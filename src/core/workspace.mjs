// Course-workspace layout: the directory skeleton, artifact discovery, and
// path helpers. The layout mirrors the canonical PAIDEIA course folder so the
// same artifact contracts (converted/, course-index/, errors/log.md, ...) hold.
import {
  existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync,
} from "node:fs";
import { join, dirname, basename, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** Directories created by `init-course` (idempotent). */
export const SKELETON = [
  "materials/lectures", "materials/textbook", "materials/homework", "materials/solutions",
  "converted/lectures", "converted/textbook", "converted/homework", "converted/solutions",
  "course-index", "quizzes", "mock", "twins", "chain", "derivations", "cheatsheet", "weakmap",
  "answers/converted", "errors",
  ".paideia/run", ".paideia/tmp",
];

export const CATEGORIES = ["lectures", "textbook", "homework", "solutions"];

export const ERRORS_LOG_SEED = `# Error log

<!-- Append-only YAML entries. Schema:
- problem_id: <id>
  pattern: <Pk>
  error_type: pattern-missed | wrong-variable | wrong-end-form | algebraic | sign | definition
  summary: "<1 line>"
  source: <origin of the entry>
  date: <ISO8601>
-->
`;

/** Create the full skeleton under `root` and seed errors/log.md if absent. */
export function ensureSkeleton(root) {
  for (const d of SKELETON) mkdirSync(join(root, d), { recursive: true });
  const log = join(root, "errors", "log.md");
  if (!existsSync(log)) writeFileSync(log, ERRORS_LOG_SEED, "utf8");
}

/** Recursively list files under `dir` matching `ext` (e.g. ".pdf"). [] if absent. */
export function listFiles(dir, ext = null) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_pages" || entry.name.startsWith(".tmp-")) continue;
      out.push(...listFiles(full, ext));
    } else if (!ext || extname(entry.name).toLowerCase() === ext) {
      out.push(full);
    }
  }
  return out;
}

/** Materials grouped by category: { lectures: [...], textbook: [...], ... }. */
export function materialsByCategory(root) {
  const map = {};
  for (const cat of CATEGORIES) {
    map[cat] = listFiles(join(root, "materials", cat)).sort();
  }
  return map;
}

/** Converted markdown grouped by category. */
export function convertedByCategory(root) {
  const map = {};
  for (const cat of CATEGORIES) {
    map[cat] = listFiles(join(root, "converted", cat), ".md").sort();
  }
  return map;
}

/** True if any converted/*.md exists. */
export function hasConverted(root) {
  return CATEGORIES.some((c) => listFiles(join(root, "converted", c), ".md").length > 0);
}

/** True if the course index has been built. */
export function hasIndex(root) {
  return existsSync(join(root, "course-index", "patterns.md"));
}

/** Newest weakmap/weakmap_*.md by mtime, or null. */
export function latestWeakmap(root) {
  const dir = join(root, "weakmap");
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => /^weakmap_.*\.md$/.test(f))
    .map((f) => join(dir, f));
  if (!files.length) return null;
  files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return files[0];
}

/** Most recently modified file directly in answers/ (not answers/converted/). */
export function latestAnswer(root) {
  const dir = join(root, "answers");
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(dir, e.name));
  if (!files.length) return null;
  files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return files[0];
}

/** Read errors/log.md (or "" if absent). */
export function readErrorsLog(root) {
  const p = join(root, "errors", "log.md");
  if (!existsSync(p)) return "";
  try { return readFileSync(p, "utf8"); } catch { return ""; }
}

// ── Harness install paths (for bundled assets) ────────────────────────────────

const CORE_DIR = dirname(fileURLToPath(import.meta.url));

/** Root of the installed harness (the package directory). */
export function harnessRoot() {
  return join(CORE_DIR, "..", "..");
}

/** Path to a bundled asset, e.g. assetPath("scripts", "vision_ocr.py"). */
export function assetPath(...parts) {
  return join(harnessRoot(), "assets", ...parts);
}

/** Read a bundled prompt template from assets/prompts/. */
export function readPrompt(name) {
  return readFileSync(assetPath("prompts", name), "utf8");
}

/** A pair of timestamps used across commands. */
export function timestamps(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const hm = `${p(d.getHours())}${p(d.getMinutes())}`;
  const compact = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  return { day: date, dayHm: `${date}_${hm}`, compact };
}

export { relative, basename, dirname, join };
