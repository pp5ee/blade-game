# Goal Tracker

<!--
This file tracks the ultimate goal, acceptance criteria, and plan evolution.
It prevents goal drift by maintaining a persistent anchor across all rounds.

RULES:
- IMMUTABLE SECTION: Do not modify after initialization
- MUTABLE SECTION: Update each round, but document all changes
- Every task must be in one of: Active, Completed, or Deferred
- Deferred items require explicit justification
-->

## IMMUTABLE SECTION
<!-- Do not modify after initialization -->

### Ultimate Goal
Build a desktop-first single-player browser game inspired by io-style survival arenas, where the player moves around a top-down map, collects colored blade pickups, grows a visible orbiting blade ring, fights NPC opponents through contact-based combat, collects dropped blade bundles from defeated actors, and wins by becoming the last surviving strongest actor on the field. The implementation should preserve all draft requirements: player movement, pickup growth, three blade colors (red, yellow, blue) with red strongest, NPC loot/chase/flee behavior, kill-and-drop loop, dark neon visual direction based on `uploads/blade.jpeg`, match-based play, and a last-survivor victory condition.

## Acceptance Criteria

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: A playable single-page match can be started in the browser with one player actor, multiple NPC actors, a bounded top-down arena, and a camera/view that keeps the player readable during movement.
  - Positive Tests (expected to PASS):
    - Starting the app loads a playable arena scene rather than a blank page or placeholder screen.
    - Keyboard input moves the player continuously within arena bounds while NPCs spawn into the same match.
  - Negative Tests (expected to FAIL):
    - The player cannot move before the arena scene is initialized.
    - The player cannot leave the defined arena bounds or cause the camera to lose the controlled actor entirely.
- AC-2: Blade pickups exist in the arena, can be collected by the player and NPCs, and visibly increase the collector’s blade inventory and orbit presentation.
  - Positive Tests (expected to PASS):
    - Walking the player through a pickup removes the pickup from the map and increases the player’s stored blade count by the pickup’s amount and color.
    - An NPC crossing a pickup path also consumes the pickup and gains visible orbit growth.
  - Negative Tests (expected to FAIL):
    - A pickup does not remain collectible after it has already been consumed by another actor.
    - An actor does not gain blade count from a pickup that is outside its pickup radius.
  - AC-2.1: The blade inventory tracks red, yellow, and blue blades separately while still exposing a total combat-readable value.
    - Positive: Inventory and UI both reflect per-color counts and overall total after mixed-color collection.
    - Negative: Mixed-color collection does not collapse all blades into a single undifferentiated count.
- AC-3: Combat resolves automatically when opposing actors enter combat contact, using a documented default formula that combines blade quantity and color strength.
  - Positive Tests (expected to PASS):
    - When two actors collide in combat range, the system computes each side’s combat power using the same deterministic formula and resolves a winner.
    - A stronger actor can survive the clash with reduced inventory according to the configured loss formula, while the defeated actor is removed from active play.
  - Negative Tests (expected to FAIL):
    - Two actors that never enter combat contact do not trigger combat resolution.
    - Combat resolution does not use hidden randomness that changes the same mirrored setup into different outcomes.
  - AC-3.1: The default formula is explicit and configurable: red weight 3, yellow weight 2, blue weight 1, total power equals weighted sum, ties break in favor of the higher red count, then higher total count, then deterministic actor order.
    - Positive: Example setups from the plan always produce the same outcome when replayed.
    - Negative: Equal weighted totals without tie-breaking do not leave the match in an undefined state.
  - AC-3.2: On defeat, the losing actor drops compressed blade bundles representing its remaining inventory rather than one world entity per blade.
    - Positive: A defeated actor creates a bounded number of pickups or bundles that can be recollected.
    - Negative: A large inventory defeat does not explode into hundreds of one-blade entities.
- AC-4: NPCs show meaningful survival behavior by switching between loot, chase, flee, and recover decisions according to nearby pickups, nearby enemies, and relative combat power.
  - Positive Tests (expected to PASS):
    - An NPC near a favorable pickup path with no stronger nearby threat prefers collecting blades.
    - An NPC facing a clearly stronger nearby enemy enters flee behavior instead of charging blindly.
    - An NPC with superior combat power and reachable prey can switch into chase behavior.
  - Negative Tests (expected to FAIL):
    - NPCs do not remain in permanent random wandering when pickups or threats are nearby.
    - NPCs do not chase stronger targets when their flee threshold says the encounter is unfavorable.
- AC-5: The match reaches a clear win-or-loss outcome with a last-survivor condition and a deterministic endgame convergence mechanism.
  - Positive Tests (expected to PASS):
    - The match declares victory when the player is the only surviving actor in the arena.
    - The match declares defeat when the player is eliminated.
    - If the arena reaches a prolonged low-population state, the configured endgame pressure mechanic tightens the conflict space or otherwise guarantees resolution.
  - Negative Tests (expected to FAIL):
    - A finished match does not continue spawning regular gameplay events without an explicit restart.
    - The final surviving state does not leave the result ambiguous between multiple actors.
- AC-6: The UI communicates core gameplay information in a readable dark neon style aligned with `uploads/blade.jpeg` without requiring custom production art.
  - Positive Tests (expected to PASS):
    - The HUD shows total blade count, per-color blade counts or proportions, remaining survivors, and match state.
    - The playfield uses a dark arena background, a highlighted player, and bright colored orbiting blades that evoke the provided reference image.
  - Negative Tests (expected to FAIL):
    - Core state information is not hidden behind debug-only tools.
    - The first implementation does not depend on external art creation to be visually understandable.
- AC-7: Project documentation and configuration support the game as a fresh repository deliverable.
  - Positive Tests (expected to PASS):
    - A root `README.md` describes the game, prerequisites, install/run steps, configuration points, usage examples, and project structure.
    - Core tuning values such as NPC count, blade weights, drop bundle sizing, spawn density, and AI thresholds live in a clear configuration location.
  - Negative Tests (expected to FAIL):
    - The project does not omit setup and usage documentation.
    - Gameplay constants do not remain scattered across unrelated files without a central tuning source.

---

## MUTABLE SECTION
<!-- Update each round with justification for changes -->

### Plan Version: 1 (Updated: Round 0)

#### Plan Evolution Log
<!-- Document any changes to the plan with justification -->
| Round | Change | Reason | Impact on AC |
|-------|--------|--------|--------------|
| 0 | Initial plan | - | - |

#### Active Tasks
<!-- Map each task to its target Acceptance Criterion and routing tag -->
| Task | Target AC | Status | Tag | Owner | Notes |
|------|-----------|--------|-----|-------|-------|
| task1 - Define the project scaffold, scene layout, and source tree for a TypeScript browser game from scratch. | AC-1, AC-7 | pending | analyze | codex | Establishes implementation structure before coding. |
| task2 - Implement the initial app scaffold, arena scene, keyboard movement, and bounded camera behavior. | AC-1 | pending | coding | claude | Depends on task1. |
| task3 - Specify the deterministic combat formula, tie-break examples, drop compression model, and tuning constants table. | AC-3, AC-7 | pending | analyze | codex | Depends on task1. |
| task4 - Implement blade inventory tracking, pickup consumption, orbit rendering, and compressed world drop bundles. | AC-2, AC-3 | pending | coding | claude | Depends on task2 and task3. |
| task5 - Implement automatic combat resolution, defeat handling, survivor tracking, and restartable match flow. | AC-3, AC-5 | pending | coding | claude | Depends on task4. |
| task6 - Specify NPC state thresholds and endgame convergence rules with concrete example scenarios. | AC-4, AC-5 | pending | analyze | codex | Depends on task3 and task5. |
| task7 - Implement NPC loot/chase/flee/recover logic and the endgame pressure mechanic. | AC-4, AC-5 | pending | coding | claude | Depends on task6. |
| task8 - Implement HUD, match-state presentation, and neon-styled procedural arena visuals informed by `uploads/blade.jpeg`. | AC-6 | pending | coding | claude | Depends on task5 and task7. |
| task9 - Add deterministic logic tests and developer-facing configuration organization. | AC-3, AC-4, AC-5, AC-7 | pending | coding | claude | Depends on task7. |
| task10 - Write the root `README.md` with setup, usage, configuration, and structure documentation. | AC-7 | pending | coding | claude | Depends on task8 and task9. |

### Completed and Verified
<!-- Only move tasks here after Codex verification -->
| AC | Task | Completed Round | Verified Round | Evidence |
|----|------|-----------------|----------------|----------|

### Explicitly Deferred
<!-- Items here require strong justification -->
| Task | Original AC | Deferred Since | Justification | When to Reconsider |
|------|-------------|----------------|---------------|-------------------|

### Open Issues
<!-- Issues discovered during implementation -->
| Issue | Discovered Round | Blocking AC | Resolution Path |
|-------|-----------------|-------------|-----------------|
