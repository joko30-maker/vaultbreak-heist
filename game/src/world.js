// The living museum: every rule of the heist, stepped at a fixed rate so a game — and
// every screenshot scene — plays out the same way every time. The thief slips between
// patrols; guards walk their loops, chase what they see and follow up decoy coins;
// cameras sweep; the alarm climbs while any cone holds the thief and drains while he
// is hidden. Take the Star of Meridian and reach the south door to get away.

import { STAGE, THIEF, GUARD, CAMERA, ALARM, DECOY } from './config.js';
import { WALLS, CASES, PILLARS, GEM, EXIT, PATROLS, CAMERAS, THIEF_START } from './level.js';
import { canSee, angleDifference } from './vision.js';
import { makeRandom } from './random.js';

export const EVENT_LOOT = 1;
export const EVENT_SPOTTED = 2;
export const EVENT_CAUGHT = 4;
export const EVENT_ESCAPED = 8;
export const EVENT_DECOY = 16;
export const EVENT_DASH = 32;
export const EVENT_GEM = 64;

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_ESCAPED = 'escaped';

const SOLIDS = [...WALLS, ...CASES];

function clampToStage(e, r) {
  e.x = Math.min(STAGE.width - 26 - r, Math.max(26 + r, e.x));
  e.y = Math.min(STAGE.height - 24 - r, Math.max(STAGE.hud + 22 + r, e.y));
}

function collide(e, r) {
  for (const s of SOLIDS) {
    const nx = Math.min(s.x + s.w, Math.max(s.x, e.x));
    const ny = Math.min(s.y + s.h, Math.max(s.y, e.y));
    const dx = e.x - nx;
    const dy = e.y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      if (d2 === 0) {
        e.y = s.y - r;
        continue;
      }
      const d = Math.sqrt(d2);
      e.x = nx + (dx / d) * r;
      e.y = ny + (dy / d) * r;
    }
  }
  for (const p of PILLARS) {
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const rr = r + p.r;
    const d2 = dx * dx + dy * dy;
    if (d2 < rr * rr && d2 > 0) {
      const d = Math.sqrt(d2);
      e.x = p.x + (dx / d) * rr;
      e.y = p.y + (dy / d) * rr;
    }
  }
  clampToStage(e, r);
}

function moveToward(e, tx, ty, speed, dt) {
  const dx = tx - e.x;
  const dy = ty - e.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  e.x += (dx / d) * step;
  e.y += (dy / d) * step;
  e.facing = Math.atan2(dy, dx);
  return d <= step + 1;
}

export class World {
  constructor(seed = 1) {
    this.random = makeRandom(seed);
    this.reset();
  }

  reset() {
    this.screen = SCREEN_PLAY;
    this.time = 0;
    this.alarm = 0;
    this.spotted = 0;
    this.wasSpotted = false;
    this.thief = {
      x: THIEF_START.x,
      y: THIEF_START.y,
      facing: -Math.PI / 2,
      dashT: 0,
      dashCharges: THIEF.dashCharges,
      dashRegen: 0,
      moving: false,
    };
    this.guards = PATROLS.map((route, i) => ({
      x: route[0].x,
      y: route[0].y,
      facing: i * 2.1,
      route,
      wp: 1,
      pauseT: 0,
      mode: 'patrol',
      tx: route[0].x,
      ty: route[0].y,
      seeT: 0,
      loseT: 0,
      scanSeed: this.random() * 10,
    }));
    this.cameras = CAMERAS.map((c) => ({ ...c, angle: c.facing }));
    this.cases = CASES.map((c) => ({ ...c, taken: false }));
    this.gemTaken = false;
    this.lootValue = 0;
    this.lootCount = 0;
    this.decoys = { charges: DECOY.charges, active: null };
    this.steal = null;
    this.result = null;
  }

  throwDecoy(x, y) {
    if (this.decoys.charges <= 0 || this.screen !== SCREEN_PLAY) return 0;
    const dx = x - this.thief.x;
    const dy = y - this.thief.y;
    const d = Math.hypot(dx, dy);
    if (d > DECOY.throwRange) {
      x = this.thief.x + (dx / d) * DECOY.throwRange;
      y = this.thief.y + (dy / d) * DECOY.throwRange;
    }
    this.decoys.charges -= 1;
    this.decoys.active = { x, y, t: DECOY.lureSeconds };
    for (const g of this.guards) {
      if (Math.hypot(g.x - x, g.y - y) < DECOY.lureRadius && g.mode !== 'chase') {
        g.mode = 'investigate';
        g.tx = x;
        g.ty = y;
        g.loseT = 0;
      }
    }
    return EVENT_DECOY;
  }

  step(dt, input) {
    if (this.screen !== SCREEN_PLAY) return 0;
    let events = 0;
    this.time += dt;
    const thief = this.thief;

    // The thief: walk, or burn a dash charge to cross a cone unseen.
    if (input.dash && thief.dashT <= 0 && thief.dashCharges > 0) {
      thief.dashT = THIEF.dashSeconds;
      thief.dashCharges -= 1;
      events |= EVENT_DASH;
    }
    if (thief.dashT > 0) thief.dashT -= dt;
    if (thief.dashCharges < THIEF.dashCharges) {
      thief.dashRegen += dt;
      if (thief.dashRegen >= THIEF.dashRecharge) {
        thief.dashRegen = 0;
        thief.dashCharges += 1;
      }
    }
    const mag = Math.hypot(input.mx, input.my);
    thief.moving = mag > 0.05;
    if (thief.moving) {
      const speed = thief.dashT > 0 ? THIEF.dashSpeed : THIEF.walkSpeed;
      thief.x += (input.mx / Math.max(1, mag)) * speed * dt;
      thief.y += (input.my / Math.max(1, mag)) * speed * dt;
      thief.facing = Math.atan2(input.my, input.mx);
      collide(thief, THIEF.radius);
    }

    // Cameras sweep on their mounts.
    for (const cam of this.cameras) {
      cam.angle = cam.facing + Math.sin(this.time * CAMERA.sweepSpeed + cam.phase) * CAMERA.sweepArc;
    }

    // Who can see the thief right now?
    let seenByGuard = false;
    let seenByCamera = false;
    if (thief.dashT <= 0) {
      for (const g of this.guards) {
        const sees = canSee(g.x, g.y, g.facing, GUARD.viewRange, GUARD.viewHalfAngle, thief.x, thief.y);
        g.sees = sees;
        if (sees) seenByGuard = true;
      }
      for (const cam of this.cameras) {
        if (canSee(cam.x, cam.y, cam.angle, CAMERA.viewRange, CAMERA.viewHalfAngle, thief.x, thief.y)) seenByCamera = true;
      }
    } else {
      for (const g of this.guards) g.sees = false;
    }
    this.spotted = (seenByGuard ? 1 : 0) + (seenByCamera ? 1 : 0);
    if (this.spotted > 0 && !this.wasSpotted) events |= EVENT_SPOTTED;
    this.wasSpotted = this.spotted > 0;

    // The alarm climbs under a gaze and drains in shadow.
    if (seenByGuard) this.alarm += ALARM.guardRate * dt;
    else if (seenByCamera) this.alarm += ALARM.cameraRate * dt;
    else this.alarm -= ALARM.decayRate * dt;
    this.alarm = Math.min(ALARM.max, Math.max(0, this.alarm));

    // Guards: patrol, investigate, chase.
    for (const g of this.guards) {
      if (g.sees) {
        g.seeT += dt;
        g.loseT = 0;
        g.tx = thief.x;
        g.ty = thief.y;
        if (g.seeT > 0.45 || this.alarm > 60) g.mode = 'chase';
      } else if (g.mode === 'chase') {
        g.loseT += dt;
        if (g.loseT > 3) {
          g.mode = 'investigate';
          g.seeT = 0;
        }
      }
      if (g.mode === 'chase') {
        this.alarm = Math.min(ALARM.max, this.alarm + ALARM.chaseRate * dt * 0.25);
        moveToward(g, g.tx, g.ty, GUARD.chaseSpeed, dt);
        if (Math.hypot(g.x - thief.x, g.y - thief.y) < GUARD.radius + THIEF.radius + 2) {
          this.screen = SCREEN_CAUGHT;
          events |= EVENT_CAUGHT;
        }
      } else if (g.mode === 'investigate') {
        if (moveToward(g, g.tx, g.ty, GUARD.investigateSpeed, dt)) {
          g.facing += Math.sin(this.time * 2.2 + g.scanSeed) * dt * 2.4;
          g.loseT += dt;
          if (g.loseT > DECOY.lureSeconds) {
            g.mode = 'patrol';
            g.loseT = 0;
          }
        }
      } else {
        const target = g.route[g.wp];
        if (g.pauseT > 0) {
          g.pauseT -= dt;
          g.facing += Math.sin(this.time * 1.7 + g.scanSeed) * dt * 1.9;
        } else if (moveToward(g, target.x, target.y, GUARD.patrolSpeed, dt)) {
          g.wp = (g.wp + 1) % g.route.length;
          g.pauseT = GUARD.pauseSeconds;
        }
      }
      collide(g, GUARD.radius);
    }

    // A decoy coin rings, then is forgotten.
    if (this.decoys.active) {
      this.decoys.active.t -= dt;
      if (this.decoys.active.t <= 0) this.decoys.active = null;
    }

    // Stealing: stand close and still, and the prize is yours.
    this.steal = null;
    if (!thief.moving && thief.dashT <= 0) {
      let target = null;
      for (const c of this.cases) {
        if (c.taken) continue;
        const nx = Math.min(c.x + c.w, Math.max(c.x, thief.x));
        const ny = Math.min(c.y + c.h, Math.max(c.y, thief.y));
        if (Math.hypot(thief.x - nx, thief.y - ny) < THIEF.stealRange) target = { kind: 'case', ref: c, x: c.x + c.w / 2, y: c.y + c.h / 2, need: 0.8 };
      }
      if (!this.gemTaken && Math.hypot(thief.x - GEM.x, thief.y - GEM.y) < THIEF.stealRange + 6) {
        target = { kind: 'gem', ref: GEM, x: GEM.x, y: GEM.y, need: 1.4 };
      }
      if (target) {
        if (!this.stealState || this.stealState.ref !== target.ref) this.stealState = { ref: target.ref, t: 0 };
        this.stealState.t += dt;
        this.steal = { x: target.x, y: target.y, frac: Math.min(1, this.stealState.t / target.need) };
        if (this.stealState.t >= target.need) {
          if (target.kind === 'gem') {
            this.gemTaken = true;
            this.lootValue += GEM.value;
            events |= EVENT_GEM;
          } else {
            target.ref.taken = true;
            this.lootValue += target.ref.loot.value;
            events |= EVENT_LOOT;
          }
          this.lootCount += 1;
          this.stealState = null;
          this.steal = null;
        }
      } else {
        this.stealState = null;
      }
    } else {
      this.stealState = null;
    }

    // Caught by the alarm itself: every eye in the building is on you.
    if (this.alarm >= ALARM.max && this.spotted > 0) {
      this.screen = SCREEN_CAUGHT;
      events |= EVENT_CAUGHT;
    }

    // The getaway: gem in hand, through the south door.
    if (this.gemTaken && thief.x > EXIT.x && thief.x < EXIT.x + EXIT.w && thief.y > EXIT.y) {
      this.screen = SCREEN_ESCAPED;
      const timeBonus = Math.max(0, 1200 - Math.floor(this.time) * 10);
      this.result = { loot: this.lootValue, timeBonus, total: this.lootValue + timeBonus, time: this.time };
      events |= EVENT_ESCAPED;
    }
    return events;
  }
}
