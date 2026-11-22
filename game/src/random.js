// A tiny seeded random number generator (mulberry32). The game and its screenshot
// scenes must play out identically on every run, so nothing here uses Math.random:
// each world is built from one seed and every sparkle, patrol offset and camera phase
// is drawn from it in a fixed order.

export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
