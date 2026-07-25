import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { assetPath, relative } from "../core/workspace.mjs";
import { pythonBin } from "../core/render.mjs";
import { describeSpawnFailure } from "../core/proc.mjs";
import { parseArgs, argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  const { flags } = parseArgs(args);

  const code = runOpencodeStage({
    course,
    ctx,
    command: "cheatsheet",
    promptFile: "cheatsheet.md",
    requires: { index: true },
    extraVars: { ARGS: argString(args) },
  });
  if (code !== 0 || ctx.dryRun) return code;

  // --pdf: the harness owns the MD->PDF conversion (deterministic, reliable).
  if (flags.pdf) {
    const md = join(course.root, "cheatsheet", "final.md");
    const pdf = join(course.root, "cheatsheet", "final.pdf");
    if (!existsSync(md)) {
      console.error("  (--pdf skipped: cheatsheet/final.md was not produced)");
      return code;
    }
    const py = pythonBin();
    if (!py) {
      console.error("  (--pdf skipped: python3 not found)");
      return code;
    }
    // Bounded: md_to_pdf prefers pandoc, and a pandoc/LaTeX run that stalls
    // would otherwise hang the command forever over a cosmetic artifact.
    const r = spawnSync(py, [assetPath("scripts", "md_to_pdf.py"), md, pdf],
      { encoding: "utf8", timeout: 300000 });
    if (r.status === 0) {
      console.error(`  PDF: ${relative(course.root, pdf)}`);
    } else {
      console.error(`  (--pdf failed: ${describeSpawnFailure(r, "md_to_pdf.py")}; final.md is still available)`);
    }
  }
  return code;
}
