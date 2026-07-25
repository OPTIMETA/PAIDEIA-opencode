// The spec is the harness's actual output — everything else is plumbing around
// composing it. These run every stage against a fully-populated course and
// assert the composed spec is something a model can execute.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { BIN, fullCourse } from "./helpers.mjs";

// Every stage, with arguments that exercise its real entry points.
const STAGES = [
  ["analyze", []],
  ["hwmap", ["all"]],
  ["pattern", ["all"]],
  ["quiz", ["all", "5"]],
  ["quiz", ["weakmap"]],
  ["mock", ["90"]],
  ["twin", ["HW1-P2"]],
  ["twin", ["HW1-P2", "--strategy", "apply P1, hold the contour fixed"]],
  ["blind", ["HW1-P2"]],
  ["blind", ["HW1-P2", "--strategy", "apply P1, hold the contour fixed"]],
  ["chain", ["3"]],
  ["derive", ["Cauchy integral formula"]],
  ["grade", []],
  ["weakmap", []],
  ["weakmap", ["residues"]],
  ["cheatsheet", []],
  ["alt", []],
];

function compose(root, cmd, args) {
  const r = spawnSync(process.execPath, [BIN, cmd, ...args, "--dry-run"],
    { cwd: root, encoding: "utf8" });
  // The label is localized ("spec:" / "스펙:"), so key on the path itself.
  const m = /^\s*\S+:\s*(\S*[/\\]\.paideia[/\\]run[/\\]\S+\.md)\s*$/m.exec(r.stdout);
  return { r, spec: m ? readFileSync(m[1], "utf8") : null };
}

for (const [cmd, args] of STAGES) {
  const label = [cmd, ...args].join(" ").slice(0, 48);
  test(`stage "${label}" composes an executable spec`, () => {
    const root = fullCourse();
    const { r, spec } = compose(root, cmd, args);
    assert.equal(r.status, 0, `${label} failed: ${r.stderr}`);
    assert.ok(spec, `${label} produced no spec`);

    // An unresolved placeholder means the command and its prompt disagree on a
    // variable name, and the literal `{{TS}}` ships to the model.
    const unresolved = [...new Set([...spec.matchAll(/\{\{[A-Z0-9_]+\}\}/g)].map((x) => x[0]))];
    assert.deepEqual(unresolved, [], `${label} left placeholders unresolved`);

    // The three parts every spec is made of.
    assert.match(spec, /PAIDEIA stage spec/);
    assert.match(spec, /## Course context \(provided by the harness\)/);
    assert.match(spec, /INTERFACE_LANG: en/);
    assert.ok(spec.length > 800, `${label} spec looks truncated (${spec.length} chars)`);
  });
}

test("the spec carries the course's language through to the prompt", () => {
  const root = fullCourse({ INTERFACE_LANG: "ko" });
  const { spec } = compose(root, "quiz", ["all", "5"]);
  assert.match(spec, /INTERFACE_LANG: ko/);
  assert.match(spec, /INTERFACE_LANG = ko/); // the _system.md language rule
});

test("the spec states the phase and D-N the harness computed", () => {
  const root = fullCourse({ EXAM_DATE: "2030-01-01" });
  const { spec } = compose(root, "pattern", ["all"]);
  assert.match(spec, /- Current phase: (setup|diag|drill|mock|cram|cool)/);
  assert.match(spec, /\(D-\d+\)/);
});
