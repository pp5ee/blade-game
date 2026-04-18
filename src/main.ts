import './styles/global.css';
import { GameState } from './game/gameState';
import { InputController } from './ui/input';
import { GameRenderer } from './ui/gameRenderer';

async function main(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) {
    throw new Error('Missing app host');
  }

  const state = new GameState();
  const input = new InputController();
  const renderer = new GameRenderer(host);

  input.attach();
  await renderer.init();
  renderer.app.ticker.add((ticker) => {
    state.update(ticker.deltaMS, { ...input.state, restart: input.consumeRestart() });
    renderer.render(state);
  });
}

void main();
