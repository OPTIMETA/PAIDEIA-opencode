// End-to-end contracts of the binary itself: exit codes, stdout/stderr split,
// and that every advertised command dispatches. Runs the real entry point.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BIN, REPO_ROOT, tempDir, tempCourse, put } from "./helpers.mjs";
import { parseArgs, argString } from "../src/core/args.mjs";
import { COMMANDS } from "../src/cli.mjs";

const ESC = String.fromCharCode(27);

const paideia = (args, cwd = tempDir(), env = {}) =>
  spawnSync(process.execPath, [BIN, ...args], {
    cwd, encoding: "utf8", env: { ...process.env, ...env },
  });

test("--version prints the package version to stdout", () => {
  const r = paideia(["--version"]);
  const { version } = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), `paideia ${version}`);
});

test("--help exits 0 on stdout; no command is a usage error on stderr", () => {
  const help = paideia(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /USAGE/);

  const none = paideia([]);
  assert.equal(none.status, 1);
  assert.match(none.stderr, /USAGE/);
  assert.equal(none.stdout, "");
});

test("an unknown command fails with a pointer to --help", () => {
  const r = paideia(["frobnicate"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unknown command 'frobnicate'/);
});

test("--model without a value is rejected rather than silently ignored", () => {
  const r = paideia(["quiz", "--model"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--model needs a value/);
});

test("commands outside a course explain how to bootstrap one", () => {
  const r = paideia(["analyze"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /init-course/);
});

test("status is silent outside a course and structured with --json", () => {
  const outside = paideia(["status"]);
  assert.equal(outside.status, 0);
  assert.equal(outside.stdout.trim(), "");

  const root = tempCourse({ COURSE_NAME: "Quantum Mechanics", EXAM_DATE: "2030-05-05" });
  const json = paideia(["status", "--json"], root);
  const state = JSON.parse(json.stdout);
  assert.equal(state.course, "Quantum Mechanics");
  assert.equal(state.phase, "setup");
  assert.ok(state.days > 0);
});

test("status output survives a pipe (exitCode, not process.exit)", () => {
  const root = tempCourse({ COURSE_NAME: "Piped Course" });
  // A shell pipe makes stdout a non-TTY: process.exit() would truncate here.
  const r = spawnSync("sh", ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(BIN)} status --json | cat`],
    { cwd: root, encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(JSON.parse(r.stdout).course, "Piped Course");
});

test("status --banner and the plain one-liner render without escapes", () => {
  const root = tempCourse({ COURSE_NAME: "QM", EXAM_DATE: "2030-05-05" });
  const banner = paideia(["status", "--banner"], root);
  assert.match(banner.stdout, /\[paideia\] QM · D-\d+ · phase=setup/);

  const line = paideia(["status"], root, { NO_COLOR: "1" });
  assert.ok(!line.stdout.includes(ESC), "NO_COLOR must suppress escapes");
  assert.match(line.stdout, /paideia · QM/);
});

test("a dry-run composes the spec and runs nothing", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  const r = paideia(["quiz", "P3", "5", "--dry-run"], root);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\[dry-run\] would run: opencode run/);
  const spec = /spec: (.+)$/m.exec(r.stdout);
  assert.ok(spec, "dry-run must report the spec path");
  assert.match(readFileSync(spec[1].trim(), "utf8"), /PAIDEIA — quiz stage/);
});

test("stages refuse to run before their prerequisites exist", () => {
  const root = tempCourse();
  const noIndex = paideia(["pattern", "--dry-run"], root);
  assert.equal(noIndex.status, 1);
  assert.match(noIndex.stderr, /course-index\//);

  const noConverted = paideia(["analyze", "--dry-run"], root);
  assert.equal(noConverted.status, 1);
  assert.match(noConverted.stderr, /converted\//);
});

test("prerequisite errors are localized by INTERFACE_LANG", () => {
  const root = tempCourse({ INTERFACE_LANG: "ko" });
  const r = paideia(["analyze", "--dry-run"], root);
  assert.match(r.stderr, /먼저 `paideia ingest`/);
});

test("commands that need an argument say so", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  for (const [cmd, rx] of [["derive", /usage: paideia derive/], ["twin", /usage: paideia twin/], ["blind", /usage: paideia blind/]]) {
    const r = paideia([cmd, "--dry-run"], root);
    assert.equal(r.status, 1, `${cmd} should fail without an argument`);
    assert.match(r.stderr, rx);
  }
});

test("a valueless --strategy is an error, not a silently different command", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  for (const cmd of ["twin", "blind"]) {
    for (const arg of ["--strategy", "--strategy="]) {
      const r = paideia([cmd, "HW3-P2", arg, "--dry-run"], root);
      assert.equal(r.status, 1, `${cmd} ${arg} should not fall through`);
      assert.match(r.stderr, /--strategy needs your strategy/);
    }
  }
});

test("a real --strategy routes to the check stage", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  const r = paideia(["twin", "HW3-P2", "--strategy", "apply P3, hold omega fixed", "--dry-run"], root);
  assert.equal(r.status, 0, r.stderr);
  const spec = /spec: (.+)$/m.exec(r.stdout);
  const body = readFileSync(spec[1].trim(), "utf8");
  assert.match(body, /twin_check stage/);
  assert.match(body, /apply P3, hold omega fixed/);
});

test("quiz weakmap fails fast when no weakmap report exists", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  // The harness knows there is nothing to target; it must not spend a model
  // run having the agent relay that.
  const r = paideia(["quiz", "weakmap", "--dry-run"], root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No weakmap report yet/);
  assert.ok(!/would run/.test(r.stdout), "no stage should have been composed");

  put(root, "weakmap/weakmap_2026-06-01_0900.md", "pattern: P3");
  const ok = paideia(["quiz", "weakmap", "--dry-run"], root);
  assert.equal(ok.status, 0, ok.stderr);
});

test("alt fails fast without an exam-radar export", () => {
  const root = tempCourse();
  const r = paideia(["alt", "--dry-run"], root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No exam-radar:v1 export found/);

  put(root, "materials/radar.md", "<!-- exam-radar:v1 -->\nOrthogonality 88");
  const ok = paideia(["alt", "--dry-run"], root);
  assert.equal(ok.status, 0, ok.stderr);
  const spec = /spec: (.+)$/m.exec(ok.stdout);
  assert.match(readFileSync(spec[1].trim(), "utf8"), /from materials\/radar\.md/);
});

test("doctor checks the node version against engines", () => {
  const r = paideia(["doctor"], tempDir());
  assert.match(r.stdout, /checks passed/);
  // This process satisfies engines, so node must not appear among the problems.
  assert.ok(!/✗ node/.test(r.stdout), "node should pass on a supported runtime");
});

test("grade rejects an unknown OCR engine instead of falling back silently", () => {
  const root = tempCourse();
  put(root, "answers/hw01.md", "# answer");
  const r = paideia(["grade", "--ocr=nonsense", "--dry-run"], root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unknown OCR engine 'nonsense'/);
});

test("grade reports when there is no answer to grade", () => {
  const r = paideia(["grade", "--dry-run"], tempCourse());
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No answer file found/);
});

test("ingest asks for materials when the folders are empty", () => {
  const r = paideia(["ingest", "--dry-run"], tempCourse());
  assert.equal(r.status, 1);
  assert.match(r.stderr, /materials\//);
});

test("a markdown-only ingest converts without needing opencode", () => {
  const root = tempCourse();
  put(root, "materials/lectures/L1.md", "# Lecture 1\n\n$$E = mc^2$$\n");
  // PATH without opencode: the .md pass-through is deterministic and must not
  // be gated on a model runtime it never uses.
  const r = paideia(["ingest"], root, { PATH: "/nonexistent" });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!/opencode is not installed/.test(r.stderr), r.stderr);
  const out = readFileSync(join(root, "converted", "lectures", "L1.md"), "utf8");
  assert.match(out, /method: passthrough/);
  assert.match(out, /E = mc\^2/);

  // Second run is idempotent: already converted, nothing to do.
  const again = paideia(["ingest"], root, { PATH: "/nonexistent" });
  assert.equal(again.status, 0);
  assert.match(again.stdout, /\| lectures \| 0 \| 1 \| 0 \|/);
});

test("ingest skips a PDF whose stem is already claimed by a markdown file", () => {
  const root = tempCourse();
  put(root, "materials/homework/HW01.md", "# HW1");
  put(root, "materials/homework/HW01.pdf", "%PDF-1.4");
  const r = paideia(["ingest"], root, { PATH: "/nonexistent" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /a same-named \.md already claims HW01\.md/);
});

test("every routed command dispatches to a module that loads", () => {
  const root = tempCourse();
  put(root, "course-index/patterns.md", "# patterns");
  const names = Object.keys(COMMANDS);
  assert.ok(names.length >= 17, `expected the full command table, saw ${names.length}`);
  for (const cmd of names) {
    const r = paideia([cmd, "--dry-run"], root);
    assert.ok(!/unknown command/.test(r.stderr), `${cmd} is routed but not reachable`);
    // A missing module or an import-time throw surfaces as a stack trace.
    assert.ok(!/ERR_MODULE_NOT_FOUND|at file:\/\//.test(r.stderr), `${cmd} crashed: ${r.stderr}`);
  }
});

test("every command in the table is documented in --help", () => {
  const help = paideia(["--help"]).stdout;
  const aliases = new Set(["init"]); // shorthand for init-course; not documented separately
  for (const cmd of Object.keys(COMMANDS)) {
    if (aliases.has(cmd)) continue;
    assert.ok(new RegExp(`^ {2}${cmd}\\b`, "m").test(help), `${cmd} is missing from --help`);
  }
});

test("doctor reports on the install and exits 0/1/2 by severity", () => {
  const r = paideia(["doctor"], tempDir());
  assert.ok([0, 1, 2].includes(r.status), `unexpected doctor status ${r.status}`);
  assert.match(r.stdout, /paideia doctor — global mode/);
  assert.match(r.stdout, /checks passed/);
  assert.ok(!/✗ bundled assets/.test(r.stdout), "this install should have its bundled assets");
});

test("doctor --fix repairs a course skeleton", () => {
  const root = tempCourse();
  const r = paideia(["doctor", "--fix"], root);
  assert.ok([0, 1, 2].includes(r.status));
  assert.equal(readFileSync(join(root, "errors", "log.md"), "utf8").includes("# Error log"), true);
});

test("parseArgs handles --key=value, --key value, flags and positionals", () => {
  const { flags, positionals } = parseArgs(
    ["a", "--ocr=tesseract", "--strategy", "use P3 then P7", "--force", "b"], ["strategy"]);
  assert.equal(flags.ocr, "tesseract");
  assert.equal(flags.strategy, "use P3 then P7");
  assert.equal(flags.force, true);
  assert.deepEqual(positionals, ["a", "b"]);
  assert.equal(argString(positionals), "a b");
});

test("parseArgs leaves a value flag boolean when no value follows", () => {
  assert.equal(parseArgs(["--strategy"], ["strategy"]).flags.strategy, true);
  assert.equal(parseArgs(["--strategy", "--force"], ["strategy"]).flags.strategy, true);
});

test("parseArgs flags carry no inherited names", () => {
  // Commands test presence with `"strategy" in flags`; on a normal object that
  // is also true for every Object.prototype member.
  const { flags } = parseArgs(["--force"]);
  assert.ok("force" in flags);
  for (const inherited of ["toString", "constructor", "hasOwnProperty", "valueOf"]) {
    assert.ok(!(inherited in flags), `${inherited} must not be visible as a flag`);
  }
  // `--__proto__=x` is an ordinary key, not a prototype assignment.
  const proto = parseArgs(["--__proto__=polluted"]).flags;
  assert.equal(proto["__proto__"], "polluted");
  assert.equal({}.polluted, undefined);
});
