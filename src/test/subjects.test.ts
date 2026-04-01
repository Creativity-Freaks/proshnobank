import { describe, expect, it } from "vitest";
import { getSubjectLabel, normalizeSubjectKey, getSubjectQueryAliases } from "@/lib/subjects";

describe("subjects taxonomy", () => {
  it("normalizes Bangla and English aliases", () => {
    expect(normalizeSubjectKey("বাংলা")).toBe("bangla");
    expect(normalizeSubjectKey("English")).toBe("english");
  });

  it("returns human label for canonical key", () => {
    expect(getSubjectLabel("physics")).toBe("পদার্থবিজ্ঞান");
  });

  it("builds query aliases for canonical subject", () => {
    expect(getSubjectQueryAliases("gk")).toContain("সাধারণ জ্ঞান");
    expect(getSubjectQueryAliases("gk")).toContain("gk");
  });
});
