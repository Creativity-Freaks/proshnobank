import { describe, expect, it } from "vitest";
import { mapLiveExamRow, formatMinutesBn } from "@/lib/live-exam";

describe("live exam mapper", () => {
  it("maps valid API row", () => {
    const row = {
      event_id: "event-1",
      id: "template-1",
      title: "Test Exam",
      category: "medical",
      start_time: "2030-01-01T00:00:00.000Z",
      status: "upcoming",
      participants: 42,
      prize: "1000 BDT",
      question_count: 50,
      duration_minutes: 90,
      marks_per_question: 1,
      negative_marks: 0.25,
      difficulty: "medium",
      subjects: ["physics"],
      topics: { physics: ["mechanics"] },
    };

    const mapped = mapLiveExamRow(row);
    expect(mapped).not.toBeNull();
    expect(mapped?.id).toBe("template-1");
    expect(mapped?.config.subjects).toEqual(["physics"]);
  });

  it("returns null for invalid row", () => {
    expect(mapLiveExamRow({ foo: "bar" })).toBeNull();
  });

  it("formats minutes in bangla", () => {
    expect(formatMinutesBn(90)).toContain("ঘণ্টা");
  });
});
