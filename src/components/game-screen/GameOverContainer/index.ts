import { AbstractComponent } from "@/ts/abstract";
import { showScaleAnimation } from "@/animations/showScaleAnimation";
import { isMobileBrowser } from "@/utils/checkMobileBrowser";
import { playAudio } from "@/utils/playAudio";

import gameOverAudioUrl from "@/assets/sounds/game-over.mp3";
import playAudioUrl from "@/assets/sounds/play.mp3";

export class GameOverContainer extends AbstractComponent {
  private SCORE_CONTAINER_SELECTOR = "#game-screen-game-over-score";
  private MENU_SELECTOR = "#game-screen-game-over-menu";
  private MENU_ITEM_ACTIVE_CLASS = "active";

  private menuListenerParams: IControlsListenerParams<"keydown" | "click">;
  private playAgainCallback: Function;
  private quitCallback: Function;

  constructor() {
    super({ templateSelector: "#game-screen-game-over", title: "Game Over" });
  }

  private setScore() {
    const scoreContainerElement = this.rootElement.querySelector(this.SCORE_CONTAINER_SELECTOR)!;
    const lastScore = localStorage.getItem("last-score");

    scoreContainerElement.innerHTML = `<b>Score:</b> ${lastScore}`;
  }

  private playAgain() {
    playAudio(playAudioUrl);
    this.playAgainCallback();
  }

  private onKeyDown({ code }: KeyboardEvent) {
    const menuContainer = this.rootElement.querySelector(this.MENU_SELECTOR)!;
    const [yes, no] = menuContainer.querySelectorAll("li");

    switch (code) {
      case "ArrowLeft":
        yes.classList.add(this.MENU_ITEM_ACTIVE_CLASS);
        no.classList.remove(this.MENU_ITEM_ACTIVE_CLASS);
        break;

      case "ArrowRight":
        no.classList.add(this.MENU_ITEM_ACTIVE_CLASS);
        yes.classList.remove(this.MENU_ITEM_ACTIVE_CLASS);
        break;

      case "Enter":
        if (yes.classList.contains(this.MENU_ITEM_ACTIVE_CLASS)) {
          this.playAgain();
        } else {
          window.removeEventListener(this.menuListenerParams.eventName, this.menuListenerParams.handler);
          this.quitCallback();
        }
    }
  }

  private onClick({ target }: MouseEvent) {
    const button = (target as HTMLElement).closest("button");

    if (!button) return;

    switch (button.id) {
      case "yes-btn":
        this.playAgain();
        break;

      case "no-btn":
        window.removeEventListener(this.menuListenerParams.eventName, this.menuListenerParams.handler);
        this.quitCallback();
        break;
    }
  }

  private initKeydownListener() {
    if (isMobileBrowser) {
      this.menuListenerParams = {
        eventName: "click",
        handler: this.onClick.bind(this),
      } as IControlsListenerParams<"click">;
    } else {
      this.menuListenerParams = {
        eventName: "keydown",
        handler: this.onKeyDown.bind(this),
      } as IControlsListenerParams<"keydown">;
    }

    window.addEventListener(this.menuListenerParams.eventName, this.menuListenerParams.handler);
  }

  public onPlayAgain(callback: Function) {
    this.playAgainCallback = callback;
  }

  public onQuit(callback: Function) {
    this.quitCallback = callback;
  }

  protected beforeRemove() {
    window.removeEventListener(this.menuListenerParams.eventName, this.menuListenerParams.handler);
  }

  protected async afterRender() {
    playAudio(gameOverAudioUrl);
    this.setScore();
    await showScaleAnimation(this.rootElement);
    this.initKeydownListener();
  }
}
