# Task: cheatsheet — one-page exam cheatsheet

`{{ARGS}}` may contain `--pdf`. Read `course-index/patterns.md`, `coverage.md`,
`summary.md`, and `errors/log.md`.

## 1. Collect highest-value items

- Top 5 patterns by frequency of appearance (from `patterns.md`).
- All boxed final results from `derivations/*.md`.
- The user's most-frequent error types (from `errors/log.md`) — stated as the
  **correction**, not the error.
- 🔴 blind-spot sections with one key formula each.

## 2. Structure (target: fits one page @ 10pt)

```markdown
# <Course name> — Cheatsheet

_Generated <date>. For exam reference only._

## Core formulas
<compact table/list of boxed results from derivations/>

## Pattern quick-ref
| Pk | Recognition | Move |
|---|---|---|
...top 8 patterns only

## Traps to remember (from my errors/log)
- <correction 1>
...max 5

## Blind-spot formulas (memorize — no HW drilled them)
<one boxed formula per blind-spot section>
```

## 3. Write `cheatsheet/final.md`.

That is the only file you produce. If the user passed `--pdf`, the **harness**
converts `final.md` → `cheatsheet/final.pdf` deterministically after you return
— do **not** attempt to generate the PDF yourself.

## 4. Print (terminal, in {{INTERFACE_LANG}})

The cheatsheet filename, a rough word count / page estimate, and the closing
line: "Check what materials your exam allows. If none, scan this and commit it
to memory."

## Density tips

- Formulas only, no sentences — anything derivable in your head doesn't belong.
- Use abbreviations the user already knows.
- Group by *when you'll need it*, not pedagogical order.
- The "traps" section is disproportionately valuable — it is tailored to the
  user's own mistakes.
