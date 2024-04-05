import { gsap } from "@/plugins/gsap";

export const showFadeInAnimation = (element: HTMLElement) => {
  return new Promise((resolve) => {
    const timeline = gsap.timeline();

    timeline.set(element, { opacity: 0 });
    timeline.to(element, { delay: 0.1, opacity: 1, boxShadow: "0 0 0 10px #fff", ease: "steps(5)", duration: 0.3 });
    timeline.to(element, { boxShadow: "none", ease: "steps(5)", duration: 0.1, onComplete: resolve });
  });
};
