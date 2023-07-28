/* eslint react/jsx-props-no-spreading: ["error", { "exceptions": ["TestComponent"] }] */

import { describe, it, expect, vi } from 'vitest';
import useKeyListener, { KeyListenerOptions } from '@/app/hooks/useKeyListener';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Test component
interface TestComponentProps {
  keySet: string | string[];
  onKeyPress(key: string): void;
  listenerOpts?: KeyListenerOptions;
}

function TestComponent({ keySet, onKeyPress, listenerOpts }: TestComponentProps) {
  useKeyListener(keySet, onKeyPress, listenerOpts);

  return null;
}

// Setup function
function setup(keySet: string | string[], options?: KeyListenerOptions) {
  const mockFn = vi.fn();
  return {
    user: userEvent.setup(),
    mockFn,
    renderResult: render(<TestComponent keySet={keySet} onKeyPress={mockFn} listenerOpts={options} />),
  };
}

describe('useKeyListener hook', () => {
  it('should call handler when single key target is pressed', async () => {
    const key = 'w';
    const { user, mockFn } = setup(key);

    // Press the key and expect the handler to have been called with it
    await user.keyboard(key);

    expect(mockFn).toHaveBeenCalledWith(key);
  });

  it('should call handler for each key in target array having been pressed', async () => {
    const keys = ['b', 'g', 'h', 'i', 'o', 's', 't'];
    const { user, mockFn } = setup(keys);

    // Press series of target keys on the keyboard
    const pressString = 'bigshot'.repeat(3);
    await user.keyboard(pressString);

    // Ensure listener was called with each key in the correct order
    pressString.split('').forEach((key, index) => {
      expect(mockFn).toHaveBeenNthCalledWith(index + 1, key);
    });
  });

  it('should not call handler for a key it is not listening for', async () => {
    const targetKey = 'w';
    const { user, mockFn } = setup(targetKey);

    const keyToPress = 'l';
    await user.keyboard(keyToPress);

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should properly handle a mix of target and non-target keypresses', async () => {
    const targetKeys = ['b', 'g', 'h', 'i', 'o', 's', 't'];
    const { user, mockFn } = setup(targetKeys);

    // Type out a legendary string in uncharacteristic lowercase
    const pressString = "now's your chance to be a big shot!";
    await user.keyboard(pressString);

    // Ensure the handler triggers for only the target keys and in the correct order
    const expectedKeyTriggers = ['o', 's', 'o', 'h', 't', 'o', 'b', 'b', 'i', 'g', 's', 'h', 'o', 't'];
    expectedKeyTriggers.forEach((key, index) => {
      expect(mockFn).toHaveBeenNthCalledWith(index + 1, key);
    });
  });

  it('should properly handle the noHold option', () => {
    const targetKey = 'w';
    const { mockFn } = setup(targetKey, { noHold: true });

    // Simulate the target key being held for a long time
    Array.from({ length: 20 }).forEach(() => {
      fireEvent.keyDown(document, {
        repeated: true,
        key: targetKey,
      });
    });

    // Expect the handler to only be invoked once
    expect(mockFn).toHaveBeenCalledOnce();

    fireEvent.keyUp(document, {
      key: targetKey,
    });

    // Expect another keydown after keyup to invoke handler a second time
    fireEvent.keyDown(document, {
      key: targetKey,
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
