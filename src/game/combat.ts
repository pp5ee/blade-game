import { gameConfig, type BladeColor } from '../config/gameConfig';
import { cloneInventory, getTotalBlades, getWeightedPower, removeWeakestPower } from './inventory';
import type { Actor, CombatOutcome, Inventory, Pickup } from './types';

export function compareActorsForCombat(left: Actor, right: Actor): number {
  const leftPower = getWeightedPower(left.inventory);
  const rightPower = getWeightedPower(right.inventory);

  if (leftPower !== rightPower) {
    return leftPower - rightPower;
  }

  if (left.inventory.red !== right.inventory.red) {
    return left.inventory.red - right.inventory.red;
  }

  const leftTotal = getTotalBlades(left.inventory);
  const rightTotal = getTotalBlades(right.inventory);

  if (leftTotal !== rightTotal) {
    return leftTotal - rightTotal;
  }

  return right.id - left.id;
}

export function resolveCombat(left: Actor, right: Actor): CombatOutcome {
  const comparison = compareActorsForCombat(left, right);
  const winner = comparison >= 0 ? left : right;
  const loser = comparison >= 0 ? right : left;
  const loserPower = getWeightedPower(loser.inventory);
  const lossPower = Math.max(
    gameConfig.combat.minWinnerLossPower,
    Math.ceil(loserPower * gameConfig.combat.winnerLossFactor),
  );

  removeWeakestPower(winner.inventory, lossPower);
  loser.alive = false;

  return { winner, loser };
}

export function compressInventoryToDrops(
  inventory: Inventory,
  origin: { x: number; y: number },
  nextId: () => number,
): Pickup[] {
  const entries = (['red', 'yellow', 'blue'] as BladeColor[])
    .filter((color) => inventory[color] > 0)
    .flatMap((color, colorIndex) => {
      const parts: Pickup[] = [];
      let remaining = inventory[color];
      let offsetIndex = 0;

      while (remaining > 0 && parts.length < gameConfig.pickups.maxBundlesPerDefeat) {
        const amount = Math.min(remaining, gameConfig.pickups.bundleMaxSize);
        const angle = colorIndex * 2.1 + offsetIndex * 0.45;
        parts.push({
          id: nextId(),
          color,
          amount,
          radius: 16 + Math.min(amount, 10),
          position: {
            x: origin.x + Math.cos(angle) * (22 + offsetIndex * 8),
            y: origin.y + Math.sin(angle) * (22 + offsetIndex * 8),
          },
        });
        remaining -= amount;
        offsetIndex += 1;
      }

      return parts;
    });

  return entries;
}

export function dropInventory(actor: Actor, nextId: () => number): Pickup[] {
  const inventory = cloneInventory(actor.inventory);
  return compressInventoryToDrops(inventory, actor.position, nextId);
}
