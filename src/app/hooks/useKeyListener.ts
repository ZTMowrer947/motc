import { useCallback, useEffect, useMemo, useRef } from 'react';

export interface KeyListenerOptions {
  noHold: boolean;
}

export default function useKeyListener(
  keySet: string | string[],
  handler: (key: string) => void,
  options: KeyListenerOptions = { noHold: false }
): void {
  const normalizedKeySet = useMemo(() => (typeof keySet === 'string' ? [keySet] : keySet), [keySet]);
  const keyHeldObj = normalizedKeySet.reduce<Record<string, boolean>>((obj, key) => ({ ...obj, [key]: false }), {});

  const keyHeldRef = useRef(keyHeldObj);

  const listener = useCallback(
    (event: KeyboardEvent) => {
      if (normalizedKeySet.includes(event.key) && (!options.noHold || !keyHeldRef.current[event.key])) {
        handler(event.key);
        if (options.noHold) {
          keyHeldRef.current[event.key] = true;
        }
      }
    },
    [handler, normalizedKeySet, options.noHold]
  );

  const keyUpListener = useCallback(
    (event: KeyboardEvent) => {
      if (normalizedKeySet.includes(event.key) && options.noHold) {
        keyHeldRef.current[event.key] = false;
      }
    },
    [options.noHold, normalizedKeySet]
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
