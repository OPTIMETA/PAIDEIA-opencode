// Shared test scaffolding: disposable course workspaces on the real
// filesystem. Every harness contract is a file contract, so the tests exercise
// real files rather than a mocked fs.
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BIN = join(REPO_ROOT, "bin", "paideia.mjs");

const made = [];

/** A fresh empty temp directory, removed when the test process exits. */
export function tempDir(prefix = "paideia-test-") {
  const d = mkdtempSync(join(tmpdir(), prefix));
  made.push(d);
  return d;
}

/** A temp directory that is a course workspace (.course-meta written). */
export function tempCourse(meta = {}) {
  const root = tempDir();
  const merged = {
    COURSE_NAME: "Test Course",
    EXAM_DATE: "2030-01-01",
    EXAM_TYPE: "final",
    USER_WEAK_ZONES: "unknown",
    OCR_ENGINE: "vision",
    INTERFACE_LANG: "en",
    ...meta,
  };
  writeFileSync(join(root, ".course-meta"),
    Object.entries(merged).map(([k, v]) => `${k}: ${v}`).join("\n") + "\n", "utf8");
  return root;
}

/** Write `body` to `<root>/<rel>`, creating parent directories. */
export function put(root, rel, body = "x") {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body, "utf8");
  return p;
}

/** Force a file's mtime, for deterministic newest-wins assertions. */
export function setMtime(path, epochSeconds) {
  utimesSync(path, epochSeconds, epochSeconds);
}

process.on("exit", () => {
  for (const d of made) {
    try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ }
  }
});
