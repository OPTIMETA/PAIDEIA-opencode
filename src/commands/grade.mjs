// grade — resolve the answer + reference, run the OCR half the harness owns
// (local engines, or rasterize for agent-vision), then drive opencode to
// transcribe (if needed) and strategy-grade. Archives the PDF on success.
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, basename, extname, isAbsolute, resolve as pathResolve } from "node:path";
import { resolveCourse } from "../core/stage.mjs";
import {
  latestAnswer, listFiles, timestamps, relative, assetPath,
} from "../core/workspace.mjs";
import { courseVars, buildSpec } from "../core/prompts.mjs";
import { runStage, opencodeAvailable } from "../core/opencode.mjs";
import { renderPdfPages, cleanup, pythonBin } from "../core/render.mjs";
import { parseArgs } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

const ENGINE_ALIAS = { claude: "vision", agent: "vision", vision: "vision", ollama: "ollama", tesseract: "tesseract" };

function resolveTarget(root, positional) {
  if (positional) {
    const p = isAbsolute(positional) ? positional : pathResolve(root, positional);
    return existsSync(p) ? p : null;
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
  const r = spawnSync(py, [assetPath("scripts", "vision_ocr.py"), `--engine=${engine}`, pdf, out],
    { cwd: root, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`vision_ocr.py exited ${r.status}`);
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

  const engine = ENGINE_ALIAS[String(flags.ocr || meta.OCR_ENGINE || "vision").toLowerCase()] || "vision";
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
  if (res.code === 0 && ext === ".pdf" && target.startsWith(join(root, "answers"))) {
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
