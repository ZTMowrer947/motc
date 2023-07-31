/* eslint react/jsx-props-no-spreading: ["error", { "exceptions": ["Board" ] }] */

import { expect, describe, it, vi } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import Board, { BoardProps } from '@/features/piece/Board';
import getCanvasImage from '@/testutils/getCanvasImage';
import { MatchImageSnapshotOptions } from 'jest-image-snapshot';

const imgSnapSharedOptions: MatchImageSnapshotOptions = {
  comparisonMethod: 'ssim',
};

describe('Board component', () => {
  it('should properly render an empty board', () => {
    const props: BoardProps = {
      occupiedCoordinates: [],
      linesCleared: 0,
      handleAutoMoveDown: vi.fn(),
    };

    render(<Board {...props} />);

    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');

    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'Board-Empty',
    });
  });

  it('should properly render a game in progress', () => {
    const props: BoardProps = {
      occupiedCoordinates: [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
        { row: 1, col: 4 },
        { row: 1, col: 6 },
        { row: 1, col: 7 },
        { row: 1, col: 8 },
        { row: 2, col: 0 },
        { row: 2, col: 2 },
        { row: 2, col: 3 },
        { row: 2, col: 4 },
        { row: 2, col: 5 },
        { row: 2, col: 6 },
        { row: 2, col: 7 },
        { row: 2, col: 8 },
        { row: 3, col: 0 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
        { row: 3, col: 4 },
        { row: 3, col: 6 },
        { row: 3, col: 7 },
        { row: 3, col: 8 },
      ],
      activePiece: {
        type: 'I',
        coordinates: [
          { row: 11, col: 3 },
          { row: 11, col: 4 },
          { row: 11, col: 5 },
          { row: 11, col: 6 },
        ],
      },
      linesCleared: 4,
      handleAutoMoveDown: vi.fn(),
    };

    render(<Board {...props} />);

    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');

    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'Board-GameInProgress',
    });
  });

  it('should call handleAutoMoveDown after 20 frames', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const props: BoardProps = {
      activePiece: {
        type: 'I',
        coordinates: [
          { row: 4, col: 5 },
          { row: 4, col: 6 },
          { row: 4, col: 7 },
          { row: 4, col: 8 },
        ],
      },
      occupiedCoordinates: [],
      linesCleared: 0,
      handleAutoMoveDown: vi.fn(),
    };

    // Render the board
    render(<Board {...props} />);

    // Wait for 20 frames and then ensure auto-move-down handler was called
    await waitFor(() => expect(rafSpy.mock.calls.length).toBeGreaterThanOrEqual(20));

    expect(props.handleAutoMoveDown).toHaveBeenCalled();
  });
});
