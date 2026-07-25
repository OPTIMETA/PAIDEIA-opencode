// CLI dispatch. Parses a small set of global flags (--dry-run, --model) from
// anywhere in argv, then routes the subcommand to src/commands/<name>.mjs.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { harnessRoot } from "./core/workspace.mjs";

// command name (and aliases) → module file under ./commands/.
// Null-prototype: the lookup key is user input, and on a normal object
// `COMMANDS["constructor"]` resolves to an inherited function — so `paideia
// constructor` slipped past the unknown-command guard and died trying to
// import a module named after the function's source text.
export const COMMANDS = Object.assign(Object.create(null), {
  "init-course": "init-course", init: "init-course",
  ingest: "ingest",
  analyze: "analyze",
  hwmap: "hwmap",
  pattern: "pattern",
  quiz: "quiz",
  mock: "mock",
  twin: "twin",
  blind: "blind",
  chain: "chain",
  derive: "derive",
  grade: "grade",
  weakmap: "weakmap",
  cheatsheet: "cheatsheet",
  alt: "alt",
  doctor: "doctor",
  status: "status",
});

function version() {
  try {
    return JSON.parse(readFileSync(join(harnessRoot(), "package.json"), "utf8")).version;
  } catch {
    return "0.0.0";
  }
}

const HELP = `paideia — exam-prep harness for math/physics courses, driving opencode.

USAGE
  paideia <command> [args]  [--model <provider/model>] [--dry-run]

SETUP
  init-course            Bootstrap this folder into a course workspace (interactive)
  doctor [--fix]         Diagnose the install + workspace; --fix repairs safe issues
  status [--banner]      One-line study status (course · D-N · phase · Pk ↑)

PIPELINE
  ingest [--force]       Convert materials/**/*.pdf → converted/**/*.md (vision)
  analyze [weak,zones]   Build course-index: patterns.md, coverage.md, summary.md
  hwmap [§|hot|all]      Project the HW→exam coverage map
  pattern [§|Pk|kw|all]  Show solution pattern cards

DRILL
  quiz <topic|§|weakmap|all> [N]   Generate N practice problems (+ hidden answers)
  mock <minutes> [emphasize=§X]    Generate a full mock exam
  twin <id> [--strategy "..."]     Twin variant of a known problem
  blind <id> [--strategy "..."]    Strategy-level blind drill (2 phases)
  chain <N>                        Multi-pattern integration problem
  derive <name>                    Save a clean reference derivation
  grade [--ocr=E] [path]           OCR + strategy-grade a hand-written answer scan

REVIEW
  weakmap [concept]      Priority-ranked weakness report
  cheatsheet [--pdf]     One-page exam cheatsheet
  alt [paste|radar.md]   Import an OPTIMETA Exam Radar export (lecture emphasis)

GLOBAL FLAGS
  --model, -m <p/m>      Pass a provider/model to opencode for this run
  --dry-run, -n          Compose the spec + show the opencode command; run nothing
  --version -v, --help -h

EXIT CODES
  0 success · 1 usage or stage error · doctor also uses 2 (blocking issues)

The harness owns the study logic and drives opencode (one run per stage). Model
selection and auth live in opencode — run \`opencode auth login\` once, or see
\`paideia doctor\`.`;

function extractGlobals(argv) {
  const rest = [];
  let dryRun = false, model, help = false, ver = false, error;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run" || a === "-n") dryRun = true;
    else if (a === "--help" || a === "-h") help = true;
    else if (a === "--version" || a === "-v") ver = true;
    else if (a === "--model" || a === "-m") {
      // A trailing `--model` used to bind undefined and fall back to the env
      // var, silently running against a model the user did not ask for.
      if (i + 1 >= argv.length) error = `${a} needs a value, e.g. --model anthropic/claude-sonnet-4-5`;
      else model = argv[++i];
    } else if (a.startsWith("--model=")) {
      model = a.slice("--model=".length);
      if (!model) error = "--model= needs a value, e.g. --model=anthropic/claude-sonnet-4-5";
    } else rest.push(a);
  }
  return { dryRun, model, help, version: ver, rest, error };
}

export async function main(argv) {
  const { dryRun, model, help, version: ver, rest, error } = extractGlobals(argv);
  const command = rest[0];

  if (ver) { console.log(`paideia ${version()}`); return 0; }
  if (help) { console.log(HELP); return 0; }
  if (error) { console.error(`paideia: ${error}`); return 1; }
  if (!command) { console.error(HELP); return 1; } // usage error → stderr, non-zero

  const file = COMMANDS[command];
  if (!file) {
    console.error(`paideia: unknown command '${command}'. Run \`paideia --help\`.`);
    return 1;
  }

  const ctx = { dryRun, model, cwd: process.cwd() };
  const mod = await import(new URL(`./commands/${file}.mjs`, import.meta.url));
  return mod.run(rest.slice(1), ctx);
}
