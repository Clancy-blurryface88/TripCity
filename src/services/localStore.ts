/** Tiny localStorage wrapper. Silently no-ops where storage is blocked (sandboxed iframes, private mode). */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(`tripcity:${key}`);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
export function loadRaw<T>(key: string): T | undefined {
  try {
    const raw = globalThis.localStorage?.getItem(`tripcity:${key}`);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
export function save(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(`tripcity:${key}`, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}
