import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  readMeta, writeMeta, interfaceLang, daysUntil, formatDN, findCourseRoot, isValidExamDate,
} from "../src/core/meta.mjs";
import { tempDir, tempCourse } from "./helpers.mjs";

test("readMeta parses KEY: value and strips trailing comments", () => {
  const d = tempDir();
  writeFileSync(join(d, ".course-meta"),
    "COURSE_NAME: Complex Analysis\nINTERFACE_LANG: ko # main language\nbad line\n  EXAM_TYPE : final \n");
  const m = readMeta(d);
  assert.equal(m.COURSE_NAME, "Complex Analysis");
  assert.equal(m.INTERFACE_LANG, "ko");
  assert.equal(m.EXAM_TYPE, "final");
});

test("readMeta returns {} when there is no .course-meta", () => {
  assert.deepEqual(readMeta(tempDir()), {});
});

test("writeMeta round-trips through readMeta", () => {
  const d = tempDir();
  const meta = { COURSE_NAME: "QM", EXAM_DATE: "2026-06-26", INTERFACE_LANG: "ko" };
  writeMeta(d, meta);
  const back = readMeta(d);
  for (const [k, v] of Object.entries(meta)) assert.equal(back[k], v);
});

test("writeMeta flattens newlines so a value cannot split into a lost line", () => {
  const d = tempDir();
  writeMeta(d, { COURSE_NAME: "Line one\nEXAM_TYPE: injected", EXAM_DATE: "2030-01-01" });
  const back = readMeta(d);
  assert.equal(back.COURSE_NAME, "Line one EXAM_TYPE: injected");
  assert.equal(back.EXAM_DATE, "2030-01-01"); // not clobbered by the smuggled key
});

test("writeMeta omits undefined values instead of writing 'undefined'", () => {
  const d = tempDir();
  writeMeta(d, { COURSE_NAME: "QM", EXAM_DATE: undefined });
  assert.ok(!readFileSync(join(d, ".course-meta"), "utf8").includes("undefined"));
});

test("interfaceLang normalizes to en/ko with en as the default", () => {
  assert.equal(interfaceLang({ INTERFACE_LANG: "KO" }), "ko");
  assert.equal(interfaceLang({ INTERFACE_LANG: "ko # note" }), "ko");
  assert.equal(interfaceLang({ INTERFACE_LANG: "fr" }), "en");
  assert.equal(interfaceLang({}), "en");
});

test("daysUntil rejects impossible dates instead of rolling them over", () => {
  // new Date(2026, 12, 45) is a real 2027 date — the round-trip check is what
  // stops a typo'd EXAM_DATE from producing a confident, wrong D-N.
  assert.equal(daysUntil("2026-13-45"), null);
  assert.equal(daysUntil("2026-02-30"), null);
  assert.equal(daysUntil("not-a-date"), null);
  assert.equal(daysUntil(""), null);
  assert.equal(daysUntil(undefined), null);
  assert.equal(isValidExamDate("2026-02-29"), false); // 2026 is not a leap year
  assert.equal(isValidExamDate("2024-02-29"), true);
});

test("daysUntil counts whole local days", () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  assert.equal(daysUntil(iso), 5);
});

test("formatDN renders D-n / D-0 / D+n", () => {
  assert.equal(formatDN(5), "D-5");
  assert.equal(formatDN(0), "D-0");
  assert.equal(formatDN(-3), "D+3");
  assert.equal(formatDN(null), "");
});

test("findCourseRoot walks up to the nearest .course-meta", () => {
  const root = tempCourse();
  const deep = join(root, "quizzes", "nested");
  mkdirSync(deep, { recursive: true });
  assert.equal(findCourseRoot(deep), root);
  assert.equal(findCourseRoot(tempDir()), null);
});
