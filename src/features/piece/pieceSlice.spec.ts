import { describe, it, expect } from 'vitest';
import { fillActivePieceSourceData } from '@/features/piece/__pieceSlice.specdata';
import pieceReducer, { PieceState, fillActivePiece, fillBag } from './pieceSlice';
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

  it.skip('should properly handle fillBag', () => {
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
});
