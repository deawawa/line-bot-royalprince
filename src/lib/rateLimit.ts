/**
 * Simple in-memory sliding-window rate limiter (per LINE user).
 * Good enough for a single serverless instance; swap for Upstash/Redis
 * when horizontal scale requires shared state.
 */
const windows = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return true;
  }
  hits.push(now);
  windows.set(key, hits);
  return false;
}
