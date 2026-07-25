// Course-workspace layout: the directory skeleton, artifact discovery, and
// path helpers. The layout mirrors the canonical PAIDEIA course folder so the
// same artifact contracts (converted/, course-index/, errors/log.md, ...) hold.
import {
  existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync,
  realpathSync, renameSync, rmSync,
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
  if (!existsSync(log)) writeFileAtomic(log, ERRORS_LOG_SEED);
}

// ── Atomic writes ─────────────────────────────────────────────────────────────
// Every file the harness owns is a contract another stage reads back. A crash
// (or a full disk) partway through a plain writeFileSync leaves a *truncated but
// present* file, which downstream code cannot distinguish from a valid one — a
// half-written `.course-meta` loses the course, a half-written converted/*.md
// silently poisons `analyze`. Write to a sibling temp file, then rename: on
// every POSIX filesystem the rename is atomic, so readers see old or new, never
// half. `process.pid` + a counter keep concurrent writers from sharing a temp.

let atomicSeq = 0;

/** A per-process-unique token, for temp names and run artifacts. */
export function uniqueToken() {
  return `${process.pid.toString(36)}${(atomicSeq++).toString(36)}`;
}

/** Write `data` to `path` atomically (temp file + rename). Creates parent dirs. */
export function writeFileAtomic(path, data) {
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const tmp = join(dir, `.${basename(path)}.${uniqueToken()}.tmp`);
  try {
    writeFileSync(tmp, data, "utf8");
    renameSync(tmp, path);
  } catch (e) {
    try { rmSync(tmp, { force: true }); } catch { /* nothing to clean */ }
    throw e;
  }
}

// Scratch/vendor directories never worth descending into.
const SKIP_DIRS = new Set(["_pages", "node_modules"]);

/**
 * Recursively list files under `dir` matching `ext` (e.g. ".pdf"). [] if absent
 * or unreadable. Dot-entries (.DS_Store, .tmp-*, .git) are skipped; symlinked
 * directories ARE followed (people symlink materials/ at a cloud drive), with a
 * realpath guard so a symlink cycle cannot loop forever.
 */
export function listFiles(dir, ext = null, seen = null) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return []; // missing, EACCES, or not a directory — all mean "no files here"
  }
  const visited = seen || new Set();
  // Seed the root, or a link pointing back at it re-enters from inside and
  // every file at this level is reported a second time under the link's path.
  if (!seen) {
    try { visited.add(realpathSync(dir)); } catch { visited.add(dir); }
  }
  const out = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    let isDir = entry.isDirectory();
    if (!isDir && entry.isSymbolicLink()) {
      try { isDir = statSync(full).isDirectory(); } catch { continue; } // broken link
    }
    if (isDir) {
      if (SKIP_DIRS.has(entry.name)) continue;
      let key = full;
      try { key = realpathSync(full); } catch { /* unresolvable — key on the path */ }
      if (visited.has(key)) continue;
      visited.add(key);
      out.push(...listFiles(full, ext, visited));
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

/**
 * Newest of `paths` by mtime, or null. Stats each path exactly once (a
 * statSync inside a sort comparator is both O(n log n) syscalls and a crash
 * when a file is removed mid-sort) and skips whatever vanished. Ties break on
 * name, descending, so the result is deterministic for same-second artifacts.
 */
function newestByMtime(paths) {
  let best = null;
  for (const p of paths) {
    let mtime;
    try { mtime = statSync(p).mtimeMs; } catch { continue; }
    if (!best || mtime > best.mtime || (mtime === best.mtime && p > best.path)) {
      best = { path: p, mtime };
    }
  }
  return best ? best.path : null;
}

/** Newest weakmap/weakmap_*.md by mtime, or null. */
export function latestWeakmap(root) {
  const dir = join(root, "weakmap");
  let names;
  try { names = readdirSync(dir); } catch { return null; }
  return newestByMtime(names.filter((f) => /^weakmap_.*\.md$/.test(f)).map((f) => join(dir, f)));
}

/** Extensions `grade` knows how to consume as an uploaded answer. */
export const ANSWER_EXTS = new Set([".pdf", ".md"]);

/**
 * Most recently modified answer file directly in answers/ (not
 * answers/converted/). Restricted to extensions `grade` can actually handle —
 * otherwise a stray .DS_Store or editor backup becomes the "latest answer" and
 * grade fails on a file the user never uploaded.
 */
export function latestAnswer(root) {
  const dir = join(root, "answers");
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  return newestByMtime(entries
    .filter((e) => e.isFile() && !e.name.startsWith(".")
      && ANSWER_EXTS.has(extname(e.name).toLowerCase()))
    .map((e) => join(dir, e.name)));
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
  const p = assetPath("prompts", name);
  try {
    return readFileSync(p, "utf8");
  } catch (e) {
    // A missing bundled prompt means a broken/partial install, not a user error
    // — say so instead of surfacing a bare ENOENT stack from deep in a stage.
    throw new Error(`bundled prompt missing: ${p} — the paideia install is `
      + `incomplete. Reinstall the package, then run \`paideia doctor\`. (${e.code || e.message})`);
  }
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
