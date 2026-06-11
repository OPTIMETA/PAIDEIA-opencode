# Task: ingest — transcribe rendered course pages to faithful LaTeX markdown

The harness has already done the mechanical half of the vision pipeline: every
PDF that needs conversion has been **rendered to PNG pages and resized** to
≤1800 px on the long edge (so they are safe for many-image requests), and any
`.md` materials were copied through verbatim. Your job is the transcription.

**Why vision, not text extraction.** Digital PDF text extraction is unreliable
on course materials — even prose-heavy textbook pages silently word-salad when
they mix equations, figures, or multi-column layouts. We render every page and
read it visually instead. Do not try to "shortcut" with a text dump.

## Worklist

The **"PDFs to transcribe"** context section above lists each job: its category,
stem, the absolute `_pages/<stem>/` directory holding `p01.png … pNN.png`, the
page count, the output path, and a domain hint. If the worklist is empty, report
that everything is already converted and stop.

## Procedure

For each job, spawn **one subagent via your Task tool** (in parallel — each job
touches only its own `_pages/<stem>/` directory and its own output file, so they
never race). Give each subagent this instruction, with the bracketed values
filled in:

```
You are transcribing a <domain> PDF to clean markdown using vision.
Input: page images at <pages_dir>/p01.png through pNN.png (NN pages), each
≤1800 px on the long edge. Output: write <output_path>.

Procedure:
1. Read each page image with the Read tool — ONE AT A TIME, not in parallel
   batches. Reading many images in one request trips the many-image dimension
   limit even though each image is individually under the ceiling. Read a page,
   transcribe it, then move to the next.
2. Transcribe each page into markdown, preserving the page's reading order
   (not raw column order).
3. Format math in LaTeX: inline $...$, display $$...$$. Render hats, hbars,
   partials, bras/kets, sums, vectors, operators faithfully. If a symbol is
   genuinely unreadable, write [?] — do not guess.
4. Use ## for section/slide titles. Prepend ### Page N anchors so downstream
   tools can cite pages.
5. Preserve bullet hierarchy, numbered postulates/theorems/definitions,
   labeled equations, and tables.
6. Skip-mark truly empty pages as *[blank]*.
7. Do NOT summarize — transcribe faithfully only what is on the page.
8. For heavy diagrams, write one italic line *Figure: [description]* rather than
   pixel-wise transcription.

The very top of the output file must be exactly:
<!-- SOURCE: materials/<category>/<stem>.pdf, extracted <YYYY-MM-DD>, method: vision -->

# <Title>

Write the whole file once at the end. Report: page count handled and any [?]
symbols you marked.
```

`<domain>` is whatever the course is about (quantum mechanics, linear algebra,
real analysis, E&M, …) — infer it from the material or the course name in the
context above.

After all subagents finish, **spot-check one or two** output files: equations
should read top-to-bottom as coherent LaTeX, and `### Page N` anchors should be
present.

## Report

Print a short report (in {{INTERFACE_LANG}}): how many files you transcribed,
and a list of any files where you left `[?]` marks (with counts). **Do not print
a Converted/Skipped/Failed table** — the harness prints the authoritative one
(it alone knows the skipped/failed counts). The harness also removes the
`_pages/` scratch directories after you return — do not delete them yourself,
and do not re-render anything.
