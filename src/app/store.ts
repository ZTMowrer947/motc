import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import piece from '../features/piece/pieceSlice';

export const store = configureStore({
  reducer: {
    piece,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
