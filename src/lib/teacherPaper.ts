/**
 * Teacher question-paper & OMR helpers.
 *
 * Pure, dependency-free utilities used by the teacher panel to generate
 * print-ready (PDF via the browser print dialog) question papers and OMR
 * sheets, and to grade OMR responses client-side.
 */

export type InstitutionProfile = {
  name: string;
  address: string;
  logoUrl: string;
  motto: string;
};

export const EMPTY_INSTITUTION: InstitutionProfile = {
  name: "",
  address: "",
  logoUrl: "",
  motto: "",
};

type Metadata = Record<string, unknown> | null | undefined;

function readString(metadata: Metadata, key: string): string {
  if (!metadata) return "";
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Pull the institution profile out of Supabase auth `user_metadata`. */
export function readInstitutionProfile(metadata: Metadata): InstitutionProfile {
  return {
    name: readString(metadata, "institution_name") || readString(metadata, "institute"),
    address: readString(metadata, "institution_address") || readString(metadata, "location"),
    logoUrl: readString(metadata, "institution_logo"),
    motto: readString(metadata, "institution_motto"),
  };
}

export type PaperQuestion = {
  question_text: string;
  options: string[];
  correct_answer?: number;
};

export type PaperOptions = {
  examName: string;
  subject: string;
  className: string;
  timeText: string;
  fullMarks: string;
  setCode: string;
  columns: 1 | 2;
  fontSize: number;
  instructions: string;
  includeAnswerKey: boolean;
  watermark: string;
  institution: InstitutionProfile;
};

export const OPTION_LETTERS = ["ক", "খ", "গ", "ঘ", "ঙ"] as const;
export const LATIN_LETTERS = ["A", "B", "C", "D", "E"] as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paperHeader(options: PaperOptions): string {
  const inst = options.institution;
  const logo = inst.logoUrl
    ? `<img class="logo" src="${escapeHtml(inst.logoUrl)}" alt="logo" />`
    : "";
  const name = inst.name ? `<div class="inst-name">${escapeHtml(inst.name)}</div>` : "";
  const motto = inst.motto ? `<div class="inst-motto">${escapeHtml(inst.motto)}</div>` : "";
  const address = inst.address ? `<div class="inst-addr">${escapeHtml(inst.address)}</div>` : "";
  const exam = options.examName ? `<div class="exam-name">${escapeHtml(options.examName)}</div>` : "";

  const metaParts = [
    options.subject ? `বিষয়: ${escapeHtml(options.subject)}` : "",
    options.className ? `শ্রেণি: ${escapeHtml(options.className)}` : "",
    options.timeText ? `সময়: ${escapeHtml(options.timeText)}` : "",
    options.fullMarks ? `পূর্ণমান: ${escapeHtml(options.fullMarks)}` : "",
  ].filter(Boolean);

  return `
    <div class="header">
      ${logo}
      <div class="header-text">
        ${name}
        ${motto}
        ${address}
        ${exam}
      </div>
      ${options.setCode ? `<div class="set-code">সেট<br/>${escapeHtml(options.setCode)}</div>` : ""}
    </div>
    ${metaParts.length ? `<div class="meta-row">${metaParts.map((p) => `<span>${p}</span>`).join("")}</div>` : ""}
    ${options.instructions ? `<div class="instructions">${escapeHtml(options.instructions)}</div>` : ""}
  `;
}

function questionBlock(question: PaperQuestion, index: number): string {
  const text = escapeHtml(question.question_text);
  const opts = question.options
    .map((opt, i) => {
      const letter = OPTION_LETTERS[i] ?? LATIN_LETTERS[i] ?? String(i + 1);
      return `<span class="opt">${letter}. ${escapeHtml(opt)}</span>`;
    })
    .join("");
  return `
    <div class="q">
      <div class="q-text">${index + 1}. ${text}</div>
      <div class="opts">${opts}</div>
    </div>
  `;
}

function answerKeyBlock(questions: PaperQuestion[]): string {
  const cells = questions
    .map((q, idx) => {
      const ans = typeof q.correct_answer === "number" ? LATIN_LETTERS[q.correct_answer] ?? "?" : "?";
      return `<span class="ak">${idx + 1}-${ans}</span>`;
    })
    .join("");
  return `
    <div class="answer-key">
      <div class="ak-title">উত্তরমালা (Answer Key)</div>
      <div class="ak-grid">${cells}</div>
    </div>
  `;
}

/** Build a full printable HTML document for a question paper. */
export function buildQuestionPaperHtml(options: PaperOptions, questions: PaperQuestion[]): string {
  const title = options.examName || options.institution.name || "প্রশ্নপত্র";
  const body = questions.map((q, idx) => questionBlock(q, idx)).join("\n");
  const watermark = options.watermark
    ? `<div class="watermark">${escapeHtml(options.watermark)}</div>`
    : "";
  const answerKey = options.includeAnswerKey ? answerKeyBlock(questions) : "";

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Noto Sans Bengali", "Hind Siliguri", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 28px 32px;
      color: #111;
      font-size: ${options.fontSize}px;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 45%;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 64px;
      color: rgba(0,0,0,0.06);
      transform: rotate(-24deg);
      pointer-events: none;
      z-index: 0;
      white-space: nowrap;
    }
    .header { display: flex; align-items: center; gap: 14px; border-bottom: 2px solid #111; padding-bottom: 10px; }
    .logo { height: 56px; width: 56px; object-fit: contain; }
    .header-text { flex: 1; text-align: center; }
    .inst-name { font-size: 1.6em; font-weight: 800; }
    .inst-motto { font-size: 0.85em; color: #444; }
    .inst-addr { font-size: 0.8em; color: #555; }
    .exam-name { margin-top: 4px; font-weight: 700; }
    .set-code { border: 1.5px solid #111; border-radius: 6px; padding: 4px 8px; text-align: center; font-weight: 700; font-size: 0.8em; }
    .meta-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin: 10px 0; font-weight: 600; font-size: 0.95em; }
    .instructions { border: 1px dashed #999; border-radius: 6px; padding: 8px 10px; margin-bottom: 12px; font-size: 0.85em; color: #333; }
    .questions { column-count: ${options.columns}; column-gap: 28px; position: relative; z-index: 1; }
    .q { break-inside: avoid; margin: 0 0 12px; }
    .q-text { font-weight: 600; margin-bottom: 4px; }
    .opts { display: flex; flex-wrap: wrap; gap: 6px 18px; padding-left: 14px; }
    .opt { white-space: nowrap; }
    .answer-key { margin-top: 22px; border-top: 2px dashed #111; padding-top: 10px; break-before: page; }
    .ak-title { font-weight: 700; margin-bottom: 8px; }
    .ak-grid { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 0.9em; }
    .ak { font-weight: 600; }
    .toolbar { position: sticky; top: 0; background: #0b2545; color: #fff; padding: 10px 14px; display: flex; gap: 10px; justify-content: flex-end; z-index: 5; }
    .toolbar button { font: inherit; padding: 6px 14px; border-radius: 6px; border: 0; cursor: pointer; background: #f4b400; color: #111; font-weight: 700; }
    @media print { .toolbar { display: none; } body { padding: 12px 16px; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <button onclick="window.print()">প্রিন্ট / PDF</button>
  </div>
  ${watermark}
  ${paperHeader(options)}
  <div class="questions">
    ${body}
  </div>
  ${answerKey}
</body>
</html>`;
}

export type OmrSheetOptions = {
  title: string;
  questionCount: number;
  optionCount: number;
  columns: number;
  institution: InstitutionProfile;
};

/** Build a printable OMR answer sheet. */
export function buildOmrSheetHtml(options: OmrSheetOptions): string {
  const optionCount = Math.min(Math.max(options.optionCount, 2), 5);
  const rows = Array.from({ length: Math.max(1, options.questionCount) }, (_, i) => {
    const bubbles = Array.from({ length: optionCount }, (_, o) => {
      return `<span class="bubble">${LATIN_LETTERS[o]}</span>`;
    }).join("");
    return `<div class="omr-row"><span class="omr-no">${i + 1}.</span>${bubbles}</div>`;
  }).join("");

  return `<!doctype html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(options.title || "OMR Sheet")}</title>
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
    .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 12px; }
    .inst-name { font-size: 20px; font-weight: 800; }
    .fields { display: flex; gap: 16px; flex-wrap: wrap; margin: 12px 0 18px; }
    .field { flex: 1; min-width: 160px; border-bottom: 1px solid #111; padding-bottom: 4px; font-size: 13px; }
    .omr { column-count: ${Math.max(1, options.columns)}; column-gap: 26px; }
    .omr-row { break-inside: avoid; display: flex; align-items: center; gap: 8px; margin: 4px 0; }
    .omr-no { width: 28px; text-align: right; font-weight: 600; font-size: 13px; }
    .bubble { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border: 1.5px solid #111; border-radius: 50%; font-size: 11px; }
    .toolbar { position: sticky; top: 0; background: #0b2545; color: #fff; padding: 10px 14px; display: flex; justify-content: flex-end; }
    .toolbar button { font: inherit; padding: 6px 14px; border-radius: 6px; border: 0; cursor: pointer; background: #f4b400; color: #111; font-weight: 700; }
    @media print { .toolbar { display: none; } body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="toolbar"><button onclick="window.print()">প্রিন্ট / PDF</button></div>
  <div class="header">
    <div class="inst-name">${escapeHtml(options.institution.name || "OMR Answer Sheet")}</div>
    <div>${escapeHtml(options.title || "")}</div>
  </div>
  <div class="fields">
    <div class="field">নাম: </div>
    <div class="field">রোল: </div>
    <div class="field">সেট: </div>
  </div>
  <div class="omr">${rows}</div>
</body>
</html>`;
}

/** Open an HTML document in a new tab for printing. Returns false if blocked. */
export function openPrintWindow(html: string): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

export type OmrResult = {
  correct: number;
  wrong: number;
  blank: number;
  score: number;
  total: number;
};

function normalizeAnswer(value: string): string {
  return value.trim().toUpperCase();
}

/** Grade a single OMR response against the answer key. */
export function gradeOmr(
  answerKey: string[],
  responses: string[],
  marksPerQuestion: number,
  negativeMarks: number,
): OmrResult {
  let correct = 0;
  let wrong = 0;
  let blank = 0;
  answerKey.forEach((keyRaw, idx) => {
    const key = normalizeAnswer(keyRaw);
    const given = normalizeAnswer(responses[idx] ?? "");
    if (!key) return;
    if (!given) {
      blank += 1;
    } else if (given === key) {
      correct += 1;
    } else {
      wrong += 1;
    }
  });
  const score = correct * marksPerQuestion - wrong * negativeMarks;
  const total = answerKey.filter((k) => normalizeAnswer(k)).length * marksPerQuestion;
  return { correct, wrong, blank, score: Number(score.toFixed(2)), total };
}

/** Parse a free-form answer string like "ABCD, A B C" into letters. */
export function parseAnswers(input: string): string[] {
  return input
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}
