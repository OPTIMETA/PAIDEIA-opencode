# Task: hwmap — project the HW/exam coverage map

Read `course-index/coverage.md` (the harness confirmed it exists). Query =
`{{ARGS}}` (a § number/name, `hot`, `all`, or empty). This is a **read-only**
projection — do not write files.

**Core premise.** HW coverage is an exam-probability signal. Sections the
professor drilled into HW are where the exam points live. "No HW" is a low-risk
zone the professor chose to omit, not a red flag.

## If query is a § number or section name

Show which problems cover that section, plus adjacent sections (§±1) for
context. List the patterns involved. State the exam tier (🔥🔥 / 🔥 / 🟡 / ⚪) and
the drill recommendation that follows.

## If query is `hot` (or `primary`/`exam`/`risk`/`blind` for back-compat)

Return 🔥🔥 Exam-primary and 🔥 Exam-likely sections, ranked by HW density
(highest first). For each:
- list the HW problems that target it (your drill anchors), and
- one-line drill recommendation:
  - many HW, pattern fluent → `paideia twin <hw-id>` (build surface variance)
  - many HW, strategy shaky → `paideia blind <hw-id>` (strategy-check on real HW)
  - solved HW but forgets the pattern → `paideia pattern <Pk>` then
    `paideia quiz §<n> 3`

Do **not** recommend `paideia derive` here by default — derivations are for
reading gaps, not for drilling exam-likely zones.

## If query is `all` or empty

Render an exam-tier distribution table:

| Exam tier | Count | Sections |
|---|---|---|
| 🔥🔥 Exam-primary (3+ HW) | n | list |
| 🔥 Exam-likely (2 HW) | n | list |
| 🟡 Exam-possible (1 HW) | n | list |
| ⚪ Low-risk (no HW) | n | list |

Plus the "Recommended drill priority" section from `coverage.md` (ordered by HW
density, not by absence).

**Low-risk handling.** If the user insists on a ⚪ section, warn once (in
{{INTERFACE_LANG}}): "Sections with no HW have low exam probability. If time is
short, start from 🔥🔥." Then comply.

**Always close** (in {{INTERFACE_LANG}}): "If you could pick just one 🔥🔥 item to
drill right now, which one — and how many minutes do you have?"
