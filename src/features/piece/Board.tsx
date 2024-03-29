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
  heldPiece?: PieceData;
  handleAutoMoveDown(): void;
}

export default function Board({
  activePiece,
  occupiedCoordinates,
  linesCleared,
  handleAutoMoveDown,
  heldPiece,
  nextPieces,
}: BoardProps) {
  // Calculate dimensions of canvas
  const height = window.innerHeight - 50;
  const width = height;
  const sideLength = height / 24;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, frame: number) => {
      // Clear current canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0)';

      ctx.fillRect(sideLength * 7, sideLength * 2, sideLength * 10, sideLength * 20);

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
      ctx.fillText(`Lines: ${linesCleared}`, 10, 350);

      // Draw boxes for held piece and next piece
      ctx.fillStyle = 'black';
      ctx.fillRect(0, sideLength * 3, sideLength * 6, sideLength * 4);
      ctx.fillRect(sideLength * 18, sideLength * 2, sideLength * 6, ctx.canvas.height - sideLength * 2);

      // Draw held piece if one is being held
      if (heldPiece) {
        heldPiece.coordinates.forEach(({ row, col }) => {
          drawSquare(ctx, getPieceColor(heldPiece.type), row, col, sideLength);
        });
      }

      // Draw next pieces
      nextPieces.forEach((piece) => {
        piece.coordinates.forEach(({ row, col }) => {
          drawSquare(ctx, getPieceColor(piece.type), row, col, sideLength);
        });
      });
    },
    [activePiece, handleAutoMoveDown, nextPieces, heldPiece, linesCleared, occupiedCoordinates, sideLength]
  );

  return <Canvas height={height} width={width} draw={draw} />;
}
