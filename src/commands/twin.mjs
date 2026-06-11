import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps, convertedByCategory, basename } from "../core/workspace.mjs";
import { parseArgs, argString } from "../core/args.mjs";

function sourceListing(root) {
  const byCat = convertedByCategory(root);
  return ["homework", "solutions", "lectures", "textbook"]
    .map((cat) => `- ${cat}: ${(byCat[cat] || []).map((f) => basename(f)).join(", ") || "(none)"}`)
    .join("\n");
}

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  const { flags, positionals } = parseArgs(args, ["strategy"]);
  const id = argString(positionals);
  if (!id) {
    console.error('usage: paideia twin <problem-id>  [--strategy "<3-5 lines>"]');
    return 1;
  }

  if (flags.strategy && flags.strategy !== true) {
    return runOpencodeStage({
      course,
      ctx,
      command: "twin-check",
      promptFile: "twin_check.md",
      requires: { index: true },
      extraVars: { ARGS_BASE: id, STRATEGY: String(flags.strategy) },
    });
  }

  return runOpencodeStage({
    course,
    ctx,
    command: "twin",
    promptFile: "twin.md",
    requires: { index: true },
    extraVars: { ARGS: id, TS: timestamps().dayHm },
    contextSections: [{ title: "Candidate source files", body: sourceListing(course.root) }],
  });
}
