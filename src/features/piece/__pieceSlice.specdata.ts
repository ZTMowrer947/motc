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
