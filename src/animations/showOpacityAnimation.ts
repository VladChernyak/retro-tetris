import { gsap } from "@/plugins/gsap";

interface IOpacityAnimationOptions {
  reversed: boolean;
}

export const showOpacityAnimation = (element: HTMLElement, options?: IOpacityAnimationOptions) => {
  return new Promise<any>((resolve) => {
    const timeline = gsap.timeline();

    timeline.fromTo(
      element,
      {
        opacity: options?.reversed ? 0 : 1,
      },
      {
        opacity: options?.reversed ? 1 : 0,
        position: options?.reversed ? "" : "absolute",
        onComplete: resolve,
        duration: 0.5,
      }
    );
  });
};
