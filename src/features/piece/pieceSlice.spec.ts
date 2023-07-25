import { describe, it, expect } from 'vitest';
import { fillActivePieceSourceData, rotateActivePieceSourceData } from '@/features/piece/__pieceSlice.specdata';
import pieceReducer, {
  PieceState,
  clearLine,
  fillActivePiece,
  fillBag,
  lockActivePiece,
  rotateActivePiece,
  translateActivePiece,
} from './pieceSlice';
import type { PieceType } from './pieceAPI';

describe('piece reducer', () => {
  it('should properly initialize state', () => {
    // Arrange
    const expectedState: PieceState = {
      active: null,
      occupied: {
        byRow: {},
        rows: [],
      },
      nextPieces: [],
      lineClears: 0,
    };

    // Act
    const finalState = pieceReducer(undefined, { type: 'INIT' });

    // Assert
    expect(finalState).toEqual(expectedState);
  });

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

  it('should properly handle translateActivePiece', () => {
    // Arrange
    const initialState: PieceState = {
      active: {
        type: 'I',
        coordinates: {
          byRow: {
            21: [3, 4, 5, 6],
          },
          rows: [21],
        },
        rotationDelta: 0,
      },
      occupied: {
        byRow: {},
        rows: [],
      },
      nextPieces: [],
      lineClears: 0,
    };

    const expectedState: PieceState = {
      active: {
        type: 'I',
        coordinates: {
          byRow: {
            20: [3, 4, 5, 6],
          },
          rows: [20],
        },
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
    const action = translateActivePiece({
      dCol: 0,
      dRow: -1,
    });

    const finalState = pieceReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  // Using external source data, run tests for rotateActivePiece
  describe('handling rotateActivePiece', () => {
    Array.from({ length: 2 }, (_, idx) => idx % 2 === 0).forEach((isClockwise) => {
      rotateActivePieceSourceData.forEach(({ pieceType, possibleCoordinates }) => {
        possibleCoordinates.forEach((initialCoordinates, rotationDelta) => {
          // Determine the expected post-rotation delta
          const nextDelta = (() => {
            if (isClockwise) return rotationDelta + 1 < 4 ? rotationDelta + 1 : 0;

            return rotationDelta - 1 >= 0 ? rotationDelta - 1 : 3;
          })();

          const expectedCoordinates = possibleCoordinates[nextDelta];

          const rotationTypeText = isClockwise ? 'clockwise' : 'counter-clockwise';

          it(`should properly rotate ${pieceType}-piece at rotation ${rotationDelta} ${rotationTypeText}`, () => {
            // Arrange
            const initialState: PieceState = {
              active: {
                type: pieceType,
                coordinates: initialCoordinates,
                rotationDelta: rotationDelta as 0 | 1 | 2 | 3,
              },
              occupied: {
                rows: [],
                byRow: {},
              },
              nextPieces: [],
              lineClears: 0,
            };

            const expectedState: PieceState = {
              active: {
                type: pieceType,
                coordinates: expectedCoordinates,
                rotationDelta: nextDelta as 0 | 1 | 2 | 3,
              },
              occupied: {
                rows: [],
                byRow: {},
              },
              nextPieces: [],
              lineClears: 0,
            };

            // Act
            const action = rotateActivePiece({ clockwise: isClockwise });

            const finalState = pieceReducer(initialState, action);

            // Assert
            expect(finalState).toEqual(expectedState);
          });
        });
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

  it('should properly handle lockActivePiece', () => {
    // Arrange
    const initialState: PieceState = {
      active: {
        type: 'I',
        coordinates: {
          byRow: {
            0: [3, 4, 5, 6],
          },
          rows: [0],
        },
        rotationDelta: 0,
      },
      occupied: {
        byRow: {},
        rows: [],
      },
      nextPieces: [],
      lineClears: 0,
    };

    const expectedState: PieceState = {
      active: null,
      occupied: {
        byRow: {
          0: [3, 4, 5, 6],
        },
        rows: [0],
      },
      nextPieces: [],
      lineClears: 0,
    };

    // Act
    const action = lockActivePiece();

    const finalState = pieceReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  it('should properly handle clearLine on bottom row', () => {
    // Arrange
    const initialState: PieceState = {
      active: null,
      occupied: {
        byRow: {
          1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          2: [0, 1, 9],
          3: [1],
        },
        rows: [1, 2, 3],
      },
      nextPieces: [],
      lineClears: 0,
    };

    const expectedState: PieceState = {
      active: null,
      occupied: {
        byRow: {
          1: [0, 1, 9],
          2: [1],
        },
        rows: [1, 2],
      },
      nextPieces: [],
      lineClears: 1,
    };

    // Act
    const action = clearLine({ row: 1 });

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
