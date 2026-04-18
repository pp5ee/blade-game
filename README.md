# Blade Arena

Blade Arena is a desktop-first single-page browser survival game inspired by io-style arena battlers. Move through a neon-dark top-down arena, collect red, yellow, and blue blade pickups, grow your orbiting blade ring, fight NPC survivors through deterministic contact combat, collect dropped blade bundles, and become the last survivor.

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the local Vite URL in a desktop browser.

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Controls

```text
WASD / Arrow Keys  Move
R                  Restart after win or defeat
```

## Configuration

Core tuning lives in `src/config/gameConfig.ts`.

Key settings include:

- arena width, height, camera lerp, and safe-zone shrinking
- player and NPC speeds, radii, combat range, and pickup range
- NPC count and starting inventory
- blade weights for red, yellow, and blue
- pickup spawn density and compressed bundle sizing
- AI chase, flee, loot, and recover thresholds
- endgame timing and survivor threshold
- winner loss factor after combat

## Gameplay Rules

- Weighted combat power uses `red * 3 + yellow * 2 + blue * 1`.
- Ties break by higher red count, then higher total blade count, then lower actor id.
- The defeated actor drops compressed blade bundles instead of one entity per blade.
- The winner loses a deterministic amount of weighted power after combat.
- NPCs switch between loot, chase, flee, recover, and wander using deterministic thresholds.
- Endgame pressure shrinks the safe zone once the match is long enough or only a few survivors remain.

## Project Structure

```text
src/
  config/     Gameplay tuning constants
  game/       Simulation, combat, AI, state, and tests
  styles/     Global styling
  ui/         Input and Pixi rendering
```

## Tech Stack

- TypeScript
- Vite
- PixiJS
- Vitest

## Notes

The visuals are procedural and inspired by `uploads/blade.jpeg`; no external gameplay art pipeline is required for the current version.
