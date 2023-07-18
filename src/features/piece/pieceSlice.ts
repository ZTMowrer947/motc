import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState, AppThunk } from '@/app/store';
import { coordCollectionToArray } from '@/features/coordinate/helpers';
import { arePieceCoordinatesValid, canTranslatePiece, PieceType, rotatePiece } from './pieceAPI';
import type { CoordinateCollection, CoordinateMap } from '../coordinate/types';

// Types
type PieceRotationDelta = 0 | 1 | 2 | 3;

export interface ActivePieceData {
  coordinates: CoordinateCollection;
  type: PieceType;
  rotationDelta: PieceRotationDelta;
}

interface TranslatePiecePayload {
  dCol: number;
  dRow: number;
}

interface RotatePiecePayload {
  clockwise: boolean;
}

interface ClearLinePayload {
  row: number;
}

// Slice
const pieceSlice = createSlice({
  name: 'piece',
  initialState: {
    active: null as ActivePieceData | null,
    occupied: {
      byRow: {} as CoordinateMap,
      rows: [] as number[],
    },
    nextPieces: [] as PieceType[],
    lineClears: 0,
  },
  reducers: {
    fillActivePiece(state) {
      // Grab the next piece in line
      const type = state.nextPieces.shift();

      if (type) {
        // Set active piece data in state
        state.active = {
          type,
          coordinates: {
            rows: [21],
            byRow: {
              21: [],
            },
          },
          rotationDelta: 0,
        };

        // For I-block, all the squares are in a line on row 21
        if (type === 'I') {
          state.active.coordinates.byRow[21].push(3, 4, 5, 6);
          return;
        }

        // All other pieces have at least one pair of squares in the middle columns,
        // and squares starting on row 20.
        state.active.coordinates.rows.unshift(20);
        state.active.coordinates.byRow[20] = [];

        const midCols = [4, 5];
        const targetRowForMid = type === 'S' ? 21 : 20;

        state.active.coordinates.byRow[targetRowForMid].push(...midCols);

        // O-pieces have the same configuration for their other starting row
        if (type === 'O') {
          state.active.coordinates.byRow[21].push(...midCols);
          return;
        }

        // S- and Z- pieces have squares on columns 3 and 4
        // on starting rows 21 or 20, respectively
        if (type === 'S' || type === 'Z') {
          const otherCols = [3, 4];
          const targetRowForOther = type === 'S' ? 20 : 21;

          state.active.coordinates.byRow[targetRowForOther].push(...otherCols);
          return;
        }

        // The remaining piece types (J, T, and L) have a square on column 3
        // of row 20 and one final square on row 20 (column 3, 4, or 5 respectively)
        state.active.coordinates.byRow[20].unshift(3);

        const topCol: Record<typeof type, number> = {
          J: 3,
          T: 4,
          L: 5,
        };

        state.active.coordinates.byRow[21].push(topCol[type]);
      }
    },
    translateActivePiece(state, { payload }: PayloadAction<TranslatePiecePayload>) {
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
    rotateActivePiece(state, { payload }: PayloadAction<RotatePiecePayload>) {
      if (state.active) {
        const { type, coordinates, rotationDelta } = state.active;

        // Do the actual gruntwork in rotating the piece
        state.active.coordinates = rotatePiece(type, coordinates, rotationDelta, payload.clockwise);

        // Update the rotation delta
        let nextDelta = state.active.rotationDelta;

        if (payload.clockwise) {
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

        state.active.rotationDelta = nextDelta as PieceRotationDelta;
      }
    },
    fillBag(state, { payload }: PayloadAction<PieceType[]>) {
      state.nextPieces = payload;
    },
    lockActivePiece(state) {
      if (state.active) {
        const { coordinates } = state.active;

        // Merge coordinates of active pieces into occupied piece data
        coordinates.rows.forEach((row) => {
          let colsToAdd = coordinates.byRow[row];

          if (state.occupied.rows.includes(row)) {
            colsToAdd = colsToAdd.filter((col) => !state.occupied.byRow[row].includes(col));
          } else {
            state.occupied.rows.push(row);
            state.occupied.byRow[row] = [];
          }

          // Add unique columns to row and sort them
          state.occupied.byRow[row].push(...colsToAdd);
          state.occupied.byRow[row].sort();
        });

        // Unset active piece to make way for the next
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
export const { fillActivePiece, translateActivePiece, rotateActivePiece, fillBag, lockActivePiece, clearLine } =
  pieceSlice.actions;

// Selectors
export const selectActiveColumnsByRow = (state: RootState) => state.piece.active?.coordinates.byRow;
export const selectActivePieceRows = (state: RootState) => state.piece.active?.coordinates.rows;

export const selectActivePieceCoordinates = createSelector(
  [selectActiveColumnsByRow, selectActivePieceRows],
  (byRow, rows) => {
    if (!byRow || !rows) return [];

    return coordCollectionToArray({ rows, byRow });
  }
);

export const selectOccupiedColumnsByRow = (state: RootState) => state.piece.occupied.byRow;
export const selectOccupiedRows = (state: RootState) => state.piece.occupied.rows;

export const selectOccupiedCoordinates = createSelector(
  [selectOccupiedColumnsByRow, selectOccupiedRows],
  (byRow, rows) => coordCollectionToArray({ rows, byRow })
);

// Thunks
export function tryTranslateActivePiece({ dCol, dRow }: TranslatePiecePayload): AppThunk<boolean> {
  return (dispatch, getState) => {
    // Get coordinates of active piece
    const state = getState();
    const coordinates = state.piece.active?.coordinates;

    // If no active piece is set, we can't do anything, so we don't
    if (!coordinates) return false;

    // Determine if translation is valid, and apply it if so
    const canTranslate = canTranslatePiece(coordinates, state.piece.occupied, dRow, dCol);

    if (canTranslate) {
      dispatch(translateActivePiece({ dCol, dRow }));
    }

    // Return whether we could translate the piece in any case
    return canTranslate;
  };
}

export function tryRotateActivePiece({ clockwise }: RotatePiecePayload): AppThunk<boolean> {
  return (dispatch, getState) => {
    // Get active piece
    const state = getState();
    const { active } = state.piece;

    // If no active piece is set, we can't do anything, so we don't
    if (!active) return false;

    // Calculate what the rotated coordinates would be
    const { type, coordinates, rotationDelta } = active;
    const nextCoordinates = rotatePiece(type, coordinates, rotationDelta, clockwise);

    // Determine whether these coordinates are valid and apply the rotation if we can
    const canRotate = arePieceCoordinatesValid(nextCoordinates, state.piece.occupied);

    if (canRotate) {
      dispatch(rotateActivePiece({ clockwise }));
    }

    // Return whether we could translate the piece in any case
    return canRotate;
  };
}

export function moveDownOrLockActivePiece(): AppThunk {
  return (dispatch) => {
    // Try to move piece down and check if we actually did
    const didTranslate = dispatch(tryTranslateActivePiece({ dCol: 0, dRow: -1 }));

    // If we didn't, lock the piece
    if (!didTranslate) {
      dispatch(lockActivePiece());
    }
  };
}

export function hardDropActivePiece(): AppThunk {
  return (dispatch, getState) => {
    // Get occupied and active piece coordinate data
    const state = getState();
    const { active: activePiece, occupied } = state.piece;

    // Ensure we actually have a piece to drop
    if (activePiece) {
      let dRow = 0;

      // Find maximum amount down we can validly drop the piece
      do {
        dRow -= 1;
      } while (canTranslatePiece(activePiece.coordinates, occupied, dRow, 0));

      dRow += 1;

      // Drop the piece down by that much
      dispatch(translateActivePiece({ dCol: 0, dRow }));

      // Lock the piece instantly
      dispatch(lockActivePiece());
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
export type PieceState = Readonly<ReturnType<typeof pieceSlice.reducer>>;
export default pieceSlice.reducer;
