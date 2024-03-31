import { AbstractComponent } from "@/ts/abstract";
import { showScaleAnimation } from "@/animations/showScaleAnimation";
import { isMobileBrowser } from "@/utils/checkMobileBrowser";

export class PauseContainer extends AbstractComponent {
  private MENU_SELECTOR = "#game-screen-pause-menu";
  private MENU_ITEM_ACTIVE_CLASS = "active";

  private menuListenerParams: IControlsListenerParams<"keydown" | "click">;
  private resumeCallback: Function;
  private quitCallback: Function;

  constructor() {
    super({ templateSelector: "#game-screen-pause" });
  }

  private onKeyDown({ code }: KeyboardEvent) {
    const menuContainer = this.rootElement.querySelector(this.MENU_SELECTOR)!;
    const [resume, quit] = menuContainer.querySelectorAll("li");

    switch (code) {
      case "Escape":
        this.resumeCallback();
        break;

      case "ArrowUp":
        resume.classList.add(this.MENU_ITEM_ACTIVE_CLASS);
        quit.classList.remove(this.MENU_ITEM_ACTIVE_CLASS);
        break;

      case "ArrowDown":
        quit.classList.add(this.MENU_ITEM_ACTIVE_CLASS);
        resume.classList.remove(this.MENU_ITEM_ACTIVE_CLASS);
        break;

      case "Enter":
        if (resume.classList.contains(this.MENU_ITEM_ACTIVE_CLASS)) {
          this.resumeCallback();
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
      case "resume-btn":
        this.resumeCallback();
        break;

      case "quit-btn":
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

  public onResume(callback: Function) {
    this.resumeCallback = callback;
  }

  public onQuit(callback: Function) {
    this.quitCallback = callback;
  }

  protected beforeRemove() {
    window.removeEventListener(this.menuListenerParams.eventName, this.menuListenerParams.handler);
  }

  protected async afterRender() {
    await showScaleAnimation(this.rootElement);
    this.initKeydownListener();
  }
}
