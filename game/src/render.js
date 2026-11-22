// The night watchman's view: everything the player (and the judge) sees. A dark
// marble hall, a red carpet running from the south door to the vault, glass cases
// glowing with gold, vision cones that bend around pillars and cases, and a HUD with
// the alarm meter, the night's takings and the tools left. Cones are filled from the
// same occlusion polygons the rules judge by, so what you see is exactly what sees you.

import { STAGE, COLORS, GUARD, CAMERA, ALARM } from './config.js';
import { WALLS, PILLARS, GEM, EXIT } from './level.js';
import { conePolygon } from './vision.js';
import { SCREEN_TITLE, SCREEN_CAUGHT, SCREEN_ESCAPED } from './world.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor(ctx, world) {
  ctx.fillStyle = COLORS.floorA;
  ctx.fillRect(0, STAGE.hud, STAGE.width, STAGE.height - STAGE.hud);
  ctx.fillStyle = COLORS.floorB;
  const tile = 64;
  for (let y = STAGE.hud; y < STAGE.height; y += tile) {
    for (let x = ((y / tile) % 2) * tile; x < STAGE.width; x += tile * 2) {
      ctx.fillRect(x, y, tile, tile);
    }
  }
  // The red carpet: south door to vault door, the thief's red thread through the hall.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(600, 110, 80, STAGE.height - 110);
  ctx.fillStyle = COLORS.carpetEdge;
  ctx.fillRect(600, 110, 4, STAGE.height - 110);
  ctx.fillRect(676, 110, 4, STAGE.height - 110);
  // The vault floor is paler marble, ringed in gold trim.
  ctx.fillStyle = 'rgba(220,225,240,0.06)';
  ctx.fillRect(484, 110, 312, 136);
  ctx.strokeStyle = 'rgba(245,197,66,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(484, 110, 312, 136);
  // The getaway door.
  ctx.fillStyle = '#0d3a24';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = '#39d98a';
  ctx.lineWidth = 2;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = '#39d98a';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.gemTaken ? 'GETAWAY VAN → RUN!' : 'GETAWAY VAN', EXIT.x + EXIT.w / 2, EXIT.y + 28);
}

function drawCases(ctx, world) {
  world.cases.forEach((c, i) => {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx, c.x + 3, c.y + 5, c.w, c.h, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.caseWood;
    roundRect(ctx, c.x, c.y, c.w, c.h, 6);
    ctx.fill();
    ctx.fillStyle = COLORS.caseGlass;
    roundRect(ctx, c.x + 5, c.y + 5, c.w - 10, c.h - 10, 4);
    ctx.fill();
    ctx.strokeStyle = COLORS.caseGlassEdge;
    ctx.lineWidth = 1;
    roundRect(ctx, c.x + 5, c.y + 5, c.w - 10, c.h - 10, 4);
    ctx.stroke();
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    if (c.taken) {
      ctx.fillStyle = 'rgba(230,230,230,0.35)';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMPTIED', cx, cy + 3);
    } else {
      // Each prize is its own little gold silhouette.
      ctx.fillStyle = COLORS.gold;
      ctx.save();
      ctx.translate(cx, cy);
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (i % 3 === 1) {
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, 4);
        ctx.lineTo(0, 10);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b8860b';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(245,197,66,0.9)';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$' + c.loot.value, cx, c.y + c.h + 12);
    }
  });
}

function drawGem(ctx, world) {
  if (world.gemTaken) {
    ctx.fillStyle = 'rgba(230,230,230,0.35)';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE STAR IS GONE', GEM.x, GEM.y + 4);
    return;
  }
  const pulse = 0.75 + 0.25 * Math.sin(world.time * 3);
  const glow = ctx.createRadialGradient(GEM.x, GEM.y, 2, GEM.x, GEM.y, 44 * pulse);
  glow.addColorStop(0, 'rgba(87,230,217,0.5)');
  glow.addColorStop(1, 'rgba(87,230,217,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(GEM.x, GEM.y, 44 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2c14';
  roundRect(ctx, GEM.x - 20, GEM.y + 12, 40, 10, 3);
  ctx.fill();
  ctx.fillStyle = COLORS.gem;
  ctx.beginPath();
  ctx.moveTo(GEM.x, GEM.y - 15);
  ctx.lineTo(GEM.x + 11, GEM.y - 2);
  ctx.lineTo(GEM.x, GEM.y + 12);
  ctx.lineTo(GEM.x - 11, GEM.y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(GEM.x, GEM.y - 15);
  ctx.lineTo(GEM.x + 5, GEM.y - 2);
  ctx.lineTo(GEM.x - 5, GEM.y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.gem;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STAR OF MERIDIAN · $2,500', GEM.x, GEM.y - 26);
}

function drawWallsAndPillars(ctx) {
  for (const p of PILLARS) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.arc(p.x + 3, p.y + 5, p.r, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(p.x - 6, p.y - 6, 3, p.x, p.y, p.r);
    g.addColorStop(0, '#cfd6e4');
    g.addColorStop(1, '#79839c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a546e';
    ctx.stroke();
  }
  for (const w of WALLS) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = COLORS.wallTrim;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, STAGE.hud, STAGE.width, 22);
  ctx.fillRect(0, STAGE.height - 22, STAGE.width, 22);
  ctx.fillRect(0, STAGE.hud, 22, STAGE.height - STAGE.hud);
  ctx.fillRect(STAGE.width - 22, STAGE.hud, 22, STAGE.height - STAGE.hud);
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.strokeRect(22, STAGE.hud + 22, STAGE.width - 44, STAGE.height - STAGE.hud - 44);
}

function fillCone(ctx, points, rgb, spotted) {
  const grad = ctx.createRadialGradient(points[0].x, points[0].y, 8, points[0].x, points[0].y, 190);
  grad.addColorStop(0, rgb + (spotted ? '0.5)' : '0.34)'));
  grad.addColorStop(1, rgb + '0.02)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fill();
}

function drawCones(ctx, world) {
  for (const cam of world.cameras) {
    fillCone(ctx, conePolygon(cam.x, cam.y, cam.angle, CAMERA.viewRange, CAMERA.viewHalfAngle), COLORS.coneCamera, false);
  }
  for (const g of world.guards) {
    const rgb = g.sees ? COLORS.coneAlert : COLORS.coneGuard;
    fillCone(ctx, conePolygon(g.x, g.y, g.facing, GUARD.viewRange, GUARD.viewHalfAngle), rgb, g.sees);
  }
}

function drawCameras(ctx, world) {
  for (const cam of world.cameras) {
    ctx.fillStyle = '#0c0e14';
    roundRect(ctx, cam.x - 10, cam.y - 10, 20, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#8f7ff5';
    ctx.lineWidth = 2;
    roundRect(ctx, cam.x - 10, cam.y - 10, 20, 20, 5);
    ctx.stroke();
    ctx.fillStyle = '#c9c2ff';
    ctx.beginPath();
    ctx.arc(cam.x + Math.cos(cam.angle) * 5, cam.y + Math.sin(cam.angle) * 5, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuard(ctx, g, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.arc(g.x + 2, g.y + 4, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g.mode === 'chase' ? '#7a2e35' : COLORS.guard;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.guardCap;
  ctx.beginPath();
  ctx.arc(g.x, g.y, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8b25a';
  ctx.beginPath();
  ctx.moveTo(g.x + Math.cos(g.facing) * 14, g.y + Math.sin(g.facing) * 14);
  ctx.lineTo(g.x + Math.cos(g.facing + 2.6) * 7, g.y + Math.sin(g.facing + 2.6) * 7);
  ctx.lineTo(g.x + Math.cos(g.facing - 2.6) * 7, g.y + Math.sin(g.facing - 2.6) * 7);
  ctx.closePath();
  ctx.fill();
  if (g.sees) {
    ctx.fillStyle = '#ff5040';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 20 - Math.sin(time * 6) * 2);
  } else if (g.mode === 'investigate') {
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - 19);
  }
}

function drawThief(ctx, world) {
  const t = world.thief;
  if (t.dashT > 0) {
    ctx.fillStyle = 'rgba(87,230,217,0.25)';
    ctx.beginPath();
    ctx.arc(t.x - Math.cos(t.facing) * 16, t.y - Math.sin(t.facing) * 16, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.arc(t.x + 2, t.y + 4, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thiefCoat;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#10131c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(t.x, t.y, 6, Math.PI * 0.9, Math.PI * 2.1);
  ctx.stroke();
  if (world.gemTaken) {
    ctx.fillStyle = COLORS.gem;
    ctx.beginPath();
    ctx.moveTo(t.x - Math.cos(t.facing) * 12, t.y - Math.sin(t.facing) * 12 - 5);
    ctx.lineTo(t.x - Math.cos(t.facing) * 12 + 5, t.y - Math.sin(t.facing) * 12);
    ctx.lineTo(t.x - Math.cos(t.facing) * 12, t.y - Math.sin(t.facing) * 12 + 5);
    ctx.lineTo(t.x - Math.cos(t.facing) * 12 - 5, t.y - Math.sin(t.facing) * 12);
    ctx.closePath();
    ctx.fill();
  }
  if (world.steal) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(world.steal.x, world.steal.y - 26, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(world.steal.x, world.steal.y - 26, 10, -Math.PI / 2, -Math.PI / 2 + world.steal.frac * Math.PI * 2);
    ctx.stroke();
  }
}

function drawDecoy(ctx, world) {
  const d = world.decoys.active;
  if (!d) return;
  const r = 6 + Math.sin(world.time * 10) * 2;
  ctx.strokeStyle = 'rgba(245,197,66,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(d.x, d.y, r + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(d.x, d.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHud(ctx, world) {
  ctx.fillStyle = '#0b0d13';
  ctx.fillRect(0, 0, STAGE.width, STAGE.hud);
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VAULTBREAK', 18, 35);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('THE MERIDIAN MUSEUM', 18, 50);

  // The alarm meter: ten segments that fill green, amber, then red.
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('ALARM', 210, 35);
  for (let i = 0; i < 10; i += 1) {
    const filled = world.alarm > i * 10;
    ctx.fillStyle = !filled ? '#232838' : i < 5 ? '#39d98a' : i < 8 ? '#f5c542' : '#ff5040';
    roundRect(ctx, 262 + i * 26, 18, 21, 20, 4);
    ctx.fill();
  }
  if (world.spotted > 0) {
    ctx.fillStyle = '#ff5040';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText('SPOTTED!', 262, 52);
  }

  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('$' + world.lootValue.toLocaleString('en-US'), 580, 36);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(world.lootCount + ' prizes lifted', 580, 51);

  ctx.fillStyle = COLORS.text;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Dash', 730, 30);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < world.thief.dashCharges ? COLORS.gem : '#232838';
    ctx.beginPath();
    ctx.arc(738 + i * 18, 45, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.text;
  ctx.fillText('Coins', 810, 30);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < world.decoys.charges ? COLORS.gold : '#232838';
    ctx.beginPath();
    ctx.arc(818 + i * 18, 45, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.gemTaken ? 'The Star is yours — reach the van!' : 'Lift the Star of Meridian from the vault', 1010, 33);
  ctx.fillStyle = COLORS.dim;
  ctx.font = '12px system-ui, sans-serif';
  const mm = String(Math.floor(world.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(world.time % 60)).padStart(2, '0');
  ctx.fillText(mm + ':' + ss, 1010, 51);
  ctx.textAlign = 'left';
}

function drawPanel(ctx, title, titleColor, lines) {
  ctx.fillStyle = 'rgba(5,6,10,0.72)';
  ctx.fillRect(0, STAGE.hud, STAGE.width, STAGE.height - STAGE.hud);
  ctx.fillStyle = '#12151f';
  roundRect(ctx, 390, 250, 500, 300, 14);
  ctx.fill();
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  roundRect(ctx, 390, 250, 500, 300, 14);
  ctx.stroke();
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 330);
  ctx.fillStyle = COLORS.text;
  ctx.font = '17px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, 640, 385 + i * 30));
  ctx.textAlign = 'left';
}

export function draw(ctx, world, screen) {
  drawFloor(ctx, world);
  drawCases(ctx, world);
  drawGem(ctx, world);
  drawWallsAndPillars(ctx);
  drawCones(ctx, world);
  drawCameras(ctx, world);
  drawDecoy(ctx, world);
  for (const g of world.guards) drawGuard(ctx, g, world.time);
  drawThief(ctx, world);
  if (world.alarm > 70 && screen === 'play') {
    const edge = ctx.createRadialGradient(640, 428, 320, 640, 428, 720);
    edge.addColorStop(0, 'rgba(255,40,30,0)');
    edge.addColorStop(1, 'rgba(255,40,30,' + (0.16 + 0.1 * Math.sin(world.time * 7)) + ')');
    ctx.fillStyle = edge;
    ctx.fillRect(0, STAGE.hud, STAGE.width, STAGE.height - STAGE.hud);
  }
  drawHud(ctx, world);
  if (screen === SCREEN_TITLE) {
    drawPanel(ctx, 'VAULTBREAK', COLORS.gold, [
      'One thief. One museum. One priceless star.',
      'Cross the hall, dodge the cones, empty the cases,',
      'take the Star of Meridian and reach the van.',
      '',
      'WASD / arrows move · SHIFT dash · CLICK toss a decoy coin',
      'Stand still beside a case to lift its prize.',
      'Press ENTER to begin the heist',
    ]);
  } else if (screen === SCREEN_CAUGHT) {
    drawPanel(ctx, 'BUSTED!', '#ff5040', [
      'The alarm peaked with every eye on you.',
      'You lifted $' + world.lootValue.toLocaleString('en-US') + ' before they closed in.',
      '',
      'Press ENTER to try the night again',
    ]);
  } else if (screen === SCREEN_ESCAPED) {
    const r = world.result;
    drawPanel(ctx, 'CLEAN GETAWAY', '#39d98a', [
      'Loot: $' + r.loot.toLocaleString('en-US') + '   ·   ' + world.lootCount + ' prizes',
      'Time bonus: $' + r.timeBonus.toLocaleString('en-US') + '   ·   ' + r.time.toFixed(1) + 's inside',
      'TOTAL TAKE: $' + r.total.toLocaleString('en-US'),
      '',
      'Press ENTER to rob the Meridian again',
    ]);
  }
}
