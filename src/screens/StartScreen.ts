import { AbstractScreen } from "@/ts/abstract";

import { type ITetrisBgAnimationReturnData, showTetrisBgAnimation } from "@/animations/showTetrisBgAnimation";
import { showExplodeAnimation } from "@/animations/showExplodeAnimation";
import { showPixelFillEffect } from "@/animations/showPixelFillEffect";
import { isMobileBrowser } from "@/utils/checkMobileBrowser";
import { playAudio } from "@/utils/playAudio";

import mainThemeAudioUrl from "@/assets/sounds/main-theme.mp3";
import startSoundAudioUrl from "@/assets/sounds/start.mp3";

export class StartScreen extends AbstractScreen {
  private BG_ANIMATION_CONTAINER_SELECTOR = "#start-screen-animated-bg";
  private HIGH_SCORE_SELECTOR = "#start-screen-high-score";
  private START_TEXT_SELECTOR = "#start-screen-start-text";

  private bgAnimationData: ITetrisBgAnimationReturnData;
  private mainThemeAudio: Howl;

  private onStartCallback?: Function;
  private startListenerParams: IControlsListenerParams<"keydown" | "touchend">;

  constructor() {
    super({ templateSelector: "#start-screen" });
  }

  private showHighScore() {
    const highScoreElement = document.querySelector<HTMLDivElement>(this.HIGH_SCORE_SELECTOR)!;
    const highScore = localStorage.getItem("high-score");

    if (highScore) {
      highScoreElement.style.visibility = "visible";
      highScoreElement.innerHTML = `<b>HIGH SCORE</b>${highScore}`;
    } else {
      highScoreElement.style.visibility = "hidden";
    }
  }

  private async start() {
    window.removeEventListener(this.startListenerParams.eventName, this.startListenerParams.handler);

    this.mainThemeAudio.stop();
    playAudio(startSoundAudioUrl);

    const startTextElement = document.querySelector<HTMLElement>(this.START_TEXT_SELECTOR);

    if (startTextElement) {
      startTextElement.style.animation = "none";
    }

    if (this.bgAnimationData.animatedElement && this.bgAnimationData.killAnimation) {
      await showExplodeAnimation(this.bgAnimationData.animatedElement);
      this.bgAnimationData.killAnimation();
    }

    showPixelFillEffect(this.rootElement, { color: "#281D2C", onFilled: this.onStartCallback });
  }

  private startListener(event: KeyboardEvent | TouchEvent) {
    if (event instanceof KeyboardEvent && event.code !== "Enter") return;
    this.start();
  }

  protected async afterRender() {
    this.showHighScore();

    this.mainThemeAudio = await playAudio(mainThemeAudioUrl, { loop: true });
    this.bgAnimationData = showTetrisBgAnimation(this.BG_ANIMATION_CONTAINER_SELECTOR);

    if (isMobileBrowser) {
      this.startListenerParams = {
        eventName: "touchend",
        handler: this.startListener.bind(this),
      };
    } else {
      this.startListenerParams = {
        eventName: "keydown",
        handler: this.startListener.bind(this),
      };
    }

    window.addEventListener(this.startListenerParams.eventName, this.startListenerParams.handler);
  }

  public onStart(callback: Function) {
    this.onStartCallback = callback;
  }
}
