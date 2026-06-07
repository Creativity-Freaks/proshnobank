import { describe, expect, it } from "vitest";
import {
  buildQuestionPaperHtml,
  EMPTY_INSTITUTION,
  escapeHtml,
  gradeOmr,
  parseAnswers,
  readInstitutionProfile,
  type PaperOptions,
} from "@/lib/teacherPaper";

describe("teacherPaper - parseAnswers", () => {
  it("splits on spaces and commas, uppercases, drops empties", () => {
    expect(parseAnswers("a b,c  d")).toEqual(["A", "B", "C", "D"]);
    expect(parseAnswers("")).toEqual([]);
  });
});

describe("teacherPaper - gradeOmr", () => {
  it("scores with negative marking", () => {
    const result = gradeOmr(["A", "B", "C", "D"], ["A", "B", "X", ""], 1, 0.25);
    expect(result.correct).toBe(2);
    expect(result.wrong).toBe(1);
    expect(result.blank).toBe(1);
    expect(result.score).toBe(1.75);
    expect(result.total).toBe(4);
  });

  it("ignores blank answer-key slots", () => {
    const result = gradeOmr(["A", "", "C"], ["A", "B", "C"], 2, 1);
    expect(result.total).toBe(4);
    expect(result.correct).toBe(2);
    expect(result.score).toBe(4);
  });
});

describe("teacherPaper - escapeHtml", () => {
  it("escapes html-significant characters", () => {
    expect(escapeHtml(`<b>"x"&'y'`)).toBe("&lt;b&gt;&quot;x&quot;&amp;&#39;y&#39;");
  });
});

describe("teacherPaper - readInstitutionProfile", () => {
  it("returns empty profile for missing metadata", () => {
    expect(readInstitutionProfile(undefined)).toEqual(EMPTY_INSTITUTION);
  });

  it("reads institution fields with fallbacks", () => {
    const profile = readInstitutionProfile({ institute: "ABC School", location: "Dhaka" });
    expect(profile.name).toBe("ABC School");
    expect(profile.address).toBe("Dhaka");
  });
});

describe("teacherPaper - buildQuestionPaperHtml", () => {
  const options: PaperOptions = {
    examName: "Model Test",
    subject: "Math",
    className: "10",
    timeText: "30 মিনিট",
    fullMarks: "10",
    setCode: "A",
    columns: 2,
    fontSize: 14,
    instructions: "",
    includeAnswerKey: true,
    watermark: "",
    institution: EMPTY_INSTITUTION,
  };

  it("renders questions and an answer key when requested", () => {
    const html = buildQuestionPaperHtml(options, [
      { question_text: "2+2?", options: ["3", "4"], correct_answer: 1 },
    ]);
    expect(html).toContain("Model Test");
    expect(html).toContain("2+2?");
    expect(html).toContain("Answer Key");
    expect(html).toContain("1-B");
  });
});
