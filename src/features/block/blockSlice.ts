import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BlockType, CoordinateMap } from './blockAPI';

interface ActiveBlockData {
  coordinates: CoordinateMap;
  type: BlockType;
  rotationDelta: 0 | 1 | 2 | 3;
}

interface TranslateBlockPayload {
  dx: number;
  dy: number;
}

const blockSlice = createSlice({
  name: 'block',
  initialState: {
    active: null as ActiveBlockData | null,
    occupied: {} as CoordinateMap,
    nextBlocks: [] as BlockType[],
    lineClears: 0,
  },
  reducers: {
    fillActiveBlock(state) {
      // TODO: Actually set the block
    },
    translateActiveBlock(state, { payload }: PayloadAction<TranslateBlockPayload>) {
      // TODO: Actually move a block
    },
    rotateActiveBlock(state) {
      // TODO: Rotate block
    },
    fillBag(state, { payload }: PayloadAction<BlockType[]>) {
      // TODO: Actually refill the block bag
    },
  },
});

export const { fillActiveBlock, translateActiveBlock, rotateActiveBlock, fillBag } = blockSlice.actions;

export type BlockState = Readonly<ReturnType<typeof blockSlice.reducer>>;
export default blockSlice.reducer;
