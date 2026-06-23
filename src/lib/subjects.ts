export type SubjectKey =
  | "bangla_1"
  | "bangla_2"
  | "english_1"
  | "english_2"
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "gk"
  | "ict"
  | "bd_world"
  | "religion"
  | "higher_math"
  | "statistics"
  | "history"
  | "geography"
  | "economics"
  | "civics"
  | "accounting"
  | "business"
  | "finance"
  | "islamic_studies"
  | "social_science"
  | "management"
  | "iq"
  | "logical_reasoning";

export const SUBJECT_LABELS: Record<SubjectKey, string> = {
  bangla_1: "বাংলা ১ম পত্র",
  bangla_2: "বাংলা ২য় পত্র",
  english_1: "ইংরেজি ১ম পত্র",
  english_2: "ইংরেজি ২য় পত্র",
  math: "গণিত",
  physics: "পদার্থবিজ্ঞান",
  chemistry: "রসায়ন",
  biology: "জীববিজ্ঞান",
  gk: "সাধারণ জ্ঞান",
  ict: "ICT",
  bd_world: "বাংলাদেশ ও বিশ্বপরিচয়",
  religion: "ধর্ম ও নৈতিক শিক্ষা",
  higher_math: "উচ্চতর গণিত",
  statistics: "পরিসংখ্যান",
  history: "ইতিহাস",
  geography: "ভূগোল",
  economics: "অর্থনীতি",
  civics: "পৌরনীতি",
  accounting: "হিসাববিজ্ঞান",
  business: "ব্যবসায় উদ্যোগ",
  finance: "ফিন্যান্স",
  islamic_studies: "ইসলামিক স্টাডিজ",
  social_science: "সমাজবিজ্ঞান",
  management: "ব্যবস্থাপনা",
  iq: "মানসিক দক্ষতা",
  logical_reasoning: "Logical Reasoning",
};

const SUBJECT_ALIASES: Record<string, SubjectKey> = {
  // SSC Bangla
  bangla_1: "bangla_1",
  "বাংলা ১": "bangla_1",
  bangla_2: "bangla_2",
  "বাংলা ২": "bangla_2",
  bangla: "bangla_1",
  "বাংলা": "bangla_1",

  // SSC English
  english_1: "english_1",
  "english 1": "english_1",
  english_2: "english_2",
  "english 2": "english_2",
  english: "english_1",
  ইংরেজি: "english_1",

  // Core Subjects
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

  // General Subjects
  gk: "gk",
  "general knowledge": "gk",
  "সাধারণ জ্ঞান": "gk",
  ict: "ict",

  // SSC Additional
  bd_world: "bd_world",
  "বাংলাদেশ ও বিশ্বপরিচয়": "bd_world",
  religion: "religion",
  "ধর্ম ও নৈতিক শিক্ষা": "religion",

  // HSC Additional
  higher_math: "higher_math",
  "উচ্চতর গণিত": "higher_math",
  statistics: "statistics",
  পরিসংখ্যান: "statistics",
  history: "history",
  ইতিহাস: "history",
  geography: "geography",
  ভূগোল: "geography",
  economics: "economics",
  অর্থনীতি: "economics",
  civics: "civics",
  পৌরনীতি: "civics",

  // Commerce
  accounting: "accounting",
  হিসাববিজ্ঞান: "accounting",
  business: "business",
  "ব্যবসায় উদ্যোগ": "business",
  finance: "finance",
  ফিন্যান্স: "finance",
  management: "management",
  ব্যবস্থাপনা: "management",

  // Arts
  islamic_studies: "islamic_studies",
  "ইসলামিক স্টাডিজ": "islamic_studies",
  social_science: "social_science",
  সমাজবিজ্ঞান: "social_science",

  // Job Exams
  iq: "iq",
  "mental ability": "iq",
  "মানসিক দক্ষতা": "iq",
  logical_reasoning: "logical_reasoning",
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
