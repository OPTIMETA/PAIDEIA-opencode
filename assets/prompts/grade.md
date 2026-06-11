# Task: grade — transcribe (if needed) and strategy-grade an answer scan

The harness has resolved the target answer, the OCR engine, and the reference
solution. See the **"Grading job"** context section above for: the target file,
its stem, the OCR engine, the transcription state, and the candidate reference
solution(s).

## Step 1 — get the answer into markdown

Follow whichever case the context specifies:

- **Transcription ready** (engine `ollama`/`tesseract`, or the target was already
  `.md`): read `answers/converted/<stem>.md`. Note its `<!-- TIER: ... -->`
  header for the confidence caveat below.
- **Pages rendered** (engine `vision`, target was a PDF): the context gives a
  directory of `page-1.png … page-N.png`. **Read each PNG in order** and
  synthesize one clean markdown file at `answers/converted/<stem>.md` following
  this transcription contract:
  - Prose stays in its original language (English, Korean, …) — do not translate.
  - Math as `$...$` / `$$...$$`. Preserve problem numbering (P1, (1), (a), …).
  - Do NOT interpret or grade here — pure transcription. `[?]` for ambiguous
    glyphs. Skip crossed-out work. Markdown only.

  Header the file with:
  ```markdown
  # Vision-OCR transcription

  <!-- SOURCE: <stem>.pdf, agent-vision (native), N pages -->

  ## Page 1

  <transcription>
  ```

## Step 2 — strategy-based grading (do NOT grade OCR algebra)

Hand-written math OCR is noisy: Greek letters misread as Latin ($\alpha\to a$,
$\pi\to n$), fractions flattened, sub/superscripts lost. **Do not mark something
wrong because OCR mangled a glyph.** Grade the *strategy*. For each problem:

1. **Pattern match** — did the user invoke the right pattern from
   `course-index/patterns.md`? (Named theorems/techniques, the chosen
   ansatz/substitution, what they held fixed — even with mangled notation.)
2. **Variable choice** — did they hold the right things fixed?
3. **End form** — does the final expression's *structure* match (a log? a sqrt?
   a series? the right variables?), even if the algebra has slips?
4. **Completeness** — where did they stop? Note the last recognizable step.

Compare against the reference solution from the context (e.g.
`converted/solutions/<hw>_sol.md`, `quizzes/<name>_answers.md`,
`twins/<id>_<ts>_sol.md`, `chain/<ts>_sol.md`). Only flag line-by-line algebra
when it is an exam-relevant sign error or a notation bug that matters
(conjugate vs. transpose, a missing `−`).

## Step 3 — grade table (terminal, ≤ 15 lines)

```
| P# | Pattern | Vars | End form | Overall |
|---|---|---|---|---|
| P1 | ✅ | ✅ | ⚠️ | PARTIAL |
| P2 | ❌ | — | — | FAIL |
```

Close with one line (in {{INTERFACE_LANG}}): `Dominant issue: <type>. Next drill:
paideia <command> <target>.` **Do not** print the full reference solution.

## Step 4 — log errors

Append every non-✅ problem to `errors/log.md` using the canonical YAML schema
(see the system section), with `source: answers/converted/<stem>.md`.

## OCR quality escape hatch

Inspect the transcription header first. If the tier was a **tesseract fallback**
or **explicit tesseract**, the MD is <100 chars, or it is mostly garbled, print
this menu (in {{INTERFACE_LANG}}; keep commands/paths verbatim) instead of a
confident grade:

```
OCR quality is low (grading reliability degraded).
Options:
  (a) paideia grade --ocr=vision <pdf>   ← retry with agent vision
  (b) re-scan brighter / larger, then grade again
  (c) type the answer into answers/converted/<stem>.md, then grade
  (d) skip grading; use paideia blind <problem-id> to verbalize the strategy
```

The harness archives the graded PDF and cleans up scratch pages after you
return successfully — do not move or delete the originals yourself.
