**Task3 Spec**

- **Inventory model**: each actor stores `inventory = { red: number, yellow: number, blue: number }`; derived values are `totalCount = red + yellow + blue` and `weightedPower = red*3 + yellow*2 + blue*1`.
- **Combat trigger**: when two opposing actors enter combat contact in the same tick, both powers are computed from current inventory and resolved with no randomness.
- **Winner rule**: higher `weightedPower` wins; if tied, higher `red` wins; if still tied, higher `totalCount` wins; if still tied, lower stable `actorOrder`/spawn index wins.
- **Tie examples**: `A {2,0,0}=6` beats `B {0,3,0}=6` by higher `red`; `A {1,1,1}=6` beats `B {1,0,3}=6` by higher `totalCount` `3>4` is false, so `B` wins; exact tie `A {1,1,1}` vs `B {1,1,1}` goes to lower `actorOrder`.
- **Winner loss formula**: `lossPower = max(minWinnerLossPower, ceil(loserWeightedPower * winnerLossFactor))`; recommended defaults: `minWinnerLossPower=1`, `winnerLossFactor=0.35`. Remove loss from winner inventory in weakest-first order `blue -> yellow -> red` to preserve stronger blades.
- **Loss removal algorithm**: spend `1` loss by removing one `blue`; if none, remove one `yellow` and refund `-2` power; if none, remove one `red` and refund `-3` power; continue until `lossPower <= 0` or inventory empty. This is deterministic and easy to test.
- **Defeat/drop rule**: loser is removed from play and drops its full remaining inventory as compressed bundles, not per-blade entities.
- **Compressed drop bundle model**: create at most one bundle per color per defeat: `[{color:"red", amount:r}, {color:"yellow", amount:y}, {color:"blue", amount:b}]`, omitting zero amounts. Optional render split: if `amount > maxBundleSize`, split into `ceil(amount/maxBundleSize)` same-color bundles.
- **Recommended bundle size**: `maxBundleSize=12`; example loser `{red:5,yellow:0,blue:27}` drops `red x5`, `blue x12`, `blue x12`, `blue x3`.
- **Central config table**: keep in `src/config/gameConfig.ts:1` as:
  - `bladeWeights: { red: 3, yellow: 2, blue: 1 }`
  - `combatTieBreakOrder: ["redCount", "totalCount", "actorOrder"]`
  - `winnerLossFactor: 0.35`
  - `minWinnerLossPower: 1`
  - `winnerLossRemovalOrder: ["blue", "yellow", "red"]`
  - `dropCompression: { maxBundleSize: 12, splitByColor: true, maxBundlesPerDefeat: 9 }`

**Implementation Notes**

- Keep all combat math integer-only.
- Use `actorOrder` as a stable deterministic ID assigned at spawn.
- Expose helpers: `getWeightedPower`, `compareActorsForCombat`, `applyWinnerLoss`, `compressInventoryToDrops`.

If you want, I can turn this into a ready-to-paste `task3` markdown artifact or directly scaffold `src/config/gameConfig.ts` and `src/game/systems/combat.ts`.
