// doctor — "can paideia actually run here?" Checks the install (python deps,
// poppler, tesseract, opencode + auth, optional ollama) and, inside a course
// folder, the workspace. `--fix` repairs the permission-free issues.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { findCourseRoot, readMeta, interfaceLang } from "../core/meta.mjs";
import { SKELETON, ensureSkeleton } from "../core/workspace.mjs";
import { pythonBin } from "../core/render.mjs";
import { opencodeVersion, opencodeAuthList } from "../core/opencode.mjs";
import { parseArgs } from "../core/args.mjs";

function probe(cmd, args = ["--version"]) {
  try {
    const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 15000 });
    return { ok: r.status === 0, out: `${r.stdout || ""}${r.stderr || ""}`.trim(), status: r.status };
  } catch {
    return { ok: false, out: "", status: null };
  }
}

function pyImport(py, mod) {
  const r = spawnSync(py, ["-c", `import ${mod}`], { encoding: "utf8", timeout: 20000 });
  return r.status === 0;
}

const ICON = { ok: "✓", warn: "⚠", fail: "✗" };

export async function run(args, _ctx) {
  const { flags } = parseArgs(args);
  const fix = !!flags.fix;
  const root = findCourseRoot(process.cwd());
  const meta = root ? readMeta(root) : {};
  const lang = interfaceLang(meta);
  const engine = String(meta.OCR_ENGINE || "vision").toLowerCase();
  const checks = [];
  const add = (name, status, detail = "", fixCmd = "") => checks.push({ name, status, detail, fixCmd });

  // ── System: opencode (the execution substrate) ─────────────────────────────
  const oc = opencodeVersion();
  if (oc) {
    add("opencode", "ok", oc.split("\n")[0]);
    const auth = opencodeAuthList();
    if (/\b(anthropic|openai|google|opencode|github|amazon|azure|openrouter|model)\b/i.test(auth)) {
      add("opencode auth", "ok", "provider(s) configured");
    } else {
      add("opencode auth", "warn", "no providers detected", "opencode auth login");
    }
  } else {
    add("opencode", "fail", "not found — required to run any stage",
      "install: https://opencode.ai/docs  (e.g. `npm i -g opencode-ai`)");
  }

  // ── System: python + rendering deps ────────────────────────────────────────
  const py = pythonBin();
  if (py) {
    add("python3", "ok", probe(py).out.split("\n")[0]);
    const need = { pdf2image: "render", PIL: "render", pytesseract: "ocr", pypdf: "pdf", pdfplumber: "pdf", reportlab: "cheatsheet-pdf" };
    const missing = Object.keys(need).filter((m) => !pyImport(py, m));
    const renderMissing = missing.filter((m) => ["pdf2image", "PIL"].includes(m));
    if (renderMissing.length) {
      add("python: render deps", "fail", `missing: ${renderMissing.join(", ")}`,
        "python3 -m pip install --user pdf2image pillow");
    } else {
      add("python: render deps", "ok", "pdf2image, pillow");
    }
    const optMissing = missing.filter((m) => !["pdf2image", "PIL"].includes(m));
    if (optMissing.length) {
      add("python: optional deps", "warn", `missing: ${optMissing.join(", ")}`,
        `python3 -m pip install --user ${optMissing.map((m) => (m === "PIL" ? "pillow" : m)).join(" ")}`);
    }
  } else {
    add("python3", "fail", "not found — required for PDF rendering + local OCR",
      "install python3 (macOS: `brew install python`)");
  }

  // ── System: poppler + tesseract ────────────────────────────────────────────
  const poppler = probe("pdftoppm", ["-v"]);
  add("poppler (pdftoppm)", poppler.ok || /pdftoppm/.test(poppler.out) ? "ok" : "fail",
    poppler.ok ? "" : "required by every OCR/ingest path",
    "macOS: brew install poppler · Ubuntu: apt-get install poppler-utils");

  const tess = probe("tesseract", ["--version"]);
  const tessOk = tess.ok || /tesseract/.test(tess.out);
  const tessSev = engine === "tesseract" || engine === "ollama" ? "fail" : "warn";
  add("tesseract", tessOk ? "ok" : tessSev, tessOk ? "" : `needed for OCR_ENGINE=${engine}`,
    "macOS: brew install tesseract tesseract-lang · Ubuntu: apt-get install tesseract-ocr tesseract-ocr-kor");
  if (tessOk) {
    const langs = probe("tesseract", ["--list-langs"]);
    const hasKor = /\bkor\b/.test(langs.out);
    if (lang === "ko") {
      add("tesseract: kor langdata", hasKor ? "ok" : "warn", hasKor ? "" : "Korean OCR fallback unavailable",
        "macOS: brew install tesseract-lang · Ubuntu: apt-get install tesseract-ocr-kor");
    }
  }

  // ── Optional: ollama (only escalated when the course uses it) ───────────────
  if (engine === "ollama") {
    const ol = probe("ollama", ["--version"]);
    if (ol.ok || /ollama/.test(ol.out)) {
      add("ollama", "ok", ol.out.split("\n")[0]);
      const tags = probe("curl", ["-fsS", "--max-time", "3", "http://localhost:11434/api/tags"]);
      add("ollama daemon", tags.ok ? "ok" : "warn", tags.ok ? "" : "daemon down", "ollama serve &");
      const list = probe("ollama", ["list"]);
      const hasModel = /qwen3-vl:8b/.test(list.out);
      add("ollama qwen3-vl:8b", hasModel ? "ok" : "warn", hasModel ? "" : "model not pulled (~6 GB)",
        "ollama pull qwen3-vl:8b");
    } else {
      add("ollama", "fail", "OCR_ENGINE=ollama but ollama not found", "macOS: brew install ollama");
    }
  }

  // ── Course mode ────────────────────────────────────────────────────────────
  if (root) {
    const missingDirs = SKELETON.filter((d) => !existsSync(join(root, d)));
    if (missingDirs.length) {
      if (fix) { ensureSkeleton(root); add("workspace skeleton", "ok", `repaired ${missingDirs.length} dir(s)`); }
      else add("workspace skeleton", "warn", `${missingDirs.length} dir(s) missing`, "paideia doctor --fix");
    } else add("workspace skeleton", "ok", "");

    const required = ["COURSE_NAME", "EXAM_DATE", "OCR_ENGINE", "INTERFACE_LANG"];
    const missingMeta = required.filter((k) => !meta[k]);
    add(".course-meta", missingMeta.length ? "warn" : "ok",
      missingMeta.length ? `missing keys: ${missingMeta.join(", ")} (edit .course-meta or re-run init-course)` : "");

    add("errors/log.md", existsSync(join(root, "errors", "log.md")) ? "ok" : (fix ? "ok" : "warn"),
      existsSync(join(root, "errors", "log.md")) ? "" : "missing (run with --fix)", "paideia doctor --fix");
    if (fix) ensureSkeleton(root);

    add("opencode.json", existsSync(join(root, "opencode.json")) ? "ok" : "warn",
      existsSync(join(root, "opencode.json")) ? "" : "no workspace config (re-run init-course)");
  } else {
    add("mode", "warn", "no .course-meta here — global checks only. Run `paideia init-course` in a course folder.");
  }

  // ── Report ─────────────────────────────────────────────────────────────────
  const fails = checks.filter((c) => c.status === "fail");
  const warns = checks.filter((c) => c.status === "warn");
  const oks = checks.filter((c) => c.status === "ok");

  console.log(`paideia doctor — ${root ? "course mode" : "global mode"}${fix ? " (--fix)" : ""}\n`);
  for (const c of [...fails, ...warns]) {
    console.log(`  ${ICON[c.status]} ${c.name}${c.detail ? `: ${c.detail}` : ""}`);
    if (c.fixCmd && c.status !== "ok") console.log(`      → ${c.fixCmd}`);
  }
  console.log(`\n  ${ICON.ok} ${oks.length} checks passed.`);

  const status = fails.length ? "✗ blocking issues" : warns.length ? "⚠ usable with warnings" : "✓ all clear";
  console.log(`\n${status}.`);
  if (!root && !fails.length) console.log("Next: `paideia init-course` in your course folder.");
  return fails.length ? 2 : warns.length ? 1 : 0;
}
