import { render, RenderOptions } from '@testing-library/react';
import { PreloadedState } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { AppStore, RootState, setupStore } from '@/app/store';
import { PropsWithChildren, ReactElement } from 'react';

interface RenderWithReduxOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export default function renderWithRedux(
  ui: ReactElement,
  { preloadedState = undefined, store = setupStore(preloadedState), ...renderOptions }: RenderWithReduxOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
