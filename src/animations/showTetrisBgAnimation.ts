import { gsap, random } from "@/plugins/gsap";
import { TetrisBlockTypes } from "@/ts/enums";

export interface ITetrisBgAnimationReturnData {
  animatedElement: HTMLElement | null;
  killAnimation: Function | null;
}

const TETRIS_BLOCK_TYPES = Object.values(TetrisBlockTypes);
const TETRIS_BLOCK_CLASS = "animation-tetris-block";

const tetrisBlockSize = document.documentElement.clientWidth > 600 ? 150 : 80;
const returnData: ITetrisBgAnimationReturnData = {
  animatedElement: null,
  killAnimation: null,
};

const createRandomMotionPath = (container: HTMLElement) => {
  const X_PADDING = 30;
  const minXPosition = X_PADDING;
  const maxXPosition = container.clientWidth - tetrisBlockSize - X_PADDING;

  const initialXPosition = random(minXPosition, maxXPosition);
  const initialYPosition = -tetrisBlockSize;
  const endYPosition = container.clientHeight - tetrisBlockSize;

  const path = [{ x: initialXPosition, y: initialYPosition }];

  while (true) {
    const lastStep = path[path.length - 1];
    const penultimateStep = path[path.length - 2];

    if (lastStep.y >= endYPosition) break;

    // Сheck whether there was a displacement along Y in the last step
    // The offset along the Y axis must be at least one step apart
    if (!penultimateStep || lastStep.y === penultimateStep.y) {
      path.push({ x: lastStep.x, y: lastStep.y + tetrisBlockSize });
      continue;
    }

    const randomXShift = random([lastStep.x - tetrisBlockSize, lastStep.x, lastStep.x + tetrisBlockSize]);

    const nextXShift = randomXShift < minXPosition || randomXShift > maxXPosition ? lastStep.x : randomXShift;
    const nextYShift = nextXShift === lastStep.x ? lastStep.y + tetrisBlockSize : lastStep.y;

    path.push({
      x: nextXShift,
      y: nextYShift,
    });
  }

  return path;
};

const animate = async (container: HTMLElement) => {
  const randomBlockType = random(TETRIS_BLOCK_TYPES);

  const blockElement = document.createElement("div");
  blockElement.classList.add(TETRIS_BLOCK_CLASS, `${randomBlockType}-block`);
  blockElement.style.width = `${tetrisBlockSize}px`;
  blockElement.style.height = `${tetrisBlockSize}px`;

  returnData.animatedElement = blockElement;
  container.append(blockElement);

  const motionPath = createRandomMotionPath(container);
  const [startPoint] = motionPath.splice(0, 1);

  gsap.set(blockElement, startPoint);
  gsap.to(blockElement, {
    motionPath,
    ease: `steps(${motionPath.length})`,
    duration: 8,
    onStart() {
      returnData.killAnimation = this.kill.bind(this);
    },
    onComplete() {
      blockElement.remove();
      returnData.animatedElement = null;
      returnData.killAnimation = null;
      animate(container);
    },
  });
};

export const showTetrisBgAnimation = (selector: string): ITetrisBgAnimationReturnData => {
  const container = document.querySelector<HTMLElement>(selector);

  if (!container) {
    const error = new Error("Container for tetris animation is not existing");
    console.error(error);
  } else {
    animate(container);
  }

  return returnData;
};
