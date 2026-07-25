// grade — resolve the answer + reference, run the OCR half the harness owns
// (local engines, or rasterize for agent-vision), then drive opencode to
// transcribe (if needed) and strategy-grade. Archives the PDF on success.
import { mkdirSync, renameSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, basename, extname, isAbsolute, resolve as pathResolve } from "node:path";
import { resolveCourse } from "../core/stage.mjs";
import {
  latestAnswer, listFiles, timestamps, relative, assetPath,
} from "../core/workspace.mjs";
import { courseVars, buildSpec } from "../core/prompts.mjs";
import { runStage, opencodeAvailable } from "../core/opencode.mjs";
import { renderPdfPages, cleanup, pythonBin } from "../core/render.mjs";
import { describeSpawnFailure, longRunTimeoutMs } from "../core/proc.mjs";
import { parseArgs } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

// Null-prototype: the key is whatever the user typed after --ocr, and on a
// normal object `ENGINE_ALIAS["constructor"]` is a truthy inherited function —
// it passed the unknown-engine guard and reached the spec as the engine name.
const ENGINE_ALIAS = Object.assign(Object.create(null), {
  claude: "vision", agent: "vision", vision: "vision", ollama: "ollama", tesseract: "tesseract",
});

/** True iff `p` is inside `dir` (and not merely prefixed by its name). */
function isInside(dir, p) {
  const rel = relative(dir, p);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}

function resolveTarget(root, positional) {
  if (positional) {
    const p = isAbsolute(positional) ? positional : pathResolve(root, positional);
    // Must be a *file*: a directory passes existsSync and then fails much later
    // inside the rasterizer, with an error about the PDF library.
    try { return statSync(p).isFile() ? p : null; } catch { return null; }
  }
  return latestAnswer(root);
}

function referenceCandidates(root, stem) {
  const dirs = ["converted/solutions", "quizzes", "twins", "chain", "mock"];
  const token = stem.split(/[_-]/)[0].toLowerCase();
  const all = [];
  for (const d of dirs) {
    for (const f of listFiles(join(root, d), ".md")) all.push(f);
  }
  const hit = all.filter((f) => basename(f).toLowerCase().includes(token));
  const chosen = (hit.length ? hit : all).slice(0, 10);
  return chosen.map((f) => `- ${relative(root, f)}`).join("\n") || "(none found — ask the user which reference solution to grade against)";
}

function runVisionOcr(root, pdf, out, engine) {
  const py = pythonBin();
  if (!py) throw new Error("python3 not found — required for the ollama/tesseract OCR engines.");
  // Bounded like every other long-running child: vision_ocr.py caps each page
  // at 30 minutes but nothing capped the *document*, so a stalled local model
  // on a 20-page scan could hold the terminal for a working day.
  const r = spawnSync(py, [assetPath("scripts", "vision_ocr.py"), `--engine=${engine}`, pdf, out],
    { cwd: root, stdio: "inherit", timeout: longRunTimeoutMs() });
  // stdio is inherited, so r.stderr is null — describeSpawnFailure still turns
  // a spawn error or a kill signal into something better than "exited null".
  if (r.status !== 0) throw new Error(describeSpawnFailure(r, "vision_ocr.py"));
}

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  const { root, meta, lang } = course;
  const { flags, positionals } = parseArgs(args, ["ocr"]);

  const target = resolveTarget(root, positionals[0]);
  if (!target) {
    console.error(lang === "ko"
      ? "채점할 답안 파일을 찾지 못했습니다. answers/ 에 PDF를 올리거나 경로를 지정하세요."
      : "No answer file found. Upload a PDF into answers/ or pass a path.");
    return 1;
  }

  // A typo'd engine used to fall back to vision silently — the user asks for a
  // local, nothing-leaves-the-machine transcription and gets a remote one.
  const requested = String(flags.ocr || meta.OCR_ENGINE || "vision").toLowerCase();
  const engine = ENGINE_ALIAS[requested];
  if (!engine) {
    console.error(`paideia grade: unknown OCR engine '${requested}'. `
      + `Use one of: ${[...new Set(Object.keys(ENGINE_ALIAS))].join(", ")}.`);
    return 1;
  }
  const ext = extname(target).toLowerCase();
  const stem = basename(target, ext);
  const convOut = join(root, "answers", "converted", `${stem}.md`);

  if (!ctx.dryRun && !opencodeAvailable()) {
    console.error(t("no_opencode", lang));
    return 1;
  }

  // ── OCR half (harness-owned) ───────────────────────────────────────────────
  let transcriptionNote;
  let tmpDir = null;
  if (ext === ".md") {
    transcriptionNote = `The answer is already markdown at \`${relative(root, target)}\`. Read it directly; skip transcription.`;
  } else if (engine === "ollama" || engine === "tesseract") {
    if (!ctx.dryRun) {
      try {
        runVisionOcr(root, target, convOut, engine);
      } catch (e) {
        console.error(`  OCR failed: ${e.message}`);
        return 1;
      }
    }
    transcriptionNote = `Transcription ready at \`answers/converted/${stem}.md\` (engine: ${engine}). Read it; check its <!-- TIER --> header for the confidence caveat.`;
  } else {
    // agent-vision: rasterize for opencode to read.
    tmpDir = join(root, "answers", "converted", `.tmp-${stem}`);
    if (!ctx.dryRun) {
      cleanup(tmpDir); // clear any scratch left by a prior interrupted run
      try {
        renderPdfPages(target, tmpDir, { dpi: 200, maxPx: 1800, prefix: "page-" });
      } catch (e) {
        console.error(`  rasterize failed: ${e.message}`);
        return 1;
      }
    }
    const pages = ctx.dryRun ? [] : listFiles(tmpDir, ".png").map((f) => basename(f)).sort();
    transcriptionNote = `Engine: agent-vision. Answer pages are rendered in \`${relative(root, tmpDir)}/\``
      + (pages.length ? ` (${pages.join(", ")})` : "")
      + `. Read each page PNG in order, transcribe to \`answers/converted/${stem}.md\` per the contract, then grade.`;
  }

  const jobBody = [
    `- Target answer: \`${relative(root, target)}\``,
    `- Stem: \`${stem}\``,
    `- OCR engine: ${engine}`,
    `- Transcription: ${transcriptionNote}`,
    ``,
    `Candidate reference solutions:`,
    referenceCandidates(root, stem),
  ].join("\n");

  const vars = courseVars(root, meta, { ARGS: positionals.join(" ") });
  const spec = buildSpec({
    promptFile: "grade.md",
    vars,
    contextSections: [{ title: "Grading job", body: jobBody }],
  });

  console.error(t("running_stage", lang, { stage: "grade" }));
  const res = runStage({ root, stage: "grade", spec, model: ctx.model, dryRun: ctx.dryRun });
  if (res.dryRun) {
    console.log(t("dry_run", lang, { cmd: res.printable }));
    console.log(t("spec_written", lang, { path: res.specPath }));
    return 0;
  }

  // ── Post: archive the graded PDF, clean scratch ────────────────────────────
  // Containment, not string prefix: `answers-old/x.pdf` starts with the same
  // characters as `answers/` and would otherwise get archived out from under a
  // directory the harness does not own.
  if (res.code === 0 && ext === ".pdf" && isInside(join(root, "answers"), target)) {
    try {
      const archive = join(root, "answers", "_archive");
      mkdirSync(archive, { recursive: true });
      const dest = join(archive, `${stem}_${timestamps().compact}.pdf`);
      renameSync(target, dest);
      console.error(`  archived: ${relative(root, target)} → ${relative(root, dest)}`);
    } catch (e) {
      console.error(`  (archive skipped: ${e.message})`);
    }
  }
  cleanup(tmpDir);

  if (res.code === 0) console.error(t("stage_done", lang, { stage: "grade" }));
  else console.error(t("stage_failed", lang, { stage: "grade", code: res.code }));
  return res.code;
}
