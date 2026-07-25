// Packaging + prompt-coupling integrity: the failures that only appear on
// someone else's machine, after `npm i -g`, when a file did not ship or a
// template asks for a variable no command supplies.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { REPO_ROOT, tempCourse } from "./helpers.mjs";
import { courseVars } from "../src/core/prompts.mjs";
import { readMeta } from "../src/core/meta.mjs";
import { COMMANDS } from "../src/cli.mjs";

const PROMPTS = join(REPO_ROOT, "assets", "prompts");
const commandSource = (file) => readFileSync(join(REPO_ROOT, "src", "commands", file), "utf8");

// Substitutions a command may add on top of courseVars(), and the prompts
// entitled to use them. Anything else in a template is a broken reference.
const EXTRA_VARS = ["ARGS", "ARGS_BASE", "STRATEGY", "TS"];

test("every promptFile a command names exists in assets/prompts", () => {
  const files = readdirSync(join(REPO_ROOT, "src", "commands"));
  let referenced = 0;
  for (const f of files) {
    for (const m of commandSource(f).matchAll(/promptFile:\s*"([^"]+)"/g)) {
      referenced++;
      assert.ok(existsSync(join(PROMPTS, m[1])), `${f} references a missing prompt: ${m[1]}`);
    }
  }
  assert.ok(referenced >= 15, `expected a prompt per stage, found ${referenced}`);
});

test("every {{PLACEHOLDER}} in a prompt is one the harness supplies", () => {
  const supplied = new Set([...Object.keys(courseVars(tempCourse(), readMeta(tempCourse()))), ...EXTRA_VARS]);
  for (const f of readdirSync(PROMPTS).filter((p) => p.endsWith(".md"))) {
    const used = [...readFileSync(join(PROMPTS, f), "utf8").matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((m) => m[1]);
    for (const key of used) {
      assert.ok(supplied.has(key), `assets/prompts/${f} uses {{${key}}}, which no command supplies`);
    }
  }
});

test("each stage prompt is reachable from the command table", () => {
  // A prompt nobody loads is dead weight in the package; a command with no
  // prompt cannot run. _system.md is the shared preamble, loaded by buildSpec.
  const loaded = new Set(["_system.md"]);
  for (const f of readdirSync(join(REPO_ROOT, "src", "commands"))) {
    for (const m of commandSource(f).matchAll(/promptFile:\s*"([^"]+)"/g)) loaded.add(m[1]);
  }
  for (const p of readdirSync(PROMPTS).filter((f) => f.endsWith(".md"))) {
    assert.ok(loaded.has(p), `assets/prompts/${p} is never loaded by any command`);
  }
});

test("every command in the table has a module on disk", () => {
  for (const [name, file] of Object.entries(COMMANDS)) {
    assert.ok(existsSync(join(REPO_ROOT, "src", "commands", `${file}.mjs`)),
      `${name} routes to a missing module: ${file}.mjs`);
  }
});

test("package.json ships everything the harness loads at runtime", () => {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
  // assets/ holds the prompts and python scripts; without them an installed
  // copy fails at the first stage rather than at install time.
  for (const dir of ["bin/", "src/", "assets/"]) {
    assert.ok(pkg.files.includes(dir), `package.json "files" is missing ${dir}`);
  }
  assert.equal(pkg.bin.paideia, "bin/paideia.mjs");
  assert.equal(pkg.type, "module");
  assert.ok(!pkg.files.includes("test/"), "tests should not ship to consumers");
});

test("the bundled python scripts are present and self-describing", () => {
  for (const s of ["render_pages.py", "vision_ocr.py", "md_to_pdf.py"]) {
    const src = readFileSync(join(REPO_ROOT, "assets", "scripts", s), "utf8");
    assert.match(src, /Usage:/, `${s} should document its usage`);
    assert.match(src, /if __name__ == "__main__":/, `${s} should be runnable`);
  }
});

test("text written by the harness is always explicitly UTF-8", () => {
  // The course language may be Korean; a locale-default write corrupts or
  // throws on any non-UTF-8 system.
  for (const s of ["vision_ocr.py", "md_to_pdf.py", "render_pages.py"]) {
    const src = readFileSync(join(REPO_ROOT, "assets", "scripts", s), "utf8");
    for (const m of src.matchAll(/\.(write_text|read_text)\(([^)]*)\)/g)) {
      assert.match(m[2], /encoding=/, `${s}: ${m[0]} must pass an explicit encoding`);
    }
  }
});
