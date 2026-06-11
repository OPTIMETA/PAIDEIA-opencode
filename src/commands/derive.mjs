import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  if (!argString(args)) {
    console.error("usage: paideia derive <equation or theorem name>");
    return 1;
  }
  return runOpencodeStage({
    course,
    ctx,
    command: "derive",
    promptFile: "derive.md",
    requires: { converted: true },
    extraVars: { ARGS: argString(args) },
  });
}
