/**
 * Exam Catalog - Subject and Topic structure for all exam categories
 * This catalog is used by the ExamSetup page to display available subjects and topics
 */

export type Topic = { id: string; name: string };
export type Subject = { id: string; name: string; topics: Topic[] };
export type Category = { id: string; name: string; subjects: Subject[] };

const commonTopics = {
  bangla: [
    { id: "literature", name: "সাহিত্য" },
    { id: "grammar", name: "ব্যাকরণ" },
    { id: "composition", name: "রচনা" },
  ],
  english: [
    { id: "grammar", name: "গ্রামার" },
    { id: "vocabulary", name: "ভোকাবুলারি" },
    { id: "reading", name: "রিডিং কম্প্রিহেনশন" },
  ],
  math: [
    { id: "algebra", name: "বীজগণিত" },
    { id: "geometry", name: "জ্যামিতি" },
    { id: "trigonometry", name: "ত্রিকোণমিতি" },
    { id: "calculus", name: "ক্যালকুলাস" },
  ],
  physics: [
    { id: "mechanics", name: "মেকানিক্স" },
    { id: "heat", name: "তাপগতিবিদ্যা" },
    { id: "waves", name: "তরঙ্গ" },
    { id: "electricity", name: "বিদ্যুৎ" },
  ],
  chemistry: [
    { id: "periodic", name: "পর্যায় সারণী" },
    { id: "bonding", name: "রাসায়নিক বন্ধন" },
    { id: "reactions", name: "রাসায়নিক বিক্রিয়া" },
    { id: "organic", name: "জৈব রসায়ন" },
  ],
  biology: [
    { id: "cell", name: "কোষ বিজ্ঞান" },
    { id: "genetics", name: "বংশগতি" },
    { id: "ecology", name: "ইকোলজি" },
    { id: "human", name: "মানব শরীর" },
  ],
  ict: [
    { id: "hardware", name: "হার্ডওয়্যার" },
    { id: "software", name: "সফটওয়্যার" },
    { id: "networking", name: "নেটওয়ার্কিং" },
  ],
  gk: [
    { id: "geography", name: "ভূগোল" },
    { id: "history", name: "ইতিহাস" },
    { id: "culture", name: "সংস্কৃতি" },
    { id: "current", name: "সাম্প্রতিক তথ্য" },
  ],
  mental_ability: [
    { id: "reasoning", name: "রিজনিং" },
    { id: "series", name: "সিরিজ" },
    { id: "puzzles", name: "পাজল" },
  ],
};

export const examCatalog: Category[] = [
  {
    id: "ssc",
    name: "SSC",
    subjects: [
      { id: "ssc_bangla_1", name: "বাংলা ১ম পত্র", topics: commonTopics.bangla },
      { id: "ssc_bangla_2", name: "বাংলা ২য় পত্র", topics: commonTopics.bangla },
      { id: "ssc_english_1", name: "ইংরেজি ১ম পত্র", topics: commonTopics.english },
      { id: "ssc_english_2", name: "ইংরেজি ২য় পত্র", topics: commonTopics.english },
      { id: "ssc_math", name: "গণিত", topics: commonTopics.math },
      { id: "ssc_physics", name: "পদার্থবিজ্ঞান", topics: commonTopics.physics },
      { id: "ssc_chemistry", name: "রসায়ন", topics: commonTopics.chemistry },
      { id: "ssc_biology", name: "জীববিজ্ঞান", topics: commonTopics.biology },
      { id: "ssc_higher_math", name: "উচ্চতর গণিত", topics: commonTopics.math },
      { id: "ssc_bd_world", name: "বাংলাদেশ ও বিশ্বপরিচয়", topics: commonTopics.gk },
      { id: "ssc_religion", name: "ধর্ম ও নৈতিক শিক্ষা", topics: [{ id: "religious_texts", name: "ধর্মীয় গ্রন্থ" }] },
      { id: "ssc_ict", name: "ICT", topics: commonTopics.ict },
      { id: "ssc_history", name: "ইতিহাস", topics: [{ id: "world_history", name: "বিশ্ব ইতিহাস" }, { id: "modern_history", name: "আধুনিক ইতিহাস" }] },
      { id: "ssc_geography", name: "ভূগোল", topics: [{ id: "physical_geo", name: "ভৌত ভূগোল" }, { id: "human_geo", name: "মানব ভূগোল" }] },
      { id: "ssc_economics", name: "অর্থনীতি", topics: [{ id: "micro", name: "অণুঅর্থনীতি" }, { id: "macro", name: "বৃহত্অর্থনীতি" }] },
      { id: "ssc_civics", name: "পৌরনীতি", topics: [{ id: "government", name: "সরকার ব্যবস্থা" }, { id: "rights", name: "নাগরিক অধিকার" }] },
      { id: "ssc_accounting", name: "হিসাববিজ্ঞান", topics: [{ id: "double_entry", name: "দ্বিমুখী প্রবেশ" }, { id: "journal", name: "জার্নাল এবং লেজার" }] },
      { id: "ssc_business", name: "ব্যবসায় উদ্যোগ", topics: [{ id: "business_basics", name: "ব্যবসা মূলনীতি" }, { id: "entrepreneurship", name: "উদ্যোক্তা" }] },
    ],
  },
  {
    id: "hsc",
    name: "HSC",
    subjects: [
      { id: "hsc_bangla", name: "বাংলা", topics: commonTopics.bangla },
      { id: "hsc_english", name: "ইংরেজি", topics: commonTopics.english },
      { id: "hsc_physics", name: "পদার্থবিজ্ঞান", topics: commonTopics.physics },
      { id: "hsc_chemistry", name: "রসায়ন", topics: commonTopics.chemistry },
      { id: "hsc_biology", name: "জীববিজ্ঞান", topics: commonTopics.biology },
      { id: "hsc_higher_math", name: "উচ্চতর গণিত", topics: commonTopics.math },
      { id: "hsc_statistics", name: "পরিসংখ্যান", topics: [{ id: "probability", name: "সম্ভাব্যতা" }, { id: "distribution", name: "বিতরণ" }] },
      { id: "hsc_ict", name: "ICT", topics: commonTopics.ict },
      { id: "hsc_accounting", name: "হিসাববিজ্ঞান", topics: [{ id: "financial", name: "আর্থিক বিবরণ" }, { id: "analysis", name: "বিশ্লেষণ" }] },
      { id: "hsc_finance", name: "ফিন্যান্স", topics: [{ id: "banking", name: "ব্যাংকিং" }, { id: "investment", name: "বিনিয়োগ" }] },
      { id: "hsc_management", name: "ব্যবস্থাপনা", topics: [{ id: "principles", name: "নীতিমালা" }, { id: "org", name: "সংগঠন" }] },
      { id: "hsc_history", name: "ইতিহাস", topics: [{ id: "ancient", name: "প্রাচীন ইতিহাস" }, { id: "medieval", name: "মধ্যযুগীয় ইতিহাস" }, { id: "modern", name: "আধুনিক ইতিহাস" }] },
      { id: "hsc_islamic_studies", name: "ইসলামিক স্টাডিজ", topics: [{ id: "quran", name: "কুরান" }, { id: "hadith", name: "হাদিস" }, { id: "fiqh", name: "ফিক্হ" }] },
      { id: "hsc_social_science", name: "সমাজবিজ্ঞান", topics: [{ id: "sociology", name: "সমাজশাস্ত্র" }, { id: "anthropology", name: "নৃতত্ত্ব" }] },
      { id: "hsc_economics", name: "অর্থনীতি", topics: [{ id: "consumer", name: "ভোক্তা অর্থনীতি" }, { id: "producer", name: "উৎপাদক অর্থনীতি" }] },
    ],
  },
  {
    id: "medical",
    name: "মেডিকেল",
    subjects: [
      { id: "medical_physics", name: "পদার্থবিজ্ঞান", topics: commonTopics.physics },
      { id: "medical_chemistry", name: "রসায়ন", topics: commonTopics.chemistry },
      { id: "medical_biology", name: "জীববিজ্ঞান", topics: commonTopics.biology },
      { id: "medical_english", name: "ইংরেজি", topics: commonTopics.english },
      { id: "medical_gk", name: "সাধারণ জ্ঞান", topics: commonTopics.gk },
    ],
  },
  {
    id: "engineering",
    name: "ইঞ্জিনিয়ারিং",
    subjects: [
      { id: "engineering_higher_math", name: "উচ্চতর গণিত", topics: commonTopics.math },
      { id: "engineering_physics", name: "পদার্থবিজ্ঞান", topics: commonTopics.physics },
      { id: "engineering_chemistry", name: "রসায়ন", topics: commonTopics.chemistry },
      { id: "engineering_english", name: "ইংরেজি", topics: commonTopics.english },
    ],
  },
  {
    id: "university",
    name: "বিশ্ববিদ্যালয়",
    subjects: [
      { id: "uni_english", name: "ইংরেজি", topics: commonTopics.english },
      { id: "uni_math", name: "গণিত", topics: commonTopics.math },
      { id: "uni_physics", name: "পদার্থবিজ্ঞান", topics: commonTopics.physics },
      { id: "uni_chemistry", name: "রসায়ন", topics: commonTopics.chemistry },
      { id: "uni_bangla", name: "বাংলা", topics: commonTopics.bangla },
      { id: "uni_economics", name: "অর্থনীতি", topics: [{ id: "macro", name: "বৃহত্অর্থনীতি" }, { id: "international", name: "আন্তর্জাতিক অর্থনীতি" }] },
      { id: "uni_history", name: "ইতিহাস", topics: [{ id: "world", name: "বিশ্ব ইতিহাস" }, { id: "bangladesh", name: "বাংলাদেশ ইতিহাস" }] },
      { id: "uni_social_science", name: "সমাজবিজ্ঞান", topics: commonTopics.gk },
      { id: "uni_philosophy", name: "দর্শন", topics: [{ id: "logic", name: "যুক্তিবিদ্যা" }, { id: "epistemology", name: "জ্ঞানতত্ত্ব" }] },
      { id: "uni_law", name: "আইন", topics: [{ id: "constitutional", name: "সাংবিধানিক আইন" }, { id: "criminal", name: "ফৌজদারি আইন" }] },
    ],
  },
  {
    id: "job",
    name: "চাকরি",
    subjects: [
      { id: "job_bangla", name: "বাংলা", topics: commonTopics.bangla },
      { id: "job_english", name: "ইংরেজি", topics: commonTopics.english },
      { id: "job_math", name: "গণিত", topics: commonTopics.math },
      { id: "job_gk", name: "সাধারণ জ্ঞান", topics: commonTopics.gk },
      { id: "job_ict", name: "ICT", topics: commonTopics.ict },
      { id: "job_mental_ability", name: "মানসিক দক্ষতা", topics: commonTopics.mental_ability },
      { id: "job_logical", name: "Logical Reasoning", topics: [{ id: "reasoning", name: "যুক্তিপূর্ণ যুক্তি" }, { id: "critical", name: "সমালোচনামূলক চিন্তাভাবনা" }] },
    ],
  },
];

export const getCategory = (id: string): Category | undefined => {
  return examCatalog.find((cat) => cat.id === id);
};

export const getCategoryName = (id: string): string => {
  return getCategory(id)?.name || id;
};

export const getSubjects = (categoryId: string): Subject[] => {
  return getCategory(categoryId)?.subjects || [];
};

export const getSubject = (categoryId: string, subjectId: string): Subject | undefined => {
  return getSubjects(categoryId).find((s) => s.id === subjectId);
};

export const getTopics = (categoryId: string, subjectId: string): Topic[] => {
  return getSubject(categoryId, subjectId)?.topics || [];
};
