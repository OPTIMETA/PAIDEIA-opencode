import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { parseArgs, argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  const { flags, positionals } = parseArgs(args, ["strategy"]);
  const id = argString(positionals);
  if (!id) {
    console.error('usage: paideia blind <problem-id>            ← present the problem\n'
      + '       paideia blind <problem-id> --strategy "..."  ← grade your strategy');
    return 1;
  }

  if (flags.strategy && flags.strategy !== true) {
    return runOpencodeStage({
      course,
      ctx,
      command: "blind-check",
      promptFile: "blind_check.md",
      requires: { index: true },
      extraVars: { ARGS_BASE: id, STRATEGY: String(flags.strategy) },
    });
  }

  return runOpencodeStage({
    course,
    ctx,
    command: "blind",
    promptFile: "blind.md",
    requires: { index: true },
    extraVars: { ARGS: id },
  });
}
