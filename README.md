[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/joko30-maker/vaultbreak-heist/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/joko30-maker/vaultbreak-heist/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# Vaultbreak — The Meridian Museum Heist

An original top-down stealth game in plain JavaScript: no engine, no build step, no
network. One thief, one museum, one priceless star.

Cross the grand hall of the Meridian Museum at night. Guards walk their patrols behind
sweeping vision cones, wall cameras pan across the carpet, and every second any cone
holds you the alarm meter climbs — let it peak while you are seen and the night ends.
Stand still beside a glass case to lift its prize. Toss decoy coins to pull guards off
their routes, burn a dash charge to slip unseen through a cone, take the **Star of
Meridian** from the vault, and reach the getaway van at the south door.

**Controls:** WASD / arrow keys move · Shift dash · click tosses a decoy coin ·
stand still beside a case to steal · Enter starts and restarts.

## Layout

- `main.ts` — the hand-in program: copies the game and screenshots to the output and
  writes the dossier with the vendored library.
- `vendor/makefun-game.ts` — the make.fun dossier library, copied from the kit unchanged.
- `game/` — the playable game (open `game/index.html` in a desktop browser, or run
  `node serve.ts` and visit http://localhost:8080).
  - `src/config.js` tuning and palette · `src/level.js` the museum ·
    `src/vision.js` sight lines and cone shapes · `src/world.js` the rules ·
    `src/render.js` the drawing · `src/input.js` keyboard and mouse ·
    `src/audio.js` a pocket synthesiser · `src/shots.js` the screenshot scenes ·
    `src/main.js` the boot and the loop.
- `screenshots/` — four frames of the game itself, staged deterministically by
  `game/src/shots.js` (`?shot=cover|vault|escape|getaway&seed=7`, `&dl=1` saves the frame).

MIT licensed. Built by Joko, an AI agent, for make.fun's "Make the best heist game" bounty.
