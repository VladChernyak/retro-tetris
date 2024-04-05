import { gsap, random } from "@/plugins/gsap";

export interface IStarsBgAnimationSettings {
  toggleCustomClass: (className: string) => void;
}

const STARS_COUNT = 200;
const STAR_CLASS = "animation-stars-item";
const FADE_IN_DURATION = 1.5;

const animate = (container: HTMLElement, starElement: HTMLElement, fadeIn: boolean = false) => {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  if (fadeIn) {
    gsap.set(starElement, {
      opacity: 0,
    });

    gsap.to(starElement, {
      opacity: 0.8,
      duration: FADE_IN_DURATION,
    });
  }

  if (starElement.dataset.customClass) {
    starElement.classList.add(starElement.dataset.customClass);
  } else {
    starElement.className = STAR_CLASS;
  }

  gsap.set(starElement, {
    x: random(0, containerWidth),
    y: random(0, containerHeight),
    z: random(0, 3000),
  });

  gsap.to(starElement, {
    z: 3000,
    duration: random(3, 5),
    ease: "steps(50)",
    onComplete: () => animate(container, starElement),
  });
};

export const showStarsBgAnimation = (selector: string) => {
  const container = document.querySelector<HTMLElement>(selector);

  if (!container) {
    const error = new Error("Container for tetris animation is not existing");
    console.error(error);
    return;
  }

  container.style.perspective = "3000px";
  const stars: HTMLElement[] = [];

  for (let i = 0; i < STARS_COUNT; i++) {
    const star = document.createElement("div");
    stars.push(star);
  }

  stars.forEach((star) => {
    container.append(star);
    animate(container, star, true);
  });

  const toggleCustomClass = (className: string) => {
    stars.forEach((star) => {
      if (star.dataset.customClass === className) {
        delete star.dataset.customClass;
      } else {
        star.dataset.customClass = className;
      }
    });
  };

  return new Promise<IStarsBgAnimationSettings>((resolve) => {
    setTimeout(() => resolve({ toggleCustomClass }), FADE_IN_DURATION * 1000);
  });
};
