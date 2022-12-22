import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { BlockType, CoordinateMap } from './blockAPI';
import { getInitialCoordinatesForBlock } from './blockAPI';

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
      // Grab the next block in line
      const nextBlock = state.nextBlocks.shift();

      // Ensure such a block was actually available before continuing
      if (nextBlock) {
        const coordinates = getInitialCoordinatesForBlock(nextBlock);

        const coordinateMap = coordinates.reduce((map, [x, y]) => {
          if (y in map) {
            map[y] = [...map[y], x];
          } else {
            map[y] = [x];
          }

          return map;
        }, {} as CoordinateMap);

        state.active = {
          type: nextBlock,
          coordinates: coordinateMap,
          rotationDelta: 0,
        };
      }
    },
    translateActiveBlock(state, { payload }: PayloadAction<TranslateBlockPayload>) {
      if (state.active) {
        const { dx, dy } = payload;
        Object.keys(state.active.coordinates).forEach((key) => {
          const y = Number.parseInt(key, 10);

          state.active!.coordinates[y + dy] = state.active!.coordinates[y].map((x) => x + dx);
          delete state.active!.coordinates[y];
        });
      }
    },
    rotateActiveBlock(state) {
      // TODO: Rotate block
    },
    fillBag(state, { payload }: PayloadAction<BlockType[]>) {
      state.nextBlocks = payload;
    },
    lockActiveBlock(state) {
      if (state.active) {
        Object.entries<number[]>(state.active.coordinates).forEach(([key, xs]) => {
          const y = Number.parseInt(key, 10);

          state.occupied[y] = [...xs];
        });

        state.active = null;
      }
    },
  },
});

export const { fillActiveBlock, translateActiveBlock, rotateActiveBlock, fillBag, lockActiveBlock } =
  blockSlice.actions;

export type BlockState = Readonly<ReturnType<typeof blockSlice.reducer>>;
export default blockSlice.reducer;
