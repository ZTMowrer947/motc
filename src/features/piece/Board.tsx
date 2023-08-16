import { drawSquare, getPieceColor, PieceType } from '@/features/piece/pieceAPI';
import type { Coordinate } from '@/features/coordinate/types';
import { useCallback } from 'react';
import Canvas from '@/features/drawing/Canvas';

export interface PieceData {
  type: PieceType;
  coordinates: Coordinate[];
}

export interface BoardProps {
  activePiece?: PieceData;
  occupiedCoordinates: Coordinate[];
  linesCleared: number;
  nextPieces: PieceData[];
  // heldPiece?: PieceType;
  handleAutoMoveDown(): void;
}

export default function Board({
  activePiece,
  occupiedCoordinates,
  linesCleared,
  handleAutoMoveDown,
  nextPieces,
}: BoardProps) {
  // Calculate dimensions of canvas
  const height = window.innerHeight - 50;
  const width = height / 2 + 400;
  const sideLength = height / 20;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      // Clear current canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0)';

      ctx.fillRect(200, 0, ctx.canvas.height / 2, ctx.canvas.height);

      // Move active piece down every 20th frame
      if (frame % 20 === 19) {
        handleAutoMoveDown();
      }

      // Draw active piece on canvas if present
      if (activePiece) {
        activePiece.coordinates.forEach(({ row, col }) => {
          const color = getPieceColor(activePiece.type);
          drawSquare(ctx, color, row, col, sideLength);
        });
      }

      // Draw occupied coordinates
      ctx.fillStyle = 'gray';
      occupiedCoordinates.forEach(({ row, col }) => {
        drawSquare(ctx, 'gray', row, col, sideLength);
      });

      // Add text for held piece, next pieces, and line clears
      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText('Hold', 10, 50);
      ctx.fillText('Next', ctx.canvas.height + 60, sideLength);
      ctx.fillText(`Lines: ${linesCleared}`, 10, 350);

      ctx.fillStyle = 'black';
      ctx.fillRect(200 - sideLength * 8, sideLength * 3, sideLength * 6, sideLength * 4);
      ctx.fillRect(
        200 + ctx.canvas.height / 2 + sideLength * 2,
        sideLength * 2,
        sideLength * 6,
        ctx.canvas.height - sideLength * 2
      );

      nextPieces.forEach((piece) => {
        piece.coordinates.forEach(({ row, col }) => {
          drawSquare(ctx, getPieceColor(piece.type), row, col, sideLength);
        });
      });
    },
    [activePiece, handleAutoMoveDown, nextPieces, linesCleared, occupiedCoordinates, sideLength]
  );

  return <Canvas height={height} width={width} draw={draw} />;
}
