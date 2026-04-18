import type { InputState } from '../game/types';

export class InputController {
  readonly state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    restart: false,
  };

  private readonly keyMap: Record<string, keyof InputState> = {
    w: 'up',
    arrowup: 'up',
    s: 'down',
    arrowdown: 'down',
    a: 'left',
    arrowleft: 'left',
    d: 'right',
    arrowright: 'right',
    r: 'restart',
  };

  attach(): void {
    window.addEventListener('keydown', (event) => this.setKey(event.key, true));
    window.addEventListener('keyup', (event) => this.setKey(event.key, false));
  }

  consumeRestart(): boolean {
    const value = this.state.restart;
    this.state.restart = false;
    return value;
  }

  private setKey(rawKey: string, pressed: boolean): void {
    const key = this.keyMap[rawKey.toLowerCase()];
    if (!key) {
      return;
    }

    this.state[key] = pressed;
  }
}
