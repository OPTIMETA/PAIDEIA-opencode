// Deterministic PDF rasterization (the harness's non-LLM half of the vision
// pipeline). Shells out to python3 + render_pages.py (pdf2image + Pillow).
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { assetPath } from "./workspace.mjs";

/** Resolve a usable python interpreter. */
export function pythonBin() {
  for (const cand of [process.env.PAIDEIA_PYTHON, "python3", "python"]) {
    if (!cand) continue;
    try {
      const r = spawnSync(cand, ["--version"], { encoding: "utf8", timeout: 10000 });
      if (r.status === 0 || /python/i.test(`${r.stdout}${r.stderr}`)) return cand;
    } catch { /* try next */ }
  }
  return null;
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
    const msg = `${r.stderr || ""}`.trim() || `render failed (exit ${r.status})`;
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
