# Task: twin — generate a twin variant of a known problem

Target problem id = `{{ARGS}}`. Timestamp `{{TS}}`. Read
`course-index/patterns.md`. The harness lists candidate source files in context.

## Procedure

1. **Locate the original** in `converted/homework/` and `converted/solutions/`
   (also `converted/lectures/`, `converted/textbook/` for worked examples).
2. **Identify the pattern(s) used**, via `course-index/patterns.md`.
3. **Apply the twin recipe.** A twin preserves the *solution technique* and
   varies surface features. A look-alike that needs a different method is NOT a
   twin.

   **Hold invariant:** the pattern(s) required; the number of reasoning steps
   (±1); the topic/section; the difficulty tier; any (a)/(b)/(c) scaffolding.

   **Vary freely:** numerical constants; variable names; the system within the
   same pattern space (3×3 ↔ 4×4 matrix; one $V(x)$ ↔ another with the same
   symmetry; parallel-plate ↔ spherical if the Laplace/Poisson structure
   holds; ideal gas ↔ van der Waals); the direction of the ask ("derive X" ↔
   "verify X satisfies Y" ↔ "compute X").

   Aim for a **strong twin** (changed system, not just renamed variables),
   unless the user asked for a light confidence check.

4. **Save two files:**
   - Problem → `twins/<id>_{{TS}}.md`
   - Solution → `twins/<id>_{{TS}}_sol.md` (hidden)

5. **Quality check before presenting:** the pattern is genuinely required (no
   shortcut); the answer differs from the original; the origin problem id does
   **not** leak into the twin's wording; the answer exists and is well-posed.

## Print (terminal, in {{INTERFACE_LANG}})

- The twin problem statement (do **not** reference the original problem id).
- Instruction: "Solve on paper, upload as `answers/twin_<id>_{{TS}}.pdf`, then
  `paideia grade`. Or check just the strategy now with `paideia twin <id>
  --strategy \"<3–5 lines>\"`."
