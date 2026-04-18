import { describe, expect, it } from 'vitest';
import { chooseNpcState, isEndgame } from './ai';
import { createInventory } from './inventory';
import type { Actor, Pickup } from './types';

function actor(id: number, inventory = createInventory(), x = 0, y = 0): Actor {
  return {
    id,
    kind: 'npc',
    position: { x, y },
    velocity: { x: 0, y: 0 },
    radius: 10,
    speed: 0,
    inventory,
    alive: true,
    npcState: 'wander',
    recoverUntil: 0,
  };
}

function pickup(id: number, color: 'red' | 'yellow' | 'blue', amount: number, x: number, y: number): Pickup {
  return { id, color, amount, position: { x, y }, radius: 10 };
}

describe('ai', () => {
  it('flees from stronger nearby enemies', () => {
    const self = actor(1, createInventory({ red: 0, yellow: 2, blue: 1 }), 0, 0);
    const enemy = actor(2, createInventory({ red: 3, yellow: 0, blue: 0 }), 80, 0);
    expect(chooseNpcState(self, [self, enemy], [], 0)).toBe('flee');
  });

  it('chases weaker targets when favorable', () => {
    const self = actor(1, createInventory({ red: 3, yellow: 1, blue: 0 }), 0, 0);
    const enemy = actor(2, createInventory({ red: 1, yellow: 1, blue: 0 }), 100, 0);
    expect(chooseNpcState(self, [self, enemy], [], 0)).toBe('chase');
  });

  it('loots when a pickup is attractive and no strong threat exists', () => {
    const self = actor(1, createInventory({ red: 0, yellow: 1, blue: 1 }), 0, 0);
    const loot = pickup(1, 'red', 2, 50, 0);
    expect(chooseNpcState(self, [self], [loot], 0)).toBe('loot');
  });

  it('enters recover after recent combat pressure', () => {
    const self = actor(1, createInventory({ red: 2, yellow: 1, blue: 0 }), 0, 0);
    self.recoverUntil = 1000;
    expect(chooseNpcState(self, [self], [], 100)).toBe('recover');
  });

  it('triggers endgame on time or low survivors', () => {
    const a = actor(1);
    const b = actor(2);
    const c = actor(3);
    const d = actor(4);
    expect(isEndgame(151000, [a, b, c, d])).toBe(true);
    expect(isEndgame(0, [a, b, c, d])).toBe(true);
  });
});
