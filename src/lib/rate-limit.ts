// Simple in-memory rate limiter for server runtime. Suitable for dev/single-instance.
// For production with multiple instances, use Redis or another shared store.

type Entry = { count: number; resetAt: number };
const bucket = new Map<string, Entry>();

export function rateLimit({ key, limit, windowMs }: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry || now > entry.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { ok: true, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}
