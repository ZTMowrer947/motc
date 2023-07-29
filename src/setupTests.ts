import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend(matchers);
expect.extend({ toMatchImageSnapshot });

afterEach(() => {
  cleanup();
});
