import { gameConfig, type BladeColor } from '../config/gameConfig';
import type { Inventory } from './types';

export function createInventory(seed?: Partial<Inventory>): Inventory {
  return {
    red: seed?.red ?? 0,
    yellow: seed?.yellow ?? 0,
    blue: seed?.blue ?? 0,
  };
}

export function cloneInventory(inventory: Inventory): Inventory {
  return createInventory(inventory);
}

export function getTotalBlades(inventory: Inventory): number {
  return inventory.red + inventory.yellow + inventory.blue;
}

export function getWeightedPower(inventory: Inventory): number {
  return (
    inventory.red * gameConfig.blades.weights.red +
    inventory.yellow * gameConfig.blades.weights.yellow +
    inventory.blue * gameConfig.blades.weights.blue
  );
}

export function addBlades(inventory: Inventory, color: BladeColor, amount: number): void {
  inventory[color] += amount;
}

export function removeWeakestPower(inventory: Inventory, lossPower: number): void {
  let remaining = lossPower;

  for (const color of gameConfig.combat.lossRemovalOrder) {
    while (remaining > 0 && inventory[color] > 0) {
      inventory[color] -= 1;
      remaining -= gameConfig.blades.weights[color];
    }
  }
}
