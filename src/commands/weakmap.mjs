import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps, latestWeakmap, readErrorsLog, relative } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;

  const wm = latestWeakmap(course.root);
  // Strip HTML comments so the schema example in the errors/log.md seed
  // (`- problem_id: <id>`) isn't mistaken for a real graded entry.
  const errLog = readErrorsLog(course.root).replace(/<!--[\s\S]*?-->/g, "");
  const hasErrors = /\bproblem_id\s*:/.test(errLog);
  const body = [
    wm ? `Latest report: ${relative(course.root, wm)}` : "No prior weakmap report.",
    hasErrors ? "errors/log.md has entries to snapshot." : "errors/log.md is empty (no graded errors yet).",
    argString(args) ? "Mode: Case B (concept patch — argument present)." : "Mode: Case A (fresh snapshot — no argument).",
  ].join("\n");

  return runOpencodeStage({
    course,
    ctx,
    command: "weakmap",
    promptFile: "weakmap.md",
    extraVars: { ARGS: argString(args), TS: timestamps().dayHm },
    contextSections: [{ title: "Weakmap state", body }],
  });
}
