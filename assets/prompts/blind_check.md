# Task: blind — grade the user's strategy (phase 2)

Target problem id = `{{ARGS_BASE}}`. The user's strategy is:

> {{STRATEGY}}

## Procedure

1. Load the solution from `converted/solutions/<n>.md` (or the textbook example).
2. Compare the user's strategy on three axes:
   a. **Pattern identification** — correct Pk(s)?
   b. **Variable choice** — correct hold-fixed set?
   c. **End-form prediction** — matches the actual answer structure?

3. **Feedback (in {{INTERFACE_LANG}}):**
   - ✅ all three → confirm, then copy the relevant solution part into
     `derivations/blind-<id>.md` for permanent reference.
   - ❌ on any axis → say **which** axis failed, **without** revealing the correct
     answer, and ask the user to revise (re-run with a new `--strategy`).
   - If this is clearly a 2nd+ failed attempt on the same axis, give a one-line
     hint referencing the relevant pattern name.

4. **Log errors** (only if the user needed a revision). Append to
   `errors/log.md` with the canonical schema and `source: blind/<id>`. Map the
   failed axis → `error_type`: pattern axis → `pattern-missed`, variable axis →
   `wrong-variable`, end-form axis → `wrong-end-form`.

5. **Close** (in {{INTERFACE_LANG}}): "To check retention on the same type, do one
   variant via `paideia twin <id>`."
