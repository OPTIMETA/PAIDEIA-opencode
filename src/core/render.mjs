// Deterministic PDF rasterization (the harness's non-LLM half of the vision
// pipeline). Shells out to python3 + render_pages.py (pdf2image + Pillow).
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { assetPath } from "./workspace.mjs";
import { describeSpawnFailure } from "./proc.mjs";

// Resolving python costs a process spawn per candidate; `ingest` asks once per
// PDF. The interpreter cannot change mid-run, so probe at most once.
let pythonProbe;

/** Resolve a usable python interpreter (memoized). */
export function pythonBin() {
  if (pythonProbe !== undefined) return pythonProbe;
  pythonProbe = null;
  for (const cand of [process.env.PAIDEIA_PYTHON, "python3", "python"]) {
    if (!cand) continue;
    try {
      const r = spawnSync(cand, ["--version"], { encoding: "utf8", timeout: 10000 });
      if (r.status === 0 || /python/i.test(`${r.stdout}${r.stderr}`)) { pythonProbe = cand; break; }
    } catch { /* try next */ }
  }
  return pythonProbe;
}

/**
 * Render `pdf` to PNG pages in `outDir`. Returns { pages } on success.
 * Throws with a readable message on failure (missing deps, bad PDF, ...).
 */
export function renderPdfPages(pdf, outDir, { dpi = 160, maxPx = 1800, prefix = "p" } = {}) {
  const py = pythonBin();
  if (!py) throw new Error("python3 not found — required for PDF rendering. See `paideia doctor`.");
  const script = assetPath("scripts", "render_pages.py");
  const r = spawnSync(
    py,
    [script, "--dpi", String(dpi), "--max-px", String(maxPx), "--prefix", prefix, pdf, outDir],
    { encoding: "utf8", timeout: 600000 },
  );
  if (r.status !== 0) {
    const msg = describeSpawnFailure(r, "render_pages.py");
    if (/No module named/.test(msg)) {
      throw new Error(`${msg}\n  → install: python3 -m pip install --user pdf2image pillow (and poppler).`);
    }
    throw new Error(msg);
  }
  const pages = parseInt(`${r.stdout}`.trim(), 10);
  return { pages: Number.isFinite(pages) ? pages : null };
}

/** Remove a scratch directory tree (best effort). */
export function cleanup(dir) {
  if (dir && existsSync(dir)) {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}
