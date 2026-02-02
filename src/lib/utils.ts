/**
 * 並列実行数を制限してPromiseを実行
 */
export const limitedParallel = async <T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> => {
  const results: T[] = [];
  let index = 0;

  const workers = new Array(limit).fill(null).map(async () => {
    while (index < tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  });

  await Promise.all(workers);
  return results;
};

/**
 * エラーを UpdateErrorReason にマッピング
 */
export const mapUpdateError = (error: unknown): "RATE_LIMIT" | "NETWORK_ERROR" | "UNKNOWN" => {
  if (typeof error === "string") {
    if (error.includes("429")) return "RATE_LIMIT";
    if (error.includes("network") || error.includes("Network")) return "NETWORK_ERROR";
  }
  if (error instanceof Error) {
    if (error.message.includes("429")) return "RATE_LIMIT";
    if (error.message.includes("network") || error.message.includes("Network"))
      return "NETWORK_ERROR";
  }
  return "UNKNOWN";
};
