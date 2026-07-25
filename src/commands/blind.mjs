import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { parseArgs, argString } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

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

  // `--strategy` with no value (or an empty one) parses as a bare flag. Falling
  // through to re-presenting the problem is the one outcome the user did not
  // ask for — they typed it because they had an answer to submit.
  if ("strategy" in flags) {
    const strategy = flags.strategy === true ? "" : String(flags.strategy).trim();
    if (!strategy) {
      console.error(t("need_strategy", course.lang));
      return 1;
    }
    return runOpencodeStage({
      course,
      ctx,
      command: "blind-check",
      promptFile: "blind_check.md",
      requires: { index: true },
      extraVars: { ARGS_BASE: id, STRATEGY: strategy },
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
