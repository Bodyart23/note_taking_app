"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value`. Clears propagate on the next microtask so
 * filters reset without waiting for the full delay.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (value === "") {
      queueMicrotask(() => setDebouncedValue(value));
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
