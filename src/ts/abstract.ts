export interface IContructorParams {
  templateSelector: string;
}

export abstract class AbstractScreen {
  protected template: HTMLTemplateElement;
  protected rootElement: HTMLElement;

  constructor({ templateSelector }: IContructorParams) {
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

  protected beforeRender?(): void;
  protected afterRender?(): void;

  public async render(container: HTMLElement) {
    if (!this.template) {
      throw new Error("Template is empty");
    }

    if (this.beforeRender) {
      await this.beforeRender();
    }

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
