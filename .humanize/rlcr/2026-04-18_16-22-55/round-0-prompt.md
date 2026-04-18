Read and execute below with ultrathink

## Goal Tracker Setup (REQUIRED FIRST STEP)

Before starting implementation, you MUST initialize the Goal Tracker:

1. Read @/app/workspaces/c6162566-aff8-4634-b3e4-0a4c80c8e597/.humanize/rlcr/2026-04-18_16-22-55/goal-tracker.md
2. If the "Ultimate Goal" section says "[To be extracted...]", extract a clear goal statement from the plan
3. If the "Acceptance Criteria" section says "[To be defined...]", define 3-7 specific, testable criteria
4. Populate the "Active Tasks" table with tasks from the plan, mapping each to an AC and filling Tag/Owner
5. Write the updated goal-tracker.md

**IMPORTANT**: The IMMUTABLE SECTION can only be modified in Round 0. After this round, it becomes read-only.

---

## Implementation Plan

For all tasks that need to be completed, please use the Task system (TaskCreate, TaskUpdate, TaskList) to track each item in order of importance.
You are strictly prohibited from only addressing the most important issues - you MUST create Tasks for ALL discovered issues and attempt to resolve each one.

## Task Tag Routing (MUST FOLLOW)

Each task must have one routing tag from the plan: `coding` or `analyze`.

- Tag `coding`: Claude executes the task directly.
- Tag `analyze`: Claude must execute via `/humanize:ask-codex`, then integrate Codex output.
- Keep Goal Tracker "Active Tasks" columns **Tag** and **Owner** aligned with execution (`coding -> claude`, `analyze -> codex`).
- If a task has no explicit tag, default to `coding` (Claude executes directly).

# Blade Arena Single-Page Game Plan

## Goal Description
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

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
The implementation delivers a polished single-map desktop browser game with a stable match loop, deterministic combat, readable NPC behavior, compressed drop economy, clear HUD, restart flow, configurable tuning values, logic-level automated tests for deterministic systems, and a neon-styled presentation built mostly from procedural shapes, particles, and lightweight effects inspired by `uploads/blade.jpeg`.

### Lower Bound (Minimum Acceptable Scope)
The implementation delivers a complete playable match loop on one arena map with keyboard movement, collectible red/yellow/blue blade pickups, visible orbit growth, deterministic combat resolution, kill drops that can be recollected, baseline chase/flee NPC logic, win/lose flow, and a complete `README.md` explaining how to run and tune the project.

### Allowed Choices
- Can use: `TypeScript`, `Vite`, `Phaser 3`, HTML5 canvas-based rendering, procedural shapes, object pooling, finite-state NPC logic, logic-level tests for formulas and AI thresholds, a simple endgame pressure mechanic, and constants-driven balancing.
- Cannot use: multiplayer networking, account systems, meta progression, mobile-first control design, mandatory hand-authored art pipelines, one-entity-per-blade death explosions, undefined combat randomness, or implementation scope that omits the original draft’s movement/pickup/combat/NPC/UI loop.

> **Note on Deterministic Designs**: This draft fixes several gameplay outcomes already: the project is a single-page single-player game, blade colors are red/yellow/blue with red strongest, victory is becoming the last strongest survivor, and unspecified details should be filled with sensible defaults. The remaining flexibility is mostly in technical stack and exact balancing, not in replacing the core design.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
One viable implementation path is:
1. Scaffold a minimal browser game app with a single arena scene, keyboard movement, camera follow, and procedural rendering.
2. Model actors with per-color blade inventories and a derived combat power function.
3. Represent orbiting blades as inventory-driven visual slots instead of one physics object per blade, so growth remains readable without excessive simulation cost.
4. Spawn world pickups as compressed bundles carrying color and amount metadata.
5. Resolve combat when opposing actors overlap a combat radius. Use a deterministic formula:
   - `power = red * 3 + yellow * 2 + blue * 1`
   - tie-break by higher red count, then higher total blade count, then stable actor id order
   - the loser is removed from active play and drops configurable bundles matching its remaining inventory
   - the winner loses a configurable amount based on the defeated side’s weighted power so fights still have cost
6. Drive NPCs with a small finite-state machine:
   - `loot`: nearest beneficial pickup or bundle
   - `chase`: weaker nearby target
   - `flee`: stronger nearby target
   - `recover`: short reposition state after combat or dense threat conditions
7. Add an endgame convergence rule such as late-match pressure when the survivor count is low or match duration exceeds a configured threshold.
8. Layer in HUD, restart flow, and README once the deterministic gameplay loop is stable.

### Relevant References
- `requirements/draft.md` - primary gameplay and deliverable requirements from the user conversation
- `uploads/blade.jpeg` - visual style reference for dark neon top-down arena presentation
- `README.md` - required final documentation deliverable at repository root
- `src/config/gameConfig.ts` - recommended home for match, combat, AI, and spawn constants
- `src/game/scenes/ArenaScene.ts` - recommended home for match orchestration and rendering loop
- `src/game/systems/combat.ts` - recommended home for deterministic combat calculations
- `src/game/systems/ai.ts` - recommended home for NPC state selection and threat evaluation

## Dependencies and Sequence

### Milestones
1. Milestone 1: Establish the game foundation and deterministic ruleset
   - Phase A: Set up the browser game scaffold, arena scene, input loop, camera behavior, and actor data structures.
   - Phase B: Define blade inventory tracking, combat power calculation, tie-breaking rules, drop compression rules, and shared tuning constants.
2. Milestone 2: Deliver the complete play loop
   - Phase A: Implement pickups, orbit visuals, collision detection, combat resolution, defeat handling, and recollectable drops.
   - Phase B: Add win/lose flow, restart loop, and endgame convergence behavior.
3. Milestone 3: Make the arena feel like the requested game
   - Phase A: Add NPC finite-state behavior for loot/chase/flee/recover, then tune thresholds against deterministic examples.
   - Phase B: Add HUD presentation and dark neon visual styling aligned with the image reference while keeping asset needs lightweight.
4. Milestone 4: Finalize reliability and project deliverables
   - Phase A: Add logic-level tests for combat, drop compression, and AI threshold decisions.
   - Phase B: Write `README.md`, document configuration values, and verify the project structure is understandable for future iteration.

The sequence depends on deterministic rules before balancing, the combat and drop loop before AI tuning, and the playable loop before visual polish and documentation.

## Task Breakdown

Each task must include exactly one routing tag:
- `coding`: implemented by Claude
- `analyze`: executed via Codex (`/humanize:ask-codex`)

| Task ID | Description | Target AC | Tag (`coding`/`analyze`) | Depends On |
|---------|-------------|-----------|----------------------------|------------|
| task1 | Define the project scaffold, scene layout, and source tree for a TypeScript browser game from scratch. | AC-1, AC-7 | analyze | - |
| task2 | Implement the initial app scaffold, arena scene, keyboard movement, and bounded camera behavior. | AC-1 | coding | task1 |
| task3 | Specify the deterministic combat formula, tie-break examples, drop compression model, and tuning constants table. | AC-3, AC-7 | analyze | task1 |
| task4 | Implement blade inventory tracking, pickup consumption, orbit rendering, and compressed world drop bundles. | AC-2, AC-3 | coding | task2, task3 |
| task5 | Implement automatic combat resolution, defeat handling, survivor tracking, and restartable match flow. | AC-3, AC-5 | coding | task4 |
| task6 | Specify NPC state thresholds and endgame convergence rules with concrete example scenarios. | AC-4, AC-5 | analyze | task3, task5 |
| task7 | Implement NPC loot/chase/flee/recover logic and the endgame pressure mechanic. | AC-4, AC-5 | coding | task6 |
| task8 | Implement HUD, match-state presentation, and neon-styled procedural arena visuals informed by `uploads/blade.jpeg`. | AC-6 | coding | task5, task7 |
| task9 | Add deterministic logic tests and developer-facing configuration organization. | AC-3, AC-4, AC-5, AC-7 | coding | task7 |
| task10 | Write the root `README.md` with setup, usage, configuration, and structure documentation. | AC-7 | coding | task8, task9 |

## Claude-Codex Deliberation

### Agreements
- The repository currently has no app scaffold, so the plan must include project setup rather than only feature additions.
- A desktop-first single-player scope is the correct first boundary for a feasible delivery.
- A fixed map with approximately one player plus about twenty NPCs is a sensible target density for a first playable version.
- Contact-based combat, compressed blade drops, and finite-state NPC behavior are appropriate simplifications for the requested gameplay.
- `README.md` is a mandatory deliverable and must be treated as part of the planned scope rather than an afterthought.

### Resolved Disagreements
- Visual fidelity scope: Claude initially leaned toward a broad neon presentation target, while Codex warned against plan ambiguity that could imply expensive shader or art work. The plan resolves this by limiting the first implementation to procedural neon-styled visuals inspired by `uploads/blade.jpeg` rather than requiring a heavy art pipeline.
- Combat model ambiguity: Claude’s early candidate mentioned a weighted color formula with optional bonus behavior, while Codex flagged that as underspecified. The plan resolves this by fixing a default deterministic formula with explicit weights and tie-break rules, while keeping the constants configurable.
- Endgame pacing strictness: Claude considered endgame pressure optional, while Codex argued that a last-survivor game needs a guaranteed convergence mechanism. The plan resolves this by requiring a deterministic endgame pressure mechanic whenever low-population or long-match thresholds are reached.
- Analyze task vagueness: Codex noted that analysis tasks must produce concrete artifacts. The plan resolves this by defining analysis tasks around tangible outputs such as scaffold decisions, formula tables, threshold scenarios, and acceptance-check materials.

### Convergence Status
- Final Status: `partially_converged`

## Pending User Decisions

- DEC-1: Combat color interaction depth
  - Claude Position: Use a simple weighted power model where red is strongest through scalar weight, without introducing rock-paper-scissors color matchup rules in the first version.
  - Codex Position: N/A - open question
  - Tradeoff Summary: A scalar model is easier to explain, test, and balance in a first implementation, while matchup rules would add strategic depth but also more tuning and UI explanation overhead.
  - Decision Status: `PENDING`
- DEC-2: Input scope for the first release
  - Claude Position: Ship keyboard-driven desktop controls first and defer alternate input mappings and mobile controls.
  - Codex Position: N/A - open question
  - Tradeoff Summary: Desktop keyboard control keeps the first release focused and reduces HUD/input complexity; broader input support increases reach but expands implementation and testing scope.
  - Decision Status: `PENDING`
- DEC-3: Endgame pressure style
  - Claude Position: Use a late-match pressure mechanic such as shrinking safe space or escalating danger only after configured low-population or long-match thresholds, so the early game stays open.
  - Codex Position: A guaranteed convergence mechanism is required, but the specific mechanic remains unresolved.
  - Tradeoff Summary: A delayed pressure mechanic preserves free-roam collection early while ensuring the match eventually resolves; a permanently active pressure system would converge faster but could conflict with the draft’s open survival-growth feel.
  - Decision Status: `PENDING`
- DEC-4: Automated testing depth
  - Claude Position: Include logic-level automated tests for deterministic systems such as combat, drops, and AI thresholds, while leaving full gameplay verification to manual smoke testing.
  - Codex Position: The plan should explicitly state whether tests are expected and keep them measurable.
  - Tradeoff Summary: Logic-level tests provide strong verification for the hardest deterministic rules without requiring fragile browser gameplay automation; deeper automation would add confidence but also more tooling overhead in a new repo.
  - Decision Status: `PENDING`

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific terminology such as "AC-", "Milestone", "Step", "Phase", or similar workflow markers.
- These terms are for plan documentation only, not for the resulting codebase.
- Use descriptive, domain-appropriate naming in code instead.

### Additional Planning Notes
- The original draft must remain fully preserved in this file as the authoritative human input source.
- Unspecified gameplay details should be resolved with sensible defaults and documented in configuration or README content rather than left implicit.
- The image at `uploads/blade.jpeg` should be treated as a style reference, not as a required runtime asset.
- If future implementation includes git commits, the draft requires using the `feat:` prefix.

## Output File Convention

This template is used to produce the main output file (e.g., `plan.md`).

### Translated Language Variant

When `alternative_plan_language` resolves to a supported language name through merged config loading, a translated variant of the output file is also written after the main file. Humanize loads config from merged layers in this order: default config, optional user config, then optional project config; `alternative_plan_language` may be set at any of those layers. The variant filename is constructed by inserting `_<code>` (the ISO 639-1 code from the built-in mapping table) immediately before the file extension:

- `plan.md` becomes `plan_<code>.md` (e.g. `plan_zh.md` for Chinese, `plan_ko.md` for Korean)
- `docs/my-plan.md` becomes `docs/my-plan_<code>.md`
- `output` (no extension) becomes `output_<code>`

The translated variant file contains a full translation of the main plan file's current content in the configured language. All identifiers (`AC-*`, task IDs, file paths, API names, and command flags) remain unchanged, as they are language-neutral.

When `alternative_plan_language` is empty, absent, set to `"English"`, or set to an unsupported language, no translated variant is written. Humanize does not auto-create `.humanize/config.json` when no project config file is present.

--- Original Design Draft Start ---

# Requirement

我想做一个转刀刀网页游戏，人物可以移动捡刀，然后捡到就变多，可以相互击杀，击杀后掉落对应数量的刀，这个刀也可以被捡起来，取决于刀刀数量也可以自由移动，避免交战，这个是单机页面游戏，其他的都是npc，刀分为3种红黄蓝，拼杀需要拼数量和颜色（不同等级的话有个计算公式扣除刀），红色最厉害，UI风格参考 图片 @blade.jpeg(uploads/blade.jpeg)

**AI Understanding:**
我理解到你想做的是一个**单机网页 IO 风格转刀刀游戏**：
- 玩家角色可自由移动
- 地图上有刀可拾取，拾取后自己身上的刀数量增加
- 其他角色都是 NPC，也能移动、拾刀、躲避或交战
- 角色之间可以相互击杀
- 被击杀后会掉落对应数量的刀，这些刀还能被继续拾取
- 是否主动交战取决于当前刀的数量，刀少就可以选择游走避战
- 刀有 **红 / 黄 / 蓝** 3 种颜色，强度上红最高
- 战斗不仅比数量，还比颜色/等级，并且不同等级之间要按一个公式结算刀的扣除
- UI 风格希望参考你给的图：我看到是**深色背景、俯视角竞技场、中心角色高亮、周围大量彩色刀刃环绕、整体偏霓虹和轻科幻感**
现在只差一个关键点需要你定一下：**你希望这是“实时操作生存玩法”还是“局内成长+阶段结算玩法”？**  
比如：
1. **实时生存**：一直打一直捡，活越久越强  
2. **阶段结算**：每局有目标、波次或倒计时，结束后结算胜负
如果差不多就按这个方向做，你回复 **“start”** 或 **“proceed”**，我就继续生成实现计划。

一直打一直捡，活越久越强  ,每局有目标

**AI Understanding:**
明白了，我现在理解你的需求是：
- **单机网页游戏**
- 核心玩法是 **一直打、一直捡、活越久越强**
- 玩家可移动、拾取地上的刀，拾到后自身刀数量增加
- 地图内有 **NPC 敌人**，它们也会移动、拾刀、根据实力决定追击或避战
- 角色之间可交战，**击杀后掉落对应数量的刀**，掉落物可继续被拾取
- 刀有 **红 / 黄 / 蓝** 三种，且 **红最强**
- 战斗结算要同时考虑 **刀的数量 + 颜色等级**，不同颜色之间按一个公式扣除
- 玩家体验上是 **生存成长制**，但 **每局仍然有目标**
结合你刚补充的“每局有目标”，我理解成：
- 游戏不是纯无限无目标存活
- 而是 **在持续生存变强的过程中，达成某个局内目标才算胜利**
我这边只差最后一个关键定义：**每局目标是什么？**
比如你可以选一种：
1. **存活到指定时间**
2. **击杀达到指定数量**
3. **刀数量达到指定数量**
4. **成为场上最后最强者**
你定一下这个目标；如果你已经觉得需求差不多完整了，直接回复 **start** 或 **proceed**，我就继续整理成实现计划。

成为场上最后最强者

**AI Understanding:**
我理解完整了：
- **类型**：单机网页俯视角竞技生存游戏，类似 io 风格
- **核心循环**：移动 → 捡刀 → 变强 → 选择追击或避战 → 击杀对手 → 掉刀再拾取
- **胜利条件**：成为场上最后最强者
- **角色构成**：1 个玩家 + 多个 NPC
- **刀系统**：
  - 地图上散落可拾取刀
  - 击杀后掉落对应数量的刀
  - 刀分 **红 / 黄 / 蓝** 3 种
  - 强度关系：**红 > 黄 > 蓝**
- **战斗规则**：
  - 胜负不只看刀数量，也看刀颜色
  - 不同颜色之间按公式扣减刀数量来结算
- **AI 预期**：
  - NPC 会移动、捡刀
  - 会根据当前实力决定追杀或避战
- **UI 风格**：
  - 参考你给的图，整体是**深色背景、霓虹感、俯视角竞技场、角色周围环绕彩色刀刃**的风格
现在只差 **1 个关键定义**：  
**红 / 黄 / 蓝三种刀之间的战斗换算公式，你想怎么定？**
如果你暂时不想细化，我也可以先按一个默认方案进入规划。你回复 **start** 或 **proceed** 就行。

---

## Implementation Notes

- For any unspecified details (combat formulas, game balance, UI layout, tech choices, etc.), make reasonable decisions yourself and document them in the plan. Do NOT ask the user for clarification — proceed with sensible defaults.
- If referenced image files exist in the workspace, treat them as visual style references.

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.

--- Original Design Draft End ---

---

## BitLesson Selection (REQUIRED FOR EACH TASK)

Before executing each task or sub-task, you MUST:

1. Read @/app/workspaces/c6162566-aff8-4634-b3e4-0a4c80c8e597/.humanize/bitlesson.md
2. Run `bitlesson-selector` for each task/sub-task to select relevant lesson IDs
3. Follow the selected lesson IDs (or `NONE`) during implementation

Include a `## BitLesson Delta` section in your summary with:
- Action: none|add|update
- Lesson ID(s): NONE or comma-separated IDs
- Notes: what changed and why (required if action is add or update)

Reference: @/app/workspaces/c6162566-aff8-4634-b3e4-0a4c80c8e597/.humanize/bitlesson.md

---

## Goal Tracker Rules

Throughout your work, you MUST maintain the Goal Tracker:

1. **Before starting a task**: Mark it as "in_progress" in Active Tasks
   - Confirm Tag/Owner routing is correct before execution
2. **After completing a task**: Move it to "Completed and Verified" with evidence (but mark as "pending verification")
3. **If you discover the plan has errors**:
   - Do NOT silently change direction
   - Add entry to "Plan Evolution Log" with justification
   - Explain how the change still serves the Ultimate Goal
4. **If you need to defer a task**:
   - Move it to "Explicitly Deferred" section
   - Provide strong justification
   - Explain impact on Acceptance Criteria
5. **If you discover new issues**: Add to "Open Issues" table

---

Note: You MUST NOT try to exit `start-rlcr-loop` loop by lying or edit loop state file or try to execute `cancel-rlcr-loop`

After completing the work, please:
0. If you have access to the `code-simplifier` agent, use it to review and optimize the code you just wrote
1. Finalize @/app/workspaces/c6162566-aff8-4634-b3e4-0a4c80c8e597/.humanize/rlcr/2026-04-18_16-22-55/goal-tracker.md (this is Round 0, so you are initializing it - see "Goal Tracker Setup" above)
2. Commit your changes with a descriptive commit message
3. Write your work summary into @/app/workspaces/c6162566-aff8-4634-b3e4-0a4c80c8e597/.humanize/rlcr/2026-04-18_16-22-55/round-0-summary.md

Note: Since `--push-every-round` is enabled, you must push your commits to remote after each round.
