import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import blockReducer from '../features/block/blockSlice';

export const store = configureStore({
  reducer: {
    block: blockReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
