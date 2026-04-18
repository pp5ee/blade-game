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
});
