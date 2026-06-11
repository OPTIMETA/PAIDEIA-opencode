import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { convertedByCategory, basename } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";

function convertedListing(root) {
  const byCat = convertedByCategory(root);
  return Object.entries(byCat)
    .map(([cat, files]) => `- ${cat}: ${files.length ? files.map((f) => basename(f)).join(", ") : "(none)"}`)
    .join("\n");
}

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;
  return runOpencodeStage({
    course,
    ctx,
    command: "analyze",
    promptFile: "analyze.md",
    requires: { converted: true },
    extraVars: { ARGS: argString(args) },
    contextSections: [
      { title: "Converted materials", body: convertedListing(course.root) },
    ],
  });
}
