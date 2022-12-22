export type Coordinate = [x: number, y: number];
export type CoordinateMap = Record<number, number[]>;
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
        [4, 21],
        [4, 20],
        [5, 21],
        [6, 20],
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
        [3, 21],
        [4, 21],
        [4, 20],
        [5, 20],
      ];
    }

    default: {
      return [];
    }
  }
}
