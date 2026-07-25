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

/**
 * A course with every prerequisite satisfied, so any stage can be composed:
 * an index, converted material, an answer, a weakmap and a radar export.
 */
export function fullCourse(meta = {}) {
  const root = tempCourse(meta);
  put(root, "course-index/patterns.md", "# patterns\n\n## P1 — residue at a simple pole\n");
  put(root, "course-index/coverage.md", "# coverage\n");
  put(root, "converted/lectures/L1.md", "# Lecture 1\n");
  put(root, "converted/solutions/HW1_sol.md", "# HW1 solutions\n");
  put(root, "answers/hw01.md", "# my answer\n");
  put(root, "weakmap/weakmap_2030-01-01_0900.md", "## One-line verdict\n\npattern: P1 keeps biting.\n");
  put(root, "materials/radar.md", "<!-- exam-radar:v1 -->\nOrthogonality 88\n");
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
