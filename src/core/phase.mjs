// Study-phase + top-miss detection, derived from workspace artifacts (not time).
// Ported from the canonical PAIDEIA statusline logic so `paideia status`, the
// session banner, and injected stage context all agree on where the user is.
//
// Phases:
//   setup - course-index/patterns.md absent
//   diag  - patterns exist, but no quiz problems yet, or no graded error yet
//   drill - quiz problems exist AND errors/log.md has >= 1 graded entry
//   mock  - a mock exam has been graded (errors/log.md has a mock/ source)
//   cram  - cheatsheet/final.{md,pdf} present
//   cool  - D-0 (today == exam date) overrides all
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readErrorsLog, latestWeakmap } from "./workspace.mjs";

// Accept both the canonical `pattern:` and a legacy `pattern_missed_initial:`.
const PATTERN_RX = /\b(?:pattern|pattern_missed_initial)\s*:\s*(P\d+)/g;

// Strip HTML comments so the schema example inside the errors/log.md seed
// (which literally contains `- problem_id: <id>`) doesn't read as a real entry.
const stripComments = (t) => t.replace(/<!--[\s\S]*?-->/g, "");

function quizProblemsExist(root) {
  const dir = join(root, "quizzes");
  if (!existsSync(dir)) return false;
  return readdirSync(dir).some((f) => f.endsWith(".md") && !f.endsWith("_answers.md"));
}

function hasErrorEntries(logText) {
  return /^\s*-\s+problem_id\s*:/m.test(logText);
}

function mockWasGraded(logText) {
  if (/^\s*source\s*:\s*(?:answers\/converted\/)?mock[/_]/m.test(logText)) return true;
  if (/^\s*problem_id\s*:\s*['"]?mock[_-]/m.test(logText)) return true;
  return false;
}

/** Detect the current study phase. `days` is daysUntil(EXAM_DATE) or null. */
export function detectPhase(root, days) {
  if (days === 0) return "cool";
  const cheat = join(root, "cheatsheet");
  if (existsSync(join(cheat, "final.pdf")) || existsSync(join(cheat, "final.md"))) return "cram";
  const log = stripComments(readErrorsLog(root));
  if (mockWasGraded(log)) return "mock";
  if (!existsSync(join(root, "course-index", "patterns.md"))) return "setup";
  if (quizProblemsExist(root) && hasErrorEntries(log)) return "drill";
  return "diag";
}

/** The pattern the user misses most: newest weakmap, else top of errors log. */
export function topMiss(root) {
  const wm = latestWeakmap(root);
  if (wm) {
    let text = "";
    try { text = readFileSync(wm, "utf8"); } catch { /* ignore */ }
    const m = PATTERN_RX.exec(text);
    PATTERN_RX.lastIndex = 0;
    if (m) return m[1];
    const m2 = /\bP(\d+)\b/.exec(text);
    if (m2) return `P${m2[1]}`;
  }
  const log = stripComments(readErrorsLog(root));
  if (log) {
    const counts = new Map();
    let m;
    PATTERN_RX.lastIndex = 0;
    while ((m = PATTERN_RX.exec(log))) counts.set(m[1], (counts.get(m[1]) || 0) + 1);
    if (counts.size) {
      return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
  }
  return null;
}
