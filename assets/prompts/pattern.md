# Task: pattern — show solution pattern cards

Read `course-index/patterns.md` (the harness confirmed it exists). Query =
`{{ARGS}}`. **Read-only** — do not write files. Keep total output under 40
lines: this is a recognition tool, not a tutorial.

## Filter

- Query starts with `§`/`Ch`/similar → patterns whose **Topic** includes that §.
- Query matches `P\d+` (e.g. `P7`) → that single pattern + its cross-references.
- Keyword (e.g. `maxwell`, `fourier`, `induction`) → patterns matching
  name/recognition/move text, case-insensitive.
- `all` or empty → the full list, grouped by part/topic.

## Render each match as a compact card

```
[Pk] <name>
Recognition: <signal>
Move: <operation, 1–2 lines>
Seen in: <problem IDs>
Topic: <§ numbers>
```

## Close (in {{INTERFACE_LANG}})

"Any pattern here that would be hard to recognize at first sight? Tell me its
number — we'll drill just that one with `paideia blind <problem>`."
