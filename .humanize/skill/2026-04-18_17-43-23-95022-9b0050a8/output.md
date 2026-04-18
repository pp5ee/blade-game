**Task6 Output**

- Use a deterministic priority order: `flee > recover > chase > loot > wander`.
- Compute `selfPower = red*3 + yellow*2 + blue`, `targetPower` the same, and `powerRatio = selfPower / max(1, targetPower)`.
- Use these concrete thresholds:
  - `flee` if any enemy within `180` units has `powerRatio <= 0.82`, or within `110` units has `powerRatio <= 0.92`
  - `recover` for `1.2s` after combat, or if `2+` enemies are within `160` units and none are safely chaseable
  - `chase` if nearest enemy within `220` units has `powerRatio >= 1.18` and path is not blocked by a stronger enemy trigger
  - `loot` if best pickup/bundle within `260` units and no `flee` condition is active; prefer loot if no chase candidate beats `1.30`
  - `wander` only if none of the above apply
- Score loot deterministically: `lootScore = weightedValue / (distance + 40)`, where weighted value uses the same color weights; prefer bundles over equal-score single pickups.

**Endgame Convergence**

- Trigger endgame pressure when `survivors <= 4` or `matchTime >= 150s`.
- Phase 1: every `10s`, shrink safe radius by `8%` until reaching `35%` of original arena radius.
- Phase 2: once at min radius or `survivors <= 2`, spawn no new pickups outside the safe zone and multiply NPC aggression:
  - chase threshold drops from `1.18` to `1.08`
  - flee threshold tightens from `0.82` to `0.88`
- Tie movement deterministically: if two choices have equal score, pick lower actor-id target, then nearest.

**Example Scenarios**

- `loot`: NPC power `12`, pickup bundle value `6` at `90`, weak enemy power `9` at `210` → stay in `loot` because chase ratio is only `1.33` but target is far, and loot is immediately beneficial.
- `chase`: NPC power `18`, enemy power `13` at `140`, no stronger enemy nearby → `18/13=1.38`, so `chase`.
- `flee`: NPC power `14`, enemy power `18` at `100` → `14/18=0.78`, inside close-range flee threshold, so `flee`.
- `recover`: NPC just won combat, drops nearby, another enemy appears at `150` with similar power → enter `recover` for `1.2s`, drift toward low-threat space, then re-evaluate.
- `endgame`: 3 survivors at `165s`; safe zone starts shrinking, outer loot stops mattering, two mid-power NPCs that previously farmed now cross the reduced chase threshold and are forced into conflict.

- Source reference: `docs/plan.md:150`
- Supporting rules context: `docs/plan.md:40`, `docs/plan.md:48`, `docs/plan.md:103`

If you want, I can turn this into a ready-to-implement constants table for `src/config/gameConfig.ts`.
