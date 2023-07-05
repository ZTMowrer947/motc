import React, { useCallback, useEffect } from 'react';
import Canvas from './features/drawing/Canvas';
import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  clearFilledLines,
  fillActiveBlock,
  fillBag,
  hardDropActiveBlock,
  moveDownOrLockActiveBlock,
  rotateActiveBlockIfPossible,
  selectActiveBlockCoordinates,
  selectOccupiedCoordinates,
  translateActiveBlockIfPossible,
} from './features/block/blockSlice';
import { BlockType, drawSquare, getBlockColor } from './features/block/blockAPI';
import useKeyListener from './app/hooks/useKeyListener';
import { shuffle } from './features/rng/randomAPI';

const possibleBlockTypes: BlockType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];

function App() {
  const blockType = useAppSelector((state) => state.block.active?.type);
  const coordinates = useAppSelector(selectActiveBlockCoordinates);
  const nextBlocks = useAppSelector((state) => state.block.nextBlocks);
  const occupiedCoordinates = useAppSelector(selectOccupiedCoordinates);
  const lineClears = useAppSelector((state) => state.block.lineClears);
  const dispatch = useAppDispatch();

  const height = window.innerHeight - 50;
  const width = height / 2 + 400;
  const sideLength = height / 20;

  useEffect(() => {
    if (nextBlocks.length === 0) {
      dispatch(fillBag(shuffle(possibleBlockTypes)));
    } else if (coordinates.length === 0) {
      dispatch(fillActiveBlock());
    } else {
      dispatch(clearFilledLines());
    }
  });

  useKeyListener('ArrowRight', () => {
    dispatch(translateActiveBlockIfPossible({ dCol: 1, dRow: 0 }));
  });

  useKeyListener('ArrowLeft', () => {
    dispatch(translateActiveBlockIfPossible({ dCol: -1, dRow: 0 }));
  });

  useKeyListener('ArrowDown', () => {
    dispatch(translateActiveBlockIfPossible({ dCol: 0, dRow: -1 }));
  });

  useKeyListener('z', () => {
    dispatch(rotateActiveBlockIfPossible({ direction: 'counterclockwise' }));
  });

  useKeyListener('x', () => {
    dispatch(rotateActiveBlockIfPossible({ direction: 'clockwise' }));
  });

  useKeyListener(' ', () => {
    dispatch(hardDropActiveBlock());
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      ctx.fillRect(200, 0, ctx.canvas.height / 2, ctx.canvas.height);

      if (frame % 20 === 19) {
        dispatch(moveDownOrLockActiveBlock());
      }

      coordinates.forEach(([col, row]) => {
        const color = blockType ? getBlockColor(blockType) : 'gray';
        drawSquare(ctx, color, row, col, sideLength);
      });

      ctx.fillStyle = 'gray';
      occupiedCoordinates.forEach(([col, row]) => {
        drawSquare(ctx, 'gray', row, col, sideLength);
      });

      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('Hold', 10, 50);
      ctx.fillText('Next', ctx.canvas.height + 90, 50);
      ctx.fillText(`Lines: ${lineClears}`, 10, 350);
    },
    [blockType, coordinates, dispatch, lineClears, occupiedCoordinates, sideLength]
  );

  return <Canvas height={height} width={width} draw={draw} />;
}

export default App;
