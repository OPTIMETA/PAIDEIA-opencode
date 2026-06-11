# Task: weakmap — priority-ranked weakness report

`{{ARGS}}` is an optional concept string. Timestamp: `{{TS}}`. The latest report
path (if any) is in context.

**Storage rules.** Report dir `weakmap/`; filename
`weakmap/weakmap_{{TS}}.md`; top heading `# Weakmap — <YYYY-MM-DD HH:mm>`.
**Never overwrite** — always a new timestamped file. "Latest report" = newest
mtime in `weakmap/`.

## Branches

### Case A — no argument (fresh snapshot)

1. Read `errors/log.md`; group YAML entries by `pattern`.
2. Within each pattern keep only the entry with the most recent `date` (older
   errors may already be corrected; the snapshot is "current weakness").
3. Cross-reference the blind-spot list in `course-index/coverage.md`.
4. The prior report's "User-declared weaknesses" is **not** re-included in Case A.
5. Write the report and print a chat summary.

### Case B — with argument (concept patch)

1. Read the latest report (if none, start from empty).
2. Extract its "User-declared weaknesses" list → `[A, B, …]`.
3. Treat all of `{{ARGS}}` as a new concept `C`. Dedupe → `[A, B, C]`.
4. Map each concept to `patterns.md`/`summary.md` → related §, Pk, suggested drill.
5. Also run Case A steps 1–3 so the report reflects **both** error data and
   user-declared data.
6. Save under the new timestamp.

## Report format

```markdown
# Weakmap — <YYYY-MM-DD HH:mm>

## Error histogram (latest per pattern)

| Pattern/topic | Latest error type | Date | § |
|---|---|---|---|

## Top 5 weaknesses (priority ranked)

1. **<pattern or topic>** — <one-line summary>
   → Recommended: `paideia <command> <target>`

## User-declared weaknesses

(Populated only in Case B. Empty in Case A.)

## Exam-hot zones not yet drilled

§ marked 🔥🔥 / 🔥 in `coverage.md` with no entry in `errors/log.md`:
- §X, §Y

## One-line verdict

<the single thing to drill first right now>
```

Recommendation rules by `error_type`:
- `pattern-missed` / `wrong-variable` → `paideia blind <problem>` or
  `paideia derive <concept>`
- `algebraic` / `sign` → `paideia quiz <topic> 3`
- `definition` → 5-min re-read of the § in `converted/lectures/`
- `wrong-end-form` → `paideia pattern <Pk>` recognition drill

(⚪ Low-risk sections are excluded from "Exam-hot zones".)

## Terminal output

- One line with the saved file path.
- Do **not** paste the full report — output only **Top 5 + one-line verdict**
  (≤ 30 lines).
- Close (in {{INTERFACE_LANG}}): "Add weak points with `paideia weakmap
  <concept>`; generate problems with `paideia quiz weakmap`."
