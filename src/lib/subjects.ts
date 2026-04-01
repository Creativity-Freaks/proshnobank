export type SubjectKey =
  | "bangla"
  | "english"
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "gk"
  | "ict"
  | "science"
  | "computer"
  | "iq";

export const SUBJECT_LABELS: Record<SubjectKey, string> = {
  bangla: "বাংলা",
  english: "ইংরেজি",
  math: "গণিত",
  physics: "পদার্থবিজ্ঞান",
  chemistry: "রসায়ন",
  biology: "জীববিজ্ঞান",
  gk: "সাধারণ জ্ঞান",
  ict: "ICT",
  science: "বিজ্ঞান",
  computer: "কম্পিউটার",
  iq: "বুদ্ধিমত্তা",
};

const SUBJECT_ALIASES: Record<string, SubjectKey> = {
  bangla: "bangla",
  "বাংলা": "bangla",
  english: "english",
  ইংরেজি: "english",
  math: "math",
  mathematics: "math",
  গণিত: "math",
  physics: "physics",
  পদার্থবিজ্ঞান: "physics",
  পদার্থ: "physics",
  chemistry: "chemistry",
  রসায়ন: "chemistry",
  biology: "biology",
  জীববিজ্ঞান: "biology",
  gk: "gk",
  "general knowledge": "gk",
  "সাধারণ জ্ঞান": "gk",
  ict: "ict",
  science: "science",
  বিজ্ঞান: "science",
  computer: "computer",
  কম্পিউটার: "computer",
  iq: "iq",
  বুদ্ধিমত্তা: "iq",
};

export const SUBJECT_OPTIONS = Object.entries(SUBJECT_LABELS).map(([key, label]) => ({
  key: key as SubjectKey,
  label,
}));

export function normalizeSubjectKey(subject: string): SubjectKey | null {
  const normalized = subject.trim().toLowerCase();
  return SUBJECT_ALIASES[normalized] || SUBJECT_ALIASES[subject.trim()] || null;
}

export function getSubjectLabel(subject: string): string {
  const key = normalizeSubjectKey(subject);
  return key ? SUBJECT_LABELS[key] : subject;
}

export function getSubjectQueryAliases(subject: string): string[] {
  const key = normalizeSubjectKey(subject);
  if (!key) return [subject];

  const label = SUBJECT_LABELS[key];
  return Array.from(new Set([key, label]));
}
