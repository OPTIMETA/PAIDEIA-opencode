# Task: analyze — build the course knowledge base

From `converted/**/*.md` produce three index files under `course-index/`. The
**"Converted materials"** context section above lists what is available. If it
is empty, tell the user to run `paideia ingest` first and stop.

`{{ARGS}}` (if present) is the user's declared weak zones, comma-separated —
fold them into the coverage step's Critical tier.

If `course-index/*.md` already exists, warn once (in {{INTERFACE_LANG}}) that you
will overwrite it and that hand-edited content should be backed up, then proceed
(this is a non-interactive run).

## Step 1 — `course-index/summary.md` (topic tree)

Parse section headers (`##`, `###`) from `converted/lectures/*.md` in file
order; build a topic tree. Cross-reference with `converted/textbook/*.md` (often
different numbering). Use the course's own section numbering (§ X.Y, Ch N.M,
Lecture N) if present; otherwise auto-number by order of appearance.

```markdown
# Course Summary

## Scope
Inferred from lecture notes: <one paragraph>.

## Topic tree
- §1 <topic>
  - §1.1 <subtopic> — covered in: lectures/ch01.md, textbook/ch01.md
  - §1.2 ...

## Difficulty ordering (inferred from lecture progression)
Early → foundational definitions. Middle → core theorems. Late → applications.
```

## Step 2 — `course-index/patterns.md` (recurring techniques)

Scan `converted/solutions/*.md` and worked examples in the lecture notes. For
each solution, identify the **key move** — the reusable technique (integration
by parts, change of variable, Cauchy's integral formula, Lagrange multipliers,
separation of variables, diagonalization, …). A move that appears in **≥2
distinct problems** qualifies as a pattern; number them `P1, P2, …` in order of
first appearance.

```markdown
### Pk. <short name>

**Recognition.** <1–2 lines: what triggers this pattern>

**Move.** <1–3 lines: the operation>

**Appears in.** <HW problem IDs, textbook example numbers>

**Topic.** <§ numbers from summary.md>
```

Target **15–30** patterns. Below 10, you missed some — re-scan. Above 40, merge
similar ones. A move seen only once goes in a final "One-off techniques" section,
not a numbered pattern.

## Step 3 — `course-index/coverage.md` (HW ↔ § map)

**Core premise (do not break).** HW coverage is a signal of *exam probability*,
not a completeness metric. Sections with heavy HW are where exam points live;
sections with no HW are reference-only. Do **not** invert this into "no HW =
dangerous blind spot."

```markdown
## Forward map: problem → sections

| Problem | Primary § | Secondary § | Patterns |
|---|---|---|---|
| HW1-P1 | §2.3 | §2.1 | P1, P3 |

## Reverse map: section → exam-probability (from HW density)

| § | Title | HW coverage | Exam tier |
|---|---|---|---|
| §2 | ... | HW1-P1, HW2-P3, HW3-P1 | 🔥🔥 Exam-primary |
| §1 | ... | HW1-P2, HW2-P1 | 🔥 Exam-likely |
| §4 | ... | HW3-P5 | 🟡 Exam-possible |
| §5 | ... | — | ⚪ Low-risk (reference only) |
```

Exam tiers by HW instance count targeting the section:
- 🔥🔥 **Exam-primary** — 3+ HW. Drill hardest.
- 🔥 **Exam-likely** — 2 HW.
- 🟡 **Exam-possible** — 1 HW. Warm-pass review.
- ⚪ **Low-risk** — no HW. Reference only.

Also build the reverse blind-strength annotation where useful (✅✅ Strong 3+,
✅ Covered 2, 🟡 Thin 1, 🔴 Blind 0, 🔴🔴 Critical Blind = 0 instances **and** in
the user's declared weak zone from `{{ARGS}}`).

End `coverage.md` with a **"Recommended drill priority"** section ranking the top
6 items by `(weakness × exam-probability × no-coverage)`, ordered by HW density.

## Step 4 — print summary (terminal)

Prose in {{INTERFACE_LANG}}; keep identifiers verbatim:

```
course-index/ generated.

- summary.md:  <X> sections, <Y> subsections
- patterns.md: <N> recurring patterns (P1..P<N>), <M> one-off techniques
- coverage.md: <A> strongly covered, <B> thin, <C> blind, <D> CRITICAL blind

Top 3 exam-primary sections:
  1. §<X> — <title>  [drill: paideia twin <hw-id> / paideia blind <hw-id>]
  2. §<Y> — <title>
  3. §<Z> — <title>

Next:
  paideia hwmap hot        — exam hot zones
  paideia pattern §<weak>  — pattern cards for a weak section
```
