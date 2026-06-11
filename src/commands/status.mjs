// status — the harness's status line / session brief, derived from workspace
// artifacts (not time). One-liner by default; `--banner` prints the multi-line
// session reminder; `--json` emits structured state.
import { readFileSync } from "node:fs";
import { findCourseRoot, readMeta, interfaceLang, daysUntil, formatDN } from "../core/meta.mjs";
import { detectPhase, topMiss } from "../core/phase.mjs";
import { latestWeakmap } from "../core/workspace.mjs";
import { parseArgs } from "../core/args.mjs";

const NEON = [
  [57, 255, 20], [255, 20, 147], [0, 255, 255], [204, 255, 0], [255, 0, 255],
  [191, 0, 255], [255, 102, 0], [176, 255, 0], [255, 49, 49], [125, 249, 255],
];

function hashColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const [r, g, b] = NEON[h % NEON.length];
  return `[38;2;${r};${g};${b}m`;
}

function truncate(s, n = 28) {
  s = String(s).trim();
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

function weakmapVerdict(root) {
  const wm = latestWeakmap(root);
  if (!wm) return null;
  try {
    const m = /##\s*One-line verdict\s*\n+\s*(.+?)(?:\n|$)/.exec(readFileSync(wm, "utf8"));
    return m ? m[1].trim() : null;
  } catch { return null; }
}

const NEXT = {
  setup: { en: "next: fill materials/ then `paideia ingest` → `paideia analyze`", ko: "다음: materials/ 채우고 `paideia ingest` → `paideia analyze`" },
  diag: { en: "next: run a diagnostic with `paideia quiz all 20`", ko: "다음: `paideia quiz all 20` 로 진단" },
  drill: { en: "next: `paideia weakmap`, then `paideia quiz weakmap`", ko: "다음: `paideia weakmap` 후 `paideia quiz weakmap`" },
  mock: { en: "next: `paideia cheatsheet --pdf` to start the summary", ko: "다음: `paideia cheatsheet --pdf` 로 요약 시작" },
  cram: { en: "next: re-read `paideia weakmap`; don't learn anything new", ko: "다음: `paideia weakmap` 재열람, 새로운 건 배우지 말 것" },
  cool: { en: "exam day — trust your prep.", ko: "시험 당일 — 준비를 믿으세요." },
};

export async function run(args, _ctx) {
  const { flags } = parseArgs(args);
  const root = findCourseRoot(process.cwd());
  if (!root) {
    if (flags.json) { console.log(JSON.stringify({ course: null })); return 0; }
    return 0; // silent outside a course (mirrors the statusline contract)
  }
  const meta = readMeta(root);
  const lang = interfaceLang(meta);
  const name = meta.COURSE_NAME || "course";
  const days = daysUntil(meta.EXAM_DATE);
  const dn = formatDN(days);
  const phase = detectPhase(root, days);
  const miss = topMiss(root);
  const verdict = weakmapVerdict(root);

  if (flags.json) {
    console.log(JSON.stringify({ course: name, days, dn, phase, topMiss: miss, verdict, root }));
    return 0;
  }

  if (flags.banner) {
    const lines = [`[paideia] ${name}${dn ? ` · ${dn}` : ""} · phase=${phase}`];
    if (verdict) lines.push(`  weakmap verdict: ${verdict}`);
    else if (miss) lines.push(`  top-miss pattern: ${miss} — paideia blind / paideia pattern ${miss}`);
    else if (NEXT[phase]) lines.push(`  ${NEXT[phase][lang] || NEXT[phase].en}`);
    console.log(lines.join("\n"));
    return 0;
  }

  const parts = ["paideia", truncate(name)];
  if (dn) parts.push(dn);
  parts.push(phase);
  if (miss) parts.push(`${miss} ↑`);
  const line = parts.join(" · ");
  const useColor = process.stdout.isTTY && !flags.plain;
  console.log(useColor ? `${hashColor(name)}${line}[0m` : line);
  return 0;
}
