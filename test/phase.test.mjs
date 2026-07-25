import { test } from "node:test";
import assert from "node:assert/strict";
import { detectPhase, topMiss } from "../src/core/phase.mjs";
import { ERRORS_LOG_SEED } from "../src/core/workspace.mjs";
import { tempCourse, put, setMtime } from "./helpers.mjs";

const entry = (id, pattern, source = "answers/converted/x.md") =>
  `- problem_id: ${id}\n  pattern: ${pattern}\n  error_type: sign\n  summary: "s"\n  source: ${source}\n  date: 2026-06-01\n`;

test("phase is setup until patterns.md exists", () => {
  const root = tempCourse();
  assert.equal(detectPhase(root, 30), "setup");
  put(root, "course-index/patterns.md", "# patterns");
  assert.equal(detectPhase(root, 30), "diag");
});

test("the errors/log.md seed comment is not mistaken for a graded entry", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  put(root, "quizzes/q1.md", "# quiz");
  put(root, "errors/log.md", ERRORS_LOG_SEED); // schema example lives in a comment
  assert.equal(detectPhase(root, 30), "diag");
});

test("phase reaches drill with quiz problems and a real graded entry", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  put(root, "quizzes/q1.md", "# quiz");
  put(root, "errors/log.md", ERRORS_LOG_SEED + entry("q1-P1", "P3"));
  assert.equal(detectPhase(root, 30), "drill");
});

test("an _answers.md file alone does not count as a quiz problem", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  put(root, "quizzes/q1_answers.md", "# answers");
  put(root, "errors/log.md", entry("q1-P1", "P3"));
  assert.equal(detectPhase(root, 30), "diag");
});

test("a mock-sourced entry advances the phase to mock", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  put(root, "errors/log.md", entry("m1", "P2", "mock/2026-06-01_0900.md"));
  assert.equal(detectPhase(root, 10), "mock");
});

test("cheatsheet means cram, and exam day overrides everything", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  put(root, "cheatsheet/final.md", "# sheet");
  assert.equal(detectPhase(root, 2), "cram");
  assert.equal(detectPhase(root, 0), "cool");
});

test("topMiss prefers the newest weakmap, then the errors log", () => {
  const root = tempCourse();
  assert.equal(topMiss(root), null);

  put(root, "errors/log.md", entry("a", "P4") + entry("b", "P7") + entry("c", "P7"));
  assert.equal(topMiss(root), "P7"); // most frequent

  const older = put(root, "weakmap/weakmap_2026-06-01_0900.md", "pattern: P1");
  const newer = put(root, "weakmap/weakmap_2026-06-02_0900.md", "pattern: P9");
  setMtime(older, 1_000_000);
  setMtime(newer, 2_000_000);
  assert.equal(topMiss(root), "P9"); // weakmap wins over the log
});

test("topMiss is stable across repeated calls (no shared regex state)", () => {
  const root = tempCourse();
  put(root, "errors/log.md", entry("a", "P4") + entry("b", "P4") + entry("c", "P5"));
  const first = topMiss(root);
  assert.equal(first, "P4");
  for (let i = 0; i < 5; i++) assert.equal(topMiss(root), first);
});

test("topMiss falls back to a bare Pk mention in the weakmap", () => {
  const root = tempCourse();
  put(root, "weakmap/weakmap_2026-06-01_0900.md", "Top weakness is P12 by a mile.");
  assert.equal(topMiss(root), "P12");
});
