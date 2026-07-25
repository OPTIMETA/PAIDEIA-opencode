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
// Built fresh per use: a shared /g regex carries `lastIndex` across calls, so
// one forgotten reset silently makes the next scan start mid-text.
const patternRx = () => /\b(?:pattern|pattern_missed_initial)\s*:\s*(P\d+)/g;

// Strip HTML comments so the schema example inside the errors/log.md seed
// (which literally contains `- problem_id: <id>`) doesn't read as a real entry.
const stripComments = (t) => t.replace(/<!--[\s\S]*?-->/g, "");

function quizProblemsExist(root) {
  const dir = join(root, "quizzes");
  let names;
  try { names = readdirSync(dir); } catch { return false; }
  return names.some((f) => f.endsWith(".md") && !f.endsWith("_answers.md"));
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
    try { text = readFileSync(wm, "utf8"); } catch { /* unreadable — fall through to the log */ }
    const m = patternRx().exec(text);
    if (m) return m[1];
    const m2 = /\bP(\d+)\b/.exec(text);
    if (m2) return `P${m2[1]}`;
  }
  const log = stripComments(readErrorsLog(root));
  if (log) {
    const counts = new Map();
    const rx = patternRx();
    let m;
    while ((m = rx.exec(log))) counts.set(m[1], (counts.get(m[1]) || 0) + 1);
    if (counts.size) {
      // Ties break on the pattern ID so the status line is stable run to run.
      return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    }
  }
  return null;
}
