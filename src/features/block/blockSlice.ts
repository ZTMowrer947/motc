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
  dCol: number;
  dRow: number;
}

interface RotateBlockPayload {
  direction: 'clockwise' | 'counterclockwise';
}

interface ClearLinePayload {
  row: number;
}

// Slice
const blockSlice = createSlice({
  name: 'block',
  initialState: {
    active: null as ActiveBlockData | null,
    occupied: {
      byRow: {} as CoordinateMap,
      rows: [] as number[],
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
        // Set active block data in state
        state.active = {
          type: nextBlock,
          coordinates: getInitialCoordinatesForBlock(nextBlock),
          rotationDelta: 0,
        };
      }
    },
    translateActiveBlock(state, { payload }: PayloadAction<TranslateBlockPayload>) {
      if (state.active) {
        const { dCol, dRow } = payload;
        const { coordinates } = state.active;

        const newByRow: CoordinateMap = {};

        coordinates.rows.forEach((row, index) => {
          coordinates.rows.splice(index, 1, row + dRow);
          newByRow[row + dRow] = coordinates.byRow[row].map((col) => col + dCol);
        });

        coordinates.byRow = newByRow;
      }
    },
    rotateActiveBlock(state, { payload }: PayloadAction<RotateBlockPayload>) {
      if (state.active) {
        const { type, coordinates, rotationDelta } = state.active;

        // Do the actual gruntwork in rotating the block
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

        // Merge coordinates of active blocks into occupied block data
        coordinates.rows.forEach((row) => {
          if (state.occupied.rows.includes(row)) {
            const cols = [...coordinates.byRow[row], ...state.occupied.byRow[row]];

            state.occupied.byRow[row] = Array.from(new Set(cols));
          } else {
            state.occupied.rows.push(row);
            state.occupied.byRow[row] = coordinates.byRow[row];
          }
        });

        // Unset active block to make way for the next
        state.active = null;
      }
    },
    clearLine(state, { payload }: PayloadAction<ClearLinePayload>) {
      const { row } = payload;

      // Find and remove row
      const rowIndex = state.occupied.rows.findIndex((row2) => row2 === row);
      state.occupied.rows.splice(rowIndex, 1);

      // Loop through remaining rows
      state.occupied.rows.forEach((row2, index, rows) => {
        if (row2 > row) {
          // Move array of occupied columns down by one
          state.occupied.byRow[row2 - 1] = state.occupied.byRow[row2];
          delete state.occupied.byRow[row2];

          // Decrement each row by one
          rows.splice(index, 1, row2 - 1);
        }
      });

      // Increment line clear counter
      state.lineClears += 1;
    },
  },
});

// Actions
export const { fillActiveBlock, translateActiveBlock, rotateActiveBlock, fillBag, lockActiveBlock, clearLine } =
  blockSlice.actions;

// Selectors
export const selectActiveColumnsByRow = (state: RootState) => state.block.active?.coordinates.byRow;
export const selectActiveBlockRows = (state: RootState) => state.block.active?.coordinates.rows;

export const selectActiveBlockCoordinates = createSelector(
  [selectActiveColumnsByRow, selectActiveBlockRows],
  (byRow, rows) => {
    if (!byRow || !rows) return [];

    return rows.flatMap((row) => byRow[row].map<Coordinate>((col) => ({ row, col })));
  }
);

export const selectOccupiedColumnsByRow = (state: RootState) => state.block.occupied.byRow;
export const selectOccupiedRows = (state: RootState) => state.block.occupied.rows;

export const selectOccupiedCoordinates = createSelector(
  [selectOccupiedColumnsByRow, selectOccupiedRows],
  (byRow, rows) => rows.flatMap((row) => byRow[row].map<Coordinate>((col) => ({ row, col })))
);

// Thunks
export function translateActiveBlockIfPossible({ dCol, dRow }: TranslateBlockPayload): AppThunk<boolean> {
  return (dispatch, getState) => {
    // Get coordinates of active block
    const state = getState();
    const coordinates = state.block.active?.coordinates;

    // If no active block is set, we can't do anything, so we don't
    if (!coordinates) return false;

    // Calculate what the translated coordinates would be
    const nextCoordinates = translateBlock(coordinates, dCol, dRow);

    // Determine whether these coordinates are valid and apply the translation if we can
    const canTranslate = areBlockCoordinatesValid(nextCoordinates, state.block.occupied);

    if (canTranslate) {
      dispatch(translateActiveBlock({ dCol, dRow }));
    }

    // Return whether we could translate the block in any case
    return canTranslate;
  };
}

export function rotateActiveBlockIfPossible({ direction }: RotateBlockPayload): AppThunk<boolean> {
  return (dispatch, getState) => {
    // Get active block
    const state = getState();
    const { active: activeBlock } = state.block;

    // If no active block is set, we can't do anything, so we don't
    if (!activeBlock) return false;

    // Calculate what the rotated coordinates would be
    const nextCoordinates = rotateBlock(
      activeBlock.type,
      activeBlock.coordinates,
      activeBlock.rotationDelta,
      direction
    );

    // Determine whether these coordinates are valid and apply the rotation if we can
    const canRotate = areBlockCoordinatesValid(nextCoordinates, state.block.occupied);

    if (canRotate) {
      dispatch(rotateActiveBlock({ direction }));
    }

    // Return whether we could translate the block in any case
    return canRotate;
  };
}

export function moveDownOrLockActiveBlock(): AppThunk {
  return (dispatch) => {
    // Try to move block down and check if we actually did
    const didTranslate = dispatch(translateActiveBlockIfPossible({ dCol: 0, dRow: -1 }));

    // If we didn't, lock the block
    if (!didTranslate) {
      dispatch(lockActiveBlock());
    }
  };
}

export function hardDropActiveBlock(): AppThunk {
  return (dispatch, getState) => {
    // Get occupied and active block coordinate data
    const state = getState();
    const { active: activeBlock, occupied } = state.block;

    // Ensure we actually have a block to drop
    if (activeBlock) {
      let dRow = -1;

      let translatedCoordinates = activeBlock.coordinates;

      // Find maximum amount down we can validly drop the block
      do {
        dRow -= 1;
        translatedCoordinates = translateBlock(activeBlock.coordinates, 0, dRow);
      } while (areBlockCoordinatesValid(translatedCoordinates, occupied));

      dRow += 1;

      // Drop the block down by that much
      dispatch(translateActiveBlock({ dCol: 0, dRow }));

      // Lock the piece instantly
      dispatch(lockActiveBlock());
    }
  };
}

export function clearFilledLines(): AppThunk<number> {
  return (dispatch, getState) => {
    let filledRows: number[] = [];

    do {
      // Get occupied coordinate data
      const state = getState();
      const occupiedRows = selectOccupiedRows(state);
      const occupiedByRow = selectOccupiedColumnsByRow(state);

      // Collect rows that are filled
      filledRows = occupiedRows.filter((row) => occupiedByRow[row].length === 10);

      // As long as at least one line is filled, clear a line
      if (filledRows.length > 0) dispatch(clearLine({ row: filledRows[0] }));
    } while (filledRows.length > 0); // Keep going until every filled line is cleared

    return filledRows.length;
  };
}

// Reducer
export type BlockState = Readonly<ReturnType<typeof blockSlice.reducer>>;
export default blockSlice.reducer;
