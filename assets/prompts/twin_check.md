# Task: twin (strategy check)

The user solved a previously generated twin in their head and is describing the
strategy instead of uploading a PDF. Their description is:

> {{STRATEGY}}

The twin target id is `{{ARGS_BASE}}`. Find the most recent
`twins/<id>_*_sol.md` for it (newest mtime) and compare the user's strategy on
three axes:

1. **Pattern** — did they name/imply the correct Pk?
2. **Variable choice** — correct hold-fixed set?
3. **End form** — does the predicted answer structure match?

- If all three ✅: confirm briefly, and optionally copy the relevant part of the
  solution into `derivations/twin-<id>.md` for permanent reference.
- If any ❌: flag the specific axis **without revealing the correct answer**, and
  ask the user to revise (they can re-run `paideia twin <id> --strategy "..."`).

Keep it under ~15 lines, in {{INTERFACE_LANG}}. Do not print the full solution.
