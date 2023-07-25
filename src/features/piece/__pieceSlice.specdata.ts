import { PieceType } from '@/features/piece/pieceAPI';
import { CoordinateCollection } from '@/features/coordinate/types';

export interface FillActivePieceSourceEntry {
  pieceType: PieceType;
  expectedCoordinates: CoordinateCollection;
}

export interface RotateActivePieceSourceEntry {
  pieceType: PieceType;
  possibleCoordinates: CoordinateCollection[];
}

// Test data for fillActivePiece test
export const fillActivePieceSourceData: FillActivePieceSourceEntry[] = [
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

// Test data for rotateActivePiece
export const rotateActivePieceSourceData: RotateActivePieceSourceEntry[] = [
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
