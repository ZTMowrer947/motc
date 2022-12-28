import { useCallback, useEffect, useRef } from 'react';

interface KeyListenerOptions {
  noHold: boolean;
}

export default function useKeyListener(
  key: string,
  handler: (event: KeyboardEvent) => void,
  options: KeyListenerOptions = { noHold: false }
): void {
  const keyHeldRef = useRef(false);

  const listener = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key && (!options.noHold || !keyHeldRef.current)) {
        handler(event);
        if (options.noHold) {
          keyHeldRef.current = true;
        }
      }
    },
    [handler, key, options.noHold]
  );

  const keyUpListener = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key && options.noHold) {
        keyHeldRef.current = false;
      }
    },
    [options.noHold, key]
  );

  useEffect(() => {
    document.addEventListener('keydown', listener);
    document.addEventListener('keyup', keyUpListener);

    return () => {
      document.removeEventListener('keydown', listener);
      document.removeEventListener('keyup', listener);
    };
  }, [listener, keyUpListener]);
}
