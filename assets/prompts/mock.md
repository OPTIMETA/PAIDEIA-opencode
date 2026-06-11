# Task: mock — generate a full mock exam

`{{ARGS}}` = `<total minutes, default 90> [emphasize=§X,§Y]`. Read
`course-index/summary.md`, `patterns.md`, `coverage.md`. Timestamp: `{{TS}}`.

## 1. Infer exam structure (HW-weighted)

- Typical mid/final: 4–6 problems, ~2 hours.
- Draw problems in proportion to HW density:
  - ≥70% of points from 🔥🔥 Exam-primary (3+ HW)
  - ~25% from 🔥 Exam-likely (2 HW)
  - ≤5% from 🟡 Exam-possible (1 HW)
  - 0% from ⚪ Low-risk — do not invent problems in untested sections.
- If `emphasize=§X,§Y` is given, bias toward those (override the HW weighting
  only where the user explicitly overrides).
- Difficulty: 1 warmup / N−2 standard / 1 hard (multi-pattern).

## 2. Design

For each problem pick: target §, target pattern(s), point value, estimated time.
Ensure patterns from ≥3 different parts of the course appear (tests integration).
The last problem must chain ≥2 patterns.

## 3. Save

- Problems → `mock/exam_{{TS}}.md`
- Solutions → `mock/exam_{{TS}}_sol.md` (full reference + pattern labels + point
  distribution; do **not** display)

## 4. Print (terminal, in {{INTERFACE_LANG}})

The full exam (problem statements with point values and time suggestions), total
summing to 100 (or inferred weighting), and the closing line: "Timer:
<minutes> min. Solve on paper, upload as `answers/mock_{{TS}}.pdf`, then
`paideia grade`." Do **not** reveal which patterns are tested.

## Exam format

```markdown
# Mock Exam — <date>

**Duration**: <minutes> min  **Total**: 100 pts

---

## P1 (<pts>, ~<min> min)

<problem>

## P2 (<pts>, ~<min> min)

<problem>
```
