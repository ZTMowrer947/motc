import { describe, it, expect } from 'vitest';
import { fillActivePieceSourceData } from '@/features/piece/__pieceSlice.specdata';
import pieceReducer, { PieceState, clearLine, fillActivePiece, fillBag } from './pieceSlice';
import type { PieceType } from './pieceAPI';

describe('piece reducer', () => {
  describe('handling fillActivePiece', () => {
    // Using external source data, run tests for fillActivePiece
    fillActivePieceSourceData.forEach(({ pieceType, expectedCoordinates }) => {
      it(`should properly handle initializing the ${pieceType}-piece`, () => {
        // Arrange
        const initialState: PieceState = {
          active: null,
          occupied: {
            byRow: {},
            rows: [],
          },
          nextPieces: [pieceType],
          lineClears: 0,
        };

        const expectedState: PieceState = {
          active: {
            type: pieceType,
            coordinates: expectedCoordinates,
            rotationDelta: 0,
          },
          occupied: {
            byRow: {},
            rows: [],
          },
          nextPieces: [],
          lineClears: 0,
        };

        // Act
        const action = fillActivePiece();

        const finalState = pieceReducer(initialState, action);

        // Assert
        expect(finalState).toEqual(expectedState);
      });
    });
  });

  it('should properly handle fillBag', () => {
    // Arrange
    const initialState: PieceState = {
      active: null,
      occupied: {
        byRow: {},
        rows: [],
      },
      nextPieces: [],
      lineClears: 0,
    };

    const nextBag: PieceType[] = ['I', 'Z', 'T', 'J', 'S', 'O', 'L'];

    const expectedState: PieceState = {
      active: null,
      occupied: {
        byRow: {},
        rows: [],
      },
      nextPieces: nextBag,
      lineClears: 0,
    };

    // Act
    const action = fillBag(nextBag);

    const finalState = pieceReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  it('should properly handle clearLine on above-ground row', () => {
    // Arrange
    const initialState: PieceState = {
      active: null,
      occupied: {
        byRow: {
          1: [1, 4, 5, 6, 7, 9],
          2: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          3: [0, 1, 9],
          4: [1],
        },
        rows: [1, 2, 3, 4],
      },
      nextPieces: [],
      lineClears: 0,
    };

    const expectedState: PieceState = {
      active: null,
      occupied: {
        byRow: {
          1: [1, 4, 5, 6, 7, 9],
          2: [0, 1, 9],
          3: [1],
        },
        rows: [1, 2, 3],
      },
      nextPieces: [],
      lineClears: 1,
    };

    // Act
    const action = clearLine({ row: 2 });

    const finalState = pieceReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });
});
