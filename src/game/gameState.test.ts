import { describe, expect, it } from 'vitest';
import { gameConfig } from '../config/gameConfig';
import { createInventory, getTotalBlades } from './inventory';
import { GameState } from './gameState';

describe('game state', () => {
  it('does not move before initialization', () => {
    const state = new GameState();
    state.initialized = false;
    const startX = state.player.position.x;
    state.update(16, { up: false, down: false, left: false, right: true, restart: false });
    expect(state.player.position.x).toBe(startX);
  });

  it('clamps player movement inside arena bounds', () => {
    const state = new GameState();
    state.actors = [state.player];
    state.safeRadius = 9999;
    state.player.position.x = gameConfig.actors.playerRadius + 10;
    state.update(1000, { up: false, down: false, left: true, right: false, restart: false });
    expect(state.player.position.x).toBe(gameConfig.actors.playerRadius);
  });

  it('collects pickups once inside pickup radius', () => {
    const state = new GameState();
    state.actors = [state.player];
    state.pickups = [{ id: 1, color: 'red', amount: 3, radius: 8, position: { ...state.player.position } }];
    const before = state.player.inventory.red;
    state.update(16, { up: false, down: false, left: false, right: false, restart: false });
    expect(state.pickups.some((pickup) => pickup.id === 1)).toBe(false);
    expect(state.player.inventory.red).toBe(before + 3);
  });

  it('does not collect pickups outside pickup radius', () => {
    const state = new GameState();
    state.actors = [state.player];
    state.pickups = [{ id: 1, color: 'red', amount: 3, radius: 8, position: { x: state.player.position.x + 200, y: state.player.position.y } }];
    const before = state.player.inventory.red;
    state.update(16, { up: false, down: false, left: false, right: false, restart: false });
    expect(state.pickups.some((pickup) => pickup.id === 1)).toBe(true);
    expect(state.player.inventory.red).toBe(before);
  });

  it('declares defeat or victory based on survivors', () => {
    const defeatState = new GameState();
    defeatState.player.alive = false;
    defeatState.update(16, { up: false, down: false, left: false, right: false, restart: false });
    expect(defeatState.matchState).toBe('defeat');

    const victoryState = new GameState();
    for (const actor of victoryState.actors) {
      if (actor.id !== victoryState.player.id) {
        actor.alive = false;
      }
    }
    victoryState.update(16, { up: false, down: false, left: false, right: false, restart: false });
    expect(victoryState.matchState).toBe('victory');
  });

  it('keeps per-color inventory counts separate', () => {
    const inventory = createInventory({ red: 1, yellow: 2, blue: 3 });
    expect(inventory.red).toBe(1);
    expect(inventory.yellow).toBe(2);
    expect(inventory.blue).toBe(3);
    expect(getTotalBlades(inventory)).toBe(6);
  });

  it('activates endgame pressure when survivor threshold is reached', () => {
    const state = new GameState();
    state.safeRadius = 9999;
    state.now = gameConfig.arena.shrinkIntervalMs + 1;
    state.nextShrinkAt = gameConfig.arena.shrinkIntervalMs;
    const initialRadius = state.safeRadius;
    const allButPlayer = state.actors.filter((a) => a.id !== state.player.id);
    const targetSurvivors = gameConfig.match.endgameSurvivorThreshold;
    // Kill all NPCs except targetSurvivors (4) - leaving 4 NPCs + 1 player = 5 total, which is > threshold
    // Need 4 total survivors (targetSurvivors) to trigger isEndgame: survivors <= 4
    const keepAlive = targetSurvivors - 1; // Keep 3 NPCs alive
    for (let i = keepAlive; i < allButPlayer.length; i += 1) {
      allButPlayer[i].alive = false;
    }
    const survivorsBefore = state.survivors;
    expect(survivorsBefore).toBe(targetSurvivors);

    state.update(16, { up: false, down: false, left: false, right: false, restart: false });

    expect(state.safeRadius).toBeLessThan(initialRadius);
  });

  it('activates endgame pressure when time threshold is reached', () => {
    const state = new GameState();
    state.safeRadius = 9999;
    const initialRadius = state.safeRadius;
    state.now = gameConfig.match.endgameTimeMs;

    state.update(gameConfig.arena.shrinkIntervalMs + 1, { up: false, down: false, left: false, right: false, restart: false });

    expect(state.safeRadius).toBeLessThan(initialRadius);
  });

  it('does not process gameplay events after match ends', () => {
    const state = new GameState();
    state.matchState = 'victory';
    const initialPickupCount = state.pickups.length;
    const initialPlayerX = state.player.position.x;

    state.update(16, { up: false, down: false, left: false, right: true, restart: false });

    expect(state.player.position.x).toBe(initialPlayerX);
    expect(state.pickups.length).toBe(initialPickupCount);
  });
});
