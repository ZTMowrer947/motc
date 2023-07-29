import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import App from '@/App';
import renderWithRedux from '@/testutils/renderWithRedux';

describe('App component', () => {
  it('should render without errors', () => {
    renderWithRedux(<App />);

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });
});
