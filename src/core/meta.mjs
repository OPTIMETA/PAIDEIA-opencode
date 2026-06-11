// .course-meta read/write + exam-date math.
// .course-meta is the per-course state file (KEY: value lines), the single
// source of truth read by every harness command and by vision_ocr.py.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

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

/** Serialize + write `.course-meta`. `order` controls key order; extras appended. */
export function writeMeta(dir, meta, order = [
  "COURSE_NAME", "EXAM_DATE", "EXAM_TYPE", "USER_WEAK_ZONES", "OCR_ENGINE", "INTERFACE_LANG",
]) {
  const keys = [...order.filter((k) => k in meta), ...Object.keys(meta).filter((k) => !order.includes(k))];
  const body = keys.map((k) => `${k}: ${meta[k]}`).join("\n") + "\n";
  writeFileSync(join(dir, META_FILE), body, "utf8");
}

/** The course's interface language, normalized to "en" | "ko" (default "en"). */
export function interfaceLang(meta) {
  const v = String(meta.INTERFACE_LANG || "en").split("#", 1)[0].trim().toLowerCase();
  return v === "ko" ? "ko" : "en";
}

/** Days from today until the exam date (YYYY-MM-DD). null if unparseable. */
export function daysUntil(examDate) {
  if (!examDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(examDate).trim());
  if (!m) return null;
  const exam = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(exam.getTime())) return null;
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
