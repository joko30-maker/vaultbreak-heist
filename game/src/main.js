// Vaultbreak's entry point: wires the world, the input, the sounds and the renderer
// together and runs the heist at a fixed step so every machine plays the same game.
// With ?shot=<scene> in the address it instead stages one deterministic frame for the
// entry's screenshots (and with &dl=1 saves that frame as a JPEG, the way the maker's
// own screenshots were taken); otherwise it opens on the title screen.

import { STAGE, STEP } from './config.js';
import {
  World,
  SCREEN_TITLE,
  SCREEN_PLAY,
  EVENT_LOOT,
  EVENT_SPOTTED,
  EVENT_CAUGHT,
  EVENT_ESCAPED,
  EVENT_DECOY,
  EVENT_DASH,
  EVENT_GEM,
} from './world.js';
import { Input } from './input.js';
import { SoundKit } from './audio.js';
import { draw } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = STAGE.width;
canvas.height = STAGE.height;

const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? 7) || 7;
const world = new World(seed);
const sound = new SoundKit();

function playEvents(events) {
  if (events & EVENT_LOOT) sound.loot();
  if (events & EVENT_GEM) sound.gem();
  if (events & EVENT_SPOTTED) sound.spotted();
  if (events & EVENT_DECOY) sound.decoy();
  if (events & EVENT_DASH) sound.dash();
  if (events & EVENT_CAUGHT) sound.caught();
  if (events & EVENT_ESCAPED) sound.escaped();
}

if (params.has('shot')) {
  const screen = stageShot(params.get('shot'), world);
  draw(ctx, world, screen);
  if (params.get('dl') === '1') {
    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = params.get('shot') + '.jpg';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/jpeg', 0.88);
  }
} else {
  let screen = SCREEN_TITLE;
  const input = new Input(canvas, () => sound.wake());
  let last = performance.now();
  let acc = 0;
  let dashHeld = false;

  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    const wish = input.poll();
    if (screen !== SCREEN_PLAY && wish.start) {
      world.reset();
      screen = SCREEN_PLAY;
    }
    while (acc >= STEP) {
      acc -= STEP;
      if (screen === SCREEN_PLAY) {
        for (const click of input.takeClicks()) playEvents(world.throwDecoy(click.x, click.y));
        const stepInput = { mx: wish.mx, my: wish.my, dash: wish.dash && !dashHeld };
        playEvents(world.step(STEP, stepInput));
        if (world.screen !== SCREEN_PLAY) screen = world.screen;
      } else {
        input.takeClicks();
      }
    }
    dashHeld = wish.dash;
    draw(ctx, world, screen);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
