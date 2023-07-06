import { produce } from 'immer';

import type { Coordinate, CoordinateCollection } from './types';

function compare(a: number, b: number) {
  return a - b;
}

export function coordArrayToCollection(coordinates: Coordinate[]) {
  const collectionBase: CoordinateCollection = {
    rows: [],
    byRow: {},
  };

  return produce(collectionBase, (draft) => {
    // Build out coordinate collection
    coordinates.forEach(({ row, col }) => {
      if (!draft.rows.includes(row)) {
        draft.rows.push(row);
      }

      if (!draft.byRow[row]) {
        draft.byRow[row] = [col];
      } else {
        draft.byRow[row].push(col);
      }
    });

    // Ensure rows and each set of mappings are sorted
    draft.rows.sort(compare);
    draft.rows.forEach((row) => draft.byRow[row].sort(compare));
  });
}

export function coordCollectionToArray(collection: CoordinateCollection) {
  return collection.rows.flatMap<Coordinate>((row) => collection.byRow[row].map((col) => ({ row, col })));
}
