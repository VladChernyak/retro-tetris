import { gsap } from "@/plugins/gsap";
import { playAudio } from "@/utils/playAudio";

import pixelTransitionAudioUrl from "@/assets/sounds/pixel-transition.mp3";

interface PixelFillOptions {
  color: string;
  onFilled?: Function;
}

const GRID_CLASS = "animation-pixel-fill-grid";
const GRID_PIXEL_CLASS = "animation-pixel-fill-cell";
const PIXEL_SIZE = 80;

export const showPixelFillEffect = async (container: HTMLElement, options: PixelFillOptions) => {
  const gridXPixelCount = Math.ceil(container.clientWidth / PIXEL_SIZE);
  const gridYPixelCount = Math.ceil(container.clientHeight / PIXEL_SIZE);
  const grid = document.createElement("div");

  grid.className = GRID_CLASS;
  grid.style.gridTemplateColumns = new Array(gridXPixelCount).fill("1fr").join(" ");
  grid.style.gridTemplateRows = new Array(gridYPixelCount).fill("1fr").join(" ");

  const gridPixelsCount = gridXPixelCount * gridYPixelCount;

  for (let i = 0; i < gridPixelsCount; i++) {
    const pixel = document.createElement("div");
    pixel.className = GRID_PIXEL_CLASS;
    grid.append(pixel);
  }

  container.append(grid);
  const pixelTransitionAudio = await playAudio(pixelTransitionAudioUrl);

  return new Promise((resolve) => {
    const timeline = gsap.timeline();

    timeline.set(`.${GRID_PIXEL_CLASS}`, {
      backgroundColor: "transparent",
    });

    timeline.to(`.${GRID_PIXEL_CLASS}`, {
      duration: 0.001,
      backgroundColor: options.color,
      stagger: {
        amount: pixelTransitionAudio.duration,
        from: "random",
      },
      onComplete: () => {
        if (options.onFilled) options.onFilled();
      },
    });

    timeline.to(`.${GRID_PIXEL_CLASS}`, {
      backgroundColor: "transparent",
      duration: 0.2,
      onComplete: () => {
        grid.remove();
        resolve(true);
      },
    });
  });
};
