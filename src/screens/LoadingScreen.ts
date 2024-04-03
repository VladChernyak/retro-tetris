import { Howl } from "howler";
import { AbstractScreen } from "@/ts/abstract";
import { isMobileBrowser } from "@/utils/checkMobileBrowser";
import { playAudio } from "@/utils/playAudio";

import buttonOnAudioUrl from "@/assets/sounds/button-on.mp3";

export class LoadingScreen extends AbstractScreen {
  private PROGRESS_SELECTOR = "#progress";
  private PROGRESS_VALUE_SELECTOR = "#progress-value";

  private progressElement: HTMLElement;
  private progressValueElement: HTMLElement;

  private progressValue = 0;

  private continueListenerParams: IControlsListenerParams<"keydown" | "touchend">;
  private onContinueCallback?: Function;

  constructor() {
    super({ templateSelector: "#loading-screen" });
  }

  private setProgressElements() {
    const progressElement = document.querySelector<HTMLElement>(this.PROGRESS_SELECTOR);
    const progressValueElement = document.querySelector<HTMLElement>(this.PROGRESS_VALUE_SELECTOR);

    if (!progressElement) {
      throw new Error(`Progress with selector "${this.PROGRESS_SELECTOR}" is not found`);
    }

    if (!progressValueElement) {
      throw new Error(`Progress value with selector "${this.PROGRESS_SELECTOR}" is not found`);
    }

    this.progressElement = progressElement;
    this.progressValueElement = progressValueElement;
  }

  private get progress() {
    return this.progressValue;
  }

  private set progress(value) {
    this.progressValue = value;
    this.renderCurrentProgress();
  }

  private renderCurrentProgress() {
    const PROGRESS_CELL_WIDTH = 35;
    const progressValueMaxWidth = this.progressElement.clientWidth;
    const progressValueWidth = (this.progressValue / 100) * progressValueMaxWidth;
    const roundedProgressValueWidth = progressValueWidth - (progressValueWidth % PROGRESS_CELL_WIDTH);

    this.progressValueElement.style.display = "block";
    this.progressValueElement.style.width = `${roundedProgressValueWidth}px`;
  }

  private preloadMedia(urls: Record<string, string>, constructor: Constructable<HTMLMediaElement | HTMLImageElement>) {
    const allMedia = Object.values(urls);
    const promises: Promise<any>[] = [];

    allMedia.forEach((url) => {
      const media = new constructor();

      media.src = url;

      promises.push(
        new Promise((resolve) => {
          media.onload = resolve;
        })
      );
    });

    return Promise.all(promises);
  }

  private async preloadImages() {
    const imageUrls = import.meta.glob("@/assets/images/**/*.*", { eager: true, as: "url" });
    await this.preloadMedia(imageUrls, Image);
  }

  private preloadAudio() {
    const audioUrls = import.meta.glob("@/assets/sounds/**/*.*", { eager: true, as: "url" });
    const promises: Promise<any>[] = [];

    Object.values(audioUrls).forEach((url) => {
      const promise = new Promise((resolve) => {
        new Howl({
          src: url,
          preload: true,
          onload: resolve,
        });
      });

      promises.push(promise);
    });

    return Promise.all(promises);
  }

  private onFontsLoaded() {
    return new Promise((resolve) => {
      document.fonts.ready.then(() => resolve(true));
    });
  }

  private continue(event: KeyboardEvent | TouchEvent) {
    if (event instanceof KeyboardEvent && event.code !== "Enter") return;

    window.removeEventListener(this.continueListenerParams.eventName, this.continueListenerParams.handler);

    playAudio(buttonOnAudioUrl);
    this.rootElement.innerHTML = "";

    setTimeout(() => {
      if (this.onContinueCallback) this.onContinueCallback();
    }, 700);
  }

  private setContinueReadyState() {
    const continueText = isMobileBrowser ? "Tap to continue" : "Press ENTER to continue";
    this.rootElement.innerHTML = continueText;

    if (isMobileBrowser) {
      this.continueListenerParams = {
        eventName: "touchend",
        handler: this.continue.bind(this),
      };
    } else {
      this.continueListenerParams = {
        eventName: "keydown",
        handler: this.continue.bind(this),
      };
    }

    window.addEventListener(this.continueListenerParams.eventName, this.continueListenerParams.handler);
  }

  private async preloadAll() {
    const tasks = [this.onFontsLoaded(), this.preloadAudio(), this.preloadImages()];

    tasks.forEach((task) => {
      task.then(() => {
        const percentComplete = Math.ceil(100 / tasks.length);
        this.progress += percentComplete;
      });
    });

    await Promise.all(tasks);
    setTimeout(() => this.setContinueReadyState(), 700);
  }

  protected afterRender() {
    this.setProgressElements();
    this.preloadAll();
  }

  protected beforeRemove() {
    window.removeEventListener(this.continueListenerParams.eventName, this.continueListenerParams.handler);
  }

  public onContinue(callback: typeof this.onContinueCallback) {
    this.onContinueCallback = callback;
  }
}
