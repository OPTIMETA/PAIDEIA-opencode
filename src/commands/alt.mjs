import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveCourse, runOpencodeStage } from "../core/stage.mjs";
import { timestamps } from "../core/workspace.mjs";
import { argString } from "../core/args.mjs";
import { t } from "../core/i18n.mjs";

const MARKER = "exam-radar:v1";

export async function run(args, ctx) {
  const course = resolveCourse(ctx);
  if (!course) return 1;

  // Export source: the pasted argument, else materials/radar.md.
  let exportText = argString(args);
  let origin = "argument";
  if (!exportText.includes(MARKER)) {
    const radar = join(course.root, "materials", "radar.md");
    if (existsSync(radar)) {
      try { exportText = readFileSync(radar, "utf8"); origin = "materials/radar.md"; } catch { /* unreadable — treated as absent */ }
    }
  }

  // Without an export there is nothing to fold in; say so here rather than
  // paying for a model run whose only job is to relay the same message.
  if (!exportText.includes(MARKER)) {
    console.error(t("need_radar", course.lang));
    return 1;
  }

  const body = `(from ${origin})\n\n\`\`\`\n${exportText.trim()}\n\`\`\``;

  return runOpencodeStage({
    course,
    ctx,
    command: "alt",
    promptFile: "alt.md",
    extraVars: { TS: timestamps().dayHm },
    contextSections: [{ title: "Exam Radar export", body }],
  });
}
