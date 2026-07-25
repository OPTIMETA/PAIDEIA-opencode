// doctor — "can paideia actually run here?" Checks the install (python deps,
// poppler, tesseract, opencode + auth, optional ollama) and, inside a course
// folder, the workspace. `--fix` repairs the permission-free issues.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { findCourseRoot, readMeta, interfaceLang, isValidExamDate } from "../core/meta.mjs";
import { SKELETON, ensureSkeleton, assetPath } from "../core/workspace.mjs";
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

/**
 * Which of `mods` fail to import, in ONE interpreter start. Probing six modules
 * with six `python -c` spawns is six process starts (~1s+ each on Windows and
 * cold macOS) for information a single script yields at once.
 */
function missingPyModules(py, mods) {
  const script = "import importlib.util,sys\n"
    + `mods=${JSON.stringify(mods)}\n`
    + "print('\\n'.join(m for m in mods if importlib.util.find_spec(m) is None))";
  try {
    const r = spawnSync(py, ["-c", script], { encoding: "utf8", timeout: 30000 });
    // A probe that cannot run at all tells us nothing — do not report every
    // module as missing on the strength of a broken interpreter invocation.
    if (r.status !== 0) return null;
    return `${r.stdout || ""}`.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch {
    return null;
  }
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

  // ── The runtime itself ─────────────────────────────────────────────────────
  // npm does not enforce `engines` unless engine-strict is set, so an older
  // Node reaches us and fails later with something that looks like a bug.
  const [major, minor] = process.versions.node.split(".").map(Number);
  const nodeOk = major > 18 || (major === 18 && minor >= 17);
  add("node", nodeOk ? "ok" : "fail", nodeOk ? `v${process.versions.node}`
    : `v${process.versions.node} is below the required v18.17`, "upgrade node (https://nodejs.org)");

  // ── System: opencode (the execution substrate) ─────────────────────────────
  const oc = opencodeVersion();
  if (oc) {
    add("opencode", "ok", oc.split("\n")[0]);
    const auth = opencodeAuthList();
    // Provider names only — a generic token like "model" matches the table
    // header of an otherwise empty listing and reports auth that is not there.
    if (/\b(anthropic|openai|google|opencode|github|amazon|azure|openrouter)\b/i.test(auth)) {
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
    const RENDER_MODS = ["pdf2image", "PIL"];
    const need = [...RENDER_MODS, "pytesseract", "pypdf", "pdfplumber", "reportlab"];
    const pipName = (m) => (m === "PIL" ? "pillow" : m);
    const missing = missingPyModules(py, need);
    if (missing === null) {
      add("python: modules", "warn", "could not probe imports with this interpreter",
        `${py} -c "import pdf2image, PIL"`);
    } else {
      const renderMissing = missing.filter((m) => RENDER_MODS.includes(m));
      if (renderMissing.length) {
        add("python: render deps", "fail", `missing: ${renderMissing.join(", ")}`,
          `python3 -m pip install --user ${renderMissing.map(pipName).join(" ")}`);
      } else {
        add("python: render deps", "ok", "pdf2image, pillow");
      }
      const optMissing = missing.filter((m) => !RENDER_MODS.includes(m));
      if (optMissing.length) {
        add("python: optional deps", "warn", `missing: ${optMissing.join(", ")}`,
          `python3 -m pip install --user ${optMissing.map(pipName).join(" ")}`);
      }
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

  // ── The harness install itself ─────────────────────────────────────────────
  // A partial install (a publish that dropped assets/, a half-finished clone)
  // fails deep inside a stage with a bare ENOENT. Check the bundled files the
  // stages actually load, here, where the message can say what is wrong.
  const BUNDLED = [
    ...["_system", "ingest", "analyze", "hwmap", "pattern", "quiz", "mock", "twin", "twin_check",
      "blind", "blind_check", "chain", "derive", "grade", "weakmap", "cheatsheet", "alt"]
      .map((p) => assetPath("prompts", `${p}.md`)),
    ...["render_pages.py", "vision_ocr.py", "md_to_pdf.py"].map((s) => assetPath("scripts", s)),
  ];
  const missingAssets = BUNDLED.filter((p) => !existsSync(p));
  add("bundled assets", missingAssets.length ? "fail" : "ok",
    missingAssets.length
      ? `${missingAssets.length} missing (e.g. ${missingAssets[0]}) — reinstall paideia`
      : `${BUNDLED.length} prompts + scripts present`);

  // ── Course mode ────────────────────────────────────────────────────────────
  if (root) {
    // --fix repairs the skeleton and reseeds errors/log.md; report what the
    // repair actually achieved rather than assuming it succeeded.
    let repairError = null;
    const missingDirs = SKELETON.filter((d) => !existsSync(join(root, d)));
    if (fix) {
      try { ensureSkeleton(root); } catch (e) { repairError = e.message; }
    }
    if (repairError) {
      add("workspace skeleton", "fail", `repair failed: ${repairError}`);
    } else if (!missingDirs.length) {
      add("workspace skeleton", "ok", "");
    } else if (fix) {
      add("workspace skeleton", "ok", `repaired ${missingDirs.length} dir(s)`);
    } else {
      add("workspace skeleton", "warn", `${missingDirs.length} dir(s) missing`, "paideia doctor --fix");
    }

    const required = ["COURSE_NAME", "EXAM_DATE", "OCR_ENGINE", "INTERFACE_LANG"];
    const missingMeta = required.filter((k) => !meta[k]);
    if (missingMeta.length) {
      add(".course-meta", "warn",
        `missing keys: ${missingMeta.join(", ")} (edit .course-meta or re-run init-course)`);
    } else if (!isValidExamDate(meta.EXAM_DATE)) {
      // Every D-N, the phase line and each stage's urgency framing read this.
      add(".course-meta", "warn",
        `EXAM_DATE '${meta.EXAM_DATE}' is not a real YYYY-MM-DD date — D-N shows as D-?`,
        "edit .course-meta: EXAM_DATE: YYYY-MM-DD");
    } else {
      add(".course-meta", "ok", "");
    }

    const logPresent = existsSync(join(root, "errors", "log.md"));
    add("errors/log.md", logPresent ? "ok" : "warn",
      logPresent ? "" : "missing (run with --fix)", "paideia doctor --fix");

    const hasCfg = existsSync(join(root, "opencode.json"));
    add("opencode.json", hasCfg ? "ok" : "warn",
      hasCfg ? "" : "no workspace config (re-run init-course)");
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
