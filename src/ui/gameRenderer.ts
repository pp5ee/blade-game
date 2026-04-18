import * as PIXI from 'pixi.js';
import { gameConfig } from '../config/gameConfig';
import { getTotalBlades } from '../game/inventory';
import type { Actor, Pickup } from '../game/types';
import { GameState } from '../game/gameState';

const bladeColors = {
  red: 0xff4466,
  yellow: 0xffd84d,
  blue: 0x47b8ff,
} as const;

export class GameRenderer {
  readonly app: PIXI.Application;
  readonly hud: HTMLDivElement;
  private readonly world = new PIXI.Container();
  private readonly arena = new PIXI.Graphics();
  private readonly safeZone = new PIXI.Graphics();
  private readonly pickupsLayer = new PIXI.Container();
  private readonly actorsLayer = new PIXI.Container();

  constructor(container: HTMLElement) {
    this.app = new PIXI.Application();
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    container.appendChild(this.hud);
  }

  async init(): Promise<void> {
    await this.app.init({
      resizeTo: window,
      background: '#050816',
      antialias: true,
    });

    this.app.stage.addChild(this.world);
    this.world.addChild(this.arena, this.safeZone, this.pickupsLayer, this.actorsLayer);
    document.getElementById('app')?.appendChild(this.app.canvas);
  }

  render(state: GameState): void {
    this.renderArena(state);
    this.renderPickups(state.pickups);
    this.renderActors(state.actors);
    this.renderCamera(state.player.position);
    this.renderHud(state);
  }

  private renderArena(state: GameState): void {
    this.arena.clear();
    this.arena.rect(0, 0, state.width, state.height).fill({ color: 0x071121 });
    this.arena.rect(16, 16, state.width - 32, state.height - 32).stroke({ color: 0x173456, width: 4 });

    this.safeZone.clear();
    this.safeZone.circle(state.center.x, state.center.y, state.safeRadius).stroke({ color: 0x2fe0ff, width: 3, alpha: 0.75 });
  }

  private renderPickups(pickups: Pickup[]): void {
    this.pickupsLayer.removeChildren();

    for (const pickup of pickups) {
      const glow = new PIXI.Graphics();
      glow.circle(pickup.position.x, pickup.position.y, pickup.radius).fill({ color: bladeColors[pickup.color], alpha: 0.24 });
      glow.circle(pickup.position.x, pickup.position.y, Math.max(6, pickup.radius - 7)).fill({ color: bladeColors[pickup.color], alpha: 0.92 });
      this.pickupsLayer.addChild(glow);
    }
  }

  private renderActors(actors: Actor[]): void {
    this.actorsLayer.removeChildren();

    for (const actor of actors.filter((candidate) => candidate.alive)) {
      const total = getTotalBlades(actor.inventory);
      const actorGraphic = new PIXI.Graphics();
      const bodyColor = actor.kind === 'player' ? 0xf2fbff : 0x93a8d3;
      actorGraphic.circle(actor.position.x, actor.position.y, actor.radius).fill({ color: bodyColor });
      actorGraphic.circle(actor.position.x, actor.position.y, actor.radius + 10).stroke({ color: actor.kind === 'player' ? 0x40f3ff : 0x7f6bff, width: 3, alpha: 0.7 });
      this.actorsLayer.addChild(actorGraphic);

      const orbitCount = Math.min(total, gameConfig.blades.maxRenderedOrbitBlades);
      const radius = gameConfig.blades.orbitRadiusBase + Math.min(total, 24) * gameConfig.blades.orbitRadiusStep;
      const colors = [
        ...Array(actor.inventory.red).fill('red'),
        ...Array(actor.inventory.yellow).fill('yellow'),
        ...Array(actor.inventory.blue).fill('blue'),
      ] as Array<keyof typeof bladeColors>;

      for (let index = 0; index < orbitCount; index += 1) {
        const angle = (index / orbitCount) * Math.PI * 2 + performance.now() / 700;
        const blade = new PIXI.Graphics();
        const x = actor.position.x + Math.cos(angle) * radius;
        const y = actor.position.y + Math.sin(angle) * radius;
        const color = bladeColors[colors[index % colors.length] ?? 'blue'];
        blade.roundRect(x - 3, y - 11, 6, 22, 3).fill({ color, alpha: 0.95 });
        blade.roundRect(x - 5, y - 13, 10, 26, 4).stroke({ color: 0xffffff, width: 1, alpha: 0.35 });
        this.actorsLayer.addChild(blade);
      }
    }
  }

  private renderCamera(player: { x: number; y: number }): void {
    const viewWidth = this.app.screen.width;
    const viewHeight = this.app.screen.height;
    const targetX = viewWidth / 2 - player.x;
    const targetY = viewHeight / 2 - player.y;
    const nextX = this.world.position.x + (targetX - this.world.position.x) * gameConfig.arena.cameraLerp;
    const nextY = this.world.position.y + (targetY - this.world.position.y) * gameConfig.arena.cameraLerp;
    const minX = Math.min(0, viewWidth - gameConfig.arena.width);
    const minY = Math.min(0, viewHeight - gameConfig.arena.height);
    this.world.position.x = Math.min(0, Math.max(minX, nextX));
    this.world.position.y = Math.min(0, Math.max(minY, nextY));
  }

  private renderHud(state: GameState): void {
    const hud = state.getHudState();
    this.hud.innerHTML = `
      <div class="hud__title">Blade Arena</div>
      <div>Total Blades <strong>${hud.total}</strong></div>
      <div>Power <strong>${hud.power}</strong></div>
      <div>Red <strong>${hud.red}</strong> Yellow <strong>${hud.yellow}</strong> Blue <strong>${hud.blue}</strong></div>
      <div>Survivors <strong>${hud.survivors}</strong></div>
      <div>State <strong>${hud.state}</strong></div>
      <div>Safe Radius <strong>${hud.safeRadius}</strong></div>
      <div class="hud__hint">WASD / arrows to move, R to restart</div>
    `;
  }
}
