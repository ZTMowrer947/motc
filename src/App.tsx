import React, { useEffect, useMemo } from 'react';
import Board from '@/features/piece/Board';
import { bindActionCreators } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './app/hooks/redux';
import {
  clearFilledLines,
  hardDropActivePiece,
  moveDownOrLockActivePiece,
  tryRotateActivePiece,
  selectActivePieceCoordinates,
  selectOccupiedCoordinates,
  tryTranslateActivePiece,
  fillActivePieceWithBagRefill,
  selectFilledRows,
  holdAndUpdateActivePiece,
  selectHeldPiece,
} from './features/piece/pieceSlice';
import useKeyListener from './app/hooks/useKeyListener';

function App() {
  const pieceType = useAppSelector((state) => state.piece.active?.type);
  const coordinates = useAppSelector(selectActivePieceCoordinates);
  const occupiedCoordinates = useAppSelector(selectOccupiedCoordinates);
  const filledLines = useAppSelector(selectFilledRows);
  const lineClears = useAppSelector((state) => state.piece.lineClears);
  const heldPiece = useAppSelector(selectHeldPiece);
  const dispatch = useAppDispatch();

  const activePiece = useMemo(
    () =>
      coordinates && pieceType
        ? {
            type: pieceType,
            coordinates,
          }
        : undefined,
    [coordinates, pieceType]
  );

  const handleAutoMoveDown = useMemo(() => bindActionCreators(moveDownOrLockActivePiece, dispatch), [dispatch]);

  useEffect(() => {
    if (coordinates.length === 0) {
      dispatch(fillActivePieceWithBagRefill());
    }
  }, [coordinates.length, dispatch]);

  useEffect(() => {
    if (filledLines.length > 0) {
      dispatch(clearFilledLines());
    }
  }, [filledLines, dispatch]);

  // Piece Movement
  useKeyListener(['ArrowRight', 'ArrowLeft', 'ArrowDown'], (key) => {
    const dRow = key === 'ArrowDown' ? -1 : 0;
    let dCol = key !== 'ArrowDown' ? 1 : 0;
    if (key === 'ArrowLeft') dCol *= -1;

    dispatch(tryTranslateActivePiece({ dCol, dRow }));
  });

  // Piece rotation
  useKeyListener(['z', 'x'], (key) => {
    dispatch(tryRotateActivePiece({ clockwise: key === 'x' }));
  });

  // Hard drop
  useKeyListener(
    ' ',
    () => {
      dispatch(hardDropActivePiece());
    },
    { noHold: true }
  );

  // Piece holding
  useKeyListener(['Shift', 'c'], () => {
    dispatch(holdAndUpdateActivePiece());
  });

  return (
    <Board
      activePiece={activePiece}
      occupiedCoordinates={occupiedCoordinates}
      linesCleared={lineClears}
      handleAutoMoveDown={handleAutoMoveDown}
      heldPiece={heldPiece}
    />
  );
}

export default App;
