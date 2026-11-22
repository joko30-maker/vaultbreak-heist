// The screenshot scenes behind ?shot=cover|vault|escape|getaway. Each plays the real
// rules forward from a fresh world with a scripted thief — a list of waypoints and
// timed tricks (lift this case, dash here, toss a coin there) — so every frame is a
// moment a real run passes through, and the same seed always gives the same frame.
// The cover catches the thief mid-hall with a case already emptied and the alarm
// stirring; the vault scene freezes mid-lift on the Star; the escape runs for the
// door with the alarm near its peak; the getaway shows the night's tally.

import { STEP } from './config.js';
import { SCREEN_PLAY, SCREEN_ESCAPED } from './world.js';

function makePilot(script) {
  let index = 0;
  let waitUntil = -1;
  return function pilot(world) {
    const input = { mx: 0, my: 0, dash: false };
    if (world.time < waitUntil) return input;
    const step = script[index];
    if (!step) return input;
    const t = world.thief;
    const dx = step.x - t.x;
    const dy = step.y - t.y;
    const dist = Math.hypot(dx, dy);
    if (step.act === 'steal') {
      if (dist > 8) {
        input.mx = dx / dist;
        input.my = dy / dist;
        return input;
      }
      if (world.lootCount > (step.count ?? -1) || world.time > (step.deadline ?? Infinity)) index += 1;
      return input;
    }
    if (step.act === 'lurk') {
      if (dist > 8) {
        input.mx = dx / dist;
        input.my = dy / dist;
        return input;
      }
      if (world.alarm >= (step.alarm ?? 35) || world.guards.some((g) => g.mode === 'chase') || world.time > (step.deadline ?? Infinity)) index += 1;
      return input;
    }
    if (dist < 10) {
      if (step.act === 'dash') input.dash = true;
      if (step.act === 'decoy') world.throwDecoy(step.tx, step.ty);
      if (step.wait) waitUntil = world.time + step.wait;
      index += 1;
      return input;
    }
    input.mx = dx / dist;
    input.my = dy / dist;
    return input;
  };
}

const COVER_SCRIPT = [
  { x: 166, y: 690, act: 'steal', count: 0, deadline: 14 },
  { x: 330, y: 620 },
  { x: 352, y: 560, wait: 1.2 },
  { x: 520, y: 520 },
];

const VAULT_SCRIPT = [
  { x: 640, y: 470 },
  { x: 520, y: 320 },
  { x: 620, y: 190, act: 'steal', count: 0, deadline: 20 },
];

const ESCAPE_SCRIPT = [
  { x: 640, y: 470 },
  { x: 520, y: 320 },
  { x: 620, y: 190, act: 'steal', count: 0, deadline: 20 },
  { x: 640, y: 322, act: 'lurk', alarm: 35, deadline: 26 },
  { x: 640, y: 470, act: 'dash' },
  { x: 640, y: 765 },
];

function run(world, script, stopWhen, maxSeconds) {
  const pilot = makePilot(script);
  const steps = Math.floor(maxSeconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    world.step(STEP, pilot(world));
    if (stopWhen(world)) break;
  }
}

/** Set `world` to the named scene and return the screen to draw over it. */
export function stageShot(name, world) {
  world.reset();
  if (name === 'vault') {
    run(world, VAULT_SCRIPT, (w) => w.steal && w.steal.frac > 0.45, 40);
    return SCREEN_PLAY;
  }
  if (name === 'escape') {
    run(world, ESCAPE_SCRIPT, (w) => w.gemTaken && w.alarm >= 55 && w.thief.y >= 430, 40);
    return SCREEN_PLAY;
  }
  if (name === 'getaway') {
    run(world, ESCAPE_SCRIPT, (w) => w.screen === SCREEN_ESCAPED, 60);
    return world.screen === SCREEN_ESCAPED ? SCREEN_ESCAPED : SCREEN_PLAY;
  }
  run(world, COVER_SCRIPT, (w) => w.time > 18, 22);
  return SCREEN_PLAY;
}
