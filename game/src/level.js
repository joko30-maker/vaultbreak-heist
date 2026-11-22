// The Meridian Museum at night: one grand hall the thief crosses in a single frame.
// This module only describes the place: the walls and pillars that block sight, the
// glass cases and their loot, the vault holding the Star of Meridian, the guards'
// patrol routes, the sweeping cameras and the getaway door. The world module brings
// it to life; the renderer paints exactly what is declared here.

export const WALLS = [
  // The vault chamber across the top centre: three walls with a doorway on each side.
  { x: 470, y: 96, w: 14, h: 150 },
  { x: 796, y: 96, w: 14, h: 150 },
  { x: 470, y: 96, w: 340, h: 14 },
  // Two side galleries that split the hall into three crossing routes.
  { x: 250, y: 330, w: 14, h: 190 },
  { x: 1016, y: 330, w: 14, h: 190 },
];

/** Round marble pillars: cover you can circle, drawn as circles, blocking sight like walls. */
export const PILLARS = [
  { x: 380, y: 300, r: 20 },
  { x: 900, y: 300, r: 20 },
  { x: 380, y: 590, r: 20 },
  { x: 900, y: 590, r: 20 },
  { x: 640, y: 430, r: 22 },
];

/** Glass display cases: solid cover. Stand beside one and hold still to lift what is inside. */
export const CASES = [
  { x: 120, y: 180, w: 92, h: 44, loot: { name: 'Jeweled Scarab', value: 400 } },
  { x: 1068, y: 180, w: 92, h: 44, loot: { name: 'Ivory Astrolabe', value: 450 } },
  { x: 120, y: 620, w: 92, h: 44, loot: { name: 'Golden Death Mask', value: 700 } },
  { x: 1068, y: 620, w: 92, h: 44, loot: { name: 'Fabergé Phoenix Egg', value: 850 } },
  { x: 560, y: 560, w: 70, h: 40, loot: { name: 'Sapphire Idol', value: 550 } },
  { x: 650, y: 560, w: 70, h: 40, loot: { name: 'Ruby Idol', value: 550 } },
];

/** The prize: the Star of Meridian, on its plinth in the middle of the vault. */
export const GEM = { x: 640, y: 165, value: 2500, name: 'Star of Meridian' };

/** Where the thief slips in, and where the getaway van waits: the same south door. */
export const EXIT = { x: 590, y: 742, w: 100, h: 46 };

/** Guard patrols: loops of waypoints, walked in order, with a pause and a look around at each. */
export const PATROLS = [
  [
    { x: 300, y: 180 },
    { x: 440, y: 180 },
    { x: 440, y: 300 },
    { x: 300, y: 300 },
    { x: 300, y: 480 },
    { x: 440, y: 480 },
  ],
  [
    { x: 1080, y: 700 },
    { x: 240, y: 700 },
    { x: 240, y: 545 },
    { x: 520, y: 545 },
    { x: 700, y: 700 },
  ],
  [
    { x: 640, y: 300 },
    { x: 520, y: 130 },
    { x: 760, y: 130 },
    { x: 640, y: 300 },
  ],
];

/** Wall cameras: a mount point, the way it faces, and how wide its sweep swings. */
export const CAMERAS = [
  { x: 60, y: 120, facing: 0.7, phase: 0 },
  { x: 1220, y: 120, facing: Math.PI - 0.7, phase: 2.2 },
  { x: 640, y: 258, facing: Math.PI / 2, phase: 4.1 },
];

export const THIEF_START = { x: 640, y: 700 };
