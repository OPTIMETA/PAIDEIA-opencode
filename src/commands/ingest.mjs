// ingest — the harness does the deterministic half (discover, idempotence,
// .md pass-through, render+resize PNG pages) and opencode does the vision
// transcription. The harness then cleans scratch pages and prints the summary.
import { existsSync, statSync, readdirSync, readFileSync, rmdirSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { resolveCourse } from "../core/stage.mjs";
import { CATEGORIES, listFiles, writeFileAtomic } from "../core/workspace.mjs";
import { courseVars, buildSpec } from "../core/prompts.mjs";
import { runStage, opencodeAvailable } from "../core/opencode.mjs";
import { renderPdfPages, cleanup } from "../core/render.mjs";
import { parseArgs } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

function isNewer(src, out) {
  try { return statSync(out).mtimeMs >= statSync(src).mtimeMs; } catch { return false; }
}

/** Was `p` written (non-empty) at or after `since`? */
function writtenSince(p, since) {
  try {
    const st = statSync(p);
    return st.size > 0 && st.mtimeMs >= since;
  } catch {
    return false;
  }
}

/** rmdir if empty; leaves a directory another run is still using alone. */
function removeIfEmpty(dir) {
  try {
    if (readdirSync(dir).length === 0) rmdirSync(dir);
  } catch { /* missing, non-empty, or busy — all fine */ }
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

  // Two sources in one category that share a stem (HW01.pdf + HW01.md) map to
  // the same converted/<cat>/<stem>.md, so whichever finishes last silently
  // wins. The .md is authoritative — it needs no transcription — so drop the
  // colliding PDF and say so rather than racing them.
  const claimed = new Set(passthroughs.map((p) => p.out));
  const collisions = jobs.filter((j) => claimed.has(j.out));
  for (const j of collisions) {
    console.error(lang === "ko"
      ? `  건너뜀: materials/${j.cat}/${j.stem}.pdf — 같은 이름의 .md가 이미 ${j.stem}.md로 변환됩니다.`
      : `  skipped: materials/${j.cat}/${j.stem}.pdf — a same-named .md already claims ${j.stem}.md.`);
  }
  const pdfJobs = jobs.filter((j) => !claimed.has(j.out));

  const summary = Object.fromEntries(CATEGORIES.map((c) => [c, { converted: 0, skipped: 0, failed: 0 }]));

  // 2. .md pass-through (deterministic; no model needed).
  for (const p of passthroughs) {
    if (!force && existsSync(p.out) && isNewer(p.src, p.out)) { summary[p.cat].skipped++; continue; }
    if (ctx.dryRun) { summary[p.cat].converted++; continue; }
    try {
      const body = readFileSync(p.src, "utf8");
      // Atomic: a torn write would leave a truncated converted/*.md that
      // isNewer() then treats as a valid, up-to-date conversion forever.
      writeFileAtomic(p.out,
        `<!-- SOURCE: materials/${p.cat}/${p.stem}.md, copied ${today()}, method: passthrough -->\n\n${body}`);
      summary[p.cat].converted++;
    } catch (e) {
      summary[p.cat].failed++;
      console.error(`  passthrough failed: ${p.src} — ${e.message}`);
    }
  }

  // 3. Which PDFs still need conversion? (Idempotence: skip up-to-date ones.)
  const pending = [];
  for (const j of pdfJobs) {
    if (!force && existsSync(j.out) && isNewer(j.src, j.out)) { summary[j.cat].skipped++; continue; }
    pending.push(j);
  }

  // Only transcription needs a model. A course of .md materials — or one whose
  // PDFs are all already converted — must not be blocked on opencode, and a
  // missing opencode must be reported before we spend minutes rasterizing.
  if (pending.length && !ctx.dryRun && !opencodeAvailable()) {
    console.error(t("no_opencode", lang));
    return 1;
  }

  // 4. Render PNG pages for the pending PDFs.
  const worklist = [];
  for (const j of pending) {
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

  // 5. If nothing to transcribe, just report.
  if (!worklist.length) {
    printSummary(summary, lang, ctx.dryRun);
    return 0;
  }

  // 6. Drive opencode to transcribe the rendered pages.
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
  // Anchor freshness before the run: on a --force re-ingest the output already
  // exists, so "the file is there" proves nothing — a stale artifact from a
  // previous run would be counted as converted even when opencode wrote none.
  // Floored to the second: filesystems that store mtime at 1s resolution would
  // otherwise report a just-written file as older than the sub-second start.
  const startedAt = Math.floor(Date.now() / 1000) * 1000;
  const res = runStage({ root, stage: "ingest", spec, model: ctx.model, dryRun: ctx.dryRun });
  if (res.dryRun) {
    console.log(t("dry_run", lang, { cmd: res.printable }));
    console.log(t("spec_written", lang, { path: res.specPath }));
    return 0;
  }

  // 7. Tally results, clean scratch pages.
  for (const w of worklist) {
    summary[w.cat][writtenSince(w.out, startedAt) ? "converted" : "failed"]++;
    cleanup(w.pagesDir);
  }
  // Drop the _pages parents, but only when empty — a recursive delete here
  // would take out the scratch of a concurrent ingest still transcribing.
  for (const cat of CATEGORIES) removeIfEmpty(join(root, "converted", cat, "_pages"));

  printSummary(summary, lang);
  if (res.code !== 0) console.error(t("stage_failed", lang, { stage: "ingest", code: res.code }));
  return res.code;
}

function printSummary(summary, lang, dryRun = false) {
  console.log("");
  // In a dry run nothing was written — say so, or the table reads as a report
  // of work that happened.
  if (dryRun) console.log(lang === "ko" ? "[dry-run] 아래는 예정 작업입니다 (변환 없음)." : "[dry-run] planned work below; nothing was written.");
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
