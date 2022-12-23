import blockReducer, {
  BlockState,
  fillActiveBlock,
  fillBag,
  lockActiveBlock,
  rotateActiveBlock,
  translateActiveBlock,
} from './blockSlice';
import type { BlockType, CoordinateMap } from './blockAPI';

interface FillActiveBlockSourceEntry {
  blockType: BlockType;
  expectedCoordinates: CoordinateMap;
}

interface RotateActiveBlockSourceEntry {
  blockType: BlockType;
  possibleCoordinates: CoordinateMap[];
}

describe('block reducer', () => {
  it('should properly initialize state', () => {
    // Arrange
    const expectedState: BlockState = {
      active: null,
      occupied: {},
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
        21: [3, 4, 5, 6],
      },
    },
    {
      blockType: 'O',
      expectedCoordinates: {
        21: [4, 5],
        20: [4, 5],
      },
    },
    {
      blockType: 'T',
      expectedCoordinates: {
        21: [4],
        20: [3, 4, 5],
      },
    },
    {
      blockType: 'L',
      expectedCoordinates: {
        21: [5],
        20: [3, 4, 5],
      },
    },
    {
      blockType: 'J',
      expectedCoordinates: {
        21: [3],
        20: [3, 4, 5],
      },
    },
    {
      blockType: 'S',
      expectedCoordinates: {
        21: [4, 5],
        20: [3, 4],
      },
    },
    {
      blockType: 'Z',
      expectedCoordinates: {
        21: [3, 4],
        20: [4, 5],
      },
    },
  ];

  // Run following test for each type of block
  fillActiveBlockSourceData.forEach(({ blockType, expectedCoordinates }) => {
    it(`should properly handle fillActiveBlock for ${blockType}-block`, () => {
      // Arrange
      const initialState: BlockState = {
        active: null,
        occupied: {},
        nextBlocks: [blockType],
        lineClears: 0,
      };

      const expectedState: BlockState = {
        active: {
          type: blockType,
          coordinates: expectedCoordinates,
          rotationDelta: 0,
        },
        occupied: {},
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
          21: [3, 4, 5, 6],
        },
        rotationDelta: 0,
      },
      occupied: {},
      nextBlocks: [],
      lineClears: 0,
    };

    const expectedState: BlockState = {
      active: {
        type: 'I',
        coordinates: {
          20: [3, 4, 5, 6],
        },
        rotationDelta: 0,
      },
      occupied: {},
      nextBlocks: [],
      lineClears: 0,
    };

    // Act
    const action = translateActiveBlock({
      dx: 0,
      dy: -1,
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
          10: [3, 4, 5, 6],
        },
        {
          11: [5],
          10: [5],
          9: [5],
          8: [5],
        },
        {
          9: [3, 4, 5, 6],
        },
        {
          11: [4],
          10: [4],
          9: [4],
          8: [4],
        },
      ],
    },
    {
      blockType: 'O',
      possibleCoordinates: Array.from({ length: 4 }, () => ({
        10: [4, 5],
        9: [4, 5],
      })),
    },
    {
      blockType: 'T',
      possibleCoordinates: [
        {
          10: [4],
          9: [3, 4, 5],
        },
        {
          10: [4],
          9: [4, 5],
          8: [4],
        },
        {
          9: [3, 4, 5],
          8: [4],
        },
        {
          10: [4],
          9: [3, 4],
          8: [4],
        },
      ],
    },
    {
      blockType: 'L',
      possibleCoordinates: [
        {
          10: [5],
          9: [3, 4, 5],
        },
        {
          10: [4],
          9: [4],
          8: [4, 5],
        },
        {
          9: [3, 4, 5],
          8: [3],
        },
        {
          10: [3, 4],
          9: [4],
          8: [4],
        },
      ],
    },
    {
      blockType: 'J',
      possibleCoordinates: [
        {
          10: [3],
          9: [3, 4, 5],
        },
        {
          10: [4, 5],
          9: [4],
          8: [4],
        },
        {
          9: [3, 4, 5],
          8: [5],
        },
        {
          10: [4],
          9: [4],
          8: [3, 4],
        },
      ],
    },
    {
      blockType: 'S',
      possibleCoordinates: [
        {
          10: [4, 5],
          9: [3, 4],
        },
        {
          10: [4],
          9: [4, 5],
          8: [5],
        },
        {
          9: [4, 5],
          8: [3, 4],
        },
        {
          10: [3],
          9: [3, 4],
          8: [4],
        },
      ],
    },
    {
      blockType: 'Z',
      possibleCoordinates: [
        {
          10: [3, 4],
          9: [4, 5],
        },
        {
          10: [5],
          9: [4, 5],
          8: [4],
        },
        {
          9: [3, 4],
          8: [4, 5],
        },
        {
          10: [4],
          9: [3, 4],
          8: [3],
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
            occupied: {},
            nextBlocks: [],
            lineClears: 0,
          };

          const expectedState: BlockState = {
            active: {
              type: blockType,
              coordinates: expectedCoordinates,
              rotationDelta: nextDelta as 0 | 1 | 2 | 3,
            },
            occupied: {},
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
      occupied: {},
      nextBlocks: [],
      lineClears: 0,
    };

    const nextBag: BlockType[] = ['I', 'Z', 'T', 'J', 'S', 'O', 'L'];

    const expectedState: BlockState = {
      active: null,
      occupied: {},
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
          0: [3, 4, 5, 6],
        },
        rotationDelta: 0,
      },
      occupied: {},
      nextBlocks: [],
      lineClears: 0,
    };

    const expectedState: BlockState = {
      active: null,
      occupied: {
        0: [3, 4, 5, 6],
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
});
