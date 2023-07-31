import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import App from '@/App';
import renderWithRedux from '@/testutils/renderWithRedux';
import getCanvasImage from '@/testutils/getCanvasImage';
import parseZeta from '@/testutils/parseZeta';
import { MatchImageSnapshotOptions } from 'jest-image-snapshot';

function pressKey(key: string) {
  fireEvent.keyDown(document, { key });
  fireEvent.keyUp(document, { key });
}

const defaultString = `X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/1AAAA1O3/6O3/2OOO1O3/2OOOOO3 I 0 - 3 OTSLJZZIOTLSJ`;

const imgSnapSharedOptions: MatchImageSnapshotOptions = {
  comparisonMethod: 'ssim',
};

function setup(zetaString = defaultString) {
  // Define initial game state
  const pieceState = parseZeta(zetaString);

  const preloadedState = { piece: pieceState };

  return renderWithRedux(<App />, { preloadedState });
}

describe('App component', () => {
  it('should render without errors', () => {
    renderWithRedux(<App />);

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('should properly handle horizontal movement of an active piece', async () => {
    // Render app with preloaded game state
    setup();

    // Get snapshot of game state
    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-MovementTests-0_Initial',
    });

    pressKey('ArrowLeft');

    // Expect active piece to have moved once to the left
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LRMovementTest-1_Left',
    });

    pressKey('ArrowLeft');

    // Expect piece to have not moved again, due to hitting left side of board
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LRMovementTest-2_LeftAtBoardBounds',
    });

    pressKey('ArrowRight');

    // Expect piece to have moved back to initial position
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LRMovementTest-3_RightToInitialPos',
    });

    pressKey('ArrowRight');

    // Expect piece to have moved one cell to the right
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LRMovementTest-4_RightAgain',
    });

    pressKey('ArrowRight');

    // Expect piece to have not moved again, due to colliding with an occupied cell
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LRMovementTest-5_BlockedByCell',
    });
  });

  it('should properly handle soft dropping a piece', () => {
    setup();

    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');

    pressKey('ArrowDown');

    // Expect piece to have moved one row down from its initial position
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-SoftDrop-1_Down',
    });

    pressKey('ArrowDown');

    // Expect piece to have not moved down again, due to colliding with occupied cells
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-SoftDrop-2_BlockedByCell',
    });
  });

  it('should properly handle automatically moving and locking an active piece', async () => {
    // Setup spy of RAF function
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    // Render app
    setup();
    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');

    // Wait for 20 frames for update
    await waitFor(() => expect(rafSpy.mock.calls.length).toBeGreaterThanOrEqual(20));

    // Expect piece to have moved one row down from its initial position
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-AutoDrop-1_Down',
    });

    // Wait another 20 frames for update
    await waitFor(() => expect(rafSpy.mock.calls.length).toBeGreaterThanOrEqual(40));

    // Expect piece to have not moved further, and to have been locked in its final position
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-AutoDrop-2_Lock',
    });
  });

  it('should properly handle a hard drop', () => {
    // Render app
    setup('X/X/X/AAAA6/X/X/X/X/X/X/X/X/X/X/X/X/X/OOOOOO4/2OOOOO3/2OOOOO3/OOOOOOO3 I 0 - 3 OTSLJZZIOTLSJ');
    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');

    // Get initial snapshot
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-HardDrop-0_Initial',
    });

    pressKey(' ');

    // Expect I-piece to have moved as far down as it can, and lock
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-HardDrop-1_DropAndLock',
    });
  });

  it('should properly handle clearing a line', async () => {
    // Setup spy of RAF function
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    // Render app
    setup('X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/9A/9A/O2OOOO2A/OOOOOOOOOA I 0 - 3 OTSLJZZIOTLSJ');
    const canvas = screen.getByTestId<HTMLCanvasElement>('canvas');

    // Get initial snapshot
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LineClear-0_Initial',
    });

    // Wait for next board update
    await waitFor(() => expect(rafSpy.mock.calls.length).toBeGreaterThanOrEqual(20));

    // Expect line clear counter to update and for rows to update correctly
    expect(getCanvasImage(canvas)).toMatchImageSnapshot({
      ...imgSnapSharedOptions,
      customSnapshotIdentifier: 'App-LineClear-1_Single',
    });
  });
});
