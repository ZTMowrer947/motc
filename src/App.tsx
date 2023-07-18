import React, { useCallback, useEffect } from 'react';
import Canvas from './features/drawing/Canvas';
import { useAppDispatch, useAppSelector } from './app/hooks/redux';
import {
  clearFilledLines,
  fillActivePiece,
  fillBag,
  hardDropActivePiece,
  moveDownOrLockActivePiece,
  rotateActivePieceIfPossible,
  selectActivePieceCoordinates,
  selectOccupiedCoordinates,
  translateActivePieceIfPossible,
} from './features/piece/pieceSlice';
import { PieceType, drawSquare, getPieceColor } from './features/piece/pieceAPI';
import useKeyListener from './app/hooks/useKeyListener';
import { shuffle } from './features/rng/randomAPI';

const possiblePieceTypes: PieceType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];

function App() {
  const pieceType = useAppSelector((state) => state.piece.active?.type);
  const coordinates = useAppSelector(selectActivePieceCoordinates);
  const nextPieces = useAppSelector((state) => state.piece.nextPieces);
  const occupiedCoordinates = useAppSelector(selectOccupiedCoordinates);
  const lineClears = useAppSelector((state) => state.piece.lineClears);
  const dispatch = useAppDispatch();

  const height = window.innerHeight - 50;
  const width = height / 2 + 400;
  const sideLength = height / 20;

  useEffect(() => {
    if (nextPieces.length === 0) {
      dispatch(fillBag(shuffle(possiblePieceTypes)));
    } else if (coordinates.length === 0) {
      dispatch(fillActivePiece());
    } else {
      dispatch(clearFilledLines());
    }
  });

  useKeyListener('ArrowRight', () => {
    dispatch(translateActivePieceIfPossible({ dCol: 1, dRow: 0 }));
  });

  useKeyListener('ArrowLeft', () => {
    dispatch(translateActivePieceIfPossible({ dCol: -1, dRow: 0 }));
  });

  useKeyListener('ArrowDown', () => {
    dispatch(translateActivePieceIfPossible({ dCol: 0, dRow: -1 }));
  });

  useKeyListener('z', () => {
    dispatch(rotateActivePieceIfPossible({ clockwise: false }));
  });

  useKeyListener('x', () => {
    dispatch(rotateActivePieceIfPossible({ clockwise: true }));
  });

  useKeyListener(
    ' ',
    () => {
      dispatch(hardDropActivePiece());
    },
    { noHold: true }
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

      ctx.fillRect(200, 0, ctx.canvas.height / 2, ctx.canvas.height);

      if (frame % 20 === 19) {
        dispatch(moveDownOrLockActivePiece());
      }

      coordinates.forEach(({ row, col }) => {
        const color = pieceType ? getPieceColor(pieceType) : 'gray';
        drawSquare(ctx, color, row, col, sideLength);
      });

      ctx.fillStyle = 'gray';
      occupiedCoordinates.forEach(({ row, col }) => {
        drawSquare(ctx, 'gray', row, col, sideLength);
      });

      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('Hold', 10, 50);
      ctx.fillText('Next', ctx.canvas.height + 90, 50);
      ctx.fillText(`Lines: ${lineClears}`, 10, 350);
    },
    [pieceType, coordinates, dispatch, lineClears, occupiedCoordinates, sideLength]
  );

  return <Canvas height={height} width={width} draw={draw} />;
}

export default App;
