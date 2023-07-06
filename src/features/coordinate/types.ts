/**
 * Represents a coordinate on the Tetris game board.
 */
export interface Coordinate {
  /**
   * The row of the coordinate position.
   */
  row: number;

  /**
   * The column of the coordinate position.
   */
  col: number;
}

/**
 * Maps a row to an array of columns on said row.
 */
export type CoordinateMap = Record<number, number[]>;

/**
 * Represents a normalized collection of coordinates keyed by rows.
 */
export type CoordinateCollection = {
  /**
   * The array of rows in the collection.
   */
  rows: number[];

  /**
   * The mapping of rows to columns on each row.
   */
  byRow: CoordinateMap;
};
