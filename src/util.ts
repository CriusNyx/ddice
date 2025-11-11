export function memoize<Args extends unknown[], Result>(
  func: (...args: Args) => Result,
  keyFunc: (...args: Args) => string,
): (...args: Args) => Result {
  const memo: Map<string, Result> = new Map();
  return (...args: Args) => {
    const key = keyFunc(...args);
    if (!memo.has(key)) {
      memo.set(key, func(...args));
    }
    return memo.get(key)!;
  };
}

export function safeTransform<T, U>(
  value: T | undefined | null,
  transformer: (value: T) => U,
): U | undefined {
  if (value !== null && value !== undefined) {
    return transformer(value);
  }
}
