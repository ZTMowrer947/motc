import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlockType, Coordinate, CoordinateMap, getInitialCoordinatesForBlock } from './blockAPI';

// Types
interface ActiveBlockData {
  coordinates: CoordinateMap;
  type: BlockType;
  rotationDelta: 0 | 1 | 2 | 3;
}

interface TranslateBlockPayload {
  dx: number;
  dy: number;
}

interface RotateBlockPayload {
  direction: 'clockwise' | 'counterclockwise';
}

// Slice
const blockSlice = createSlice({
  name: 'block',
  initialState: {
    active: null as ActiveBlockData | null,
    occupied: {} as CoordinateMap,
    nextBlocks: [] as BlockType[],
    lineClears: 0,
  },
  reducers: {
    fillActiveBlock(state) {
      // Grab the next block in line
      const nextBlock = state.nextBlocks.shift();

      // Ensure such a block was actually available before continuing
      if (nextBlock) {
        const coordinates = getInitialCoordinatesForBlock(nextBlock);

        const coordinateMap = coordinates.reduce((map, [x, y]) => {
          if (y in map) {
            map[y] = [...map[y], x];
          } else {
            map[y] = [x];
          }

          return map;
        }, {} as CoordinateMap);

        state.active = {
          type: nextBlock,
          coordinates: coordinateMap,
          rotationDelta: 0,
        };
      }
    },
    translateActiveBlock(state, { payload }: PayloadAction<TranslateBlockPayload>) {
      if (state.active) {
        const { dx, dy } = payload;

        state.active.coordinates = Object.fromEntries(
          Object.entries<number[]>(state.active.coordinates).map<[number, number[]]>(([key, xs]) => {
            const y = Number.parseInt(key, 10);
            const newXs = xs.map((x) => x + dx);

            return [y + dy, newXs];
          })
        );
      }
    },
    rotateActiveBlock(state, { payload }: PayloadAction<RotateBlockPayload>) {
      if (state.active) {
        const { type: blockType, rotationDelta } = state.active;

        const allXs = Object.values(state.active.coordinates)
          .flat()
          .sort((a, b) => a - b);

        const ys = Object.keys(state.active.coordinates)
          .map((key) => Number.parseInt(key, 10))
          .sort((a, b) => a - b);

        // Handle the block rotation
        if (blockType === 'I') {
          if (rotationDelta % 2 === 0) {
            // Get the sole y coordinate
            const y = Object.keys(state.active.coordinates).map((key) => Number.parseInt(key, 10))[0];

            // Get a sorted copy of the x coordinates
            const xs = [...state.active.coordinates[y]].sort((a, b) => a - b);

            // Use rotation to select final x and the fourth y coordinate
            let selectionIndex: number;

            if (
              (rotationDelta === 0 && payload.direction === 'clockwise') ||
              (rotationDelta === 2 && payload.direction === 'counterclockwise')
            ) {
              selectionIndex = 2;
            } else {
              selectionIndex = 1;
            }

            const finalY = rotationDelta === 0 ? y - 2 : y + 2;

            const x = xs[selectionIndex];

            // Update coordinates
            state.active.coordinates = {
              [y + 1]: [x],
              [y]: [x],
              [y - 1]: [x],
              [finalY]: [x],
            };
          } else {
            // Find the x coordinate present 4 times
            const xIndex = allXs.slice(0, allXs.length - 3).findIndex((x, idx) => x === allXs[idx + 3]);
            const sharedX = allXs[xIndex];

            // Use rotation to select final y and the fourth x coordinate
            let selectionIndex: number;

            if (
              (rotationDelta === 1 && payload.direction === 'clockwise') ||
              (rotationDelta === 3 && payload.direction === 'counterclockwise')
            ) {
              selectionIndex = 1;
            } else {
              selectionIndex = 2;
            }
            const y = ys[selectionIndex];
            const finalX = rotationDelta === 1 ? sharedX - 2 : sharedX + 2;
            const finalXs = [sharedX - 1, sharedX, sharedX + 1, finalX].sort();

            // Update coordinates
            state.active.coordinates = {
              [y]: finalXs,
            };
          }
        } else if (['T', 'L', 'J'].includes(blockType)) {
          let centerBlock: Coordinate;

          if (rotationDelta % 2 === 0) {
            // Find index of central y-coordinate
            const centerYIndex = ys.findIndex((y) => state.active?.coordinates[y].length === 3);
            const centerY = ys[centerYIndex];

            // Get central x-coordinate
            const centerX = state.active.coordinates[centerY][1];

            centerBlock = [centerX, centerY];
          } else {
            // Find index of central x-coordinate
            const centerXIndex = allXs.slice(0, allXs.length - 2).findIndex((x, idx) => x === allXs[idx + 2]);
            const centerX = allXs[centerXIndex];

            // Get central y-coordinate
            const centerY = ys[1];

            centerBlock = [centerX, centerY];
          }

          // Convert coordinate map into array of coordinates
          const coordinateArray = Object.keys(state.active.coordinates)
            .map((key) => Number.parseInt(key, 10))
            .flatMap((y) => (state.active?.coordinates[y] ?? []).map<Coordinate>((x) => [x, y]));

          // Rotate each coordinate relative to the central block
          const rotatedCoordinateArray = coordinateArray
            .map(([x, y]) => [x - centerBlock[0], y - centerBlock[1]])
            .map(([x, y]) => (payload.direction === 'clockwise' ? [y, -x] : [-y, x]))
            .map<Coordinate>(([x, y]) => [x + centerBlock[0], y + centerBlock[1]]);

          // Convert the rotated coordinates back into a map structure
          state.active.coordinates = rotatedCoordinateArray.reduce((coordinateMap, [x, y]) => {
            return {
              ...coordinateMap,
              [y]: [...(coordinateMap[y] ?? []), x].sort((a, b) => a - b),
            };
          }, {} as CoordinateMap);
        } else if (['S', 'Z'].includes(blockType)) {
          let centerBlock: Coordinate;

          if (rotationDelta % 2 === 0) {
            const sharedXIndex = allXs.slice(0, allXs.length - 1).findIndex((x, idx) => x === allXs[idx + 1]);
            const sharedX = allXs[sharedXIndex];
            const centerYIndex = rotationDelta === 0 ? 0 : 1;
            const centerY = ys[centerYIndex];

            centerBlock = [sharedX, centerY];
          } else {
            const sharedYIndex = ys.findIndex((y) => state.active?.coordinates[y].length === 2);
            const sharedY = ys[sharedYIndex];
            const centerXIndex = rotationDelta === 1 ? 0 : 1;
            const centerX = state.active.coordinates[sharedY][centerXIndex];

            centerBlock = [centerX, sharedY];
          }

          // Convert coordinate map into array of coordinates
          const coordinateArray = Object.keys(state.active.coordinates)
            .map((key) => Number.parseInt(key, 10))
            .flatMap((y) => (state.active?.coordinates[y] ?? []).map<Coordinate>((x) => [x, y]));

          // Rotate each coordinate relative to the central block
          const rotatedCoordinateArray = coordinateArray
            .map(([x, y]) => [x - centerBlock[0], y - centerBlock[1]])
            .map(([x, y]) => (payload.direction === 'clockwise' ? [y, -x] : [-y, x]))
            .map<Coordinate>(([x, y]) => [x + centerBlock[0], y + centerBlock[1]]);

          // Convert the rotated coordinates back into a map structure
          state.active.coordinates = rotatedCoordinateArray.reduce((coordinateMap, [x, y]) => {
            return {
              ...coordinateMap,
              [y]: [...(coordinateMap[y] ?? []), x].sort((a, b) => a - b),
            };
          }, {} as CoordinateMap);
        }

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
        Object.entries<number[]>(state.active.coordinates).forEach(([key, xs]) => {
          const y = Number.parseInt(key, 10);

          state.occupied[y] = [...xs];
        });

        state.active = null;
      }
    },
  },
});

// Actions
export const { fillActiveBlock, translateActiveBlock, rotateActiveBlock, fillBag, lockActiveBlock } =
  blockSlice.actions;

// Reducer
export type BlockState = Readonly<ReturnType<typeof blockSlice.reducer>>;
export default blockSlice.reducer;
