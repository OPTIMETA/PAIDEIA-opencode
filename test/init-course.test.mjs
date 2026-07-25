// init-course is the most stateful command — it creates the whole workspace,
// the metadata every other stage reads, and the git ignore rules that keep a
// student's scans out of a repo. Driven here non-interactively (piped answers,
// one per prompt), which is also the path a script or CI would take.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, appendFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BIN, tempDir } from "./helpers.mjs";
import { SKELETON } from "../src/core/workspace.mjs";
import { readMeta } from "../src/core/meta.mjs";

const ANSWERS = ["1", "1", "Complex Analysis", "2030-09-09", "midterm", "residues"];

function init(cwd, { input = ANSWERS.join("\n") + "\n", args = [] } = {}) {
  return spawnSync(process.execPath, [BIN, "init-course", ...args], { cwd, input, encoding: "utf8" });
}

test("init-course builds the whole workspace from piped answers", () => {
  const root = tempDir();
  const r = init(root);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Complex Analysis ready/);

  for (const d of SKELETON) assert.ok(existsSync(join(root, d)), `${d} was not created`);

  const meta = readMeta(root);
  assert.equal(meta.COURSE_NAME, "Complex Analysis");
  assert.equal(meta.EXAM_DATE, "2030-09-09");
  assert.equal(meta.EXAM_TYPE, "midterm");
  assert.equal(meta.USER_WEAK_ZONES, "residues");
  assert.equal(meta.OCR_ENGINE, "vision");
  assert.equal(meta.INTERFACE_LANG, "en");

  assert.match(readFileSync(join(root, "AGENTS.md"), "utf8"), /^# Complex Analysis — PAIDEIA/);
  const cfg = JSON.parse(readFileSync(join(root, "opencode.json"), "utf8"));
  assert.deepEqual(cfg.instructions, ["AGENTS.md"]);
  assert.match(readFileSync(join(root, "errors", "log.md"), "utf8"), /# Error log/);
});

test("the Korean path writes ko metadata and ko next-steps", () => {
  const root = tempDir();
  const r = init(root, { input: ["2", "1", "양자역학", "2030-09-09", "final", "스핀"].join("\n") + "\n" });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(readMeta(root).INTERFACE_LANG, "ko");
  assert.match(r.stdout, /다음 단계:/);
});

test("the OCR engine choice is recorded", () => {
  const root = tempDir();
  init(root, { input: ["1", "2", "QM", "2030-09-09", "final", "spin"].join("\n") + "\n" });
  assert.equal(readMeta(root).OCR_ENGINE, "ollama");
});

test("a second run refuses without --force", () => {
  const root = tempDir();
  init(root);
  const again = init(root);
  assert.equal(again.status, 0);
  assert.match(again.stdout, /already a paideia course/);
  assert.equal(readMeta(root).COURSE_NAME, "Complex Analysis"); // untouched
});

test("--force re-bootstraps and backs up an edited AGENTS.md", () => {
  const root = tempDir();
  init(root);
  appendFileSync(join(root, "AGENTS.md"), "\nMY OWN NOTES\n");

  const r = init(root, {
    input: ["1", "1", "Complex Analysis II", "2031-01-02", "final", "contours"].join("\n") + "\n",
    args: ["--force"],
  });
  assert.equal(r.status, 0, r.stderr);
  // The README calls AGENTS.md editable course context; a re-bootstrap must
  // not silently discard what the student wrote in it.
  assert.match(readFileSync(join(root, "AGENTS.md.bak"), "utf8"), /MY OWN NOTES/);
  assert.match(readFileSync(join(root, "AGENTS.md"), "utf8"), /^# Complex Analysis II/);
  assert.equal(readMeta(root).EXAM_DATE, "2031-01-02");
});

test("the ignore rules land once, even in a repo that already has a .gitignore", () => {
  const root = tempDir();
  writeFileSync(join(root, ".gitignore"), "dist/\n");
  spawnSync("git", ["init", "-q"], { cwd: root }); // pre-existing repo: we do not init
  init(root);

  const gi = readFileSync(join(root, ".gitignore"), "utf8");
  assert.match(gi, /^dist\/$/m, "the existing rules must survive");
  assert.match(gi, /answers\/\*\.pdf/, "answer scans must be ignored");
  assert.match(gi, /\.paideia\/run\//, "run scratch must be ignored");
  assert.ok(!/^errors\/log\.md$/m.test(gi), "the learning record must stay tracked");

  init(root, { args: ["--force"] });
  const twice = readFileSync(join(root, ".gitignore"), "utf8");
  assert.equal(twice.split("paideia course workspace").length - 1, 1, "rules were appended twice");
});

test("an unparseable exam date warns instead of silently degrading D-N", () => {
  const root = tempDir();
  const r = init(root, { input: ["1", "1", "QM", "2026-13-45", "final", "spin"].join("\n") + "\n" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /EXAM_DATE '2026-13-45' is unparseable/);
  assert.equal(readMeta(root).EXAM_DATE, "2026-13-45"); // kept verbatim for the user to fix
});

test("no stdin at all falls back to defaults without hanging", () => {
  const root = tempDir();
  // Attaching readline to a non-TTY stdin used to race the synchronous read of
  // the same fd and could hold the process open after the work was done.
  const r = spawnSync(process.execPath, [BIN, "init-course"], {
    cwd: root, input: "", encoding: "utf8", timeout: 20000,
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.error, `init-course did not exit on its own: ${r.error?.message}`);
  const meta = readMeta(root);
  assert.equal(meta.COURSE_NAME, "Untitled Course");
  assert.equal(meta.EXAM_TYPE, "final");
  assert.equal(meta.INTERFACE_LANG, "en");
});
