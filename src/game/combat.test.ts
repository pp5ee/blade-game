import { describe, expect, it } from 'vitest';
import { compareActorsForCombat, compressInventoryToDrops, resolveCombat } from './combat';
import { createInventory, getWeightedPower } from './inventory';
import type { Actor } from './types';

function actor(id: number, inventory = createInventory()): Actor {
  return {
    id,
    kind: 'npc',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 10,
    speed: 0,
    inventory,
    alive: true,
    npcState: 'wander',
    recoverUntil: 0,
  };
}

describe('combat', () => {
  it('uses weighted power before tie-breaks', () => {
    const left = actor(1, createInventory({ red: 1, yellow: 0, blue: 0 }));
    const right = actor(2, createInventory({ red: 0, yellow: 2, blue: 0 }));
    expect(compareActorsForCombat(left, right)).toBeLessThan(0);
  });

  it('breaks ties by red, then total, then deterministic actor order', () => {
    const redTieWinner = actor(1, createInventory({ red: 2, yellow: 0, blue: 0 }));
    const redTieLoser = actor(2, createInventory({ red: 0, yellow: 3, blue: 0 }));
    expect(compareActorsForCombat(redTieWinner, redTieLoser)).toBeGreaterThan(0);

    const totalTieWinner = actor(1, createInventory({ red: 1, yellow: 1, blue: 2 }));
    const totalTieLoser = actor(2, createInventory({ red: 1, yellow: 0, blue: 3 }));
    expect(compareActorsForCombat(totalTieWinner, totalTieLoser)).toBeGreaterThan(0);

    const orderWinner = actor(1, createInventory({ red: 1, yellow: 1, blue: 1 }));
    const orderLoser = actor(2, createInventory({ red: 1, yellow: 1, blue: 1 }));
    expect(compareActorsForCombat(orderWinner, orderLoser)).toBeGreaterThan(0);
  });

  it('reduces the winner inventory deterministically and defeats the loser', () => {
    const left = actor(1, createInventory({ red: 3, yellow: 1, blue: 2 }));
    const right = actor(2, createInventory({ red: 0, yellow: 2, blue: 2 }));
    const outcome = resolveCombat(left, right);
    expect(outcome.winner.id).toBe(1);
    expect(outcome.loser.alive).toBe(false);
    expect(getWeightedPower(outcome.winner.inventory)).toBeLessThan(13);
  });

  it('compresses large inventories into bounded drop bundles', () => {
    let nextId = 1;
    const drops = compressInventoryToDrops(createInventory({ red: 5, yellow: 0, blue: 27 }), { x: 0, y: 0 }, () => nextId++);
    expect(drops.length).toBe(4);
    expect(drops.map((drop) => drop.amount)).toEqual([5, 12, 12, 3]);
  });
});
