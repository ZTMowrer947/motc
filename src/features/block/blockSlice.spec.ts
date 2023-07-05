import { describe, it, expect } from 'vitest';
import blockReducer, {
  BlockState,
  clearLine,
  fillActiveBlock,
  fillBag,
  lockActiveBlock,
  rotateActiveBlock,
  translateActiveBlock,
} from './blockSlice';
import type { BlockType, CoordinateCollection } from './blockAPI';

interface FillActiveBlockSourceEntry {
  blockType: BlockType;
  expectedCoordinates: CoordinateCollection;
}

interface RotateActiveBlockSourceEntry {
  blockType: BlockType;
  possibleCoordinates: CoordinateCollection[];
}

describe('block reducer', () => {
  it('should properly initialize state', () => {
    // Arrange
    const expectedState: BlockState = {
      active: null,
      occupied: {
        byRow: {},
        rows: [],
      },
      nextBlocks: [],
      lineClears: 0,
    };

    // Act
    const finalState = blockReducer(undefined, { type: 'INIT' });

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  // Configure test case data for next test
  const fillActiveBlockSourceData: FillActiveBlockSourceEntry[] = [
    {
      blockType: 'I',
      expectedCoordinates: {
        byRow: {
          21: [3, 4, 5, 6],
        },
        rows: [21],
      },
    },
    {
      blockType: 'O',
      expectedCoordinates: {
        byRow: {
          21: [4, 5],
          20: [4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      blockType: 'T',
      expectedCoordinates: {
        byRow: {
          21: [4],
          20: [3, 4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      blockType: 'L',
      expectedCoordinates: {
        byRow: {
          21: [5],
          20: [3, 4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      blockType: 'J',
      expectedCoordinates: {
        byRow: {
          21: [3],
          20: [3, 4, 5],
        },
        rows: [20, 21],
      },
    },
    {
      blockType: 'S',
      expectedCoordinates: {
        byRow: {
          21: [4, 5],
          20: [3, 4],
        },
        rows: [20, 21],
      },
    },
    {
      blockType: 'Z',
      expectedCoordinates: {
        byRow: {
          21: [3, 4],
          20: [4, 5],
        },
        rows: [20, 21],
      },
    },
  ];

  // Run following test for each type of block
  fillActiveBlockSourceData.forEach(({ blockType, expectedCoordinates }) => {
    it(`should properly handle fillActiveBlock for ${blockType}-block`, () => {
      // Arrange
      const initialState: BlockState = {
        active: null,
        occupied: {
          byRow: {},
          rows: [],
        },
        nextBlocks: [blockType],
        lineClears: 0,
      };

      const expectedState: BlockState = {
        active: {
          type: blockType,
          coordinates: expectedCoordinates,
          rotationDelta: 0,
        },
        occupied: {
          byRow: {},
          rows: [],
        },
        nextBlocks: [],
        lineClears: 0,
      };

      // Act
      const action = fillActiveBlock();

      const finalState = blockReducer(initialState, action);

      // Assert
      expect(finalState).toEqual(expectedState);
    });
  });

  it('should properly handle translateActiveBlock', () => {
    // Arrange
    const initialState: BlockState = {
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
      nextBlocks: [],
      lineClears: 0,
    };

    const expectedState: BlockState = {
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
      nextBlocks: [],
      lineClears: 0,
    };

    // Act
    const action = translateActiveBlock({
      dCol: 0,
      dRow: -1,
    });

    const finalState = blockReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  // Configure test case data for block rotation test
  const rotateActiveBlockSourceData: RotateActiveBlockSourceEntry[] = [
    {
      blockType: 'I',
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
      blockType: 'O',
      possibleCoordinates: Array.from({ length: 4 }, () => ({
        byRow: {
          10: [4, 5],
          9: [4, 5],
        },
        rows: [9, 10],
      })),
    },
    {
      blockType: 'T',
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
      blockType: 'L',
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
      blockType: 'J',
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
      blockType: 'S',
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
      blockType: 'Z',
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
    rotateActiveBlockSourceData.forEach(({ blockType, possibleCoordinates }) => {
      possibleCoordinates.forEach((initialCoordinates, rotationDelta) => {
        let nextDelta: number;

        if (direction === 'clockwise') {
          nextDelta = rotationDelta + 1 < 4 ? rotationDelta + 1 : 0;
        } else {
          nextDelta = rotationDelta - 1 >= 0 ? rotationDelta - 1 : 3;
        }

        const expectedCoordinates = possibleCoordinates[nextDelta];

        it(`should properly handle rotateActiveBlock rotating an ${blockType}-block at rotation ${rotationDelta} ${direction}`, () => {
          // Arrange
          const initialState: BlockState = {
            active: {
              type: blockType,
              coordinates: initialCoordinates,
              rotationDelta: rotationDelta as 0 | 1 | 2 | 3,
            },
            occupied: {
              rows: [],
              byRow: {},
            },
            nextBlocks: [],
            lineClears: 0,
          };

          const expectedState: BlockState = {
            active: {
              type: blockType,
              coordinates: expectedCoordinates,
              rotationDelta: nextDelta as 0 | 1 | 2 | 3,
            },
            occupied: {
              rows: [],
              byRow: {},
            },
            nextBlocks: [],
            lineClears: 0,
          };

          // Act
          const action = rotateActiveBlock({ direction });

          const finalState = blockReducer(initialState, action);

          // Assert
          expect(finalState).toEqual(expectedState);
        });
      });
    });
  });

  it('should properly handle fillBag', () => {
    // Arrange
    const initialState: BlockState = {
      active: null,
      occupied: {
        byRow: {},
        rows: [],
      },
      nextBlocks: [],
      lineClears: 0,
    };

    const nextBag: BlockType[] = ['I', 'Z', 'T', 'J', 'S', 'O', 'L'];

    const expectedState: BlockState = {
      active: null,
      occupied: {
        byRow: {},
        rows: [],
      },
      nextBlocks: nextBag,
      lineClears: 0,
    };

    // Act
    const action = fillBag(nextBag);

    const finalState = blockReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  it('should properly handle lockActiveBlock', () => {
    // Arrange
    const initialState: BlockState = {
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
      nextBlocks: [],
      lineClears: 0,
    };

    const expectedState: BlockState = {
      active: null,
      occupied: {
        byRow: {
          0: [3, 4, 5, 6],
        },
        rows: [0],
      },
      nextBlocks: [],
      lineClears: 0,
    };

    // Act
    const action = lockActiveBlock();

    const finalState = blockReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  it('should properly handle clearLine on bottom row', () => {
    // Arrange
    const initialState: BlockState = {
      active: null,
      occupied: {
        byRow: {
          1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          2: [0, 1, 9],
          3: [1],
        },
        rows: [1, 2, 3],
      },
      nextBlocks: [],
      lineClears: 0,
    };

    const expectedState: BlockState = {
      active: null,
      occupied: {
        byRow: {
          1: [0, 1, 9],
          2: [1],
        },
        rows: [1, 2],
      },
      nextBlocks: [],
      lineClears: 1,
    };

    // Act
    const action = clearLine({ row: 1 });

    const finalState = blockReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  it('should properly handle clearLine on above-ground row', () => {
    // Arrange
    const initialState: BlockState = {
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
      nextBlocks: [],
      lineClears: 0,
    };

    const expectedState: BlockState = {
      active: null,
      occupied: {
        byRow: {
          1: [1, 4, 5, 6, 7, 9],
          2: [0, 1, 9],
          3: [1],
        },
        rows: [1, 2, 3],
      },
      nextBlocks: [],
      lineClears: 1,
    };

    // Act
    const action = clearLine({ row: 2 });

    const finalState = blockReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });
});
