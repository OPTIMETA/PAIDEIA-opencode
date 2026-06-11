import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  return runOpencodeStage({
    course,
    ctx,
    command: "chain",
    promptFile: "chain.md",
    requires: { index: true },
    extraVars: { ARGS: argString(args) || "2", TS: timestamps().dayHm },
  });
}
