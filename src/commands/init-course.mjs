// init-course — bootstrap the current directory into a paideia course
// workspace: interactive language/OCR/metadata prompts, the directory skeleton,
// .course-meta, AGENTS.md (course context loaded ambiently by opencode via the
// opencode.json `instructions` key), opencode.json, and git. No model needed.
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { ensureSkeleton } from "../core/workspace.mjs";
import { writeMeta } from "../core/meta.mjs";
import { parseArgs } from "../core/args.mjs";

// On a TTY we ask interactively; otherwise we consume piped lines (one per
// prompt) and fall back to the default once they run out — so the command is
// usable both interactively and in scripts (and never hangs on /dev/null).
function makeAsker(rl) {
  let fed = null;
  if (!stdin.isTTY) {
    try { fed = readFileSync(0, "utf8").split(/\r?\n/); } catch { fed = []; }
  }
  return async function prompt(text, fallback = "") {
    if (fed) {
      const v = (fed.length ? fed.shift() : "").trim();
      return v || fallback;
    }
    const ans = (await rl.question(text)).trim();
    return ans || fallback;
  };
}

const ENGINE_BLOCK = {
  en: `Pick an OCR engine for grading hand-written answers (override later with \`paideia grade --ocr=<engine>\`):

  1) vision    — the opencode agent's native vision (default, no extra install, best on messy handwriting)
  2) ollama    — local Qwen3-VL 8B (nothing leaves the machine, ~6GB initial download)
  3) tesseract — pytesseract only (lightest/fastest, lowest handwriting accuracy)

  Press Enter for: vision
> `,
  ko: `손글씨 답안 채점에 쓸 OCR 엔진을 선택하세요 (나중에 \`paideia grade --ocr=<engine>\`로 덮어쓸 수 있습니다):

  1) vision    — opencode 에이전트 네이티브 비전 (기본값, 추가 설치 불필요, 필기 정확도 가장 높음)
  2) ollama    — 로컬 Qwen3-VL 8B (외부 전송 없음, 최초 ~6GB 다운로드)
  3) tesseract — pytesseract 만 사용 (가장 가볍고 빠름, 필기 정확도는 낮음)

  입력 없이 Enter: vision
> `,
};

function normEngine(s) {
  s = String(s).trim().toLowerCase();
  if (["2", "ollama"].includes(s)) return "ollama";
  if (["3", "tesseract"].includes(s)) return "tesseract";
  return "vision";
}

function agentsMd(m) {
  return `# ${m.COURSE_NAME} — PAIDEIA course context

This is a PAIDEIA exam-prep workspace: a student's own course materials turned
into a persistent, editable study system for a specific math/physics exam. The
\`paideia\` harness drives opencode through the study cycle. This file is loaded
into every run in this folder (via opencode.json \`instructions\`) so the agent
always has the course context below.

## Course metadata

\`\`\`
COURSE_NAME: ${m.COURSE_NAME}
EXAM_DATE: ${m.EXAM_DATE}
EXAM_TYPE: ${m.EXAM_TYPE}
USER_WEAK_ZONES: ${m.USER_WEAK_ZONES}
OCR_ENGINE: ${m.OCR_ENGINE}
INTERFACE_LANG: ${m.INTERFACE_LANG}
\`\`\`

## Workflow philosophy

1. The user does **not** type math in the terminal — the harness writes markdown
   files; the user reads them.
2. The user solves on paper and uploads PDF scans to \`answers/\`; \`paideia grade\`
   OCRs and strategy-grades them.
3. **HW density = exam probability.** Drill 🔥🔥 (3+ HW) sections first; ⚪ (no HW)
   is reference-only, not a blind spot.

## Directory map

\`materials/ converted/ course-index/ quizzes/ mock/ twins/ chain/ derivations/
cheatsheet/ weakmap/ answers/ errors/\` — see the harness README for semantics.

## Conventions

- Prose in INTERFACE_LANG (${m.INTERFACE_LANG}); LaTeX math (\`$...$\`, \`$$...$$\`).
- Keep in English: file paths, command names, pattern IDs (P1, P2…), YAML keys,
  tier markers, and section anchors other stages regex on.
- Cite \`converted/<file>.md\` § in every explanation; reference techniques by Pk.
- Never reveal a solution before the user attempts the problem.
- Append failed attempts to \`errors/log.md\` (canonical YAML schema).
`;
}

const OPENCODE_JSON = (model) => JSON.stringify({
  $schema: "https://opencode.ai/config.json",
  instructions: ["AGENTS.md"],
  permission: { edit: "allow", bash: "allow", webfetch: "allow" },
  ...(model ? { model } : {}),
}, null, 2) + "\n";

const COURSE_GITIGNORE = `.paideia/run/
.paideia/tmp/
# Original answer scans: large, personal, already OCR'd into answers/converted/.
answers/*.pdf
answers/_archive/
answers/converted/.tmp-*/
converted/*/_pages/
cheatsheet/final.pdf
.DS_Store
*.pyc
__pycache__/
# Do NOT ignore errors/log.md — it's the learning record; commit every entry.
# Do NOT ignore answers/converted/*.md or the generated reference solutions.
`;

export async function run(args, _ctx) {
  const { flags } = parseArgs(args);
  const root = process.cwd();
  if (existsSync(join(root, ".course-meta")) && !flags.force) {
    console.log("This folder is already a paideia course (.course-meta exists). "
      + "Edit it directly, run `paideia doctor --fix`, or pass --force to re-bootstrap.");
    return 0;
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const ask = makeAsker(rl);
  try {
    // Step 0 — interface language (always asked in English).
    const langRaw = await ask(
      "Choose interface language (used for all future prompts + generated prose):\n"
      + "  1) en — English (default)\n  2) ko — 한국어\n  Press Enter for: en\n> ", "en");
    const lang = ["2", "ko", "korean", "한국어"].includes(langRaw.toLowerCase()) ? "ko" : "en";

    // Step 1 — OCR engine.
    const engine = normEngine(await ask(ENGINE_BLOCK[lang], "vision"));

    // Step 2 — course metadata.
    const q = lang === "ko"
      ? ["코스 이름 (예: Complex Analysis MATH 405)\n> ", "시험 날짜 (YYYY-MM-DD)\n> ", "시험 종류 (midterm/final/qualifier)\n> ", "약한 토픽 (쉼표로 구분, 또는 unknown)\n> "]
      : ["Course name (e.g. Complex Analysis MATH 405)\n> ", "Exam date (YYYY-MM-DD)\n> ", "Exam type (midterm/final/qualifier)\n> ", "Weak topics (comma-separated, or unknown)\n> "];
    const COURSE_NAME = await ask(q[0], "Untitled Course");
    const EXAM_DATE = await ask(q[1], "");
    const EXAM_TYPE = await ask(q[2], "final");
    const USER_WEAK_ZONES = await ask(q[3], "unknown");

    const meta = { COURSE_NAME, EXAM_DATE, EXAM_TYPE, USER_WEAK_ZONES, OCR_ENGINE: engine, INTERFACE_LANG: lang };

    // Step 3 — skeleton + state files.
    ensureSkeleton(root);
    writeMeta(root, meta);
    writeFileSync(join(root, "AGENTS.md"), agentsMd(meta), "utf8");
    if (!existsSync(join(root, "opencode.json"))) {
      writeFileSync(join(root, "opencode.json"), OPENCODE_JSON(process.env.PAIDEIA_MODEL), "utf8");
    }

    // Step 4 — git.
    if (!existsSync(join(root, ".git"))) {
      spawnSync("git", ["init", "-q"], { cwd: root });
      const gi = join(root, ".gitignore");
      writeFileSync(gi, existsSync(gi) ? readFileSync(gi, "utf8") + "\n" + COURSE_GITIGNORE : COURSE_GITIGNORE, "utf8");
      spawnSync("git", ["add", "-A"], { cwd: root });
      spawnSync("git", ["commit", "-q", "-m", "paideia: initial setup"], { cwd: root });
    }

    // Step 5 — next steps.
    console.log("");
    if (lang === "ko") {
      console.log(`✅ ${COURSE_NAME} 준비 완료. (OCR: ${engine}, lang: ko)\n`);
      console.log("다음 단계:");
      console.log("  1. materials/{lectures,textbook,homework,solutions}/ 에 PDF/MD 넣기");
      console.log("  2. paideia ingest     ← PDF → 마크다운");
      console.log("  3. paideia analyze    ← patterns / coverage / summary 생성");
      console.log("  4. paideia hwmap hot  ← 🔥🔥 시험 핫존 확인");
      console.log("\n설치 상태 점검: paideia doctor");
    } else {
      console.log(`✅ ${COURSE_NAME} ready. (OCR: ${engine}, lang: en)\n`);
      console.log("Next steps:");
      console.log("  1. Drop PDFs/MDs into materials/{lectures,textbook,homework,solutions}/");
      console.log("  2. paideia ingest     ← PDFs → markdown");
      console.log("  3. paideia analyze    ← build patterns / coverage / summary");
      console.log("  4. paideia hwmap hot  ← see 🔥🔥 exam hot zones");
      console.log("\nCheck your install: paideia doctor");
    }
    if (engine === "ollama") {
      console.log("\n(ollama engine) ensure the daemon + model: `ollama serve &` and `ollama pull qwen3-vl:8b`.");
    }
    return 0;
  } finally {
    rl.close();
  }
}
