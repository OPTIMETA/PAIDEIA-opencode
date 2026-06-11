import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps, latestWeakmap, relative } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;

  const contextSections = [];
  if ((args[0] || "").toLowerCase() === "weakmap") {
    const wm = latestWeakmap(course.root);
    contextSections.push({
      title: "Weakmap mode",
      body: wm
        ? `Latest weakmap report: ${relative(course.root, wm)}\nDrive the quiz mix from its Top-5 and User-declared weaknesses.`
        : "No weakmap report exists yet. Tell the user to run `paideia weakmap` first, then stop.",
    });
  }

  return runOpencodeStage({
    course,
    ctx,
    command: "quiz",
    promptFile: "quiz.md",
    requires: { index: true },
    extraVars: { ARGS: argString(args) || "all 5", TS: timestamps().dayHm },
    contextSections,
  });
}
