<h1 align="center">ΠΑΙΔΕΙΑ · Paideia <sub>for opencode</sub></h1>

<p align="center">
  <strong>Your course. Your patterns. Your errors. Your cheatsheet.</strong><br>
  <em>An exam-prep harness that turns your own materials into a permanent, editable, per-course study graph — every artifact shaped by you, not by a generic syllabus. The opencode edition: a standalone harness that drives <a href="https://opencode.ai">opencode</a>, not an editor plugin.</em>
</p>

<p align="center">
  <a href="https://github.com/OPTIMETA/PAIDEIA-Alt"><img height="30" src="https://img.shields.io/badge/Exam_Radar-OPTIMETA_Alt_plugin-333333?style=for-the-badge&labelColor=000000&color=333333" alt="Exam Radar — OPTIMETA Alt plugin"></a>
</p>

<p align="center">
  <sub><em>Capture lectures with <a href="https://github.com/OPTIMETA/PAIDEIA-Alt"><strong>Exam Radar</strong></a> — OPTIMETA's Alt plugin — and study them with Paideia. Pipe a roadmap straight in with <code>paideia alt</code>.</em></sub>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/OPTIMETA/PAIDEIA-opencode?style=flat-square&labelColor=000000&color=333333&cacheSeconds=3600" alt="License">
  <img src="https://img.shields.io/github/stars/OPTIMETA/PAIDEIA-opencode?style=flat-square&logo=github&logoColor=white&labelColor=000000&color=333333&cacheSeconds=3600" alt="GitHub stars">
  <img src="https://img.shields.io/github/last-commit/OPTIMETA/PAIDEIA-opencode?style=flat-square&labelColor=000000&color=333333&cacheSeconds=3600" alt="Last commit">
  <img src="https://img.shields.io/github/languages/top/OPTIMETA/PAIDEIA-opencode?style=flat-square&labelColor=000000&color=333333&cacheSeconds=3600" alt="Top language">
  &nbsp;
  <img src="https://img.shields.io/badge/opencode-000000?style=flat-square&logo=opencode&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="opencode">
  <img src="https://img.shields.io/badge/Harness-000000?style=flat-square&labelColor=000000&color=000000&cacheSeconds=3600" alt="Harness">
  <img src="https://img.shields.io/badge/Node.js-000000?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Node.js">
  <img src="https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Markdown">
  <img src="https://img.shields.io/badge/Python-000000?style=flat-square&logo=python&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Python">
  <img src="https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Ollama">
  <img src="https://img.shields.io/badge/Qwen3--VL-000000?style=flat-square&labelColor=000000&color=000000&cacheSeconds=3600" alt="Qwen3-VL">
  <img src="https://img.shields.io/badge/Tesseract-000000?style=flat-square&labelColor=000000&color=000000&cacheSeconds=3600" alt="Tesseract">
  &nbsp;
  <img src="https://img.shields.io/badge/LaTeX-000000?style=flat-square&logo=latex&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="LaTeX">
  <img src="https://img.shields.io/badge/Obsidian-000000?style=flat-square&logo=obsidian&logoColor=white&labelColor=000000&cacheSeconds=3600" alt="Obsidian">
</p>

<p align="center">
  <a href="./README.ko.md">한국어 README</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/OPTIMETA/PAIDEIA"><strong>PAIDEIA</strong> — original Claude Code edition</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/OPTIMETA/PAIDEIA-codex"><strong>PAIDEIA-codex</strong> — OpenAI Codex CLI edition</a>
</p>

> **Using opencode instead of Claude Code or Codex?** Same tool, same on-disk layout, same license — re-built as a **harness** that drives opencode. The original PAIDEIA is a Claude Code *plugin* (commands + skills the editor loads); this edition is a self-contained program that sits above opencode and drives it, one `opencode run` per stage. Pick whichever agentic runner you already pay for; the study graph it builds is identical and portable across all three.

> **Security notice.** PAIDEIA for opencode installs as a normal npm/Node CLI (`paideia`) and never asks you to download a `.zip`, run an `.exe`, or use any installer. Any other repository using the PAIDEIA name is not affiliated with this project unless it is explicitly linked from this README.

<p align="center">
  <em>Generic study tools teach you the average syllabus. Paideia teaches you <strong>your</strong> syllabus —<br>
  from your professor's notes, your HW emphases, your handwriting, your errors. Every artifact is a markdown file you can edit.</em>
</p>

---

## What Paideia means

In ancient Greece, **Παιδεία** was never the deposit of facts into a passive student. It was the lifelong formation of a complete human being — through structured encounter with primary texts, guided practice under a master, and reflective dialogue that folds feedback into deeper revision.

This harness implements that cycle for the specific, bounded problem of **exam preparation** in math, physics, and engineering courses:

```
  ingest ──▶ analyze ──▶ drill ──▶ grade ──▶ weakmap ──▶ cheatsheet
     ▲                                                        │
     └────────────────── feedback loop ───────────────────────┘
```

Every stage produces a markdown artifact that lives in your course folder forever. Nothing is ephemeral. Nothing is hidden behind an API. Nothing stops working when the next funding winter hits.

---

## Harness, not a plugin

The original PAIDEIA is a *plugin* — slash commands and skills an editor (Claude Code) loads and runs inside its own agent loop. This edition is a **harness**: a self-contained program that sits *above* opencode and drives it.

```
┌──────────────────────────────────────────────────────────────┐
│  paideia  (the harness — owns ALL the exam-prep logic)        │
│                                                              │
│   command  ─▶ deterministic prep        ─▶ compose a stage   │
│   parsing      (render PDFs, run OCR,       SPEC (system +    │
│                discover files, git,         course context + │
│                manage the workspace)        instructions)    │
│                          │                        │          │
│                          ▼                        ▼          │
│                  python / poppler        opencode run --dir … │
│                  / ollama / tesseract    -f <spec>           │
└──────────────────────────────────────────────┬───────────────┘
                                                ▼
                          opencode  (the execution engine)
                    model · tools (Read/Write/Bash/Task) · auth
```

- **The harness owns the study logic.** Every command, prompt, and rule lives in this repo. opencode needs no PAIDEIA plugin, agent, or skill installed.
- **opencode is the substrate.** It provides the model, the file/shell/subagent tools, and authentication. Each PAIDEIA stage is one `opencode run`.
- **Deterministic work stays in the harness** (PDF rasterization, local OCR, the directory skeleton, idempotence, git, PDF archiving, phase detection) — no token cost, no guesswork.
- **The model does the model-shaped work** (vision transcription, pattern extraction, problem generation, strategy grading) via a fully-composed specification.

---

## What generic study tools can't do

Most study tools can't personalize to *your* course, *your* professor, or *your* mistakes — because the product they sell is a generic curriculum.

- **Coursera, edX, Khan Academy** — fixed curriculum; no idea what your professor actually emphasizes.
- **Quizlet, Anki, Brainscape** — you manually curate every card; nothing derives patterns from your own solution manuals.
- **Chegg, Course Hero** — generic solution manuals; not organized around your course's recurring idioms.
- **ChatGPT Study Mode, Gemini "Deep Study", NotebookLM** — no persistent per-course state. Every new session starts cold, and last week's mistakes don't shape this week's drill unless you re-upload and re-explain.

None of them *form* understanding around the specific material in front of you. Paideia does the opposite: every artifact is derived from *your* folder — lecture notes, textbook chapter, HW, solutions, handwritten attempts — and accumulates permanently in plain markdown you can edit.

| Axis | Paideia | Typical edu-SaaS / LLM chat |
|-----|---------|------------------------------|
| Solution patterns (`P1..Pk`) | Extracted from *your course's* own solutions, citing your own files | Generic textbook list, or none |
| Drill priority | Weighted by *your professor's* HW emphasis (HW density = exam tier) | Fixed curriculum, or your own guesswork |
| Cheatsheet | Built from *your* `errors/log.md` — whatever you actually got wrong | Boilerplate from the syllabus |
| Per-course state across sessions | Permanent markdown + YAML, grows as you work | Conversation resets; paid tier for history |
| Editing an artifact you disagree with | Open the `.md` in any editor, save | Read-only UI |
| Version history of your own understanding | `git log` / `git diff` any artifact | Not surfaced |
| Where the artifacts live | Your disk, as text | Remote DB, exportable only with paid tier |

The harness uses opencode (which talks to a paid model) to do the heavy lifting, but everything it produces lives on your disk as plain markdown. If you switch model runners or pause your subscription, the course-index, patterns, error log, weakmaps, and cheatsheets are all still yours to open, read, edit, and diff. The scaffold is the harness; the study graph is yours.

By default, OCR goes through the opencode agent's native vision. If you'd rather the handwritten PDFs never leave the machine, `ollama pull qwen3-vl:8b` is a one-time ~6 GB download that flips every subsequent OCR pass to local Qwen3-VL inference.

---

## The load-bearing principle: HW density = exam probability

Most "study smart" advice tells you to hunt your blind spots. That is **backwards**. The professor has *already told you* where the exam points live — by assigning homework. Sections with heavy HW coverage are 🔥🔥 Exam-primary. Sections with zero HW are ⚪ Low-risk, not "hidden traps". The professor's omission is the strongest possible signal that the topic is off the exam.

Paideia's ranking is explicit about this, and every drill command honors it by default:

| Tier | HW count on section | Treatment | Share of mock-exam points |
|------|---------------------|-----------|---------------------------|
| 🔥🔥 Exam-primary | 3+ | Drill hardest | ≥70% |
| 🔥 Exam-likely | 2 | Drill next | ~25% |
| 🟡 Exam-possible | 1 | Warm-pass review | ≤5% |
| ⚪ Low-risk | 0 | Reference only | 0 |

`paideia quiz all`, `paideia mock`, `paideia hwmap hot` all weight output by this tiering. If you insist on drilling a ⚪ section, the harness complies once and warns you that exam probability is low — your limited time is worth more than an imagined gotcha.

---

## The formation cycle, stage by stage

| Stage | What it does | Commands | Produces |
|-------|-------------|----------|----------|
| **Encounter** | Read the professor's signal | `paideia ingest` | `converted/**/*.md` — every lecture, textbook chapter, HW, solution, as clean markdown |
| **Structure** | Extract the grammar of the course | `paideia analyze` | `course-index/{summary,patterns,coverage}.md` — topic tree, recurring solution patterns (P1..Pk), HW-density exam-tier ranking |
| **Practice** | Active recall weighted by what the professor actually tests | `paideia quiz`, `paideia twin`, `paideia blind`, `paideia chain`, `paideia mock` | `quizzes/`, `twins/`, `chain/`, `mock/` — problems you solve on paper |
| **Reflection** | Your hand-written work becomes a grade | `paideia grade` | `answers/converted/<name>.md` + `errors/log.md` — OCR via agent vision (default), Ollama/Qwen3-VL, or Tesseract; then strategy-based grading |
| **Diagnosis** | Errors compressed into a priority-ranked weakness report | `paideia weakmap` | `weakmap/weakmap_<ts>.md` — append-only history |
| **Distillation** | One page, error-driven, printable | `paideia cheatsheet`, `paideia derive`, `paideia pattern` | `cheatsheet/final.md`, `derivations/<slug>.md` — reference only what you actually need |

Supporting: `paideia hwmap` surfaces HW-density exam-probability, `paideia status` shows where you are in the cycle, and `paideia init-course` bootstraps a fresh course folder.

---

## Install

### Prerequisites

**Required**

- **Node ≥ 18.17** (runs the harness — plain ESM, zero runtime dependencies)
- **[opencode](https://opencode.ai)** (the execution engine) — `npm i -g opencode-ai`, then `opencode auth login` once
- **Python 3.9+** with `pdf2image` + `pillow` (PDF rendering & local OCR); add `reportlab` for `cheatsheet --pdf`
- A Unix-style shell (`bash` / `zsh`). On Windows use [WSL2](https://learn.microsoft.com/windows/wsl/install).
- **macOS**: `brew install poppler tesseract tesseract-lang`
- **Linux (Debian/Ubuntu)**: `apt-get install poppler-utils tesseract-ocr tesseract-ocr-kor`

**Optional — only for the `--ocr=ollama` mode (every page image stays on your machine)**

- `ollama` + the `qwen3-vl:8b` model (~6 GB). `brew install ollama && ollama pull qwen3-vl:8b`.

If you don't install Ollama, Paideia's default OCR engine is the opencode agent's own vision — nothing extra to install.

### Install the harness

```bash
git clone https://github.com/OPTIMETA/PAIDEIA-opencode
cd PAIDEIA-opencode
npm link          # or: npm i -g .   → puts `paideia` on your PATH
paideia doctor    # verify your install (opencode, python, poppler, tesseract)
```

No build step. You can also run it directly: `node /path/to/PAIDEIA-opencode/bin/paideia.mjs …`.

### Per-course bootstrap

Open a terminal inside the folder you want to use for this course, then run:

```bash
paideia init-course
```

This interactively:
1. Asks which interface language you want for this course — `en` (default) or `ko`. All subsequent prompts, drill instructions, and generated MD narrative follow that choice. Structural tokens (file paths, command names, pattern IDs `P1, P2, …`, YAML keys, tier markers) stay in English regardless.
2. Asks which OCR engine you want as default: `vision` (agent vision, no install), `ollama` (local Qwen3-VL), or `tesseract`.
3. Asks for `COURSE_NAME`, `EXAM_DATE`, `EXAM_TYPE`, `USER_WEAK_ZONES`.
4. Creates the directory skeleton (`materials/`, `converted/`, `course-index/`, `quizzes/`, `mock/`, `twins/`, `chain/`, `derivations/`, `cheatsheet/`, `weakmap/`, `answers/converted/`, `errors/`).
5. Writes `.course-meta` (carries `INTERFACE_LANG` + `OCR_ENGINE`, read by every command and by `vision_ocr.py`), an `AGENTS.md` course-context file, and an `opencode.json` whose `instructions` key loads `AGENTS.md` into every run in the folder.
6. `git init` so your prep is versioned from the first keystroke.

Override the OCR engine for a single grade call anytime: `paideia grade --ocr=vision path/to/answer.pdf`.

### Existing course folders (migration note)

A course created without an `INTERFACE_LANG` line in `.course-meta` is treated as `en`. To keep Korean output, add one line — `INTERFACE_LANG: ko` — and that's the whole migration.

---

## Course folder layout

After `paideia init-course`, your course folder looks like this:

```
my-course/
├── .course-meta                     # course name, exam date, interface language (en|ko), OCR engine
├── AGENTS.md                        # course context opencode loads every run (via opencode.json)
├── opencode.json                    # instructions: ["AGENTS.md"] + permissions for unattended runs
├── .gitignore                       # hides raw PDF scans + OCR scratch; the study graph itself stays committed
│
├── materials/                       # YOU DROP RAW FILES HERE (PDF or MD)
│   ├── lectures/                    # professor's notes, slide decks
│   ├── textbook/                    # textbook chapters
│   ├── homework/                    # HW problem sets
│   └── solutions/                   # HW solutions / worked examples
│
├── converted/                       # auto-generated markdown — do not edit
│   ├── lectures/                    # output of `paideia ingest` (vision-transcribed LaTeX)
│   ├── textbook/  homework/  solutions/
│
├── course-index/                    # knowledge base — built by `paideia analyze`
│   ├── summary.md                   # topic tree (§1, §1.1, §2, …)
│   ├── patterns.md                  # recurring solution patterns, labeled P1, P2, …
│   ├── coverage.md                  # HW ↔ § map with 🔥🔥 / 🔥 / 🟡 / ⚪ exam tiers
│   └── radar.md                     # lecture-emphasis signal — imported by `paideia alt`
│
├── answers/                         # YOU DROP HAND-WRITTEN SCAN PDFs HERE
│   └── converted/                   # `paideia grade` writes OCR'd markdown here
│
├── errors/log.md                    # append-only YAML error log (seed for weakmap + cheatsheet)
│
├── quizzes/  mock/  twins/  chain/  # generated problems (each with hidden answer/solution siblings)
├── derivations/  cheatsheet/        # `paideia derive` / `paideia cheatsheet`
├── weakmap/                         # `paideia weakmap` — timestamped, append-only history
└── .paideia/run/                    # the composed stage specs handed to opencode (one per run)
```

**Only two directories are yours to edit by hand:** `materials/` (drop source PDFs/MDs) and `answers/` (drop hand-written scan PDFs). Everything else is produced by commands and is regenerable. `git log <dir>` shows your progress over time, or point Obsidian at the whole folder as a vault.

---

## A reading tip: use Obsidian

Paideia writes everything as plain markdown with LaTeX math (`$...$`, `$$...$$`); you can read it in any editor, but **[Obsidian](https://obsidian.md)** is the natural choice:

- Renders `$...$` / `$$...$$` math via MathJax with zero configuration
- Backlinks let you click from `quizzes/q_<ts>.md` straight into the cited `converted/lectures/chN.md §K`
- The whole course folder is just a vault — point Obsidian at `~/courses/my-course`
- Entirely offline, free, local. Consistent with Paideia's philosophy: your notes, your disk, your tool

The terminal — even with a markdown preview — is bad for math; don't fight that.

## And the lecture end: Alt

Obsidian is the companion at the reading end. **[Alt](https://www.altalt.io/ko/)** is the companion at the other end — where the lectures come in. Alt records and transcribes your lectures, and OPTIMETA's **Exam Radar** plugin runs inside it to rank topics by how strongly the professor emphasized them out loud. Send that into Paideia with `paideia alt`, and the loop closes: **attend the lecture → capture it → extract the exam signal → study what matters.**

---

## Full workflow — an example

### Phase 0 — once per course (15 minutes)

```bash
cp ~/textbooks/ch*.pdf      ~/courses/my-course/materials/textbook/
cp ~/lecture-notes/wk*.pdf  ~/courses/my-course/materials/lectures/
cp ~/hw/hw*.pdf             ~/courses/my-course/materials/homework/
cp ~/hw/hw*_sol.pdf         ~/courses/my-course/materials/solutions/

paideia ingest                     # every PDF → vision pipeline (parallel subagents, LaTeX-faithful)
paideia analyze "weak-zone hints"  # build patterns + coverage + summary
paideia hwmap hot                  # surface 🔥🔥 exam-primary zones
```

### Phase 1 — diagnostic (40 minutes)

```bash
paideia quiz all 20                # broad diagnostic, 20 problems
# solve on paper (40 min), scan to answers/diagnostic.pdf
paideia grade                      # OCR + strategy grade
```

### Phase 2 — targeted drilling (bulk of your prep time)

```bash
paideia weakmap                    # priority-ranked weakness report
paideia blind hw3-p2               # strategy-only drill on a known problem
paideia blind hw3-p2 --strategy "residue theorem (P7), contour fixed, expect 2πi·Σ residues"
paideia twin hw3-p2                # variant with same pattern, new surface
paideia chain 3                    # multi-pattern integration problem
paideia quiz weakmap 5             # 5 problems targeting the latest weakmap
```

### Phase 3 — integration (~90 minutes)

```bash
paideia mock 90                    # full 90-min mock weighted by HW density
# solve on paper, scan, upload to answers/mock_<ts>.pdf
paideia grade                      # grade the mock
```

### Phase 4 — compression (60 minutes, night before exam)

```bash
paideia cheatsheet --pdf           # error-driven one-pager
paideia weakmap                    # review weak zones one more time
```

### Phase 5 — cool-down (10 minutes before exam)

```bash
paideia weakmap                    # top 3 only. Do not learn new things.
```

---

## Commands (16 + status)

| Command | Purpose |
|---------|---------|
| `paideia init-course` | Bootstrap a fresh course folder (interactive: language, OCR engine, metadata, skeleton, git) |
| `paideia doctor [--fix]` | Diagnose the install + workspace (opencode + auth, Python, poppler, tesseract, Ollama/Qwen3-VL, course folders, `.course-meta`, writable paths); `--fix` repairs the permission-free issues |
| `paideia status [--banner]` | Where you are in the cycle: `paideia · <COURSE> · D-N · <phase> · P<k> ↑` |
| `paideia ingest [--force]` | Every PDF in `materials/**` → markdown in `converted/**` via the vision pipeline (one subagent per PDF, LaTeX-faithful) |
| `paideia analyze [hints]` | Build `course-index/{summary,patterns,coverage}.md` |
| `paideia hwmap hot\|<§>` | Surface 🔥🔥 Exam-primary sections ranked by HW density |
| `paideia pattern <§\|Pk\|keyword>` | Show pattern cards from course-index |
| `paideia derive <target>` | Clean reference derivation to `derivations/<slug>.md` |
| `paideia quiz <topic\|§\|weakmap> [N]` | N practice problems, answers hidden in sibling `_answers.md` |
| `paideia blind <id> [--strategy "…"]` | Strategy-check drill on a known problem (present, then grade the strategy) |
| `paideia twin <id> [--strategy "…"]` | Variant of a known problem — same pattern, new surface |
| `paideia chain <N>` | Multi-pattern integration problem combining N patterns |
| `paideia mock <minutes>` | Full mock exam, HW-density weighted |
| `paideia grade [--ocr=<engine>] [path]` | OCR answer PDF via the engine set in `.course-meta` (agent vision / Ollama / Tesseract), strategy-grade, append `errors/log.md` |
| `paideia weakmap [concept]` | Priority-ranked weakness report saved to `weakmap/weakmap_<ts>.md` |
| `paideia cheatsheet [--pdf]` | Error-driven one-pager |
| `paideia alt [paste]` | Import an OPTIMETA Exam Radar (Alt plugin) export → `course-index/radar.md` + a lecture-emphasis column on `coverage.md` + a gold-zone weakmap |

Global flags: `--model <provider/model>` (pass a model to opencode), `--dry-run` (compose the stage spec and print the exact `opencode` command without running the model).

---

## Under the hood

### How a stage runs

1. The harness resolves the course root (`.course-meta`), checks prerequisites, and does any deterministic prep.
2. It composes a **stage spec** = the shared system prompt (`assets/prompts/_system.md`) + a live **course context** block (meta, `D-N`, phase, file listings, target files) + the ported command instructions (`assets/prompts/<command>.md`), interpolating `{{COURSE_NAME}}`, `{{INTERFACE_LANG}}`, `{{TS}}`, ….
3. It writes the spec to `.paideia/run/<stage>-<ts>.md` and runs `opencode run --dir <course> -f <spec> [-m <model>] --dangerously-skip-permissions`.
4. opencode executes the spec against the workspace, writing the artifacts.
5. The harness does any deterministic post-step (clean scratch pages, archive a graded PDF, print the summary table).

`--dry-run` shows the exact command and the composed spec without invoking the model.

### Configuration

- **Model** — `paideia <cmd> --model <provider/model>`, or set `PAIDEIA_MODEL`. Unset → opencode's configured default.
- **Timeout** — each `opencode run` has a safety timeout (default **30 min**); raise it with `PAIDEIA_TIMEOUT=<seconds>` for very large courses, or to allow a slow local model.
- **Permissions** — stages pass `--dangerously-skip-permissions` so they run unattended; set `PAIDEIA_ASK_PERMISSIONS=1` to keep opencode's approval prompts.
- **Python** — `PAIDEIA_PYTHON` overrides the interpreter used for rendering and local OCR.
- **Workspace config** — `init-course` writes an `opencode.json` with `instructions: ["AGENTS.md"]` (ambient course context) and `permission` set to allow, plus a course-scoped `.gitignore`.

### Ingest pipeline: vision for every PDF

`paideia ingest` routes every PDF in `materials/**` through the same vision pipeline. Text extraction was tried first and proved unreliable: even pages that *look* like plain prose silently word-salad as soon as they mix equations, figures, multi-column layouts, or margin notes.

The harness renders every page to PNG at `dpi=160` and resizes each to ≤1800 px on the long edge **before any agent starts reading** (many-image requests hard-reject images >2000 px; 16:9 slides blow past that unless you preempt the resize). Then opencode spawns one subagent per PDF, each reading its own pages *sequentially* and transcribing to LaTeX markdown — output like `$$\hat H = -\frac{\hbar^2}{2m}\partial_x^2 + V(x)$$` instead of `ℏ ∂ p2 ℏ 2 ∂ 2 p ̂`. Because the render is deterministic, the harness owns it (no token cost, and the resize-before-read ordering is guaranteed).

### Hand-writing OCR: three engines, you pick

You solve on paper, scan to PDF, drop it into `answers/`, and run `paideia grade`. The harness converts the scan to markdown via one of three engines, chosen per course (`OCR_ENGINE` in `.course-meta`) and overridable per call (`paideia grade --ocr=<engine>`):

| Engine | Default? | How it runs | When to pick it |
|---|---|---|---|
| `vision` | **Yes** | the harness rasterizes each page → opencode reads each PNG → synthesizes markdown in one pass. No extra model, nothing to install. | The out-of-the-box path. Strong on Korean + LaTeX. Needs a vision-capable model in opencode. |
| `ollama` | opt-in | `vision_ocr.py --engine=ollama` → local Qwen3-VL 8B with automatic tesseract fallback. | You want the page images to never leave the machine. Requires `ollama pull qwen3-vl:8b` once (~6 GB). |
| `tesseract` | opt-in | `vision_ocr.py --engine=tesseract` → pytesseract (`eng`, or `eng+kor` if `INTERFACE_LANG=ko`). | Fastest and lightest; acceptable for typed scans; poor on hand-writing. |

Each engine writes `answers/converted/<stem>.md` with a `<!-- SOURCE: ... -->` / `<!-- TIER: ... -->` header so `grade` can caveat low-confidence OCR.

### Strategy-based grading, not line-by-line

OCR noise in hand-written math makes strict algebraic grading useless — a single misread `∫` vs `∑` cascades. More importantly, **pattern recognition is the actual exam bottleneck**, not arithmetic. The grader checks three things per problem:

1. **Pattern** — did the student pick the right Pk from `course-index/patterns.md`?
2. **Variables** — did they identify the right substitution / basis / index / contour?
3. **End-form** — does their final expression have the right shape (dimensions, asymptotics, structure)?

Errors get logged as YAML to `errors/log.md` with a typed classification (`pattern-missed | wrong-variable | wrong-end-form | algebraic | sign | definition`). This log is the seed for `paideia weakmap` and the heart of the cheatsheet's *traps* section — `paideia cheatsheet` reads it alongside `patterns.md`, `coverage.md`, and `summary.md`.

### Patterns extracted from *your* solutions

`paideia analyze` doesn't ship a generic "calculus moves" list. It reads your course's actual solution manual, extracts recurring solution patterns, and labels them P1, P2, … with worked instances that cite your own `converted/solutions/` files. For a complex analysis course, P3 might be "closed contour + Jordan's lemma + residue at essential singularity." Every discipline has its own moves; only the course itself reveals them.

### Append-only history & status

`weakmap/` never overwrites — every run produces `weakmap/weakmap_<ISO-timestamp>.md`, so `git log weakmap/` is "`git diff` your own understanding over time."

`paideia status` reports where you are in the cycle — `paideia · <COURSE> · D-<days> · <phase> · P<top-miss> ↑` — derived from **activity on disk**, not the calendar: `setup` (no `patterns.md`) → `diag` (no graded error yet) → `drill` (quiz problems + a graded `- problem_id:` entry) → `mock` (a mock-sourced entry appeared) → `cram` (`cheatsheet/final.*` exists) → `cool` (`D-0`). `<top-miss>` is the most frequent `pattern:` tag from the latest weakmap (falling back to `errors/log.md`). `paideia status --banner` prints the same as a two-line session brief.

---

## What ships

```
PAIDEIA-opencode/
├── LICENSE                         # MIT
├── README.md  README.ko.md         # this file + Korean mirror
├── package.json                    # bin: paideia · ESM · zero runtime deps
├── bin/paideia.mjs                 # entry point
├── src/
│   ├── cli.mjs                     # global flags + subcommand dispatch
│   ├── core/                       # the harness engine
│   │   ├── opencode.mjs            # the driver — composes argv, runs `opencode run`
│   │   ├── prompts.mjs             # stage-spec composer (system + context + command)
│   │   ├── render.mjs              # deterministic PDF → PNG (render + resize)
│   │   ├── meta.mjs  workspace.mjs phase.mjs  stage.mjs  args.mjs  i18n.mjs
│   └── commands/                   # 16 commands + status (init-course, ingest, analyze, …)
└── assets/
    ├── prompts/                    # ported command instructions + the shared _system.md
    │   ├── _system.md  ingest.md   analyze.md  grade.md  quiz.md  mock.md
    │   ├── weakmap.md  cheatsheet.md hwmap.md  pattern.md  twin.md  twin_check.md
    │   └── blind.md  blind_check.md chain.md   derive.md   alt.md
    └── scripts/
        ├── render_pages.py         # PDF → PNG render + ≤1800px resize (pdf2image + Pillow)
        ├── vision_ocr.py           # opt-in: ollama qwen3-vl driver + tesseract, for --ocr=ollama|tesseract
        └── md_to_pdf.py            # cheatsheet --pdf: markdown → PDF (pandoc, else reportlab)
```

---

## Design convictions

1. **The terminal is bad for math.** The harness produces markdown files; you read them (ideally in Obsidian).
2. **Typing solutions is slow and error-prone.** You solve on paper, scan, and the harness OCRs locally.
3. **OCR noise is inevitable.** So grading is strategy-based (pattern / variables / end-form), not line-by-line algebra — which is what the actual exam grader evaluates anyway.
4. **Patterns must be extracted from *your* course's solutions** — not a generic list.
5. **Your errors are the most valuable study signal** — more than the textbook, more than the lectures. The cheatsheet is generated from `errors/log.md`, not the syllabus.
6. **HW density tells you the exam.** Your time is finite; spend it where the points are.
7. **Everything is yours to edit.** Patterns, weakmaps, cheatsheets, the error log — all plain markdown/YAML in your own git history. The harness is a scaffold; the study graph is yours.

---

## FAQ

**Does this work for non-math courses?**
It's built around problem-pattern extraction, so it shines in quantitative disciplines: math, physics, EE, CS-theory, ML-theory, statistics, engineering. For history or literature it would still ingest and summarize, but the drill commands assume problems have solution patterns.

**Korean and English mixed materials?**
Yes. Ingestion and OCR are configured for `eng+kor`. Patterns and grading responses honor the language mix of your source materials; set the interface language per course in `init-course`.

**How is this different from just asking an LLM to help me study?**
Per-course persistence. An LLM chat has no memory of the pattern you missed on HW2, no ranking of which sections your professor emphasizes, no notion of "your typical error type." Paideia writes all of that to markdown on your disk. A `paideia weakmap` today is informed by every `paideia grade` since the course began, because `errors/log.md` is append-only.

**Why a harness and not an opencode plugin?**
A plugin lives inside one editor's loop. A harness owns the study logic itself and drives opencode as an interchangeable execution engine — which is why the same study graph is portable across the Claude Code, Codex, and opencode editions. You can read the exact instructions sent to the model (`.paideia/run/*.md`) and re-run any stage with `--dry-run`.

**Do I need Ollama / Qwen3-VL?**
No. The default OCR engine is the opencode agent's native vision — no extra install. Ollama + `qwen3-vl:8b` is opt-in for users who want page images to stay on their machine; `tesseract` is a third option for minimal-install setups.

**Is my data private?**
Your PDFs, markdown, errors, and weakmaps all live in your local course folder. Network traffic depends on the OCR engine: with `vision`, page images flow through opencode's configured model provider; with `ollama` / `tesseract`, nothing leaves the machine.

---

## Connect

<p align="center">
  <a href="https://github.com/TaewoooPark"><img src="https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white&cacheSeconds=3600" alt="GitHub"></a>
  <a href="https://x.com/theoverstrcture"><img src="https://img.shields.io/badge/-X-000000?style=for-the-badge&logo=x&logoColor=white&cacheSeconds=3600" alt="X (Twitter)"></a>
  <a href="https://www.linkedin.com/in/taewoo-park-427a05352"><img src="https://img.shields.io/badge/-LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white&cacheSeconds=3600" alt="LinkedIn"></a>
  <a href="https://taewoopark.com"><img src="https://img.shields.io/badge/-taewoopark.com-000000?style=for-the-badge&logo=safari&logoColor=white&cacheSeconds=3600" alt="Personal site"></a>
</p>

---

## License

MIT. Use freely. Fork and modify for your own courses — the point is that the study graph it builds is yours to shape, not a fixed product you have to live with.

Concept, study model, and original Claude Code plugin: **[OPTIMETA/PAIDEIA](https://github.com/OPTIMETA/PAIDEIA)**. Execution engine: **[opencode](https://opencode.ai)**.

---

<p align="center">
  <em>Generic curricula teach the average student. Παιδεία — formation, one student at a time.</em>
</p>
