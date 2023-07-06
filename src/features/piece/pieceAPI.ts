export interface Coordinate {
  row: number;
  col: number;
}
export type CoordinateMap = Record<number, number[]>;
export type CoordinateCollection = {
  rows: number[];
  byRow: CoordinateMap;
};
export type PieceType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';

/**
 * Translates the given piece coordinates by the given row and column deltas
 * @param coordinates The coordinates to translate
 * @param dCol The number of columns to move
 * @param dRow TThe number of rows to move
 * @return The translated coordinates
 */
export function translatePiece(coordinates: CoordinateCollection, dCol: number, dRow: number): CoordinateCollection {
  return coordinates.rows.reduce(
    (collection, row) => {
      const newCols = coordinates.byRow[row].map((col) => col + dCol);

      return {
        ...collection,
        rows: [...collection.rows, row + dRow],
        byRow: {
          ...collection.byRow,
          [row + dRow]: newCols,
        },
      };
    },
    { rows: [], byRow: {} } as CoordinateCollection
  );
}

/**
 * Attempts to find the center to rotate about of the given piece. Applicable for all pieces except I- and O-pieces.
 * @param type The type of piece
 * @param coordinates The coordinates of the piece
 * @param rotationDelta The current rotation state of the piece
 * @return The coordinates of the center of the given piece
 */
function findPieceCenter(type: PieceType, coordinates: CoordinateCollection, rotationDelta: 0 | 1 | 2 | 3) {
  let centerPieces: Coordinate;

  const cols = coordinates.rows.flatMap((row) => coordinates.byRow[row]).sort((a, b) => a - b);

  const { rows } = coordinates;
  const isHorizontal = rotationDelta % 2 === 0;

  /* istanbul ignore else */
  if (['T', 'L', 'J'].includes(type)) {
    if (isHorizontal) {
      const centerRowIdx = rows.findIndex((row) => coordinates.byRow[row].length === 3);
      const centerRow = rows[centerRowIdx];

      const centerCol = coordinates.byRow[centerRow][1];

      centerPieces = { row: centerRow, col: centerCol };
    } else {
      const centerColIdx = cols.slice(0, cols.length - 2).findIndex((col, idx) => col === cols[idx + 2]);
      const centerCol = cols[centerColIdx];

      const centerRow = rows[1];

      centerPieces = { row: centerRow, col: centerCol };
    }
  } else if (['S', 'Z'].includes(type)) {
    if (isHorizontal) {
      // Get column shared across rows
      const sharedColIdx = cols.slice(0, cols.length - 1).findIndex((col, idx) => col === cols[idx + 1]);
      const sharedCol = cols[sharedColIdx];

      // Get central row based on rotation
      const centerRowIdx = rotationDelta === 0 ? 0 : 1;
      const centerRow = rows[centerRowIdx];

      centerPieces = { row: centerRow, col: sharedCol };
    } else {
      // Get row shared across columns
      const sharedRowIdx = rows.findIndex((row) => coordinates.byRow[row].length === 2);
      const sharedRow = rows[sharedRowIdx];

      // Get central column based on rotation
      const centerColIdx = rotationDelta === 1 ? 0 : 1;
      const centerCol = coordinates.byRow[sharedRow][centerColIdx];

      centerPieces = { row: sharedRow, col: centerCol };
    }
  } else {
    throw new Error('I and O-pieces have no central piece to rotate about');
  }

  return centerPieces;
}

/**
 * Rotates the given piece in the given direction
 * @param type The type of piece
 * @param coordinates The coordinates of the piece
 * @param rotationDelta The current rotation state of the piece
 * @param direction The direction to rotate the piece, either clockwise or counterclockwise
 * @return The rotated coordinates of the piece
 */
export function rotatePiece(
  type: PieceType,
  coordinates: CoordinateCollection,
  rotationDelta: 0 | 1 | 2 | 3,
  direction: 'clockwise' | 'counterclockwise'
): CoordinateCollection {
  // An O-piece never needs rotated
  if (type === 'O') return coordinates;

  let newCoordinates: CoordinateCollection;

  // Collect all the rows and columns, and sort them
  const cols = coordinates.rows.flatMap((row) => coordinates.byRow[row]).sort((a, b) => a - b);
  const rows = [...coordinates.rows].sort((a, b) => a - b);

  if (type === 'I') {
    if (rotationDelta % 2 === 0) {
      // Get the sole row
      const row = rows[0];

      // Get a sorted copy of the columns
      const colsCopy = [...coordinates.byRow[row]].sort((a, b) => a - b);

      // Use rotation to select fourth row and shared column
      let selectionIndex: number;

      if (
        (rotationDelta === 0 && direction === 'clockwise') ||
        (rotationDelta === 2 && direction === 'counterclockwise')
      ) {
        selectionIndex = 2;
      } else {
        selectionIndex = 1;
      }
      const finalRow = rotationDelta === 0 ? row - 2 : row + 2;
      const col = colsCopy[selectionIndex];

      // Update coordinates
      newCoordinates = {
        byRow: {
          [row + 1]: [col],
          [row]: [col],
          [row - 1]: [col],
          [finalRow]: [col],
        },
        rows: [row + 1, row, row - 1, finalRow].sort((a, b) => a - b),
      };
    } else {
      // Find the shared column
      const colIndex = cols.slice(0, cols.length - 3).findIndex((col, idx) => col === cols[idx + 3]);
      const sharedCol = cols[colIndex];

      // Use rotation to select shared row and the fourth column
      let selectionIndex: number;

      if (
        (rotationDelta === 1 && direction === 'clockwise') ||
        (rotationDelta === 3 && direction === 'counterclockwise')
      ) {
        selectionIndex = 1;
      } else {
        selectionIndex = 2;
      }
      const row = rows[selectionIndex];
      const fourthCol = rotationDelta === 1 ? sharedCol - 2 : sharedCol + 2;
      const finalCols = [sharedCol - 1, sharedCol, sharedCol + 1, fourthCol].sort((a, b) => a - b);

      // Update coordinates
      newCoordinates = {
        byRow: {
          [row]: finalCols,
        },
        rows: [row],
      };
    }
  } else {
    const centerSquare = findPieceCenter(type, coordinates, rotationDelta);

    // Convert coordinate map into array of coordinates
    const coordinateArray = rows.flatMap((row) => coordinates.byRow[row].map((col) => [col, row]));

    // Rotate each coordinate relative to the central piece
    const rotatedCoordinateArray = coordinateArray
      .map(([col, row]) => [col - centerSquare.col, row - centerSquare.row])
      .map(([col, row]) => (direction === 'clockwise' ? [row, -col] : [-row, col]))
      .map<Coordinate>(([col, row]) => ({ col: col + centerSquare.col, row: row + centerSquare.row }));

    // Convert the rotated coordinates back into a map structure
    newCoordinates = rotatedCoordinateArray.reduce(
      (collection, { row, col }) => {
        if (collection.rows.includes(row)) {
          return {
            ...collection,
            byRow: {
              ...collection.byRow,
              [row]: [...collection.byRow[row], col].sort((a, b) => a - b),
            },
          };
        }
        return {
          ...collection,
          rows: [...collection.rows, row].sort((a, b) => a - b),
          byRow: {
            ...collection.byRow,
            [row]: [col],
          },
        };
      },
      { rows: [], byRow: {} } as CoordinateCollection
    );
  }

  return newCoordinates;
}

/**
 * Checks the validity of the given coordinates of the active piece.
 * A piece's coordinates are valid if they are not outside the game box and are
 * not colliding with any occupied area of the box.
 * @param currentCoordinates The coordinates of the active piece
 * @param occupiedCoordinates The coordinates already occupied by previous pieces
 * @returns Whether the active piece coordinates are valid.
 */
export function arePieceCoordinatesValid(
  currentCoordinates: CoordinateCollection,
  occupiedCoordinates: CoordinateCollection
): boolean {
  return currentCoordinates.rows.every(
    (row) =>
      row > 0 &&
      currentCoordinates.byRow[row].every(
        (col) => col >= 0 && col < 10 && !occupiedCoordinates.byRow[row]?.includes(col)
      )
  );
}

/**
 * Draws a square on the game box
 * @param ctx The canvas context to use for drawing
 * @param color The color of the square
 * @param row The row of the square
 * @param col The column of the square
 * @param sideLength The side length of the square
 */
export function drawSquare(ctx: CanvasRenderingContext2D, color: string, row: number, col: number, sideLength: number) {
  // Set colors and line width
  ctx.fillStyle = color;
  ctx.strokeStyle = 'gray';
  ctx.lineWidth = 1;

  // Calculate actual coordinates for canvas
  const realX = 200 + col * sideLength;
  const realY = (20 - row) * sideLength;

  // Draw square with outline
  ctx.fillRect(realX, realY, sideLength, sideLength);
  ctx.strokeRect(realX, realY, sideLength, sideLength);
}

export function getPieceColor(type: PieceType) {
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
