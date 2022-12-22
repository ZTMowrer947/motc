import blockReducer, {
  BlockState,
  fillActiveBlock,
  fillBag,
  lockActiveBlock,
  translateActiveBlock,
} from './blockSlice';
import type { BlockType, CoordinateMap } from './blockAPI';

interface FillActiveBlockSourceEntry {
  blockType: BlockType;
  expectedCoordinates: CoordinateMap;
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

  it.todo('should properly handle rotateActiveBlock');

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
