import { lazy, type ComponentType, type LazyExoticComponent } from "react";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Retry dynamic imports after deploy — avoids one failed chunk → error boundary → reload loop.
 */
export function lazyWithRetry<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>,
  retries = 3,
  baseDelayMs = 600,
): LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await factory();
      } catch (err) {
        lastError = err;
        if (attempt < retries - 1) {
          await wait(baseDelayMs * (attempt + 1));
        }
      }
    }
    throw lastError;
  });
}
