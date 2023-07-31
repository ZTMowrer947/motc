/**
 * For simplifying the creation of Tetris game states, I have created a custom
 * notation inspired by the Forsyth-Edwards Notation used to represent chess
 * board states.
 *
 * The format is split into the following segments, separated by a single space.
 *
 * 1) Board state: Representation for 21 rows of 10 cells, with each row
 * separated by a forward slash.
 *  - X indicates an empty row.
 *  - A or O indicates a cell part of an active piece or occupied area, respectively.
 *  - The numbers 0-9 indicate that number of consecutive empty cells.
 * 2) The active piece type, or "-" for no active piece.
 * 3) The rotation delta of the active piece, as a quaternary digit.
 * 4) The type of held piece, or "-" for none.
 * 5) The number of lines cleared.
 * 6) The types of pieces to next be active, or - for an empty list.
 */

import { PieceState } from '@/features/piece/pieceSlice';
import { PieceType } from '@/features/piece/pieceAPI';
import { produce } from 'immer';

// Regex for Zeta notation
const zetaRegex =
  /^(?<board>(?:[0-9OAX]{1,10}\/){20}[0-9OAX]{1,10}) (?<atype>[IOTLJSZ-]) (?<arotdelta>[0-3]) (?<htype>[IOTLJSZ-]) (?<lines>\d+) (?<next>-|[IOTJLSZ]+)$/;

export default function parseZeta(zetaString: string): PieceState {
  const match = zetaRegex.exec(zetaString);

  if (!match?.groups) throw new Error('Invalid Zeta string');

  const {
    board,
    atype: activePieceType,
    arotdelta: activeRotationDelta,
    // htype: heldPieceType,
    lines,
    next,
  } = match.groups;

  const baseState: PieceState = {
    active: {
      type: activePieceType as PieceType,
      rotationDelta: Number.parseInt(activeRotationDelta, 4) as 0 | 1 | 2 | 3,
      coordinates: {
        rows: [],
        byRow: {},
      },
    },
    nextPieces: next.split('') as PieceType[],
    lineClears: Number.parseInt(lines, 10),
    occupied: {
      rows: [],
      byRow: {},
    },
  };

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  return produce(baseState, (draft) => {
    board
      .split('/')
      .map((row) => row.split(''))
      .forEach((row, index) => {
        const rowNum = 21 - index;

        let colIdx = 0;
        let rowDone = false;
        row.forEach((cell) => {
          if (rowDone) return;

          switch (cell) {
            case 'X': {
              rowDone = true;
              break;
            }

            case 'A': {
              if (!draft.active!.coordinates.rows.includes(rowNum)) {
                draft.active!.coordinates.rows.unshift(rowNum);
                draft.active!.coordinates.byRow[rowNum] = [];
              }

              draft.active!.coordinates.byRow[rowNum].push(colIdx);

              colIdx += 1;
              break;
            }

            case 'O': {
              if (!draft.occupied.rows.includes(rowNum)) {
                draft.occupied.rows.unshift(rowNum);
                draft.occupied.byRow[rowNum] = [];
              }

              draft.occupied.byRow[rowNum].push(colIdx);

              colIdx += 1;
              break;
            }

            default: {
              const cellNum = Number.parseInt(cell, 10);

              colIdx += cellNum;
              break;
            }
          }
        });
      });
  });
}
