import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlockType, CoordinateMap, getInitialCoordinatesForBlock } from './blockAPI';

// Types
interface ActiveBlockData {
  coordinates: CoordinateMap;
  type: BlockType;
  rotationDelta: 0 | 1 | 2 | 3;
}

interface TranslateBlockPayload {
  dx: number;
  dy: number;
}

interface RotateBlockPayload {
  direction: 'clockwise' | 'counterclockwise';
}

// Slice
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

        state.active.coordinates = Object.fromEntries(
          Object.entries<number[]>(state.active.coordinates).map<[number, number[]]>(([key, xs]) => {
            const y = Number.parseInt(key, 10);
            const newXs = xs.map((x) => x + dx);

            return [y + dy, newXs];
          })
        );
      }
    },
    rotateActiveBlock(state, { payload }: PayloadAction<RotateBlockPayload>) {
      if (state.active) {
        const { type: blockType, rotationDelta } = state.active;

        // Handle the block rotation
        if (blockType === 'I') {
          if (rotationDelta % 2 === 0) {
            // Get the sole y coordinate
            const y = Object.keys(state.active.coordinates).map((key) => Number.parseInt(key, 10))[0];

            // Get a sorted copy of the x coordinates
            const xs = [...state.active.coordinates[y]].sort((a, b) => a - b);

            // Use rotation to select final x and the fourth y coordinate
            const selectionIndex = rotationDelta === 0 ? 2 : 1;
            const finalY = rotationDelta === 0 ? y - 2 : y + 2;

            const x = xs[selectionIndex];

            // Update coordinates
            state.active.coordinates = {
              [y + 1]: [x],
              [y]: [x],
              [y - 1]: [x],
              [finalY]: [x],
            };
          }

          // TODO: Handle other rotation deltas
        }
        // TODO: Handle other block types

        // Update the rotation delta
        let nextDelta = state.active.rotationDelta;

        if (payload.direction === 'clockwise') {
          nextDelta += 1;

          if (nextDelta > 3) {
            nextDelta = 0;
          }
        } else {
          nextDelta -= 1;

          if (nextDelta < 0) {
            nextDelta = 3;
          }
        }

        state.active.rotationDelta = nextDelta as 0 | 1 | 2 | 3;
      }
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

// Actions
export const { fillActiveBlock, translateActiveBlock, rotateActiveBlock, fillBag, lockActiveBlock } =
  blockSlice.actions;

// Reducer
export type BlockState = Readonly<ReturnType<typeof blockSlice.reducer>>;
export default blockSlice.reducer;
