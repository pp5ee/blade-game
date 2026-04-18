import type { BladeColor } from '../config/gameConfig';

export type Inventory = Record<BladeColor, number>;

export type ActorKind = 'player' | 'npc';
export type MatchState = 'playing' | 'victory' | 'defeat';
export type NpcState = 'loot' | 'chase' | 'flee' | 'recover' | 'wander';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Pickup {
  id: number;
  color: BladeColor;
  amount: number;
  position: Vec2;
  radius: number;
}

export interface Actor {
  id: number;
  kind: ActorKind;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  speed: number;
  inventory: Inventory;
  alive: boolean;
  npcState: NpcState;
  recoverUntil: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  restart: boolean;
}

export interface CombatOutcome {
  winner: Actor;
  loser: Actor;
}
