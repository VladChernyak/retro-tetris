import { AbstractScreen } from "@/ts/abstract";
import { type IStarsBgAnimationSettings, showStarsBgAnimation } from "@/animations/showStarsBgAnimation";

import { GameContainer } from "@/components/game-screen/GameContainer";
import { GameOverContainer } from "@/components/game-screen/GameOverContainer";
import { PauseContainer } from "@/components/game-screen/PauseContainer";

export class GameScreen extends AbstractScreen {
  private BG_ANIMATION_CONTAINER_SELECTOR = "#game-screen-animated-bg";

  private gameContainer = new GameContainer();
  private gameOverContainer = new GameOverContainer();
  private pauseContainer = new PauseContainer();

  private starsBgAnimationSettings: IStarsBgAnimationSettings;
  private quitCallback: Function;

  constructor() {
    super({ templateSelector: "#game-screen" });
    this.init();
  }

  private onGameOver() {
    this.rootElement.style.backgroundColor = "#000";
    this.starsBgAnimationSettings.toggleCustomClass("scull");

    this.gameContainer.remove();
    this.gameOverContainer.render(this.rootElement);
  }

  private onPause() {
    this.rootElement.style.backgroundColor = "#1e2b1d";
    this.starsBgAnimationSettings.toggleCustomClass("pause");
    this.pauseContainer.render(this.rootElement);
  }

  private playAgain() {
    this.gameOverContainer.remove();
    this.rootElement.style.backgroundColor = "";
    this.starsBgAnimationSettings.toggleCustomClass("scull");

    setTimeout(() => this.gameContainer.render(this.rootElement), 500);
  }

  private resume() {
    this.pauseContainer.remove();
    this.rootElement.style.backgroundColor = "";
    this.starsBgAnimationSettings.toggleCustomClass("pause");

    setTimeout(() => this.gameContainer.resume(), 500);
  }

  private quit() {
    if (this.quitCallback) this.quitCallback();
  }

  private init() {
    this.gameContainer.onGameOver(() => this.onGameOver());
    this.gameContainer.onPause(() => this.onPause());
    this.gameOverContainer.onPlayAgain(() => this.playAgain());
    this.gameOverContainer.onQuit(() => this.quit());
    this.pauseContainer.onQuit(() => this.quit());
    this.pauseContainer.onResume(() => this.resume());
  }

  public onQuit(callback: Function) {
    this.quitCallback = callback;
  }

  protected afterRender() {
    setTimeout(async () => {
      this.starsBgAnimationSettings = await showStarsBgAnimation(this.BG_ANIMATION_CONTAINER_SELECTOR)!;
      this.gameContainer.render(this.rootElement);
    }, 500);
  }
}
