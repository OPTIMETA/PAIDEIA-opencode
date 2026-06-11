// The opencode driver — the seam where the harness hands a fully-composed
// stage specification to opencode and lets opencode's agent loop execute it
// (read materials, write artifacts, run tools) inside the course workspace.
//
// The harness owns WHAT to do (the spec); opencode owns the model, the tools,
// and auth. Each PAIDEIA stage = one `opencode run` invocation.
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { timestamps } from "./workspace.mjs";

/** Is the `opencode` binary present and runnable? */
export function opencodeAvailable() {
  try {
    const r = spawnSync("opencode", ["--version"], { encoding: "utf8", timeout: 15000 });
    return r.status === 0 || (typeof r.stdout === "string" && r.stdout.trim().length > 0);
  } catch {
    return false;
  }
}

/** opencode version string, or null. */
export function opencodeVersion() {
  try {
    const r = spawnSync("opencode", ["--version"], { encoding: "utf8", timeout: 15000 });
    const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
    return out || null;
  } catch {
    return null;
  }
}

/** Authenticated providers, parsed loosely from `opencode auth list`. */
export function opencodeAuthList() {
  try {
    const r = spawnSync("opencode", ["auth", "list"], { encoding: "utf8", timeout: 15000 });
    return `${r.stdout || ""}`.trim();
  } catch {
    return "";
  }
}

const DRIVER = `You are running non-interactively as the execution engine for a PAIDEIA \
exam-prep stage. Your complete task specification is the attached file (also on \
disk at {specRel}). Read it in full, then carry out every step exactly, using \
your file and shell tools to read course materials and write the artifacts it \
names. Do not ask for confirmation and do not stop early — you are driving an \
automated pipeline. When finished, your final message must be the concise \
summary block the specification asks you to print, and nothing else.`;

/**
 * Write the spec to `.paideia/run/<stage>-<ts>.md` and run opencode against it.
 *
 * opts:
 *   root      course workspace (absolute)
 *   stage     short stage name (used for the spec filename + logs)
 *   spec      full markdown specification text
 *   model     optional "provider/model" passthrough
 *   dryRun    print the command instead of executing
 *   askPerms  if true, do NOT pass --dangerously-skip-permissions
 *
 * Returns { code, specPath, argv }.
 */
export function runStage({ root, stage, spec, model, dryRun = false, askPerms = false }) {
  const ts = timestamps().compact;
  const runDir = join(root, ".paideia", "run");
  mkdirSync(runDir, { recursive: true });
  const specPath = join(runDir, `${stage}-${ts}.md`);
  writeFileSync(specPath, spec, "utf8");

  const specRel = relative(root, specPath) || specPath;
  const driver = DRIVER.replace("{specRel}", specRel);

  const argv = ["run", "--dir", root, "-f", specPath];
  const effModel = model || process.env.PAIDEIA_MODEL;
  if (effModel) argv.push("-m", effModel);
  if (!askPerms && !process.env.PAIDEIA_ASK_PERMISSIONS) {
    argv.push("--dangerously-skip-permissions");
  }
  argv.push(driver);

  if (dryRun) {
    const printable = ["opencode", ...argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a))].join(" ");
    return { code: 0, specPath, argv, dryRun: true, printable };
  }

  // Generous safety timeout so a hung/runaway opencode never blocks forever.
  // Override with PAIDEIA_TIMEOUT (seconds); default 30 min.
  const timeoutMs = Math.max(60, Number(process.env.PAIDEIA_TIMEOUT) || 1800) * 1000;
  const r = spawnSync("opencode", argv, { cwd: root, stdio: "inherit", timeout: timeoutMs });
  if (r.error) {
    const timedOut = r.error.code === "ETIMEDOUT" || r.signal === "SIGTERM";
    process.stderr.write(timedOut
      ? `\nopencode timed out after ${Math.round(timeoutMs / 1000)}s (raise PAIDEIA_TIMEOUT to allow longer runs).\n`
      : `\nopencode failed to run: ${r.error.message}\n`);
    return { code: 1, specPath, argv, error: r.error, timedOut };
  }
  const code = typeof r.status === "number" ? r.status : 1;
  return { code, specPath, argv };
}

/** Build the human-readable command string (for logs / dry-run). */
export function printableCommand(argv) {
  return ["opencode", ...argv.map((a) => (/\s/.test(a) ? JSON.stringify(a) : a))].join(" ");
}
