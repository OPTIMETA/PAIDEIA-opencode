import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { longRunTimeoutMs, describeSpawnFailure, DEFAULT_LONG_RUN_SECONDS } from "../src/core/proc.mjs";
import { REPO_ROOT } from "./helpers.mjs";

test("longRunTimeoutMs honours PAIDEIA_TIMEOUT and rejects nonsense", () => {
  const saved = process.env.PAIDEIA_TIMEOUT;
  try {
    delete process.env.PAIDEIA_TIMEOUT;
    assert.equal(longRunTimeoutMs(), DEFAULT_LONG_RUN_SECONDS * 1000);

    process.env.PAIDEIA_TIMEOUT = "3600";
    assert.equal(longRunTimeoutMs(), 3_600_000);

    // A cap under a minute cannot succeed; garbage and non-positive values fall
    // back rather than producing an instant, confusing timeout.
    for (const bad of ["abc", "0", "-5", ""]) {
      process.env.PAIDEIA_TIMEOUT = bad;
      assert.equal(longRunTimeoutMs(), DEFAULT_LONG_RUN_SECONDS * 1000, `PAIDEIA_TIMEOUT=${bad}`);
    }
    process.env.PAIDEIA_TIMEOUT = "10";
    assert.equal(longRunTimeoutMs(), 60_000);
  } finally {
    if (saved === undefined) delete process.env.PAIDEIA_TIMEOUT;
    else process.env.PAIDEIA_TIMEOUT = saved;
  }
});

test("describeSpawnFailure names the failure instead of 'exit null'", () => {
  assert.match(describeSpawnFailure({ error: { code: "ENOENT", message: "spawn python3 ENOENT" } }, "x"),
    /could not start: spawn python3 ENOENT/);
  assert.match(describeSpawnFailure({ error: { code: "ETIMEDOUT" }, signal: "SIGTERM" }, "x"), /timed out/);
  assert.match(describeSpawnFailure({ signal: "SIGKILL", status: null }, "x"), /killed by SIGKILL/);
  assert.match(describeSpawnFailure({ status: 2, stderr: "  boom  " }, "x"), /^boom$/);
  assert.match(describeSpawnFailure({ status: 2, stderr: "" }, "render"), /render failed \(exit 2\)/);
});

test("every child process the harness spawns is bounded", () => {
  // An unbounded child means a command that can never be waited out — the one
  // failure mode a user cannot diagnose or recover from without Ctrl-C.
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".mjs")) files.push(p);
    }
  };
  walk(join(REPO_ROOT, "src"));

  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      if (!line.includes("spawnSync(")) return;
      // The options object may wrap onto following lines.
      const window = lines.slice(i, i + 5).join(" ");
      assert.match(window, /timeout:/,
        `${f}:${i + 1} spawns a child with no timeout`);
    });
  }
});
