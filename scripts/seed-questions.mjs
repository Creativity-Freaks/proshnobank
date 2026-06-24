/**
 * Seed real, diverse questions into question_bank
 * Covers: ssc_math, ssc_physics, ssc_chemistry, ssc_biology, ssc_bangla, ssc_english,
 *         hsc_physics, hsc_chemistry, hsc_biology, hsc_math, bcs_general, bcs_bangla,
 *         bcs_english, bcs_math, medical_biology
 */

const SUPA_TOKEN = process.env.SUPA_TOKEN;
const PROJECT_REF = process.env.PROJECT_REF;

const q = async (sql) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return await r.json();
};

// First clear existing placeholder questions
await q("DELETE FROM question_bank WHERE topic = 'algebra' AND subject = 'ssc_math' AND question_text = '২ + ২ = ?'");
console.log("Cleared placeholder questions");

const questions = [
  // === SSC গণিত ===
  { subject: "ssc_math", topic: "বীজগণিত", difficulty: "easy", question_text: "যদি x + 3 = 7 হয়, তাহলে x এর মান কত?", options: JSON.stringify(["২", "৩", "৪", "৫"]), correct_answer: 2, explanation: "x + 3 = 7 → x = 7 - 3 = 4" },
  { subject: "ssc_math", topic: "বীজগণিত", difficulty: "medium", question_text: "2x² - 5x + 3 = 0 সমীকরণের সমাধান কোনটি?", options: JSON.stringify(["x = 1 বা x = 3/2", "x = 2 বা x = 1", "x = 3 বা x = 1/2", "x = -1 বা x = 3"]), correct_answer: 0, explanation: "2x² - 5x + 3 = (2x-3)(x-1) = 0, সুতরাং x = 3/2 বা x = 1" },
  { subject: "ssc_math", topic: "জ্যামিতি", difficulty: "easy", question_text: "একটি আয়তক্ষেত্রের দৈর্ঘ্য ১২ সেমি এবং প্রস্থ ৮ সেমি হলে পরিসীমা কত?", options: JSON.stringify(["৩৬ সেমি", "৪০ সেমি", "৪৮ সেমি", "৯৬ সেমি"]), correct_answer: 1, explanation: "পরিসীমা = 2(দৈর্ঘ্য + প্রস্থ) = 2(12 + 8) = 40 সেমি" },
  { subject: "ssc_math", topic: "জ্যামিতি", difficulty: "medium", question_text: "একটি বৃত্তের ব্যাসার্ধ ৭ সেমি হলে ক্ষেত্রফল কত? (π = ২২/৭)", options: JSON.stringify(["১৪৪ বর্গ সেমি", "১৫৪ বর্গ সেমি", "১৬৪ বর্গ সেমি", "১৭৪ বর্গ সেমি"]), correct_answer: 1, explanation: "ক্ষেত্রফল = πr² = (22/7) × 7² = 154 বর্গ সেমি" },
  { subject: "ssc_math", topic: "সংখ্যা", difficulty: "easy", question_text: "১ থেকে ১০০ পর্যন্ত মৌলিক সংখ্যা কতটি?", options: JSON.stringify(["২৩টি", "২৪টি", "২৫টি", "২৬টি"]), correct_answer: 2, explanation: "১ থেকে ১০০ পর্যন্ত মোট ২৫টি মৌলিক সংখ্যা আছে" },
  { subject: "ssc_math", topic: "সংখ্যা", difficulty: "medium", question_text: "২৪৫ এর ৩০% কত?", options: JSON.stringify(["৭২.৫", "৭৩.৫", "৭৪.৫", "৭৫.৫"]), correct_answer: 1, explanation: "245 × 30/100 = 73.5" },
  { subject: "ssc_math", topic: "ত্রিকোণমিতি", difficulty: "medium", question_text: "sin 30° এর মান কত?", options: JSON.stringify(["১/২", "√২/২", "√৩/২", "১"]), correct_answer: 0, explanation: "sin 30° = 1/2" },
  { subject: "ssc_math", topic: "ত্রিকোণমিতি", difficulty: "hard", question_text: "cos²θ + sin²θ = ?", options: JSON.stringify(["০", "১", "২", "১/২"]), correct_answer: 1, explanation: "এটি পিথাগোরাসের ত্রিকোণমিতিক সূত্র — সর্বদা ১" },

  // === SSC পদার্থবিজ্ঞান ===
  { subject: "ssc_physics", topic: "গতি", difficulty: "easy", question_text: "নিউটনের প্রথম সূত্র অনুযায়ী কোনো বস্তু গতিশীল থাকলে কী ঘটে?", options: JSON.stringify(["ধীর হয়ে থামে", "একই বেগে সরলরেখায় চলতে থাকে", "গতি বাড়তে থাকে", "ঘুরতে থাকে"]), correct_answer: 1, explanation: "নিউটনের ১ম সূত্র: বাহ্যিক বল না থাকলে গতিশীল বস্তু সমবেগে চলতে থাকে" },
  { subject: "ssc_physics", topic: "গতি", difficulty: "medium", question_text: "একটি বস্তু ৫ m/s² ত্বরণে ১০ সেকেন্ড চললে বেগ কত হবে? (প্রাথমিক বেগ শূন্য)", options: JSON.stringify(["৪০ m/s", "৫০ m/s", "৬০ m/s", "৭০ m/s"]), correct_answer: 1, explanation: "v = u + at = 0 + 5×10 = 50 m/s" },
  { subject: "ssc_physics", topic: "বল ও চাপ", difficulty: "easy", question_text: "চাপের SI একক কী?", options: JSON.stringify(["নিউটন", "জুল", "পাসকেল", "ওয়াট"]), correct_answer: 2, explanation: "চাপের SI একক পাসকেল (Pa = N/m²)" },
  { subject: "ssc_physics", topic: "আলো", difficulty: "medium", question_text: "শূন্যমাধ্যমে আলোর বেগ কত?", options: JSON.stringify(["2×10⁸ m/s", "3×10⁸ m/s", "4×10⁸ m/s", "5×10⁸ m/s"]), correct_answer: 1, explanation: "শূন্যে আলোর বেগ প্রায় 3×10⁸ m/s" },
  { subject: "ssc_physics", topic: "বিদ্যুৎ", difficulty: "medium", question_text: "ওহমের সূত্র কোনটি?", options: JSON.stringify(["V = IR", "V = I/R", "V = I+R", "V = I²R"]), correct_answer: 0, explanation: "ওহমের সূত্র: V = IR (ভোল্টেজ = কারেন্ট × রোধ)" },
  { subject: "ssc_physics", topic: "বিদ্যুৎ", difficulty: "hard", question_text: "একটি বর্তনীতে ১২V ভোল্টেজ এবং ৩Ω রোধ থাকলে কারেন্ট কত?", options: JSON.stringify(["২A", "৩A", "৪A", "৫A"]), correct_answer: 2, explanation: "I = V/R = 12/3 = 4A" },

  // === SSC রসায়ন ===
  { subject: "ssc_chemistry", topic: "পরমাণু গঠন", difficulty: "easy", question_text: "পরমাণুর কেন্দ্রকে কী বলা হয়?", options: JSON.stringify(["ইলেকট্রন", "নিউক্লিয়াস", "প্রোটন", "নিউট্রন"]), correct_answer: 1, explanation: "পরমাণুর কেন্দ্রকে নিউক্লিয়াস বলে, এখানে প্রোটন ও নিউট্রন থাকে" },
  { subject: "ssc_chemistry", topic: "পরমাণু গঠন", difficulty: "medium", question_text: "হাইড্রোজেন পরমাণুতে প্রোটন সংখ্যা কত?", options: JSON.stringify(["০", "১", "২", "৩"]), correct_answer: 1, explanation: "হাইড্রোজেনের পারমাণবিক সংখ্যা ১, তাই প্রোটন সংখ্যা ১" },
  { subject: "ssc_chemistry", topic: "রাসায়নিক বন্ধন", difficulty: "medium", question_text: "NaCl কোন ধরনের বন্ধনে গঠিত?", options: JSON.stringify(["সমযোজী বন্ধন", "আয়নিক বন্ধন", "ধাতব বন্ধন", "হাইড্রোজেন বন্ধন"]), correct_answer: 1, explanation: "NaCl (খাদ্য লবণ) আয়নিক বন্ধনে গঠিত — Na⁺ এবং Cl⁻ আয়নের মাধ্যমে" },
  { subject: "ssc_chemistry", topic: "অ্যাসিড ও ক্ষার", difficulty: "easy", question_text: "বিশুদ্ধ পানির pH মান কত?", options: JSON.stringify(["৫", "৬", "৭", "৮"]), correct_answer: 2, explanation: "বিশুদ্ধ পানি নিরপেক্ষ, তাই pH = 7" },
  { subject: "ssc_chemistry", topic: "অ্যাসিড ও ক্ষার", difficulty: "medium", question_text: "HCl কোন ধরনের পদার্থ?", options: JSON.stringify(["ক্ষার", "অ্যাসিড", "লবণ", "নিরপেক্ষ"]), correct_answer: 1, explanation: "HCl (হাইড্রোক্লোরিক অ্যাসিড) একটি শক্তিশালী অ্যাসিড" },

  // === SSC জীববিজ্ঞান ===
  { subject: "ssc_biology", topic: "কোষ", difficulty: "easy", question_text: "জীবের গাঠনিক ও কার্যকরী একক কী?", options: JSON.stringify(["টিস্যু", "কোষ", "অঙ্গ", "অণু"]), correct_answer: 1, explanation: "কোষ হলো জীবের গাঠনিক ও কার্যকরী একক" },
  { subject: "ssc_biology", topic: "কোষ", difficulty: "medium", question_text: "সালোকসংশ্লেষণ কোথায় ঘটে?", options: JSON.stringify(["মাইটোকন্ড্রিয়া", "রাইবোজোম", "ক্লোরোপ্লাস্ট", "নিউক্লিয়াস"]), correct_answer: 2, explanation: "সালোকসংশ্লেষণ ক্লোরোপ্লাস্টে ঘটে, যেখানে ক্লোরোফিল থাকে" },
  { subject: "ssc_biology", topic: "উদ্ভিদ", difficulty: "easy", question_text: "সালোকসংশ্লেষণে কোন গ্যাস উৎপন্ন হয়?", options: JSON.stringify(["CO₂", "N₂", "O₂", "H₂"]), correct_answer: 2, explanation: "সালোকসংশ্লেষণে O₂ (অক্সিজেন) উৎপন্ন হয়" },
  { subject: "ssc_biology", topic: "পরিবেশ", difficulty: "medium", question_text: "খাদ্যশৃঙ্খলে শক্তির প্রবাহ কোন দিকে?", options: JSON.stringify(["উৎপাদক → ভোক্তা", "ভোক্তা → উৎপাদক", "বিয়োজক → উৎপাদক", "যেকোনো দিকে"]), correct_answer: 0, explanation: "খাদ্যশৃঙ্খলে শক্তি উৎপাদক থেকে ভোক্তার দিকে প্রবাহিত হয়" },

  // === HSC পদার্থবিজ্ঞান ===
  { subject: "hsc_physics", topic: "তরঙ্গ ও শব্দ", difficulty: "medium", question_text: "শব্দের তরঙ্গদৈর্ঘ্য এবং কম্পাঙ্কের মধ্যে সম্পর্ক কী?", options: JSON.stringify(["ব্যস্তানুপাতিক", "সমানুপাতিক", "বর্গের সমানুপাতিক", "কোনো সম্পর্ক নেই"]), correct_answer: 0, explanation: "v = fλ, তাই বেগ ধ্রুবক থাকলে f ও λ ব্যস্তানুপাতিক" },
  { subject: "hsc_physics", topic: "মহাকর্ষ", difficulty: "medium", question_text: "পৃথিবীর পৃষ্ঠে অভিকর্ষজ ত্বরণ প্রায় কত?", options: JSON.stringify(["8.8 m/s²", "9.8 m/s²", "10.8 m/s²", "11.8 m/s²"]), correct_answer: 1, explanation: "পৃথিবীর পৃষ্ঠে g ≈ 9.8 m/s²" },
  { subject: "hsc_physics", topic: "তাপগতিবিদ্যা", difficulty: "hard", question_text: "তাপগতিবিদ্যার প্রথম সূত্র কোনটি?", options: JSON.stringify(["ΔU = Q - W", "ΔU = Q + W", "Q = W", "ΔU = 0"]), correct_answer: 0, explanation: "তাপগতিবিদ্যার ১ম সূত্র: ΔU = Q - W (অভ্যন্তরীণ শক্তি = তাপ - কাজ)" },
  { subject: "hsc_physics", topic: "আলোকবিজ্ঞান", difficulty: "hard", question_text: "ইয়ং এর দ্বি-চির পরীক্ষায় কোন ঘটনা প্রমাণিত হয়?", options: JSON.stringify(["আলোর প্রতিফলন", "আলোর প্রতিসরণ", "আলোর ব্যতিচার", "আলোর শোষণ"]), correct_answer: 2, explanation: "ইয়ং এর দ্বি-চির পরীক্ষা আলোর তরঙ্গধর্ম ও ব্যতিচার প্রমাণ করে" },

  // === HSC রসায়ন ===
  { subject: "hsc_chemistry", topic: "জৈব রসায়ন", difficulty: "medium", question_text: "মিথেনের আণবিক সংকেত কী?", options: JSON.stringify(["C₂H₆", "CH₄", "C₃H₈", "C₄H₁₀"]), correct_answer: 1, explanation: "মিথেনের সংকেত CH₄ — সবচেয়ে সরল অ্যালকেন" },
  { subject: "hsc_chemistry", topic: "জৈব রসায়ন", difficulty: "hard", question_text: "ইথানলের কার্যকরী গ্রুপ কোনটি?", options: JSON.stringify(["-COOH", "-OH", "-CHO", "-NH₂"]), correct_answer: 1, explanation: "অ্যালকোহলের কার্যকরী গ্রুপ -OH (হাইড্রক্সিল)" },
  { subject: "hsc_chemistry", topic: "তড়িৎ রসায়ন", difficulty: "medium", question_text: "তড়িৎবিশ্লেষণে অক্সিডেশন কোথায় ঘটে?", options: JSON.stringify(["ক্যাথোড", "অ্যানোড", "উভয় ইলেকট্রোড", "দ্রবণে"]), correct_answer: 1, explanation: "তড়িৎবিশ্লেষণে অক্সিডেশন অ্যানোডে এবং বিজারণ ক্যাথোডে ঘটে" },

  // === HSC জীববিজ্ঞান ===
  { subject: "hsc_biology", topic: "DNA ও জিনতত্ত্ব", difficulty: "medium", question_text: "DNA-র দ্বিসূত্রক গঠন কে আবিষ্কার করেন?", options: JSON.stringify(["পাস্তুর ও কক", "ওয়াটসন ও ক্রিক", "ডারউইন ও ল্যামার্ক", "মেন্ডেল ও মর্গান"]), correct_answer: 1, explanation: "১৯৫৩ সালে ওয়াটসন ও ক্রিক DNA-র দ্বিসূত্রক গঠন আবিষ্কার করেন" },
  { subject: "hsc_biology", topic: "DNA ও জিনতত্ত্ব", difficulty: "hard", question_text: "DNA-তে অ্যাডেনিন কোন বেসের সাথে যুক্ত হয়?", options: JSON.stringify(["গুয়ানিন", "সাইটোসিন", "থাইমিন", "ইউরাসিল"]), correct_answer: 2, explanation: "DNA-তে অ্যাডেনিন (A) থাইমিন (T)-এর সাথে দুটি হাইড্রোজেন বন্ধনে যুক্ত হয়" },
  { subject: "hsc_biology", topic: "মানব শরীরতত্ত্ব", difficulty: "medium", question_text: "মানবদেহে রক্তের pH সাধারণত কত?", options: JSON.stringify(["৬.৮-৭.০", "৭.৩৫-৭.৪৫", "৭.৮-৮.০", "৬.৫-৬.৮"]), correct_answer: 1, explanation: "স্বাভাবিক রক্তের pH = 7.35-7.45 (সামান্য ক্ষারীয়)" },

  // === BCS বাংলা ===
  { subject: "bcs_bangla", topic: "বাংলা সাহিত্য", difficulty: "easy", question_text: "'আমার সোনার বাংলা' গানটির রচয়িতা কে?", options: JSON.stringify(["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জীবনানন্দ দাশ", "মাইকেল মধুসূদন দত্ত"]), correct_answer: 1, explanation: "রবীন্দ্রনাথ ঠাকুর ১৯০৫ সালে 'আমার সোনার বাংলা' গান রচনা করেন" },
  { subject: "bcs_bangla", topic: "বাংলা সাহিত্য", difficulty: "medium", question_text: "বাংলা সাহিত্যের প্রথম উপন্যাস কোনটি?", options: JSON.stringify(["বিষবৃক্ষ", "দুর্গেশনন্দিনী", "আলালের ঘরের দুলাল", "হুতোম প্যাঁচার নকশা"]), correct_answer: 1, explanation: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের 'দুর্গেশনন্দিনী' (১৮৬৫) বাংলা সাহিত্যের প্রথম উপন্যাস" },
  { subject: "bcs_bangla", topic: "ব্যাকরণ", difficulty: "easy", question_text: "'সূর্য' শব্দের প্রতিশব্দ কোনটি?", options: JSON.stringify(["চন্দ্র", "রবি", "তারা", "আকাশ"]), correct_answer: 1, explanation: "'রবি' সূর্যের প্রতিশব্দ। অন্য প্রতিশব্দ: আদিত্য, ভাস্কর, দিবাকর" },
  { subject: "bcs_bangla", topic: "ব্যাকরণ", difficulty: "medium", question_text: "'পদ্ম' শব্দের বিপরীত অর্থবোধক শব্দ কোনটি?", options: JSON.stringify(["কুসুম", "পঙ্কজ", "তামরস", "কণ্টক"]), correct_answer: 3, explanation: "পদ্ম সুন্দর ফুলের প্রতীক; কণ্টক (কাঁটা) বিপরীত অর্থবাহী" },

  // === BCS ইংরেজি ===
  { subject: "bcs_english", topic: "Grammar", difficulty: "easy", question_text: "Choose the correct sentence:", options: JSON.stringify(["He go to school", "He goes to school", "He going to school", "He gone to school"]), correct_answer: 1, explanation: "Third person singular takes 's' with the verb: He goes" },
  { subject: "bcs_english", topic: "Grammar", difficulty: "medium", question_text: "The passive voice of 'I love you' is:", options: JSON.stringify(["You are being loved by me", "You were loved by me", "You are loved by me", "You will be loved by me"]), correct_answer: 2, explanation: "Simple present passive: Subject + is/am/are + past participle + by + object" },
  { subject: "bcs_english", topic: "Vocabulary", difficulty: "easy", question_text: "What is the synonym of 'happy'?", options: JSON.stringify(["Sad", "Joyful", "Angry", "Tired"]), correct_answer: 1, explanation: "Joyful means full of joy/happiness — synonym of happy" },
  { subject: "bcs_english", topic: "Vocabulary", difficulty: "medium", question_text: "What is the antonym of 'benevolent'?", options: JSON.stringify(["Kind", "Generous", "Malevolent", "Caring"]), correct_answer: 2, explanation: "Malevolent means wishing harm — antonym of benevolent (wishing good)" },

  // === BCS গণিত ===
  { subject: "bcs_math", topic: "পাটিগণিত", difficulty: "easy", question_text: "একটি ট্রেন ৬০ km/h গতিতে ৩ ঘণ্টায় কত দূরত্ব অতিক্রম করবে?", options: JSON.stringify(["১৫০ km", "১৮০ km", "২১০ km", "২৪০ km"]), correct_answer: 1, explanation: "দূরত্ব = গতি × সময় = 60 × 3 = 180 km" },
  { subject: "bcs_math", topic: "পাটিগণিত", difficulty: "medium", question_text: "৩ জন মিলে একটি কাজ ১২ দিনে করতে পারে। ৬ জন মিলে কতদিনে করবে?", options: JSON.stringify(["৪ দিন", "৫ দিন", "৬ দিন", "৮ দিন"]), correct_answer: 2, explanation: "3 × 12 = 6 × x → x = 36/6 = 6 দিন" },
  { subject: "bcs_math", topic: "পাটিগণিত", difficulty: "hard", question_text: "৪৫ জন শিক্ষার্থীর গড় বয়স ১৮ বছর। ১৫ জন চলে গেলে বাকিদের গড় বয়স ১৬ বছর হয়। যারা চলে গেল তাদের গড় বয়স কত?", options: JSON.stringify(["২০ বছর", "২২ বছর", "২৪ বছর", "২৬ বছর"]), correct_answer: 2, explanation: "মোট = 45×18=810; বাকিদের মোট = 30×16=480; চলে যাওয়াদের মোট = 810-480=330; গড় = 330/15 = 22 বছর। সঠিক উত্তর ২২ বছর।" },
  { subject: "bcs_math", topic: "বীজগণিত", difficulty: "medium", question_text: "log₂(8) এর মান কত?", options: JSON.stringify(["২", "৩", "৪", "৫"]), correct_answer: 1, explanation: "log₂(8) = log₂(2³) = 3" },

  // === BCS সাধারণ জ্ঞান ===
  { subject: "bcs_general", topic: "বাংলাদেশ", difficulty: "easy", question_text: "বাংলাদেশ কত সালে স্বাধীন হয়?", options: JSON.stringify(["১৯৬৯", "১৯৭০", "১৯৭১", "১৯৭২"]), correct_answer: 2, explanation: "বাংলাদেশ ১৯৭১ সালের ১৬ই ডিসেম্বর স্বাধীন হয়" },
  { subject: "bcs_general", topic: "বাংলাদেশ", difficulty: "medium", question_text: "বাংলাদেশের সবচেয়ে বড় জেলা কোনটি?", options: JSON.stringify(["ঢাকা", "চট্টগ্রাম", "রাঙ্গামাটি", "ময়মনসিংহ"]), correct_answer: 2, explanation: "আয়তনের দিক থেকে রাঙ্গামাটি বাংলাদেশের সবচেয়ে বড় জেলা" },
  { subject: "bcs_general", topic: "আন্তর্জাতিক", difficulty: "easy", question_text: "জাতিসংঘ কত সালে প্রতিষ্ঠিত হয়?", options: JSON.stringify(["১৯৪৩", "১৯৪৪", "১৯৪৫", "১৯৪৬"]), correct_answer: 2, explanation: "জাতিসংঘ ১৯৪৫ সালের ২৪ অক্টোবর প্রতিষ্ঠিত হয়" },
  { subject: "bcs_general", topic: "আন্তর্জাতিক", difficulty: "medium", question_text: "পৃথিবীর বৃহত্তম মহাসাগর কোনটি?", options: JSON.stringify(["আটলান্টিক", "ভারত", "প্রশান্ত", "আর্কটিক"]), correct_answer: 2, explanation: "প্রশান্ত মহাসাগর পৃথিবীর বৃহত্তম মহাসাগর" },
  { subject: "bcs_general", topic: "বিজ্ঞান ও প্রযুক্তি", difficulty: "easy", question_text: "WWW এর পূর্ণ রূপ কী?", options: JSON.stringify(["World Wide Web", "World Web Wide", "Wide World Web", "Web World Wide"]), correct_answer: 0, explanation: "WWW = World Wide Web, ১৯৮৯ সালে Tim Berners-Lee উদ্ভাবন করেন" },

  // === মেডিকেল জীববিজ্ঞান ===
  { subject: "medical_biology", topic: "শারীরস্থান", difficulty: "medium", question_text: "মানব হৃদয়ে কতটি প্রকোষ্ঠ আছে?", options: JSON.stringify(["দুটি", "তিনটি", "চারটি", "পাঁচটি"]), correct_answer: 2, explanation: "মানব হৃদয়ে চারটি প্রকোষ্ঠ: দুটি অলিন্দ ও দুটি নিলয়" },
  { subject: "medical_biology", topic: "শারীরস্থান", difficulty: "medium", question_text: "রক্তে হিমোগ্লোবিনের কাজ কী?", options: JSON.stringify(["পুষ্টি পরিবহন", "অক্সিজেন পরিবহন", "অ্যান্টিবডি তৈরি", "রোগ প্রতিরোধ"]), correct_answer: 1, explanation: "হিমোগ্লোবিন লোহিত রক্তকণিকায় থাকে এবং O₂ পরিবহন করে" },
  { subject: "medical_biology", topic: "শারীরস্থান", difficulty: "hard", question_text: "মানব শরীরে সবচেয়ে বড় অঙ্গ কোনটি?", options: JSON.stringify(["যকৃৎ", "ফুসফুস", "ত্বক", "পাকস্থলী"]), correct_answer: 2, explanation: "ত্বক মানব শরীরের সবচেয়ে বড় অঙ্গ" },
  { subject: "medical_biology", topic: "বায়োকেমিস্ট্রি", difficulty: "hard", question_text: "ইনসুলিন কোথায় তৈরি হয়?", options: JSON.stringify(["যকৃতে", "অগ্ন্যাশয়ে", "বৃক্কে", "প্লীহায়"]), correct_answer: 1, explanation: "ইনসুলিন অগ্ন্যাশয়ের (Pancreas) β-কোষে তৈরি হয়" },
  { subject: "medical_biology", topic: "বায়োকেমিস্ট্রি", difficulty: "medium", question_text: "কোষের শক্তি উৎপাদনের কেন্দ্র কোনটি?", options: JSON.stringify(["নিউক্লিয়াস", "রাইবোজোম", "মাইটোকন্ড্রিয়া", "গলজি বডি"]), correct_answer: 2, explanation: "মাইটোকন্ড্রিয়াকে কোষের 'পাওয়ার হাউস' বলা হয়" },
];

console.log(`Inserting ${questions.length} questions...`);

// Insert in batches of 10
for (let i = 0; i < questions.length; i += 10) {
  const batch = questions.slice(i, i + 10);
  const values = batch.map(q =>
    `('${q.subject}', '${q.topic}', '${q.difficulty}', '${q.question_text.replace(/'/g, "''")}', '${q.options.replace(/'/g, "''")}', ${q.correct_answer}, '${q.explanation.replace(/'/g, "''")}')`
  ).join(",\n");

  const result = await q(`
    INSERT INTO question_bank (subject, topic, difficulty, question_text, options, correct_answer, explanation)
    VALUES ${values}
    RETURNING id
  `);

  if (result.message) {
    console.error(`Batch ${i/10 + 1} ERROR:`, result.message.slice(0, 200));
  } else {
    console.log(`Batch ${i/10 + 1}: inserted ${result.length} questions`);
  }
}

const count = await q("SELECT COUNT(*) FROM question_bank");
console.log("\nTotal questions in DB:", count[0]?.count);
