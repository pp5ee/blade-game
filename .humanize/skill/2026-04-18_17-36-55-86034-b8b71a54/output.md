**Recommendation**

- Use `Vite + TypeScript + PixiJS` for a desktop-first browser game SPA.
- Keep it a single-package repo unless task1 already implies backend/multiplayer.
- Add `ESLint`, `Prettier`, `Vitest`, and `npm` scripts only; skip heavier monorepo tooling for now.
- Favor a feature-light vertical slice: boot app, fixed game loop, scene switching, keyboard/mouse input, asset manifest, HUD shell.

**Why this stack**

- `Vite` gives the fastest TS browser-game dev loop and clean static builds.
- `PixiJS` fits 2D arena gameplay better than React-first UI stacks and keeps DOM minimal.
- Plain TS modules keep game logic testable without framework coupling.
- `Vitest` works naturally with Vite for utility/domain tests.

**Package/tooling**

- Runtime: `typescript`, `pixi.js`
- Dev: `vite`, `vitest`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `prettier`, `eslint-config-prettier`
- Optional soon: `howler` for audio, `zod` for config validation, `vite-plugin-checker`

**Root files**

- `package.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `.eslintrc.cjs`
- `.prettierrc`
- `.gitignore`
- `index.html`
- `README.md`

**Suggested `package.json` scripts**

- `dev`: `vite`
- `build`: `tsc --noEmit && vite build`
- `preview`: `vite preview`
- `test`: `vitest run`
- `test:watch`: `vitest`
- `lint`: `eslint "src/**/*.{ts,tsx}"`
- `format`: `prettier --write .`

**Src tree**

- `src/main.ts`
- `src/app/bootstrap.ts`
- `src/app/game-app.ts`
- `src/app/config.ts`
- `src/core/loop/game-loop.ts`
- `src/core/scene/scene.ts`
- `src/core/scene/scene-manager.ts`
- `src/core/input/input-manager.ts`
- `src/core/assets/asset-manifest.ts`
- `src/core/assets/asset-loader.ts`
- `src/core/math/vector2.ts`
- `src/core/time/clock.ts`
- `src/features/gameplay/scenes/arena-scene.ts`
- `src/features/gameplay/entities/player.ts`
- `src/features/gameplay/entities/enemy.ts`
- `src/features/gameplay/systems/combat-system.ts`
- `src/features/gameplay/systems/movement-system.ts`
- `src/features/gameplay/state/game-state.ts`
- `src/features/ui/hud.ts`
- `src/features/ui/screens/title-screen.ts`
- `src/shared/types.ts`
- `src/shared/constants.ts`
- `src/styles/global.css`

**Module boundaries**

- `app/`: composition root only; wires renderer, loop, scenes, config.
- `core/`: engine-like reusable primitives; no gameplay rules here.
- `features/gameplay/`: arena-specific rules, entities, systems, state.
- `features/ui/`: HUD and menu overlays; may read state but should not own simulation.
- `shared/`: tiny shared types/constants only; avoid dumping logic here.

**Minimal bootstrap approach**

- `src/main.ts`: import CSS, call `bootstrap()`.
- `bootstrap()`:
  - create Pixi `Application`
  - mount canvas into `#app`
  - create `InputManager`, `SceneManager`, `GameLoop`
  - preload initial assets from manifest
  - register `TitleScreen` and `ArenaScene`
  - switch to title or directly to arena for task1
  - start fixed-timestep update + render loop
- Keep UI as either Pixi text/containers or a very small DOM overlay for HUD/debug.

**Implementation-ready default**

- Fixed update at `60 FPS`
- Canvas sized for desktop, e.g. `1600x900`, scaled to fit window
- Keyboard: `WASD` move, mouse aim, left click attack
- First milestone scene: gray arena background, controllable player square, one dummy enemy, HUD text

If you want, I can turn this into an exact starter repo skeleton with file contents and a ready-to-run `package.json`.
