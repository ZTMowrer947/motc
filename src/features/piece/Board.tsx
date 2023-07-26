import { drawSquare, getPieceColor, PieceType } from '@/features/piece/pieceAPI';
import type { Coordinate } from '@/features/coordinate/types';
import { useCallback } from 'react';
import Canvas from '@/features/drawing/Canvas';

interface ActivePiece {
  type: PieceType;
  coordinates: Coordinate[];
}

interface BoardProps {
  activePiece?: ActivePiece;
  occupiedCoordinates: Coordinate[];
  linesCleared: number;
  // nextPieces: PieceType[];
  // canHoldActivePiece: boolean;
  // heldPiece?: PieceType;
  handleAutoMoveDown(): void;
}

export default function Board({ activePiece, occupiedCoordinates, linesCleared, handleAutoMoveDown }: BoardProps) {
  // Calculate dimensions of canvas
  const height = window.innerHeight - 50;
  const width = height / 2 + 400;
  const sideLength = height / 20;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      // Clear current canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

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
      ctx.fillText('Next', ctx.canvas.height + 90, 50);
      ctx.fillText(`Lines: ${linesCleared}`, 10, 350);
    },
    [activePiece, handleAutoMoveDown, linesCleared, occupiedCoordinates, sideLength]
  );

  return <Canvas height={height} width={width} draw={draw} />;
}
