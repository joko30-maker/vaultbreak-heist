// Vaultbreak: shared tuning constants for the museum, the crew and the security.
// Everything the other modules need to agree on lives here: the stage size, how fast
// people move, how far guards and cameras see, and the palette the renderer paints with.

export const STAGE = { width: 1280, height: 800, hud: 56 };

export const STEP = 1 / 120;

export const THIEF = {
  radius: 11,
  walkSpeed: 158,
  dashSpeed: 360,
  dashSeconds: 0.26,
  dashCharges: 3,
  dashRecharge: 6,
  stealRange: 34,
};

export const GUARD = {
  radius: 12,
  patrolSpeed: 68,
  chaseSpeed: 118,
  investigateSpeed: 96,
  viewRange: 178,
  viewHalfAngle: 0.56,
  pauseSeconds: 1.6,
};

export const CAMERA = {
  viewRange: 158,
  viewHalfAngle: 0.42,
  sweepSpeed: 0.55,
  sweepArc: 0.85,
};

export const ALARM = {
  max: 100,
  guardRate: 40,
  cameraRate: 27,
  decayRate: 8,
  chaseRate: 65,
};

export const DECOY = { charges: 3, lureRadius: 280, lureSeconds: 2.6, throwRange: 330 };

export const COLORS = {
  floorA: '#232838',
  floorB: '#202636',
  carpet: '#5d1f26',
  carpetEdge: '#8a2f36',
  wall: '#12151f',
  wallTrim: '#3a415c',
  caseWood: '#4a3220',
  caseGlass: 'rgba(150,200,235,0.20)',
  caseGlassEdge: '#9fd4f2',
  gold: '#f5c542',
  gem: '#57e6d9',
  coneGuard: 'rgba(255,205,66,',
  coneCamera: 'rgba(150,120,255,',
  coneAlert: 'rgba(255,70,60,',
  thief: '#e8e4da',
  thiefCoat: '#2e4a3f',
  guard: '#31435f',
  guardCap: '#1d2a3f',
  text: '#e8e6df',
  dim: '#9aa3b8',
};
