import { vi } from "vitest";

/**
 * Default timeout for async operations in tests (in milliseconds)
 */
export const DEFAULT_TIMEOUT = 5000;

/**
 * Extended timeout for network operations (in milliseconds)
 */
export const NETWORK_TIMEOUT = 10000;

/**
 * Wrapper around vi.waitUntil with default timeout
 * @param callback - The condition to wait for
 * @param timeout - Optional timeout override (defaults to DEFAULT_TIMEOUT)
 */
export function waitUntil<T>(
  callback: () => T | Promise<T>,
  timeout: number = DEFAULT_TIMEOUT,
) {
  return vi.waitUntil(callback, { timeout });
}

/**
 * Wrapper around vi.waitUntil with network timeout (for remote PDF loading)
 * @param callback - The condition to wait for
 */
export function waitUntilNetwork<T>(callback: () => T | Promise<T>) {
  return vi.waitUntil(callback, { timeout: NETWORK_TIMEOUT });
}
