export type Coordinate = [x: number, y: number];
export type CoordinateMap = Record<number, number[]>;
export type CoordinateCollection = {
  allYs: number[];
  byY: CoordinateMap;
};
export type BlockType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';

export function getInitialCoordinatesForBlock(type: BlockType): Coordinate[] {
  switch (type) {
    case 'I': {
      return [
        [3, 21],
        [4, 21],
        [5, 21],
        [6, 21],
      ];
    }

    case 'O': {
      return [
        [4, 20],
        [5, 20],
        [4, 21],
        [5, 21],
      ];
    }

    case 'T': {
      return [
        [3, 20],
        [4, 20],
        [5, 20],
        [4, 21],
      ];
    }

    case 'L': {
      return [
        [3, 20],
        [4, 20],
        [5, 20],
        [5, 21],
      ];
    }

    case 'J': {
      return [
        [3, 20],
        [4, 20],
        [5, 20],
        [3, 21],
      ];
    }

    case 'S': {
      return [
        [3, 20],
        [4, 20],
        [4, 21],
        [5, 21],
      ];
    }

    case 'Z': {
      return [
        [4, 20],
        [5, 20],
        [3, 21],
        [4, 21],
      ];
    }

    /* istanbul ignore next */
    default: {
      return [];
    }
  }
}

export function translateBlock(coordinates: CoordinateCollection, dx: number, dy: number) {
  return coordinates.allYs.reduce(
    (collection, y) => {
      const newXs = coordinates.byY[y].map((x) => x + dx);

      return {
        ...collection,
        allYs: [...collection.allYs, y + dy],
        byY: {
          ...collection.byY,
          [y + dy]: newXs,
        },
      };
    },
    { allYs: [], byY: {} } as CoordinateCollection
  );
}

function findCenterBlock(type: BlockType, coordinates: CoordinateCollection, rotationDelta: 0 | 1 | 2 | 3): Coordinate {
  let centerBlock: Coordinate;

  const allXs = coordinates.allYs.flatMap((y) => coordinates.byY[y]).sort((a, b) => a - b);

  const ys = coordinates.allYs;
  const isHorizontal = rotationDelta % 2 === 0;

  /* istanbul ignore else */
  if (['T', 'L', 'J'].includes(type)) {
    if (isHorizontal) {
      // Find index of central y-coordinate
      const centerYIndex = ys.findIndex((y) => coordinates.byY[y].length === 3);
      const centerY = ys[centerYIndex];

      // Get central x-coordinate
      const centerX = coordinates.byY[centerY][1];

      centerBlock = [centerX, centerY];
    } else {
      // Find index of central x-coordinate
      const centerXIndex = allXs.slice(0, allXs.length - 2).findIndex((x, idx) => x === allXs[idx + 2]);
      const centerX = allXs[centerXIndex];

      // Get central y-coordinate
      const centerY = ys[1];

      centerBlock = [centerX, centerY];
    }
  } else if (['S', 'Z'].includes(type)) {
    if (isHorizontal) {
      // Get x-coordinate shared across ys
      const sharedXIndex = allXs.slice(0, allXs.length - 1).findIndex((x, idx) => x === allXs[idx + 1]);
      const sharedX = allXs[sharedXIndex];

      // Get central y-coordinate based on rotation
      const centerYIndex = rotationDelta === 0 ? 0 : 1;
      const centerY = ys[centerYIndex];

      centerBlock = [sharedX, centerY];
    } else {
      // Get y-coordinate shared across xs
      const sharedYIndex = ys.findIndex((y) => coordinates.byY[y].length === 2);
      const sharedY = ys[sharedYIndex];

      // Get central x-coordinate based on rotation
      const centerXIndex = rotationDelta === 1 ? 0 : 1;
      const centerX = coordinates.byY[sharedY][centerXIndex];

      centerBlock = [centerX, sharedY];
    }
  } else {
    throw new Error('I and O-blocks have no central block to rotate about');
  }

  return centerBlock;
}

export function rotateBlock(
  type: BlockType,
  coordinates: CoordinateCollection,
  rotationDelta: 0 | 1 | 2 | 3,
  direction: 'clockwise' | 'counterclockwise'
): CoordinateCollection {
  if (type === 'O') return coordinates;

  let newCoordinates: CoordinateCollection;

  const allXs = coordinates.allYs.flatMap((y) => coordinates.byY[y]).sort((a, b) => a - b);

  const ys = coordinates.allYs.sort((a, b) => a - b);

  if (type === 'I') {
    if (rotationDelta % 2 === 0) {
      // Get the sole y coordinate
      const y = ys[0];

      // Get a sorted copy of the x coordinates
      const xs = [...coordinates.byY[y]].sort((a, b) => a - b);

      // Use rotation to select final x and the fourth y coordinate
      let selectionIndex: number;

      if (
        (rotationDelta === 0 && direction === 'clockwise') ||
        (rotationDelta === 2 && direction === 'counterclockwise')
      ) {
        selectionIndex = 2;
      } else {
        selectionIndex = 1;
      }
      const finalY = rotationDelta === 0 ? y - 2 : y + 2;
      const x = xs[selectionIndex];

      // Update coordinates
      newCoordinates = {
        byY: {
          [y + 1]: [x],
          [y]: [x],
          [y - 1]: [x],
          [finalY]: [x],
        },
        allYs: [y + 1, y, y - 1, finalY].sort((a, b) => a - b),
      };
    } else {
      // Find the x coordinate present 4 times
      const xIndex = allXs.slice(0, allXs.length - 3).findIndex((x, idx) => x === allXs[idx + 3]);
      const sharedX = allXs[xIndex];

      // Use rotation to select final y and the fourth x coordinate
      let selectionIndex: number;

      if (
        (rotationDelta === 1 && direction === 'clockwise') ||
        (rotationDelta === 3 && direction === 'counterclockwise')
      ) {
        selectionIndex = 1;
      } else {
        selectionIndex = 2;
      }
      const y = ys[selectionIndex];
      const finalX = rotationDelta === 1 ? sharedX - 2 : sharedX + 2;
      const finalXs = [sharedX - 1, sharedX, sharedX + 1, finalX].sort((a, b) => a - b);

      // Update coordinates
      newCoordinates = {
        byY: {
          [y]: finalXs,
        },
        allYs: [y],
      };
    }
  } else {
    const centerBlock = findCenterBlock(type, coordinates, rotationDelta);

    // Convert coordinate map into array of coordinates
    const coordinateArray = ys.flatMap((y) => coordinates.byY[y].map<Coordinate>((x) => [x, y]));

    // Rotate each coordinate relative to the central block
    const rotatedCoordinateArray = coordinateArray
      .map(([x, y]) => [x - centerBlock[0], y - centerBlock[1]])
      .map(([x, y]) => (direction === 'clockwise' ? [y, -x] : [-y, x]))
      .map<Coordinate>(([x, y]) => [x + centerBlock[0], y + centerBlock[1]]);

    // Convert the rotated coordinates back into a map structure
    newCoordinates = rotatedCoordinateArray.reduce(
      (collection, [x, y]) => {
        if (collection.allYs.includes(y)) {
          return {
            ...collection,
            byY: {
              ...collection.byY,
              [y]: [...collection.byY[y], x].sort((a, b) => a - b),
            },
          };
        }
        return {
          ...collection,
          allYs: [...collection.allYs, y].sort((a, b) => a - b),
          byY: {
            ...collection.byY,
            [y]: [x],
          },
        };
      },
      { allYs: [], byY: {} } as CoordinateCollection
    );
  }

  return newCoordinates;
}

export function drawSquare(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, sideLength: number) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 1;

  const realX = 200 + x * sideLength;
  const realY = (20 - y) * sideLength;

  ctx.fillRect(realX, realY, sideLength, sideLength);
  ctx.strokeRect(realX, realY, sideLength, sideLength);
}

export function getBlockColor(type: BlockType) {
  let colors: [number, number, number];

  switch (type) {
    case 'I': {
      colors = [0, 255, 255]; // Cyan
      break;
    }

    case 'O': {
      colors = [255, 255, 0]; // Yellow
      break;
    }

    case 'T': {
      colors = [160, 0, 160]; // Purple
      break;
    }

    case 'L': {
      colors = [255, 165, 0]; // Orange
      break;
    }

    case 'J': {
      colors = [0, 0, 255]; // Blue
      break;
    }

    case 'S': {
      colors = [0, 255, 0]; // Green
      break;
    }

    case 'Z': {
      colors = [255, 0, 0]; // Red
      break;
    }

    default: {
      colors = [68, 68, 68]; // Gray
      break;
    }
  }

  return `rgb(${colors.join(', ')}`;
}
