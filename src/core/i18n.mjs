// Harness-side localized strings (en/ko) for the program's own output.
// Note: this is distinct from the LLM-generated prose inside course artifacts —
// those are produced by opencode in INTERFACE_LANG per the stage spec. These
// strings are what the `paideia` CLI itself prints to the terminal.

const STRINGS = {
  no_opencode: {
    en: "opencode is not installed or not on PATH. Install it (https://opencode.ai/docs) then run `paideia doctor`.",
    ko: "opencode가 설치되어 있지 않거나 PATH에 없습니다. 설치 후(https://opencode.ai/docs) `paideia doctor`를 실행하세요.",
  },
  not_a_course: {
    en: "No .course-meta found here. Run `paideia init-course` in the course folder first.",
    ko: ".course-meta가 없습니다. 코스 폴더에서 먼저 `paideia init-course`를 실행하세요.",
  },
  need_analyze: {
    en: "course-index/ is empty. Run `paideia analyze` first — output without the index will be unfocused.",
    ko: "course-index/가 비어 있습니다. 먼저 `paideia analyze`를 실행하세요 — 인덱스 없이는 결과가 산만합니다.",
  },
  need_ingest: {
    en: "converted/ is empty. Run `paideia ingest` first to convert your PDFs.",
    ko: "converted/가 비어 있습니다. 먼저 `paideia ingest`로 PDF를 변환하세요.",
  },
  need_weakmap: {
    en: "No weakmap report yet. Run `paideia weakmap` first, then `paideia quiz weakmap`.",
    ko: "weakmap 리포트가 아직 없습니다. 먼저 `paideia weakmap`을 실행한 뒤 `paideia quiz weakmap`을 쓰세요.",
  },
  need_radar: {
    en: "No exam-radar:v1 export found. Paste it after `paideia alt`, or save it as materials/radar.md.",
    ko: "exam-radar:v1 익스포트를 찾지 못했습니다. `paideia alt` 뒤에 붙여넣거나 materials/radar.md로 저장하세요.",
  },
  need_strategy: {
    en: "--strategy needs your strategy in 3-5 lines, e.g. --strategy \"apply P3, hold ω fixed, expect a closed form\".",
    ko: "--strategy 에는 3~5줄 전략이 필요합니다. 예: --strategy \"P3 적용, ω 고정, 닫힌 형태 기대\".",
  },
  running_stage: {
    en: "→ driving opencode: {stage}",
    ko: "→ opencode 구동 중: {stage}",
  },
  dry_run: {
    en: "[dry-run] would run: {cmd}",
    ko: "[dry-run] 실행 예정: {cmd}",
  },
  spec_written: {
    en: "  spec: {path}",
    ko: "  스펙: {path}",
  },
  stage_done: {
    en: "✓ {stage} complete.",
    ko: "✓ {stage} 완료.",
  },
  stage_failed: {
    en: "✗ {stage} failed (opencode exit {code}). See output above.",
    ko: "✗ {stage} 실패 (opencode 종료 코드 {code}). 위 출력을 확인하세요.",
  },
};

/**
 * Localized lookup. `t("running_stage", "ko", { stage: "ingest" })`.
 * Falls back to English, then to the key itself.
 */
export function t(key, lang = "en", vars = {}) {
  const bundle = STRINGS[key] || {};
  let s = bundle[lang] || bundle.en || key;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

/** Pick the matching half of an { en, ko } literal block. */
export function pick(block, lang = "en") {
  return block[lang] || block.en || "";
}
