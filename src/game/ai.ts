import { gameConfig } from '../config/gameConfig';
import { distance } from './math';
import { getWeightedPower } from './inventory';
import type { Actor, NpcState, Pickup } from './types';

export function chooseNpcState(actor: Actor, actors: Actor[], pickups: Pickup[], now: number): NpcState {
  const selfPower = Math.max(1, getWeightedPower(actor.inventory));
  const nearbyEnemies = actors
    .filter((candidate) => candidate.alive && candidate.id !== actor.id)
    .map((candidate) => ({
      actor: candidate,
      distance: distance(actor.position, candidate.position),
      ratio: selfPower / Math.max(1, getWeightedPower(candidate.inventory)),
    }))
    .filter((candidate) => candidate.distance <= gameConfig.ai.senseRange)
    .sort((left, right) => left.distance - right.distance || left.actor.id - right.actor.id);

  const fleeThreat = nearbyEnemies.find(
    (candidate) =>
      (candidate.distance <= gameConfig.ai.fleeRange && candidate.ratio <= gameConfig.ai.fleeRatio) ||
      (candidate.distance <= gameConfig.ai.fleeCloseRange && candidate.ratio <= gameConfig.ai.fleeCloseRatio),
  );

  if (fleeThreat) {
    return 'flee';
  }

  const crowdCount = nearbyEnemies.filter((candidate) => candidate.distance <= gameConfig.ai.crowdRange).length;
  if (actor.recoverUntil > now || crowdCount >= 2) {
    return 'recover';
  }

  const chaseRatio = isEndgame(now, actors) ? gameConfig.ai.aggressionEndgameRatio : gameConfig.ai.chaseRatio;
  const chaseCandidate = nearbyEnemies.find(
    (candidate) => candidate.distance <= gameConfig.ai.chaseRange && candidate.ratio >= chaseRatio,
  );

  if (chaseCandidate && chaseCandidate.ratio >= gameConfig.ai.lootPreferenceRatio) {
    return 'chase';
  }

  const bestPickup = pickups
    .map((pickup) => ({
      pickup,
      score: getWeightedValue(pickup.color, pickup.amount) / (distance(actor.position, pickup.position) + 40),
      distance: distance(actor.position, pickup.position),
    }))
    .filter((item) => item.distance <= gameConfig.ai.senseRange)
    .sort((left, right) => right.score - left.score || left.distance - right.distance || left.pickup.id - right.pickup.id)[0];

  if (bestPickup) {
    return chaseCandidate ? 'chase' : 'loot';
  }

  if (chaseCandidate) {
    return 'chase';
  }

  return 'wander';
}

export function isEndgame(now: number, actors: Actor[]): boolean {
  const survivors = actors.filter((actor) => actor.alive).length;
  return survivors <= gameConfig.match.endgameSurvivorThreshold || now >= gameConfig.match.endgameTimeMs;
}

function getWeightedValue(color: 'red' | 'yellow' | 'blue', amount: number): number {
  return gameConfig.blades.weights[color] * amount;
}
