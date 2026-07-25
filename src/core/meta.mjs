// .course-meta read/write + exam-date math.
// .course-meta is the per-course state file (KEY: value lines), the single
// source of truth read by every harness command and by vision_ocr.py.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { writeFileAtomic } from "./workspace.mjs";

export const META_FILE = ".course-meta";

const KEY_RX = /^\s*([A-Z_][A-Z0-9_]*)\s*:\s*(.+?)\s*$/;

/** Parse a `.course-meta` file in `dir` into a plain object. Missing file -> {}. */
export function readMeta(dir = process.cwd()) {
  const p = join(dir, META_FILE);
  const meta = {};
  if (!existsSync(p)) return meta;
  let text;
  try {
    text = readFileSync(p, "utf8");
  } catch {
    return meta;
  }
  for (const line of text.split(/\r?\n/)) {
    const m = KEY_RX.exec(line);
    if (m) {
      // Strip trailing `# comment` so `INTERFACE_LANG: ko # note` still parses.
      meta[m[1]] = m[2].split("#", 1)[0].trim();
    }
  }
  return meta;
}

/**
 * Serialize + write `.course-meta` atomically. `order` controls key order;
 * extras are appended. Values are flattened to a single line — a stray newline
 * would split one key into an unparseable second line and silently drop it, so
 * the file no longer round-trips through readMeta. Keys with no value are
 * omitted rather than written as the string "undefined".
 */
export function writeMeta(dir, meta, order = [
  "COURSE_NAME", "EXAM_DATE", "EXAM_TYPE", "USER_WEAK_ZONES", "OCR_ENGINE", "INTERFACE_LANG",
]) {
  const has = (k) => meta[k] !== undefined && meta[k] !== null;
  const keys = [
    ...order.filter((k) => k in meta && has(k)),
    ...Object.keys(meta).filter((k) => !order.includes(k) && has(k)),
  ];
  const body = keys.map((k) => `${k}: ${String(meta[k]).replace(/[\r\n]+/g, " ").trim()}`).join("\n") + "\n";
  writeFileAtomic(join(dir, META_FILE), body);
}

/** The course's interface language, normalized to "en" | "ko" (default "en"). */
export function interfaceLang(meta) {
  const v = String(meta.INTERFACE_LANG || "en").split("#", 1)[0].trim().toLowerCase();
  return v === "ko" ? "ko" : "en";
}

/** True iff `s` is a real calendar date in YYYY-MM-DD (2026-02-30 is not). */
export function isValidExamDate(s) {
  return parseExamDate(s) !== null;
}

/**
 * Parse YYYY-MM-DD into a local-midnight Date, or null. The round-trip check
 * matters: `new Date(2026, 12, 45)` does not produce NaN, it silently rolls
 * over into 2027 — so a typo'd EXAM_DATE would yield a confident, wrong D-N.
 */
function parseExamDate(examDate) {
  if (!examDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(examDate).trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const exam = new Date(y, mo - 1, d);
  if (exam.getFullYear() !== y || exam.getMonth() !== mo - 1 || exam.getDate() !== d) return null;
  return exam;
}

/** Days from today until the exam date (YYYY-MM-DD). null if unparseable. */
export function daysUntil(examDate) {
  const exam = parseExamDate(examDate);
  if (!exam) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam.getTime() - today.getTime()) / 86400000);
}

/** "D-5" / "D-0" / "D+3" / "" (when days is null). */
export function formatDN(days) {
  if (days == null) return "";
  if (days === 0) return "D-0";
  return days > 0 ? `D-${days}` : `D+${-days}`;
}

/**
 * Walk up from `start` until a directory containing `.course-meta` is found.
 * Returns that directory, or null if none up to the filesystem root.
 */
export function findCourseRoot(start = process.cwd()) {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, META_FILE))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
