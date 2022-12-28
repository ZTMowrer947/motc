import React, { useEffect } from 'react';
import Canvas from './features/drawing/Canvas';
import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  fillActiveBlock,
  fillBag,
  selectActiveBlockCoordinates,
  selectOccupiedCoordinates,
  translateActiveBlockIfPossible,
} from './features/block/blockSlice';
import { drawSquare } from './features/block/blockAPI';

function App() {
  const coordinates = useAppSelector(selectActiveBlockCoordinates);
  const nextBlocks = useAppSelector((state) => state.block.nextBlocks);
  const occupiedCoordinates = useAppSelector(selectOccupiedCoordinates);
  const dispatch = useAppDispatch();

  const height = window.innerHeight - 50;
  const width = height / 2 + 400;
  const sideLength = height / 20;

  useEffect(() => {
    if (nextBlocks.length === 0) {
      dispatch(fillBag(['I']));
    } else if (coordinates.length === 0) {
      dispatch(fillActiveBlock());
    }
  });

  return (
    <Canvas
      height={height}
      width={width}
      draw={(ctx, frame) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        ctx.fillRect(200, 0, ctx.canvas.height / 2, ctx.canvas.height);

        if (frame % 20 === 19) {
          dispatch(translateActiveBlockIfPossible({ dx: 0, dy: -1 }));
        }

        coordinates.forEach(([x, y]) => {
          drawSquare(ctx, 'blue', x, y, sideLength);
        });

        ctx.fillStyle = 'gray';
        occupiedCoordinates.forEach(([x, y]) => {
          drawSquare(ctx, 'gray', x, y, sideLength);
        });

        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText('Hold', 10, 50);
        ctx.fillText('Next', ctx.canvas.height + 90, 50);
        ctx.fillText('Lines: 0', 10, 350);
      }}
    />
  );
}

export default App;
