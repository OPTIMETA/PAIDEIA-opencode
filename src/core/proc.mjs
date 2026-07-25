// Child-process helpers shared by every place the harness shells out.
//
// The harness is a thin deterministic shell around long-running children
// (opencode, a local VLM, poppler, pandoc). Two things have to be uniform
// across all of them, or a failure in one reads differently from the same
// failure in another: how long we are willing to wait, and how a failure is
// described.

/** Default ceiling for a child that legitimately runs for minutes. */
export const DEFAULT_LONG_RUN_SECONDS = 1800;

/**
 * Timeout in ms for a long-running child, from `PAIDEIA_TIMEOUT` (seconds).
 * Garbage and non-positive values fall back to the default; anything under a
 * minute is raised to one, since a shorter cap cannot succeed anyway.
 */
export function longRunTimeoutMs(defaultSeconds = DEFAULT_LONG_RUN_SECONDS) {
  const requested = Number(process.env.PAIDEIA_TIMEOUT);
  const seconds = Number.isFinite(requested) && requested > 0 ? requested : defaultSeconds;
  return Math.max(60, seconds) * 1000;
}

/**
 * Turn a spawnSync result into one readable line. spawnSync reports a failure
 * to *start* (ENOENT) and a timeout kill via `error`/`signal` with a null
 * status — so the naive `exit ${r.status}` renders the two most common
 * failures as the useless "exit null".
 */
export function describeSpawnFailure(r, what) {
  if (r.error) {
    if (r.error.code === "ETIMEDOUT" || r.signal === "SIGTERM") return `${what} timed out`;
    return `${what} could not start: ${r.error.message}`;
  }
  if (r.signal) return `${what} was killed by ${r.signal}`;
  const stderr = `${r.stderr || ""}`.trim();
  return stderr || `${what} failed (exit ${r.status})`;
}
