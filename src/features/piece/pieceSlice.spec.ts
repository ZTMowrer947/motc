import { describe, it, expect } from 'vitest';
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
import { CoordinateCollection } from '../coordinate/types';

interface FillActivePieceSourceEntry {
  pieceType: PieceType;
  expectedCoordinates: CoordinateCollection;
}

interface RotateActivePieceSourceEntry {
  pieceType: PieceType;
  possibleCoordinates: CoordinateCollection[];
}

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

  // Configure test case data for next test
  const fillActivePieceSourceData: FillActivePieceSourceEntry[] = [
    {
      pieceType: 'I',
      expectedCoordinates: {
        byRow: {
          21: [3, 4, 5, 6],
        },
        rows: [21],
      },
    },
    {
      pieceType: 'O',
      expectedCoordinates: {
        byRow: {
          21: [4, 5],
          20: [4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      pieceType: 'T',
      expectedCoordinates: {
        byRow: {
          21: [4],
          20: [3, 4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      pieceType: 'L',
      expectedCoordinates: {
        byRow: {
          21: [5],
          20: [3, 4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      pieceType: 'J',
      expectedCoordinates: {
        byRow: {
          21: [3],
          20: [3, 4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      pieceType: 'S',
      expectedCoordinates: {
        byRow: {
          21: [4, 5],
          20: [3, 4],
        },
        rows: [20, 21],
      },
    },
    {
      pieceType: 'Z',
      expectedCoordinates: {
        byRow: {
          21: [3, 4],
          20: [4, 5],
        },
        rows: [20, 21],
      },
    },
  ];

  // Run following test for each type of piece
  fillActivePieceSourceData.forEach(({ pieceType, expectedCoordinates }) => {
    it(`should properly handle fillActivepiece for ${pieceType}-piece`, () => {
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

  it('should properly handle translateActivepiece', () => {
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

  // Configure test case data for piece rotation test
  const rotateActivePieceSourceData: RotateActivePieceSourceEntry[] = [
    {
      pieceType: 'I',
      possibleCoordinates: [
        {
          byRow: {
            10: [3, 4, 5, 6],
          },
          rows: [10],
        },
        {
          byRow: {
            11: [5],
            10: [5],
            9: [5],
            8: [5],
          },
          rows: [8, 9, 10, 11],
        },
        {
          byRow: {
            9: [3, 4, 5, 6],
          },
          rows: [9],
        },
        {
          byRow: {
            11: [4],
            10: [4],
            9: [4],
            8: [4],
          },
          rows: [8, 9, 10, 11],
        },
      ],
    },
    {
      pieceType: 'O',
      possibleCoordinates: Array.from({ length: 4 }, () => ({
        byRow: {
          10: [4, 5],
          9: [4, 5],
        },
        rows: [9, 10],
      })),
    },
    {
      pieceType: 'T',
      possibleCoordinates: [
        {
          byRow: {
            10: [4],
            9: [3, 4, 5],
          },
          rows: [9, 10],
        },
        {
          byRow: {
            10: [4],
            9: [4, 5],
            8: [4],
          },
          rows: [8, 9, 10],
        },
        {
          byRow: {
            9: [3, 4, 5],
            8: [4],
          },
          rows: [8, 9],
        },
        {
          byRow: {
            10: [4],
            9: [3, 4],
            8: [4],
          },
          rows: [8, 9, 10],
        },
      ],
    },
    {
      pieceType: 'L',
      possibleCoordinates: [
        {
          byRow: {
            10: [5],
            9: [3, 4, 5],
          },
          rows: [9, 10],
        },
        {
          byRow: {
            10: [4],
            9: [4],
            8: [4, 5],
          },
          rows: [8, 9, 10],
        },
        {
          byRow: {
            9: [3, 4, 5],
            8: [3],
          },
          rows: [8, 9],
        },
        {
          byRow: {
            10: [3, 4],
            9: [4],
            8: [4],
          },
          rows: [8, 9, 10],
        },
      ],
    },
    {
      pieceType: 'J',
      possibleCoordinates: [
        {
          byRow: {
            10: [3],
            9: [3, 4, 5],
          },
          rows: [9, 10],
        },
        {
          byRow: {
            10: [4, 5],
            9: [4],
            8: [4],
          },
          rows: [8, 9, 10],
        },
        {
          byRow: {
            9: [3, 4, 5],
            8: [5],
          },
          rows: [8, 9],
        },
        {
          byRow: {
            10: [4],
            9: [4],
            8: [3, 4],
          },
          rows: [8, 9, 10],
        },
      ],
    },
    {
      pieceType: 'S',
      possibleCoordinates: [
        {
          byRow: {
            10: [4, 5],
            9: [3, 4],
          },
          rows: [9, 10],
        },
        {
          byRow: {
            10: [4],
            9: [4, 5],
            8: [5],
          },
          rows: [8, 9, 10],
        },
        {
          byRow: {
            9: [4, 5],
            8: [3, 4],
          },
          rows: [8, 9],
        },
        {
          byRow: {
            10: [3],
            9: [3, 4],
            8: [4],
          },
          rows: [8, 9, 10],
        },
      ],
    },
    {
      pieceType: 'Z',
      possibleCoordinates: [
        {
          byRow: {
            10: [3, 4],
            9: [4, 5],
          },
          rows: [9, 10],
        },
        {
          byRow: {
            10: [5],
            9: [4, 5],
            8: [4],
          },
          rows: [8, 9, 10],
        },
        {
          byRow: {
            9: [3, 4],
            8: [4, 5],
          },
          rows: [8, 9],
        },
        {
          byRow: {
            10: [4],
            9: [3, 4],
            8: [3],
          },
          rows: [8, 9, 10],
        },
      ],
    },
  ];
  const directions = ['clockwise', 'counterclockwise'] as const;

  directions.forEach((direction) => {
    rotateActivePieceSourceData.forEach(({ pieceType, possibleCoordinates }) => {
      possibleCoordinates.forEach((initialCoordinates, rotationDelta) => {
        let nextDelta: number;

        if (direction === 'clockwise') {
          nextDelta = rotationDelta + 1 < 4 ? rotationDelta + 1 : 0;
        } else {
          nextDelta = rotationDelta - 1 >= 0 ? rotationDelta - 1 : 3;
        }

        const expectedCoordinates = possibleCoordinates[nextDelta];

        it(`should properly handle rotateActivepiece rotating an ${pieceType}-piece at rotation ${rotationDelta} ${direction}`, () => {
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
          const action = rotateActivePiece({ direction });

          const finalState = pieceReducer(initialState, action);

          // Assert
          expect(finalState).toEqual(expectedState);
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

  it('should properly handle lockActivepiece', () => {
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
