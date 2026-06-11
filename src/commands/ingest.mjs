// ingest — the harness does the deterministic half (discover, idempotence,
// .md pass-through, render+resize PNG pages) and opencode does the vision
// transcription. The harness then cleans scratch pages and prints the summary.
import {
  existsSync, statSync, mkdirSync, writeFileSync, readFileSync,
} from "node:fs";
import { join, basename, extname } from "node:path";
import { resolveCourse } from "../core/stage.mjs";
import { CATEGORIES, listFiles } from "../core/workspace.mjs";
import { courseVars, buildSpec } from "../core/prompts.mjs";
import { runStage, opencodeAvailable } from "../core/opencode.mjs";
import { renderPdfPages, cleanup } from "../core/render.mjs";
import { parseArgs } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

function isNewer(src, out) {
  try { return statSync(out).mtimeMs >= statSync(src).mtimeMs; } catch { return false; }
}

const today = () => new Date().toISOString().slice(0, 10);

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  const { root, meta, lang } = course;
  const { flags } = parseArgs(args);
  const force = !!flags.force;

  // 1. Discover materials per category, split PDF vs MD.
  const jobs = [];        // PDFs to (maybe) convert
  const passthroughs = [];
  for (const cat of CATEGORIES) {
    for (const f of listFiles(join(root, "materials", cat))) {
      const ext = extname(f).toLowerCase();
      const stem = basename(f, ext);
      const out = join(root, "converted", cat, `${stem}.md`);
      if (ext === ".pdf") jobs.push({ cat, stem, src: f, out });
      else if (ext === ".md") passthroughs.push({ cat, stem, src: f, out });
    }
  }
  if (!jobs.length && !passthroughs.length) {
    console.error(lang === "ko"
      ? "materials/{lectures,textbook,homework,solutions}/ 에 PDF/MD를 넣고 다시 실행하세요."
      : "Put PDFs/MDs into materials/{lectures,textbook,homework,solutions}/ and re-run.");
    return 1;
  }

  if (!ctx.dryRun && !opencodeAvailable()) {
    console.error(t("no_opencode", lang));
    return 1;
  }

  const summary = Object.fromEntries(CATEGORIES.map((c) => [c, { converted: 0, skipped: 0, failed: 0 }]));

  // 2. .md pass-through (deterministic; no model needed).
  for (const p of passthroughs) {
    if (!force && existsSync(p.out) && isNewer(p.src, p.out)) { summary[p.cat].skipped++; continue; }
    if (ctx.dryRun) { summary[p.cat].converted++; continue; }
    try {
      const body = readFileSync(p.src, "utf8");
      mkdirSync(join(root, "converted", p.cat), { recursive: true });
      writeFileSync(p.out,
        `<!-- SOURCE: materials/${p.cat}/${p.stem}.md, copied ${today()}, method: passthrough -->\n\n${body}`,
        "utf8");
      summary[p.cat].converted++;
    } catch (e) {
      summary[p.cat].failed++;
      console.error(`  passthrough failed: ${p.src} — ${e.message}`);
    }
  }

  // 3. Render PNG pages for PDFs that need conversion (skip idempotent ones).
  const worklist = [];
  for (const j of jobs) {
    if (!force && existsSync(j.out) && isNewer(j.src, j.out)) { summary[j.cat].skipped++; continue; }
    const pagesDir = join(root, "converted", j.cat, "_pages", j.stem);
    if (ctx.dryRun) { worklist.push({ ...j, pagesDir, pages: null }); continue; }
    try {
      const { pages } = renderPdfPages(j.src, pagesDir, { dpi: 160, maxPx: 1800 });
      worklist.push({ ...j, pagesDir, pages });
    } catch (e) {
      summary[j.cat].failed++;
      console.error(`  render failed: ${j.src} — ${e.message}`);
    }
  }

  // 4. If nothing to transcribe, just report.
  if (!worklist.length) {
    printSummary(summary, lang);
    return 0;
  }

  // 5. Drive opencode to transcribe the rendered pages.
  const listing = worklist.map((w, i) =>
    `${i + 1}. [${w.cat}] ${w.stem} — pages: ${w.pagesDir}${w.pages ? `/p01..p${String(w.pages).padStart(2, "0")}.png (${w.pages})` : ""}\n`
    + `   output: converted/${w.cat}/${w.stem}.md   source: materials/${w.cat}/${w.stem}.pdf`
  ).join("\n");

  const vars = courseVars(root, meta, { ARGS: "" });
  const spec = buildSpec({
    promptFile: "ingest.md",
    vars,
    contextSections: [{ title: "PDFs to transcribe", body: listing }],
  });

  console.error(t("running_stage", lang, { stage: "ingest" }));
  const res = runStage({ root, stage: "ingest", spec, model: ctx.model, dryRun: ctx.dryRun });
  if (res.dryRun) {
    console.log(t("dry_run", lang, { cmd: res.printable }));
    console.log(t("spec_written", lang, { path: res.specPath }));
    return 0;
  }

  // 6. Tally results, clean scratch pages.
  for (const w of worklist) {
    const ok = existsSync(w.out) && statSync(w.out).size > 0;
    summary[w.cat][ok ? "converted" : "failed"]++;
    cleanup(w.pagesDir);
  }
  // Remove now-empty _pages parents (best effort).
  for (const cat of CATEGORIES) cleanup(join(root, "converted", cat, "_pages"));

  printSummary(summary, lang);
  if (res.code !== 0) console.error(t("stage_failed", lang, { stage: "ingest", code: res.code }));
  return res.code;
}

function printSummary(summary, lang) {
  console.log("");
  console.log("| Category | Converted | Skipped | Failed |");
  console.log("|---|---|---|---|");
  for (const cat of CATEGORIES) {
    const s = summary[cat];
    console.log(`| ${cat} | ${s.converted} | ${s.skipped} | ${s.failed} |`);
  }
  console.log("");
  console.log(lang === "ko"
    ? "다음: `paideia analyze` 로 patterns.md, coverage.md, summary.md 생성."
    : "Next: run `paideia analyze` to generate patterns.md, coverage.md, summary.md.");
}
