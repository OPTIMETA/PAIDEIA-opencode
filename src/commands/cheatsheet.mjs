import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  return runOpencodeStage({
    course,
    ctx,
    command: "cheatsheet",
    promptFile: "cheatsheet.md",
    requires: { index: true },
    extraVars: { ARGS: argString(args) },
  });
}
