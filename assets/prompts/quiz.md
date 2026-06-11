# Task: quiz — generate N practice problems

`{{ARGS}}` = `<topic | § | "weakmap" | "all">  [N=5]`. First token is the topic,
§ number, or the literal `weakmap`; optional second token is the problem count
(default 5). Read `course-index/summary.md`, `patterns.md`, `coverage.md` (the
harness confirmed the index exists).

The harness has injected a timestamp `{{TS}}` and (in weakmap mode) the path of
the latest weakmap report.

## 0. Weakmap mode (first arg is `weakmap`)

- Parse the latest `weakmap/weakmap_*.md` (path in context). If none, tell the
  user to run `paideia weakmap` first and stop.
- From its **Top 5 weaknesses** and **User-declared weaknesses** sections collect
  target (§, Pk) pairs. Design the N-problem mix so every top weakness is covered
  at least once; user-declared items take priority; spread the rest over
  top-ranked error patterns.
- Save to `quizzes/weakmap_{{TS}}.md` (+ `_answers.md`). In each footer, cite
  which weakness entry the problem targets. Skip step 1; continue from step 2.

## 1. Resolve topic

Map the argument to specific sections + patterns via `coverage.md`/`patterns.md`.
- **`all`** (broad diagnostic): weight by HW density — ~70% from 🔥🔥, ~25% from
  🔥, ≤5% from 🟡, 0% from ⚪. Never sample ⚪ unless explicitly named.
- **Specific § / topic**: if the user names a ⚪ section, comply but warn once (in
  {{INTERFACE_LANG}}): "No HW touched this §, so exam probability is low. Still
  drill it?"

## 2. Design the mix (N problems)

- 1 warmup (definition recall / fastest pattern application)
- N−3 standard (single-pattern derivation/computation; prefer patterns that
  recur across multiple HW problems in the target sections)
- 1 applied (pattern in a specific system / numerical case)
- 1 conceptual trap (a common student error — sign, wrong variable held fixed,
  wrong pattern chosen)

## 3. Save

- Problems → `quizzes/<topic>_{{TS}}.md`
- Answers → `quizzes/<topic>_{{TS}}_answers.md` (do **not** display)

Per-problem format:

```markdown
## P<n>  (<points if applicable>)

<problem statement, including any referenced figures>

<blank line for working>

---
*(setup: §<section>, tests pattern: P<k>)*   ← at the very bottom, small
```

If INTERFACE_LANG is `ko`, render the italic footer in Korean
(`*(문제 설정: §<section>, 테스트 패턴: P<k>)*`); the `§…`/`P…` tokens stay verbatim.

## 4. Print (terminal, in {{INTERFACE_LANG}})

- The quiz filename, so the user knows where it is.
- All N problem statements, numbered.
- Closing: "Solve on paper, scan, upload as `answers/<topic>_{{TS}}.pdf`, then
  `paideia grade`."

Do **not** ask the user to type answers in the terminal. If they start to,
remind them of the PDF-upload workflow.
