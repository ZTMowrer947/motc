/* eslint react/jsx-props-no-spreading: ["error", { "exceptions": ["Board" ] }] */

import { expect, describe, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import Board, { BoardProps } from '@/features/piece/Board';

import 'canvas';

describe('Board component', () => {
  it('should render without errors', () => {
    const props: BoardProps = {
      occupiedCoordinates: [],
      linesCleared: 0,
      handleAutoMoveDown: vi.fn(),
    };

    render(<Board {...props} />);
  });

  it('should call handleAutoMoveDown after 20 frames', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const props: BoardProps = {
      activePiece: {
        type: 'I',
        coordinates: [
          { row: 0, col: 5 },
          { row: 0, col: 6 },
          { row: 0, col: 7 },
          { row: 0, col: 8 },
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
