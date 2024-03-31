import { LoadingScreen } from "./screens/LoadingScreen";
import { StartScreen } from "@/screens/StartScreen.ts";
import { GameScreen } from "@/screens/GameScreen";
import { showTurnOnEffect } from "./animations/showTurnOnEffect";
import "@/assets/styles/main.scss";
import { showPixelFillEffect } from "./animations/showPixelFillEffect";

class Tetris {
  private CONTAINER_SELECTOR = "#tetris";
  private container = document.querySelector<HTMLElement>(this.CONTAINER_SELECTOR)!;

  private loadingScreen = new LoadingScreen();
  private startScreen = new StartScreen();
  private gameScreen = new GameScreen();

  constructor() {
    this.init();
  }

  private async init() {
    this.loadingScreen.onContinue(async () => {
      this.loadingScreen.remove();
      await showTurnOnEffect(this.CONTAINER_SELECTOR);
      this.startScreen.render(this.container);
    });

    this.startScreen.onStart(() => {
      this.startScreen.remove();
      this.gameScreen.render(this.container);
    });

    this.gameScreen.onQuit(async () => {
      await showPixelFillEffect(this.container, { color: "#112336", onFilled: () => this.gameScreen.remove() });
      this.startScreen.render(this.container);
    });

    await this.loadingScreen.render(this.container);
  }
}

new Tetris();
