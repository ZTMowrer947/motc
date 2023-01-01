import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  areBlockCoordinatesValid,
  BlockType,
  Coordinate,
  CoordinateCollection,
  CoordinateMap,
  getInitialCoordinatesForBlock,
  rotateBlock,
  translateBlock,
} from './blockAPI';
import type { RootState, AppThunk } from '../../app/store';

// Types
export interface ActiveBlockData {
  coordinates: CoordinateCollection;
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
    occupied: {
      byY: {} as CoordinateMap,
      allYs: [] as number[],
    },
    nextBlocks: [] as BlockType[],
    lineClears: 0,
  },
  reducers: {
    fillActiveBlock(state) {
      // Grab the next block in line
      const nextBlock = state.nextBlocks.shift();

      // Ensure such a block was actually available before continuing
      if (nextBlock) {
        const coordinateArray = getInitialCoordinatesForBlock(nextBlock);

        const coordinates = coordinateArray.reduce(
          (currentCoordinates, [x, y]) => {
            if (currentCoordinates.allYs.includes(y)) {
              return {
                ...currentCoordinates,
                byY: {
                  ...currentCoordinates.byY,
                  [y]: [...currentCoordinates.byY[y], x],
                },
              };
            }
            return {
              ...currentCoordinates,
              allYs: [...currentCoordinates.allYs, y],
              byY: {
                ...currentCoordinates.byY,
                [y]: [x],
              },
            };
          },
          { allYs: [], byY: {} } as CoordinateCollection
        );

        state.active = {
          type: nextBlock,
          coordinates,
          rotationDelta: 0,
        };
      }
    },
    translateActiveBlock(state, { payload }: PayloadAction<TranslateBlockPayload>) {
      if (state.active) {
        const { dx, dy } = payload;
        const { coordinates } = state.active;

        state.active.coordinates = translateBlock(coordinates, dx, dy);
      }
    },
    rotateActiveBlock(state, { payload }: PayloadAction<RotateBlockPayload>) {
      if (state.active) {
        const { type, coordinates, rotationDelta } = state.active;
        state.active.coordinates = rotateBlock(type, coordinates, rotationDelta, payload.direction);

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
        const { coordinates } = state.active;

        coordinates.allYs.forEach((y) => {
          if (state.occupied.allYs.includes(y)) {
            const allXs = [...coordinates.byY[y], ...state.occupied.byY[y]];

            state.occupied.byY[y] = Array.from(new Set(allXs));
          } else {
            state.occupied.allYs.push(y);
            state.occupied.byY[y] = coordinates.byY[y];
          }
        });

        state.active = null;
      }
    },
  },
});

// Actions
export const { fillActiveBlock, translateActiveBlock, rotateActiveBlock, fillBag, lockActiveBlock } =
  blockSlice.actions;

// Selectors
export const selectActiveBlockXCoordinatesByY = (state: RootState) => state.block.active?.coordinates.byY;
export const selectActiveBlockYCoordinates = (state: RootState) => state.block.active?.coordinates.allYs;

export const selectActiveBlockCoordinates = createSelector(
  [selectActiveBlockXCoordinatesByY, selectActiveBlockYCoordinates],
  (byY, allYs) => {
    if (!byY || !allYs) return [];

    return allYs.flatMap((y) => byY[y].map<Coordinate>((x) => [x, y]));
  }
);

export const selectOccupiedXCoordinatesByY = (state: RootState) => state.block.occupied.byY;
export const selectOccupiedYCoordinates = (state: RootState) => state.block.occupied.allYs;

export const selectOccupiedCoordinates = createSelector(
  [selectOccupiedXCoordinatesByY, selectOccupiedYCoordinates],
  (byY, allYs) => {
    return allYs.flatMap((y) => byY[y].map<Coordinate>((x) => [x, y]));
  }
);

// Thunks
export function translateActiveBlockIfPossible({ dx, dy }: TranslateBlockPayload): AppThunk<boolean> {
  return (dispatch, getState) => {
    // Get coordinates of active block
    const state = getState();
    const coordinates = state.block.active?.coordinates;

    // If no active block is set, we can't do anything, so we don't
    if (!coordinates) return false;

    // Calculate what the translated coordinates would be
    const nextCoordinates = translateBlock(coordinates, dx, dy);

    // Determine whether these coordinates are valid and apply the translation if we can
    const canTranslate = areBlockCoordinatesValid(nextCoordinates, state.block.occupied);

    if (canTranslate) {
      dispatch(translateActiveBlock({ dx, dy }));
    }

    // Return whether we could translate the block in any case
    return canTranslate;
  };
}

export function moveDownOrLockActiveBlock(): AppThunk {
  return (dispatch) => {
    const didTranslate = dispatch(translateActiveBlockIfPossible({ dx: 0, dy: -1 }));

    if (!didTranslate) {
      dispatch(lockActiveBlock());
    }
  };
}

// Reducer
export type BlockState = Readonly<ReturnType<typeof blockSlice.reducer>>;
export default blockSlice.reducer;
