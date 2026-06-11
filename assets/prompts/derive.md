# Task: derive — save a clean reference derivation

Target = `{{ARGS}}` (an equation or theorem name). Read `course-index/summary.md`
to resolve it. This command is a **pure reference-writer** — do **not** quiz or
prompt the user.

## Procedure

1. **Locate the derivation** in `converted/textbook/*.md` and
   `converted/lectures/*.md`. If in both, prefer the textbook (usually cleaner).
2. **If not in the materials**, derive it from first principles using standard
   techniques for the course's domain; cite which earlier results you use.
3. **Write a clean reference** with: stated definitions/assumptions; each step
   with a one-line "why"; a boxed final result; a short interpretation; common
   pitfalls.
4. **Save to** `derivations/<slug>.md` (slug = lowercase-hyphenated target name).
5. **Print** (in {{INTERFACE_LANG}}): "Saved `derivations/<slug>.md`. Open and
   read; ask if any step is unclear."

## Format

If INTERFACE_LANG is `ko`, translate the bold labels; keep LaTeX/paths/equations
unchanged.

```markdown
# <Target name>

**Goal.** <what we want to derive>

**Starting point.** <definition / law / axiom / earlier result>

---

### Step 1 — <description>

$$<step equation>$$

<why this step>

### Step 2 — ...

---

**Result.**
$$\boxed{\;<final>\;}$$

**Interpretation.** <1–2 sentences>

**Pitfalls.**
- <common error 1>
- <common error 2>

**Reference.** <source section in converted/>
```

Use `$...$` / `$$...$$`. No emojis except a final $\blacksquare$ / ∎ at the result.
