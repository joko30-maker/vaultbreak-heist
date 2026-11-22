// Sight and shadow: who can see the thief, and the exact shape of each vision cone.
// A watcher sees a point when it is inside range, inside the cone's angle and no wall,
// case or pillar crosses the line between them. The renderer asks for the cone as a
// polygon: rays are cast across the cone and each stops at the first obstacle, so
// cones bend around cover exactly the way the rules judge them.

import { WALLS, CASES, PILLARS } from './level.js';

const BLOCKERS = [
  ...WALLS,
  ...CASES,
  ...PILLARS.map((p) => ({ x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 })),
];

/** How far along the ray (ax,ay)->(bx,by) the segment (cx,cy)->(dx,dy) is met, or Infinity. */
function segmentMeet(ax, ay, bx, by, cx, cy, dx, dy) {
  const rX = bx - ax;
  const rY = by - ay;
  const sX = dx - cx;
  const sY = dy - cy;
  const denom = rX * sY - rY * sX;
  if (denom === 0) return Infinity;
  const t = ((cx - ax) * sY - (cy - ay) * sX) / denom;
  const u = ((cx - ax) * rY - (cy - ay) * rX) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : Infinity;
}

/** The fraction of the way from (x1,y1) to (x2,y2) where the first blocker is hit; 1 when clear. */
export function sightFraction(x1, y1, x2, y2) {
  let best = 1;
  for (const b of BLOCKERS) {
    const edges = [
      [b.x, b.y, b.x + b.w, b.y],
      [b.x + b.w, b.y, b.x + b.w, b.y + b.h],
      [b.x + b.w, b.y + b.h, b.x, b.y + b.h],
      [b.x, b.y + b.h, b.x, b.y],
    ];
    for (const [cx, cy, dx, dy] of edges) {
      const t = segmentMeet(x1, y1, x2, y2, cx, cy, dx, dy);
      if (t < best) best = t;
    }
  }
  return best;
}

export function lineOfSight(x1, y1, x2, y2) {
  return sightFraction(x1, y1, x2, y2) >= 1;
}

export function angleDifference(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** True when a watcher at (x,y) facing `facing` can see the point (px,py). */
export function canSee(x, y, facing, range, halfAngle, px, py) {
  const dx = px - x;
  const dy = py - y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist > 4 && angleDifference(Math.atan2(dy, dx), facing) > halfAngle) return false;
  return lineOfSight(x, y, px, py);
}

/** The cone's outline as points: the watcher, then one point per ray where it stopped. */
export function conePolygon(x, y, facing, range, halfAngle, rays = 26) {
  const points = [{ x, y }];
  for (let i = 0; i <= rays; i += 1) {
    const angle = facing - halfAngle + (2 * halfAngle * i) / rays;
    const ex = x + Math.cos(angle) * range;
    const ey = y + Math.sin(angle) * range;
    const f = sightFraction(x, y, ex, ey);
    points.push({ x: x + (ex - x) * f, y: y + (ey - y) * f });
  }
  return points;
}
