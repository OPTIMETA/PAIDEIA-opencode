# Task: blind — present a problem for a strategy-level blind drill (phase 1)

Target problem id = `{{ARGS}}`. Read `course-index/patterns.md`. **Do NOT open
the solution** in this phase.

## Procedure

1. Load the **problem statement only** from `converted/homework/<n>.md` (or
   `converted/textbook/<ch>.md` for a textbook example). Do not read
   `converted/solutions/`.
2. Present the problem verbatim to the user.
3. Ask for the strategy — 3–5 lines of prose, **no equations** — on these three
   axes (render the questions in {{INTERFACE_LANG}}):

   ```
   Strategy only — no equations needed.
   1) Which pattern(s) will you use? (Pk from course-index/patterns.md)
   2) Which variables held fixed; which expanded?
   3) What form do you expect the final answer to take?
   ```

4. Tell the user to answer by running:
   `paideia blind <id> --strategy "<their 3–5 lines>"`

Do not grade anything yet — this phase only presents the problem and the
questions. Stop after printing them.

## Why strategy-based, not full derivation

Exam pattern recognition is the bottleneck. If the user can articulate the
correct strategy in 30 seconds, they will execute it in 10 minutes on the exam.
The strategy check IS the drill; execution is practiced on paper + `paideia
grade`.
