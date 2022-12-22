import blockReducer, { BlockState, fillActiveBlock, fillBag, translateActiveBlock } from './blockSlice';
import { BlockType } from './blockAPI';

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

  it('should properly handle fillActiveBlock', () => {
    // Arrange
    const initialState: BlockState = {
      active: null,
      occupied: {},
      nextBlocks: ['I'],
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
    const action = fillActiveBlock();

    const finalState = blockReducer(initialState, action);

    // Assert
    expect(finalState).toEqual(expectedState);
  });

  it('should properly handle translateActiveBlock', () => {
    // Arrange
    const initialState: BlockState = {
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

    const expectedState: BlockState = {
      active: {
        type: 'I',
        coordinates: {
          19: [3, 4, 5, 6],
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
});

export {};
