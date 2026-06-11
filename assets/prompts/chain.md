# Task: chain — generate a multi-pattern integration problem

N (pattern count) = `{{ARGS}}` (default 2, max 4). Read
`course-index/patterns.md`, `coverage.md`. Timestamp `{{TS}}`.

## Procedure

1. **Select N patterns** with constraints:
   - from ≥ N different source problems (span HW/example origins — don't pick two
     patterns both from HW1),
   - at least one from the user's weak zone (per `coverage.md` Critical column),
   - at least one marked ✅✅ Strong (the user has the machinery),
   - composable: pattern A's output = pattern B's input.

2. **Design** a multi-part question:
   - Part (a) establishes context, requires pattern 1
   - Part (b) uses (a)'s result, requires pattern 2
   - Part (c) ties together, requires pattern 3 (if N=3)
   - Final answer synthesizes.

3. **Save:**
   - Problem → `chain/exam_{{TS}}.md`
   - Solution → `chain/exam_{{TS}}_sol.md` (hidden)

4. **Print** (terminal, in {{INTERFACE_LANG}}):
   - The full problem.
   - Estimated time (N × 6 min + 5 min setup).
   - Do **not** reveal which patterns are used.
   - Closing: "Solve on paper, upload as `answers/chain_{{TS}}.pdf`, then
     `paideia grade`. At the end of your solution, also write down *which
     pattern you used* — that's the core of the recognition drill."

## Why multi-pattern chaining

Real exam problems rarely test one pattern in isolation. Chaining tests pattern
**decomposition** (breaking a complex problem into pattern-sized pieces) and
pattern **sequencing** (recognizing that A's output is B's input) — bottlenecks
single-pattern drills don't reach.
