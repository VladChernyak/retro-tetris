import type { TetrisBlockTypes } from "@/ts/enums";

export interface IBlockData {
  id: number;
  type: TetrisBlockTypes;
}

export interface IActiveBlockData extends IBlockData {
  x: number;
  y: number;
  matrix: Matrix;
}

export type PlayfieldState = (IBlockData | null)[][];
