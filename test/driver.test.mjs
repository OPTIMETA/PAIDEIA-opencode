// The opencode seam: spec composition and the exact argv handed to opencode.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { runStage, printableCommand } from "../src/core/opencode.mjs";
import { interpolate, courseVars, buildSpec } from "../src/core/prompts.mjs";
import { readMeta } from "../src/core/meta.mjs";
import { t, pick } from "../src/core/i18n.mjs";
import { tempCourse, put } from "./helpers.mjs";

const dry = (root, stage = "quiz", extra = {}) =>
  runStage({ root, stage, spec: "# spec", dryRun: true, ...extra });

test("the driver message is passed before -f, never after it", () => {
  // opencode's -f is variadic: a message trailing the file list is swallowed
  // into it and opencode runs with an empty prompt.
  const { argv } = dry(tempCourse());
  assert.equal(argv[0], "run");
  const fileIdx = argv.indexOf("-f");
  const msgIdx = argv.findIndex((a) => a.startsWith("You are running non-interactively"));
  assert.ok(msgIdx > 0, "driver message missing from argv");
  assert.ok(msgIdx < fileIdx, `message (${msgIdx}) must precede -f (${fileIdx})`);
  assert.equal(argv.at(-2), "-f");
  assert.ok(argv.at(-1).endsWith(".md"));
});

test("askPerms keeps the message ahead of -f with no flags in between", () => {
  const { argv } = dry(tempCourse(), "quiz", { askPerms: true });
  assert.ok(!argv.includes("--dangerously-skip-permissions"));
  assert.ok(argv.indexOf("-f") > argv.findIndex((a) => a.startsWith("You are running")));
});

test("permissions are skipped by default and opt-out via env", () => {
  assert.ok(dry(tempCourse()).argv.includes("--dangerously-skip-permissions"));
  process.env.PAIDEIA_ASK_PERMISSIONS = "1";
  try {
    assert.ok(!dry(tempCourse()).argv.includes("--dangerously-skip-permissions"));
  } finally {
    delete process.env.PAIDEIA_ASK_PERMISSIONS;
  }
});

test("an explicit model wins over PAIDEIA_MODEL", () => {
  process.env.PAIDEIA_MODEL = "env/model";
  try {
    assert.ok(dry(tempCourse()).argv.includes("env/model"));
    const { argv } = runStage({ root: tempCourse(), stage: "quiz", spec: "s", dryRun: true, model: "flag/model" });
    assert.ok(argv.includes("flag/model"));
    assert.ok(!argv.includes("env/model"));
  } finally {
    delete process.env.PAIDEIA_MODEL;
  }
});

test("each run writes its own spec file — same stage, same second", () => {
  const root = tempCourse();
  const a = dry(root, "quiz").specPath;
  const b = dry(root, "quiz").specPath;
  assert.notEqual(a, b, "two stages in one second must not share a spec path");
  assert.equal(readFileSync(a, "utf8"), "# spec");
  assert.ok(existsSync(b));
  // Atomic write: no .tmp leftovers in the run directory.
  const runDir = join(root, ".paideia", "run");
  assert.deepEqual(readdirSync(runDir).filter((f) => f.endsWith(".tmp")), []);
});

test("the spec path referenced in the driver text is the one written", () => {
  const root = tempCourse();
  const { argv, specPath } = dry(root, "grade");
  const msg = argv.find((a) => a.startsWith("You are running"));
  const rel = specPath.slice(root.length + 1);
  assert.ok(msg.includes(rel), `driver should cite ${rel}`);
});

test("printableCommand quotes arguments containing whitespace", () => {
  const s = printableCommand(["run", "hello world", "--dir", "/tmp/x"]);
  assert.ok(s.startsWith("opencode run "));
  assert.ok(s.includes('"hello world"'));
  assert.ok(s.includes("--dir /tmp/x"));
});

test("interpolate substitutes known keys and leaves unknown ones intact", () => {
  assert.equal(interpolate("{{A}}/{{B}}", { A: "1" }), "1/{{B}}");
  assert.equal(interpolate("{{N}}", { N: 0 }), "0");
});

test("courseVars derives D-N, phase and language from the workspace", () => {
  const root = tempCourse({ INTERFACE_LANG: "ko", EXAM_DATE: "2030-01-01" });
  const v = courseVars(root, readMeta(root), { ARGS: "all 5" });
  assert.equal(v.INTERFACE_LANG, "ko");
  assert.equal(v.PHASE, "setup");
  assert.equal(v.ARGS, "all 5");
  assert.match(v.DN, /^D-\d+$/);
  assert.equal(v.TOP_MISS, "—");
});

test("courseVars falls back to D-? for an unparseable exam date", () => {
  const root = tempCourse({ EXAM_DATE: "2026-13-45" });
  assert.equal(courseVars(root, readMeta(root)).DN, "D-?");
});

test("buildSpec carries system rules, context and the command prompt", () => {
  const root = tempCourse({ INTERFACE_LANG: "ko" });
  put(root, "course-index/patterns.md", "# patterns");
  const spec = buildSpec({
    promptFile: "quiz.md",
    vars: courseVars(root, readMeta(root), { ARGS: "P3 5", TS: "2026-06-01_0900" }),
    contextSections: [{ title: "Weakmap mode", body: "target P3" }, { title: "Empty", body: "  " }],
  });
  assert.match(spec, /PAIDEIA — quiz stage/);
  assert.match(spec, /INTERFACE_LANG: ko/);
  assert.match(spec, /## Weakmap mode/);
  assert.ok(!spec.includes("## Empty"), "blank context sections are dropped");
  assert.ok(!/\{\{[A-Z0-9_]+\}\}/.test(spec), "every placeholder must be resolved");
});

test("t() localizes and falls back; pick() selects a language half", () => {
  assert.match(t("need_ingest", "ko"), /converted\//);
  assert.equal(t("stage_done", "en", { stage: "quiz" }), "✓ quiz complete.");
  assert.equal(t("stage_done", "fr", { stage: "quiz" }), "✓ quiz complete."); // → en
  assert.equal(t("no_such_key", "en"), "no_such_key");
  assert.equal(pick({ en: "E", ko: "K" }, "ko"), "K");
  assert.equal(pick({ en: "E" }, "ko"), "E");
});
