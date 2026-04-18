import { gameConfig, type BladeColor } from '../config/gameConfig';
import { chooseNpcState, isEndgame } from './ai';
import { compressInventoryToDrops, resolveCombat } from './combat';
import { add, clamp, distance, normalize, scale } from './math';
import { addBlades, createInventory, getTotalBlades, getWeightedPower } from './inventory';
import type { Actor, InputState, MatchState, Pickup, Vec2 } from './types';

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export class GameState {
  readonly width = gameConfig.arena.width;
  readonly height = gameConfig.arena.height;
  readonly center = { x: this.width / 2, y: this.height / 2 };
  safeRadius: number = gameConfig.arena.initialSafeRadius;
  matchState: MatchState = 'playing';
  now = 0;
  player: Actor;
  actors: Actor[] = [];
  pickups: Pickup[] = [];
  nextActorId = 1;
  nextPickupId = 1;
  initialized = false;
  private readonly rng: () => number;
  private nextShrinkAt = gameConfig.arena.shrinkIntervalMs;

  constructor(seed = 7) {
    this.rng = createRng(seed);
    this.player = this.createActor('player', this.center, gameConfig.actors.playerRadius, gameConfig.actors.playerSpeed);
    this.bootstrap();
  }

  bootstrap(): void {
    this.actors = [this.player];

    for (let index = 0; index < gameConfig.actors.npcCount; index += 1) {
      this.actors.push(
        this.createActor(
          'npc',
          this.randomArenaPoint(),
          gameConfig.actors.npcRadius,
          gameConfig.actors.npcSpeed,
        ),
      );
    }

    for (let index = 0; index < gameConfig.pickups.initialCount; index += 1) {
      this.pickups.push(this.createPickup());
    }

    this.initialized = true;
  }

  restart(): void {
    this.actors = [];
    this.pickups = [];
    this.nextActorId = 1;
    this.nextPickupId = 1;
    this.safeRadius = gameConfig.arena.initialSafeRadius;
    this.matchState = 'playing';
    this.now = 0;
    this.nextShrinkAt = gameConfig.arena.shrinkIntervalMs;
    this.player = this.createActor('player', this.center, gameConfig.actors.playerRadius, gameConfig.actors.playerSpeed);
    this.bootstrap();
  }

  update(deltaMs: number, input: InputState): void {
    if (!this.initialized) {
      return;
    }

    if (this.matchState !== 'playing') {
      if (input.restart) {
        this.restart();
      }
      return;
    }

    this.now += deltaMs;
    this.updatePlayerVelocity(input);
    this.updateNpcVelocities();
    this.moveActors(deltaMs / 1000);
    this.collectPickups();
    this.resolveCombats();
    this.pickups = this.pickups.filter((pickup) => this.isInsideSafeZone(pickup.position));
    this.refillPickups();
    this.updateEndgame();
    this.updateMatchState();
  }

  get survivors(): number {
    return this.actors.filter((actor) => actor.alive).length;
  }

  private updatePlayerVelocity(input: InputState): void {
    const x = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const y = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    this.player.velocity = scale(normalize({ x, y }), this.player.speed);
  }

  private updateNpcVelocities(): void {
    const aliveActors = this.actors.filter((actor) => actor.alive);

    for (const actor of aliveActors) {
      if (actor.kind !== 'npc') {
        continue;
      }

      actor.npcState = chooseNpcState(actor, aliveActors, this.pickups, this.now);
      actor.velocity = scale(this.chooseNpcDirection(actor, aliveActors), actor.speed);
    }
  }

  private chooseNpcDirection(actor: Actor, aliveActors: Actor[]): Vec2 {
    if (actor.npcState === 'loot') {
      const target = this.pickups
        .map((pickup) => ({ pickup, score: getWeightedPower(createInventory({ [pickup.color]: pickup.amount })), dist: distance(actor.position, pickup.position) }))
        .sort((left, right) => left.dist - right.dist || right.score - left.score || left.pickup.id - right.pickup.id)[0]?.pickup;

      if (target) {
        return normalize({ x: target.position.x - actor.position.x, y: target.position.y - actor.position.y });
      }
    }

    if (actor.npcState === 'chase') {
      const prey = aliveActors
        .filter((candidate) => candidate.id !== actor.id)
        .sort(
          (left, right) =>
            distance(actor.position, left.position) - distance(actor.position, right.position) || left.id - right.id,
        )[0];
      if (prey) {
        return normalize({ x: prey.position.x - actor.position.x, y: prey.position.y - actor.position.y });
      }
    }

    if (actor.npcState === 'flee' || actor.npcState === 'recover') {
      const threat = aliveActors
        .filter((candidate) => candidate.id !== actor.id)
        .sort(
          (left, right) =>
            distance(actor.position, left.position) - distance(actor.position, right.position) || left.id - right.id,
        )[0];
      if (threat) {
        return normalize({ x: actor.position.x - threat.position.x, y: actor.position.y - threat.position.y });
      }
    }

    const wanderAngle = ((actor.id * 97 + Math.floor(this.now / 1000) * 17) % 360) * (Math.PI / 180);
    return { x: Math.cos(wanderAngle), y: Math.sin(wanderAngle) };
  }

  private moveActors(deltaSeconds: number): void {
    for (const actor of this.actors) {
      if (!actor.alive) {
        continue;
      }

      actor.position = add(actor.position, scale(actor.velocity, deltaSeconds));
      actor.position.x = clamp(actor.position.x, actor.radius, this.width - actor.radius);
      actor.position.y = clamp(actor.position.y, actor.radius, this.height - actor.radius);

      if (!this.isInsideSafeZone(actor.position)) {
        const towardCenter = normalize({ x: this.center.x - actor.position.x, y: this.center.y - actor.position.y });
        actor.position = add(actor.position, scale(towardCenter, 120 * deltaSeconds));
      }
    }
  }

  private collectPickups(): void {
    const remaining: Pickup[] = [];

    for (const pickup of this.pickups) {
      const collector = this.actors.find(
        (actor) => actor.alive && distance(actor.position, pickup.position) <= gameConfig.actors.pickupRadius,
      );

      if (!collector) {
        remaining.push(pickup);
        continue;
      }

      addBlades(collector.inventory, pickup.color, pickup.amount);
    }

    this.pickups = remaining;
  }

  private resolveCombats(): void {
    const alive = this.actors.filter((actor) => actor.alive).sort((left, right) => left.id - right.id);

    for (let index = 0; index < alive.length; index += 1) {
      const actor = alive[index];
      if (!actor.alive) {
        continue;
      }

      for (let inner = index + 1; inner < alive.length; inner += 1) {
        const other = alive[inner];
        if (!other.alive) {
          continue;
        }

        if (distance(actor.position, other.position) > gameConfig.actors.combatRadius) {
          continue;
        }

        const { winner, loser } = resolveCombat(actor, other);
        winner.recoverUntil = this.now + gameConfig.ai.recoverDurationMs;
        const drops = compressInventoryToDrops(loser.inventory, loser.position, () => this.nextPickupId++);
        this.pickups.push(...drops.filter((pickup) => this.isInsideSafeZone(pickup.position)));
        loser.inventory = createInventory();
      }
    }
  }

  private refillPickups(): void {
    while (this.pickups.length < gameConfig.pickups.respawnTarget) {
      const candidate = this.createPickup();
      if (this.isInsideSafeZone(candidate.position)) {
        this.pickups.push(candidate);
      }
    }
  }

  private updateEndgame(): void {
    if (!isEndgame(this.now, this.actors)) {
      return;
    }

    if (this.now >= this.nextShrinkAt && this.safeRadius > gameConfig.arena.initialSafeRadius * gameConfig.arena.minimumSafeRadiusFactor) {
      this.safeRadius *= gameConfig.arena.shrinkFactor;
      this.nextShrinkAt += gameConfig.arena.shrinkIntervalMs;
    }
  }

  private updateMatchState(): void {
    if (!this.player.alive) {
      this.matchState = 'defeat';
      return;
    }

    if (this.survivors === 1 && this.player.alive) {
      this.matchState = 'victory';
    }
  }

  private createActor(kind: 'player' | 'npc', position: Vec2, radius: number, speed: number): Actor {
    return {
      id: this.nextActorId++,
      kind,
      position: { ...position },
      velocity: { x: 0, y: 0 },
      radius,
      speed,
      alive: true,
      npcState: 'wander',
      recoverUntil: 0,
      inventory: createInventory(gameConfig.actors.startingInventory),
    };
  }

  private createPickup(): Pickup {
    const colors: BladeColor[] = ['red', 'yellow', 'blue'];
    const amount =
      gameConfig.pickups.pickupAmountRange[0] +
      Math.floor(this.rng() * (gameConfig.pickups.pickupAmountRange[1] - gameConfig.pickups.pickupAmountRange[0] + 1));

    return {
      id: this.nextPickupId++,
      color: colors[Math.floor(this.rng() * colors.length)],
      amount,
      radius: 12 + amount * 2,
      position: this.randomArenaPoint(),
    };
  }

  private randomArenaPoint(): Vec2 {
    return {
      x: 80 + this.rng() * (this.width - 160),
      y: 80 + this.rng() * (this.height - 160),
    };
  }

  private isInsideSafeZone(position: Vec2): boolean {
    return distance(position, this.center) <= this.safeRadius;
  }

  getHudState(): Record<string, number | string> {
    return {
      total: getTotalBlades(this.player.inventory),
      red: this.player.inventory.red,
      yellow: this.player.inventory.yellow,
      blue: this.player.inventory.blue,
      power: getWeightedPower(this.player.inventory),
      survivors: this.survivors,
      state: this.matchState,
      safeRadius: Math.round(this.safeRadius),
    };
  }
}
