import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps, latestWeakmap, relative } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;

  const contextSections = [];
  if ((args[0] || "").toLowerCase() === "weakmap") {
    const wm = latestWeakmap(course.root);
    // The harness already knows there is nothing to target — spending a model
    // run to have the agent relay that costs time and tokens for no output.
    if (!wm) {
      console.error(t("need_weakmap", course.lang));
      return 1;
    }
    contextSections.push({
      title: "Weakmap mode",
      body: `Latest weakmap report: ${relative(course.root, wm)}\n`
        + "Drive the quiz mix from its Top-5 and User-declared weaknesses.",
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
