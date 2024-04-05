import { gsap } from "@/plugins/gsap";

export const showBlinkAnimation = async (element: HTMLElement) => {
  return new Promise<any>((resolve) => {
    gsap.set(element, { duration: 0.02, backgroundColor: "#fff" });
    gsap.to(element, {
      duration: 0.05,
      opacity: 0,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        gsap.set(element, { clearProps: "all" });
        resolve(true);
      },
    });
  });
};
