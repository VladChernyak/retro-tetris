export interface IContructorParams {
  templateSelector: string;
  title?: string;
}

export abstract class AbstractScreen {
  protected template: HTMLTemplateElement;
  protected rootElement: HTMLElement;
  protected title?: string;

  constructor({ templateSelector, title }: IContructorParams) {
    this.title = title;
    this.cutTemplate(templateSelector);
  }

  protected cutTemplate(templateSelector: string) {
    const template = document.querySelector<HTMLTemplateElement>(templateSelector);

    if (!template) {
      throw new Error(`Template with selector "${templateSelector}" is not found`);
    }

    template.remove();
    this.template = template;
  }

  protected setDocumentTitle() {
    document.title = this.title ? `${this.title} | TETRIS` : "TETRIS";
  }

  protected beforeRender?(): void;
  protected afterRender?(): void;

  public async render(container: HTMLElement) {
    if (!this.template) {
      throw new Error("Template is empty");
    }

    if (this.beforeRender) {
      await this.beforeRender();
    }

    this.setDocumentTitle();

    this.rootElement = this.template.content.firstElementChild?.cloneNode(true) as HTMLElement;
    container.append(this.rootElement);

    if (this.afterRender) this.afterRender();
  }

  protected beforeRemove?(): void;
  protected afterRemove?(): void;

  public remove() {
    if (this.beforeRemove) this.beforeRemove();
    this.rootElement.remove();
    if (this.afterRemove) this.afterRemove();
  }
}

export class AbstractComponent extends AbstractScreen {}
