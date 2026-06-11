// Shared command plumbing: resolve the course, optionally enforce prerequisites,
// compose the spec, and drive opencode. Keeps each command file thin.
import { findCourseRoot, readMeta, interfaceLang } from "./meta.mjs";
import { hasConverted, hasIndex } from "./workspace.mjs";
import { opencodeAvailable, runStage } from "./opencode.mjs";
import { courseVars, buildSpec } from "./prompts.mjs";
import { t } from "./i18n.mjs";

/**
 * Resolve the course workspace from ctx.cwd. On failure prints a localized
 * message and returns null.
 */
export function resolveCourse(ctx) {
  const root = findCourseRoot(ctx.cwd || process.cwd());
  if (!root) {
    console.error(t("not_a_course", "en"));
    return null;
  }
  const meta = readMeta(root);
  const lang = interfaceLang(meta);
  return { root, meta, lang };
}

/**
 * Compose + run an opencode-driven stage.
 *
 *   course           { root, meta, lang } from resolveCourse
 *   command          stage name (spec filename + label)
 *   promptFile       assets/prompts/<file>
 *   contextSections  [{ title, body }] injected course context
 *   extraVars        extra {{KEY}} substitutions
 *   ctx              global flags { dryRun, model }
 *   requires         { index?: bool, converted?: bool }
 *
 * Returns a process exit code.
 */
export function runOpencodeStage({
  course, command, promptFile, contextSections = [], extraVars = {}, ctx, requires = {},
}) {
  const { root, meta, lang } = course;

  if (requires.converted && !hasConverted(root)) {
    console.error(t("need_ingest", lang));
    return 1;
  }
  if (requires.index && !hasIndex(root)) {
    console.error(t("need_analyze", lang));
    return 1;
  }
  if (!ctx.dryRun && !opencodeAvailable()) {
    console.error(t("no_opencode", lang));
    return 1;
  }

  const vars = courseVars(root, meta, extraVars);
  const spec = buildSpec({ promptFile, vars, contextSections });

  console.error(t("running_stage", lang, { stage: command }));
  const res = runStage({ root, stage: command, spec, model: ctx.model, dryRun: ctx.dryRun });

  if (res.dryRun) {
    console.log(t("dry_run", lang, { cmd: res.printable }));
    console.log(t("spec_written", lang, { path: res.specPath }));
    return 0;
  }
  if (res.code === 0) {
    console.error(t("stage_done", lang, { stage: command }));
  } else {
    console.error(t("stage_failed", lang, { stage: command, code: res.code }));
  }
  return res.code;
}
