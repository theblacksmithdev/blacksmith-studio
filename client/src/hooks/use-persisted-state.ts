import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

/**
 * Simple `localStorage`-backed state.
 *
 * - `key = null` → behaves like `useState`, persists nothing.
 * - `defaultValue` is read on first mount and whenever `key` changes.
 * - Empty-ish values (`""`, `null`, `undefined`) delete the entry so
 *   storage doesn't accumulate dead keys.
 *
 * Setter only accepts a direct value. For functional-updater / lazy-init
 * ergonomics matching React's `useState`, use `useStoredState`.
 */
export function usePersistedState<T>(
  key: string | null,
  defaultValue: T,
): [T, (next: T) => void] {
  const [value, setValueState] = useState<T>(() =>
    readStored(key, defaultValue),
  );

  const lastKeyRef = useRef(key);
  useEffect(() => {
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    setValueState(readStored(key, defaultValue));
  }, [key, defaultValue]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      writeStored(key, next);
    },
    [key],
  );

  return [value, setValue];
}

/**
 * `useState` drop-in that persists to `localStorage`. Identical
 * signature and semantics to React's `useState` — supports lazy
 * initial values and functional updaters.
 *
 *   const [count, setCount] = useStoredState("counter", 0);
 *   setCount((n) => n + 1);
 *
 * Same storage behavior as `usePersistedState`: `key = null` disables
 * persistence, and empty-ish values remove the entry.
 */
export function useStoredState<T>(
  key: string | null,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const initialRef = useRef(initial);
  initialRef.current = initial;

  const [value, setValueState] = useState<T>(() => {
    const stored = readStored<T | undefined>(key, undefined);
    if (stored !== undefined) return stored;
    return resolveInitial(initial);
  });

  const lastKeyRef = useRef(key);
  useEffect(() => {
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    const stored = readStored<T | undefined>(key, undefined);
    setValueState(
      stored !== undefined ? stored : resolveInitial(initialRef.current),
    );
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      setValueState((prev) => {
        const next =
          typeof action === "function"
            ? (action as (p: T) => T)(prev)
            : action;
        writeStored(key, next);
        return next;
      });
    },
    [key],
  );

  return [value, setValue];
}

/* ── Internals ── */

function readStored<T>(key: string | null, fallback: T): T {
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStored(key: string | null, value: unknown): void {
  if (!key) return;
  try {
    if (isEmpty(value)) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked — in-memory value still updates */
  }
}

function resolveInitial<T>(initial: T | (() => T)): T {
  return typeof initial === "function" ? (initial as () => T)() : initial;
}

function isEmpty(v: unknown): boolean {
  return v === "" || v === undefined || v === null;
}
