import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, symlinkSync, mkdirSync, chmodSync } from "node:fs";
import { join, basename } from "node:path";
import {
  listFiles, writeFileAtomic, uniqueToken, latestAnswer, latestWeakmap,
  ensureSkeleton, SKELETON, hasConverted, hasIndex, readErrorsLog, readPrompt, materialsByCategory,
} from "../src/core/workspace.mjs";
import { tempDir, tempCourse, put, setMtime } from "./helpers.mjs";

test("listFiles recurses and filters by extension", () => {
  const d = tempDir();
  put(d, "a.pdf"); put(d, "b.md"); put(d, "sub/c.pdf");
  assert.deepEqual(listFiles(d, ".pdf").map((f) => basename(f)).sort(), ["a.pdf", "c.pdf"]);
  assert.equal(listFiles(d).length, 3);
});

test("listFiles ignores dot-entries and scratch directories", () => {
  const d = tempDir();
  put(d, "keep.md");
  put(d, ".DS_Store");
  put(d, "_pages/p01.png");
  put(d, ".tmp-x/page-01.png");
  assert.deepEqual(listFiles(d).map((f) => basename(f)), ["keep.md"]);
});

test("listFiles returns [] for a missing or unreadable directory", () => {
  assert.deepEqual(listFiles(join(tempDir(), "nope")), []);
  const d = tempDir();
  const locked = join(d, "locked");
  mkdirSync(locked);
  put(d, "locked/hidden.md");
  chmodSync(locked, 0o000);
  try {
    // Unreadable is "no files here", never a thrown EACCES that kills the run.
    assert.doesNotThrow(() => listFiles(d, ".md"));
  } finally {
    chmodSync(locked, 0o755);
  }
});

test("listFiles follows symlinked directories and survives a cycle", (t) => {
  const d = tempDir();
  const real = tempDir();
  put(real, "lecture.pdf");
  try {
    symlinkSync(real, join(d, "linked"));
  } catch {
    return t.skip("symlinks unavailable on this platform");
  }
  assert.deepEqual(listFiles(d, ".pdf").map((f) => basename(f)), ["lecture.pdf"]);

  // A directory linking to its own ancestor must terminate, not recurse away.
  symlinkSync(d, join(real, "loop"));
  assert.doesNotThrow(() => listFiles(d, ".pdf"));
});

test("writeFileAtomic replaces content and leaves no temp file behind", () => {
  const d = tempDir();
  const p = join(d, "nested", "out.md");
  writeFileAtomic(p, "first");
  writeFileAtomic(p, "second");
  assert.equal(readFileSync(p, "utf8"), "second");
  assert.deepEqual(readdirSync(join(d, "nested")), ["out.md"]);
});

test("uniqueToken does not repeat within a process", () => {
  const seen = new Set(Array.from({ length: 100 }, () => uniqueToken()));
  assert.equal(seen.size, 100);
});

test("latestAnswer picks the newest .pdf/.md and ignores everything else", () => {
  const root = tempCourse();
  const old = put(root, "answers/hw01.pdf");
  const fresh = put(root, "answers/hw02.pdf");
  const junk = put(root, "answers/.DS_Store");
  const note = put(root, "answers/notes.txt");
  setMtime(old, 1_000_000);
  setMtime(fresh, 2_000_000);
  setMtime(junk, 3_000_000);   // newest on disk, but not an answer
  setMtime(note, 3_000_000);
  assert.equal(latestAnswer(root), fresh);
});

test("latestAnswer skips answers/converted and returns null when empty", () => {
  const root = tempCourse();
  put(root, "answers/converted/hw01.md");
  assert.equal(latestAnswer(root), null);
});

test("latestWeakmap picks the newest report and breaks ties deterministically", () => {
  const root = tempCourse();
  const a = put(root, "weakmap/weakmap_2026-06-01_0900.md");
  const b = put(root, "weakmap/weakmap_2026-06-02_1200.md");
  put(root, "weakmap/README.md"); // not a weakmap_*.md report
  setMtime(a, 5_000_000);
  setMtime(b, 5_000_000); // same mtime → higher name wins
  assert.equal(latestWeakmap(root), b);
  setMtime(a, 6_000_000);
  assert.equal(latestWeakmap(root), a);
  assert.equal(latestWeakmap(tempDir()), null);
});

test("ensureSkeleton is idempotent and seeds errors/log.md", () => {
  const root = tempDir();
  ensureSkeleton(root);
  ensureSkeleton(root);
  for (const d of SKELETON) assert.ok(existsSync(join(root, d)), `${d} missing`);
  const log = join(root, "errors", "log.md");
  assert.match(readFileSync(log, "utf8"), /# Error log/);

  writeFileAtomic(log, "user entries");
  ensureSkeleton(root);
  assert.equal(readFileSync(log, "utf8"), "user entries"); // never re-seeded over
});

test("hasConverted / hasIndex / readErrorsLog reflect the workspace", () => {
  const root = tempCourse();
  assert.equal(hasConverted(root), false);
  assert.equal(hasIndex(root), false);
  assert.equal(readErrorsLog(root), "");
  put(root, "converted/lectures/L1.md", "# L1");
  put(root, "course-index/patterns.md", "# P");
  put(root, "errors/log.md", "- problem_id: x");
  assert.equal(hasConverted(root), true);
  assert.equal(hasIndex(root), true);
  assert.match(readErrorsLog(root), /problem_id/);
});

test("materialsByCategory groups the four known categories", () => {
  const root = tempCourse();
  put(root, "materials/homework/HW01.pdf");
  put(root, "materials/lectures/L1.pdf");
  const by = materialsByCategory(root);
  assert.deepEqual(Object.keys(by).sort(), ["homework", "lectures", "solutions", "textbook"]);
  assert.equal(by.homework.length, 1);
  assert.equal(by.solutions.length, 0);
});

test("readPrompt explains a broken install instead of leaking ENOENT", () => {
  assert.ok(readPrompt("_system.md").length > 0);
  assert.throws(() => readPrompt("does-not-exist.md"), /install is incomplete/);
});
