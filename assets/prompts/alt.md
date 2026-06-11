# Task: alt — import an Exam Radar export, fold in the lecture-emphasis signal

Exam Radar is OPTIMETA's Alt tool. From lecture **recordings** it ranks topics
by how much the professor verbally emphasized them — a second exam-probability
signal, independent of PAIDEIA's HW density. This stage folds that signal into
`course-index/`. Timestamp `{{TS}}`.

**The export** is in the **"Exam Radar export"** context section above (the
harness read it from your argument or from `materials/radar.md`). If that section
is empty or has no `<!-- exam-radar:v1` marker, tell the user to copy **학습
로드맵 → 복사** from Exam Radar and paste it after `paideia alt`, or save it as
`materials/radar.md`, then stop.

**Premise (do not break).** HW density stays the primary `Exam tier`. Lecture
emphasis is layered on as a **second opinion** — surfaced, never substituted. A
single lecture signal does not auto-upgrade an HW-based tier; it flags
divergences for the user to judge.

## 1. Parse (`exam-radar:v1`)

Detect by the `<!-- exam-radar:v1` marker (parse `vN`; if `> 1`, warn and parse
v1 fields best-effort). Read the meta (`- 코스:`, `- 시험까지:` D-N, the count
line) and the three zones:
- `지금 할 것 — 골드존` → zone **gold** (high exam-prob, low self-confidence)
- `이미 다진 것` → zone **strong**
- `버려도 안전` → zone **skip**

Each topic line: `<name> · 시험확률 <p>%`, optionally ` · 🎙` (verbal stress).
Parse name, integer p (0–100), and the 🎙 flag. `(없음)` = empty zone.

## 2. Write `course-index/radar.md` (canonical store; overwrite)

```markdown
<!-- SOURCE: Exam Radar (Alt), exam-radar:v1, course=<course>, <D-N>, imported <YYYY-MM-DD> -->
# Lecture-emphasis signal — <course>

| Topic | Exam prob | Zone | Lecture signal |
|---|---|---|---|
| <topic> | <p>% | gold | 🎙 |
...exam-prob descending within each zone, gold → strong → skip.

## Now (gold zone)
- <topic> (<p>%)[ 🎙]

## Safe to drop
- <topic> (<p>%)
```

## 3. Merge into `course-index/coverage.md` (if it exists; else skip + tell the user to run `paideia analyze`)

1. **Map** each Exam Radar topic to a reverse-map § by title match (case/space
   insensitive, substring allowed). Keep the best match.
2. **Add/refresh a `Lecture emphasis` column** on the reverse-map table:
   `🎙🎙` for gold or ≥70%, `🎙` for 40–69%, `·` for <40% or unmapped.
3. **Do not change the `Exam tier`** (HW-derived).
4. **Append a divergence section** (replace in place on re-run):
   ```markdown
   ## Lecture vs HW — divergences (judge these)

   ### 🎙 Stressed in lecture, but no HW
   - <§/topic> — verbal-only exam point? decide; if it matters, derive/quiz it.

   ### HW-dense, but quiet in lecture
   - <§> — quietly important; tested without lecture time.
   ```
5. **Unmatched topics** → append under `## From Exam Radar (no HW section match)`.
6. **Drill priority** — use lecture emphasis as a booster/tie-breaker only; do
   not reorder across HW tiers.

## 4. Seed a gold-zone weakmap

Write a **new** `weakmap/weakmap_{{TS}}.md` (never overwrite). Put gold-zone
topics under `## User-declared weaknesses`, each tagged `(from Exam Radar gold
zone)`, mapped to related §/Pk with a recommended drill. Also run the weakmap
Case A latest-error snapshot so the report stays consistent.

## Print (terminal, prose in {{INTERFACE_LANG}}, identifiers verbatim)

```
Exam Radar imported (<course>, <D-N>).

- course-index/radar.md     ← <N> topics (gold <G> · strong <S> · skip <D>)
- course-index/coverage.md  ← Lecture emphasis column added, <X> divergences
- weakmap/weakmap_{{TS}}.md  ← <G> gold-zone topics registered as weaknesses

Divergences (lecture vs HW):
  🎙 stressed, no HW:  <§/topics>   ← possible verbal-only exam point
  HW-dense, quiet:     <§ …>        ← quietly important

Next:
  paideia weakmap            — merged weakness priority
  paideia quiz <gold §>      — drill the gold zone first
```
