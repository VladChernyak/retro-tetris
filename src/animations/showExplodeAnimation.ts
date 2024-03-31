import { gsap, random } from "@/plugins/gsap";

interface IExplodeAnimationOptions {
  remove: boolean;
}

const PARTICLE_CLASS = "animation-explode-particle";
const PARTICLES_COUNT = 20;

export const showExplodeAnimation = (element: HTMLElement, options: IExplodeAnimationOptions = { remove: true }) => {
  const elementCoords = element.getBoundingClientRect();

  const startPosition = {
    x: elementCoords.left + elementCoords.width / 2,
    y: elementCoords.top + elementCoords.height / 2,
  };

  return new Promise((resolve) => {
    for (let i = 0; i < PARTICLES_COUNT; i++) {
      const particle = document.createElement("div");
      particle.className = PARTICLE_CLASS;

      element.insertAdjacentElement("beforebegin", particle);

      gsap.set(particle, startPosition);
      gsap.to(particle, {
        x: random(startPosition.x - 200, startPosition.x + 200),
        y: random(startPosition.y - 200, startPosition.y + 200),
        opacity: 0,
        ease: "steps(10)",
        duration: 1,
        onComplete: () => {
          particle.remove();
          resolve(true);
        },
      });
    }

    if (options.remove) element.remove();
  });
};
