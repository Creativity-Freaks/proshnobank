// Bangladesh Curriculum Chapters for Each Subject
// Based on HSC and SSC Official Syllabus

export interface Chapter {
  id: string;
  number: number;
  name: string;
  topics: string[];
}

export interface SubjectCurriculum {
  subjectId: string;
  subjectName: string;
  chapters: Chapter[];
}

// SSC BANGLA 1ST PAPER (বাংলা ১ম পত্র)
const sscBangla1Chapters: Chapter[] = [
  {
    id: "ssc_bangla_1_01",
    number: 1,
    name: "গদ্য",
    topics: ["প্রথম গদ্য", "দ্বিতীয় গদ্য", "তৃতীয় গদ্য"],
  },
  {
    id: "ssc_bangla_1_02",
    number: 2,
    name: "কবিতা",
    topics: ["প্রথম কবিতা", "দ্বিতীয় কবিতা", "তৃতীয় কবিতা"],
  },
  {
    id: "ssc_bangla_1_03",
    number: 3,
    name: "নাটক",
    topics: ["নাটকের পরিচয়", "চরিত্র বিশ্লেষণ"],
  },
  {
    id: "ssc_bangla_1_04",
    number: 4,
    name: "অনুশীলনী",
    topics: ["বোধ ও ভাষা", "রচনা"]
  }
];

// SSC BANGLA 2ND PAPER (বাংলা ২য় পত্র)
const sscBangla2Chapters: Chapter[] = [
  {
    id: "ssc_bangla_2_01",
    number: 1,
    name: "ব্যাকরণ",
    topics: ["বর্ণ", "শব্দ", "পদ", "বাক্য", "প্রকরণ"],
  },
  {
    id: "ssc_bangla_2_02",
    number: 2,
    name: "কথ্য ভাষা",
    topics: ["কথ্য ও লিখিত ভাষা", "উচ্চারণ"],
  },
  {
    id: "ssc_bangla_2_03",
    number: 3,
    name: "রচনা",
    topics: ["বর্ণনামূলক রচনা", "বিবরণমূলক রচনা", "আবেগময় রচনা"],
  },
  {
    id: "ssc_bangla_2_04",
    number: 4,
    name: "অনুবাদ ও সংক্ষিপ্তকরণ",
    topics: ["ইংরেজি থেকে বাংলা অনুবাদ", "বাংলা পাঠ্য সংক্ষিপ্তকরণ"],
  }
];

// HSC HIGHER MATH (উচ্চতর গণিত)
const hscHigherMathChapters: Chapter[] = [
  {
    id: "hsc_higher_math_01",
    number: 1,
    name: "ম্যাট্রিক্স ও নির্ণায়ক",
    topics: ["ম্যাট্রিক্স", "নির্ণায়ক", "বিপরীত ম্যাট্রিক্স"],
  },
  {
    id: "hsc_higher_math_02",
    number: 2,
    name: "ভেক্টর",
    topics: ["ভেক্টরের মৌলিক ধারণা", "স্কেলার গুণন", "ভেক্টর গুণন"],
  },
  {
    id: "hsc_higher_math_03",
    number: 3,
    name: "সরলরেখা",
    topics: ["সরলরেখার সমীকরণ", "দুটি রেখার মধ্যে কোণ", "সমান্তরাল ও লম্বরেখা"],
  },
  {
    id: "hsc_higher_math_04",
    number: 4,
    name: "বৃত্ত",
    topics: ["বৃত্তের সমীকরণ", "স্পর্শক ও সাধারণ জ্যা"],
  },
  {
    id: "hsc_higher_math_05",
    number: 5,
    name: "বিজ্ঞাস ও সমাবেশ",
    topics: ["পারমুটেশন", "কম্বিনেশন", "দ্বিপদ উপপাদ্য"],
  },
  {
    id: "hsc_higher_math_06",
    number: 6,
    name: "দ্বিপদীয়িতিক অনুপাত",
    topics: ["দ্বিপদ সূত্র", "সাধারণ পদ", "মধ্যপদ"],
  },
  {
    id: "hsc_higher_math_07",
    number: 7,
    name: "সমন্বয় জ্যামিতি-৩D",
    topics: ["ত্রিমাত্রিক স্থানাঙ্ক", "সমতল ও সরলরেখা"],
  },
  {
    id: "hsc_higher_math_08",
    number: 8,
    name: "ফাংশন ও ডেরিভেটিভ",
    topics: ["ফাংশনের ধারণা", "সীমা", "অবিচ্ছিন্নতা", "অন্তরজ"],
  },
  {
    id: "hsc_higher_math_09",
    number: 9,
    name: "অন্তরীকরণ",
    topics: ["অন্তরীকরণের নিয়ম", "লজারিদমিক ও সূচকীয় ফাংশনের অন্তরীকরণ"],
  },
  {
    id: "hsc_higher_math_10",
    number: 10,
    name: "যোগজীকরণ",
    topics: ["যোগজীকরণের নিয়ম", "নির্দিষ্ট যোগজ", "প্রয়োগ"],
  }
];

// HSC PHYSICS (পদার্থবিজ্ঞান)
const hscPhysicsChapters: Chapter[] = [
  {
    id: "hsc_physics_01",
    number: 1,
    name: "স্থিতিস্থাপকতা",
    topics: ["হুকের নিয়ম", "ইয়ং এর গুণাঙ্ক", "বাল্ক মডুলাস"],
  },
  {
    id: "hsc_physics_02",
    number: 2,
    name: "তরঙ্গ",
    topics: ["তরঙ্গের বৈশিষ্ট্য", "সুপারপজিশন", "হস্তক্ষেপ", "বিচ্ছুরণ"],
  },
  {
    id: "hsc_physics_03",
    number: 3,
    name: "আলো",
    topics: ["আলোর প্রকৃতি", "প্রতিফলন", "প্রতিসরণ", "লেন্স", "বর্ণালী"],
  },
  {
    id: "hsc_physics_04",
    number: 4,
    name: "আধুনিক পদার্থবিজ্ঞান",
    topics: ["আলোর কণা প্রকৃতি", "বোর পরমাণু", "পারমাণবিক নিউক্লিয়াস", "রেডিওঅ্যাক্টিভিটি"],
  },
  {
    id: "hsc_physics_05",
    number: 5,
    name: "চুম্বকত্ব",
    topics: ["চুম্বক ক্ষেত্র", "লোরেন্জ বল", "আয়ন গতিবেগ"],
  },
  {
    id: "hsc_physics_06",
    number: 6,
    name: "তড়িৎ চুম্বক প্রেরণ",
    topics: ["ফ্যারাডে নিয়ম", "লেঞ্জ নিয়ম", "ট্রান্সফর্মার"],
  }
];

// HSC CHEMISTRY (রসায়ন)
const hscChemistryChapters: Chapter[] = [
  {
    id: "hsc_chemistry_01",
    number: 1,
    name: "পরমাণুর গঠন",
    topics: ["ইলেকট্রন কনফিগারেশন", "কোয়ান্টাম সংখ্যা", "অরবিটাল"],
  },
  {
    id: "hsc_chemistry_02",
    number: 2,
    name: "রাসায়নিক বন্ধন",
    topics: ["আয়নিক বন্ধন", "সহসংযোজক বন্ধন", "ধাতবিক বন্ধন"],
  },
  {
    id: "hsc_chemistry_03",
    number: 3,
    name: "দ্রবণ ও ঘনত্ব",
    topics: ["দ্রবণ", "মোলারিটি", "মোলালিটি", "কোলিগেটিভ ধর্ম"],
  },
  {
    id: "hsc_chemistry_04",
    number: 4,
    name: "ভারসাম্য",
    topics: ["রাসায়নিক ভারসাম্য", "সাম্যস্থিরাঙ্ক", "লেশাতেলিয়ার নীতি"],
  },
  {
    id: "hsc_chemistry_05",
    number: 5,
    name: "অম্ল-ক্ষার ভারসাম্য",
    topics: ["pH ও pOH", "বাফার দ্রবণ", "লবণের জলবিশ্লেষণ"],
  },
  {
    id: "hsc_chemistry_06",
    number: 6,
    name: "অক্সিডেশন-রিডাকশন",
    topics: ["অক্সিডেশন অবস্থা", "রিডাক্স প্রক্রিয়া", "গ্যালভানিক সেল"],
  },
  {
    id: "hsc_chemistry_07",
    number: 7,
    name: "হাইড্রোকার্বন",
    topics: ["অ্যালকেন", "অ্যালকিন", "অ্যালকাইন", "সুগন্ধি যৌগ"],
  },
  {
    id: "hsc_chemistry_08",
    number: 8,
    name: "কার্বনিল যৌগ",
    topics: ["অ্যালডিহাইড", "কিটোন", "কার্বক্সিলিক এসিড"],
  }
];

// HSC BIOLOGY (জীববিজ্ঞান)
const hscBiologyChapters: Chapter[] = [
  {
    id: "hsc_biology_01",
    number: 1,
    name: "কোশ ও এর বিভাজন",
    topics: ["কোশের প্রকারভেদ", "মাইটোসিস", "মেয়োসিস"],
  },
  {
    id: "hsc_biology_02",
    number: 2,
    name: "জীববৈচিত্র্য",
    topics: ["প্রাণীর শ্রেণীবিন্যাস", "উদ্ভিদের শ্রেণীবিন্যাস"],
  },
  {
    id: "hsc_biology_03",
    number: 3,
    name: "জিন ও বংশগতি",
    topics: ["মেন্ডেলের সূত্র", "পরবর্তী প্রজন্মের অনুপাত", "সহসংযোগ"],
  },
  {
    id: "hsc_biology_04",
    number: 4,
    name: "বিবর্তন",
    topics: ["প্রাকৃতিক নির্বাচন", "প্রজাতি", "অভিযোজন"],
  },
  {
    id: "hsc_biology_05",
    number: 5,
    name: "প্রাণীর শারীরবিদ্যা",
    topics: ["পরিপাকতন্ত্র", "সংবহনতন্ত্র", "শ্বসনতন্ত্র", "রেচনতন্ত্র"],
  },
  {
    id: "hsc_biology_06",
    number: 6,
    name: "উদ্ভিদ শারীরবিদ্যা",
    topics: ["শোষণ ও পরিবহন", "ফটোসিন্থেসিস", "শ্বসন"],
  },
  {
    id: "hsc_biology_07",
    number: 7,
    name: "জীনগত প্রকৌশল",
    topics: ["ডিএনএ প্রযুক্তি", "জিন প্রকৌশল", "জৈব অস্ত্র"],
  }
];

// SSC ENGLISH 1ST PAPER (ইংরেজি ১ম পত্র)
const sscEnglish1Chapters: Chapter[] = [
  {
    id: "ssc_english_1_01",
    number: 1,
    name: "Reading",
    topics: ["Unseen Passage", "Comprehension", "Vocabulary"],
  },
  {
    id: "ssc_english_1_02",
    number: 2,
    name: "Prose",
    topics: ["Unit 1-4 Prose", "Character Analysis"],
  },
  {
    id: "ssc_english_1_03",
    number: 3,
    name: "Poetry",
    topics: ["Unit 1-4 Poems", "Poetry Devices"],
  },
  {
    id: "ssc_english_1_04",
    number: 4,
    name: "Drama",
    topics: ["Drama Text", "Scene Analysis"],
  }
];

// সব subjects এর curriculum
const curriculumMap: Record<string, SubjectCurriculum> = {
  // SSC
  ssc_bangla_1: { subjectId: "ssc_bangla_1", subjectName: "বাংলা ১ম পত্র", chapters: sscBangla1Chapters },
  ssc_bangla_2: { subjectId: "ssc_bangla_2", subjectName: "বাংলা ২য় পত্র", chapters: sscBangla2Chapters },
  ssc_english_1: { subjectId: "ssc_english_1", subjectName: "ইংরেজি ১ম পত্র", chapters: sscEnglish1Chapters },
  
  // HSC
  hsc_higher_math: { subjectId: "hsc_higher_math", subjectName: "উচ্চতর গণিত", chapters: hscHigherMathChapters },
  hsc_physics: { subjectId: "hsc_physics", subjectName: "পদার্থবিজ্ঞান", chapters: hscPhysicsChapters },
  hsc_chemistry: { subjectId: "hsc_chemistry", subjectName: "রসায়ন", chapters: hscChemistryChapters },
  hsc_biology: { subjectId: "hsc_biology", subjectName: "জীববিজ্ঞান", chapters: hscBiologyChapters },
};

export function getChaptersForSubject(subjectId: string): Chapter[] {
  return curriculumMap[subjectId]?.chapters || [];
}

export function getCurriculumBySubject(subjectId: string): SubjectCurriculum | null {
  return curriculumMap[subjectId] || null;
}

export function getAllCurriculums(): SubjectCurriculum[] {
  return Object.values(curriculumMap);
}
