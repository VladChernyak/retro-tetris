import { gsap } from "@/plugins/gsap";

export const showScaleAnimation = (element: HTMLElement) => {
  return new Promise<any>((resolve) => {
    gsap.set(element, { transform: "scale(0)" });
    gsap.to(element, {
      transform: "scale(1)",
      ease: "steps(20)",
      duration: 1.2,
      onComplete: resolve,
    });
  });
};
