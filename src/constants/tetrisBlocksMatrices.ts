import { TetrisBlockTypes } from "@/ts/enums";

export const BLOCK_MATRICES: Record<TetrisBlockTypes, Matrix> = {
  [TetrisBlockTypes.L]: [
    [0, 0, 1],
    [1, 1, 1],
  ],

  [TetrisBlockTypes.O]: [
    [1, 1],
    [1, 1],
  ],

  [TetrisBlockTypes.S]: [
    [0, 1, 1],
    [1, 1, 0],
  ],

  [TetrisBlockTypes.T]: [
    [0, 1, 0],
    [1, 1, 1],
  ],

  [TetrisBlockTypes.J]: [
    [1, 0, 0],
    [1, 1, 1],
  ],

  [TetrisBlockTypes.I]: [[1, 1, 1, 1]],

  [TetrisBlockTypes.Z]: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};
