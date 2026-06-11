import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;

  // Export source: the pasted argument, else materials/radar.md.
  let exportText = argString(args);
  let origin = "argument";
  if (!exportText.includes("exam-radar:v1")) {
    const radar = join(course.root, "materials", "radar.md");
    if (existsSync(radar)) {
      try { exportText = readFileSync(radar, "utf8"); origin = "materials/radar.md"; } catch { /* ignore */ }
    }
  }

  const body = exportText.includes("exam-radar:v1")
    ? `(from ${origin})\n\n\`\`\`\n${exportText.trim()}\n\`\`\``
    : "(empty — no exam-radar:v1 export found in the argument or materials/radar.md)";

  return runOpencodeStage({
    course,
    ctx,
    command: "alt",
    promptFile: "alt.md",
    extraVars: { TS: timestamps().dayHm },
    contextSections: [{ title: "Exam Radar export", body }],
  });
}
