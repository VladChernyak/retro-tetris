import { gsap } from "@/plugins/gsap";
import { playAudio } from "@/utils/playAudio";

import monitorOnAudioUrl from "@/assets/sounds/monitor-on.mp3";

const OVERLAY_CLASS = "animation-turn-on-overlay";
const FLASH_CLASS = "animation-turn-on-flash";

export const showTurnOnEffect = (selector: string) => {
  const container = document.querySelector<HTMLElement>(selector);

  if (!container) {
    const error = new Error("Container for turn-on animation is not existing");
    console.error(error);
    return;
  }

  const overlayElement = document.createElement("div");
  overlayElement.className = OVERLAY_CLASS;
  container.append(overlayElement);

  const flashElement = document.createElement("div");
  flashElement.className = FLASH_CLASS;
  container.append(flashElement);

  return new Promise((resolve) => {
    const timeline = gsap.timeline();

    playAudio(monitorOnAudioUrl);

    timeline
      .to(flashElement, {
        duration: 0.2,
        width: "100%",
        height: "2px",
        ease: "power2.out",
      })
      .to(flashElement, {
        duration: 0.3,
        height: "100%",
        ease: "power2.out",
        onComplete: () => {
          overlayElement.remove();
          resolve(true);
        },
      })
      .to(flashElement, {
        duration: 0.2,
        background: "transparent",
        ease: "power4.out",
        onComplete: () => {
          flashElement.remove();
          timeline.kill();
        },
      });
  });
};
