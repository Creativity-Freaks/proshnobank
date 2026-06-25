/**
 * ProshnoBank — HTML-to-PDF Report Generator
 *
 * Renders an off-screen HTML div with proper font support,
 * captures it with html2canvas, then embeds into jsPDF.
 * This approach lets the browser handle Bengali text shaping
 * correctly — no font-glyph / ligature issues.
 */

export type Language = "en" | "bn";

// ── Brand colours ────────────────────────────────────────────────────────────
export const COLORS = {
  blue:      "#1e40af",
  blueLight: "#3b82f6",
  blueFade:  "#eff6ff",
  teal:      "#0f766e",
  amber:     "#d97706",
  dark:      "#0f172a",
  slate:     "#334155",
  muted:     "#64748b",
  border:    "#cbd5e1",
  rowAlt:    "#f8fafc",
  white:     "#ffffff",
  green:     "#16a34a",
};

// ── i18n ─────────────────────────────────────────────────────────────────────
export const i18n: Record<Language, Record<string, string>> = {
  en: {
    date: "Date", period: "Period", category: "Category",
    difficulty: "Difficulty", status: "Status", plan: "Plan",
    all: "All", share: "Share %", month: "Month",
    page: "Page", of: "of", generated: "Generated",
    confidential: "ProshnoBank — Official Report | Confidential",
    watermark: "ProshnoBank  |  www.proshnobank.com  |  Auto-generated — Confidential",
    // analytics
    analytics_title: "ProshnoBank — Analytics Report",
    analytics_subtitle: "Detailed Exam Performance Statistics",
    analytics_summary: "Summary (Key Metrics)",
    analytics_total_questions: "Total Questions",
    analytics_total_users: "Total Users",
    analytics_total_attempts: "Total Attempts",
    analytics_avg_accuracy: "Avg Accuracy",
    analytics_categories: "Categories",
    analytics_subjects: "Subjects",
    analytics_subject_breakdown: "Subject Breakdown",
    analytics_difficulty_dist: "Difficulty Distribution",
    analytics_score_dist: "Score Band Distribution",
    analytics_category_breakdown: "Category-wise Question Count",
    subject: "Subject", questions: "Questions", attempts: "Attempts",
    avg_score: "Avg Score", difficulty_level: "Difficulty Level",
    count: "Count", percentage: "%", score_range: "Score Range",
    students: "Students",
    // revenue
    revenue_title: "ProshnoBank — Revenue Report",
    revenue_subtitle: "Detailed Subscription & Batch Revenue Analysis",
    revenue_summary: "Key Metrics",
    revenue_total: "Total Revenue",
    revenue_subscription: "Subscription Revenue",
    revenue_batch: "Batch Revenue",
    revenue_total_subscribers: "Total Subscribers",
    revenue_active_subscribers: "Active Subscribers",
    revenue_batch_enrollments: "Batch Enrollments",
    revenue_plan_breakdown: "Plan-wise Subscriptions",
    revenue_batch_breakdown: "Batch-wise Revenue",
    revenue_monthly_trend: "Monthly Revenue Trend",
    plan_name: "Plan Name", subscribers: "Subscribers",
    revenue: "Revenue (৳)", batch_name: "Batch Name",
    enrolled: "Enrolled", price: "Price (৳)", total: "Total (৳)",
    sub_revenue: "Subscription (৳)", batch_revenue: "Batch (৳)",
  },
  bn: {
    date: "তারিখ", period: "সময়সীমা", category: "ক্যাটেগরি",
    difficulty: "কঠিনতা", status: "স্ট্যাটাস", plan: "প্ল্যান",
    all: "সব", share: "অংশ %", month: "মাস",
    page: "পৃষ্ঠা", of: "/", generated: "তৈরি",
    confidential: "প্রশ্নব্যাংক — অফিসিয়াল রিপোর্ট | গোপনীয়",
    watermark: "প্রশ্নব্যাংক  |  www.proshnobank.com  |  স্বয়ংক্রিয়ভাবে তৈরি — গোপনীয়",
    // analytics
    analytics_title: "প্রশ্নব্যাংক — বিশ্লেষণ রিপোর্ট",
    analytics_subtitle: "পরীক্ষা কার্যক্রমের বিস্তারিত পরিসংখ্যান",
    analytics_summary: "সারসংক্ষেপ (মূল পরিসংখ্যান)",
    analytics_total_questions: "মোট প্রশ্ন",
    analytics_total_users: "মোট ব্যবহারকারী",
    analytics_total_attempts: "মোট পরীক্ষা",
    analytics_avg_accuracy: "গড় নির্ভুলতা",
    analytics_categories: "ক্যাটেগরি",
    analytics_subjects: "বিষয়",
    analytics_subject_breakdown: "বিষয়ভিত্তিক বিশ্লেষণ",
    analytics_difficulty_dist: "প্রশ্নের কঠিনতার স্তর",
    analytics_score_dist: "স্কোর বিতরণ",
    analytics_category_breakdown: "ক্যাটেগরিভিত্তিক প্রশ্নের সংখ্যা",
    subject: "বিষয়", questions: "প্রশ্ন সংখ্যা", attempts: "পরীক্ষার সংখ্যা",
    avg_score: "গড় স্কোর", difficulty_level: "কঠিনতার স্তর",
    count: "সংখ্যা", percentage: "শতাংশ", score_range: "স্কোর রেঞ্জ",
    students: "শিক্ষার্থী",
    // revenue
    revenue_title: "প্রশ্নব্যাংক — রেভিনিউ রিপোর্ট",
    revenue_subtitle: "সাবস্ক্রিপশন ও ব্যাচ আয়ের বিস্তারিত বিশ্লেষণ",
    revenue_summary: "মূল পরিসংখ্যান",
    revenue_total: "মোট আয়",
    revenue_subscription: "সাবস্ক্রিপশন আয়",
    revenue_batch: "ব্যাচ আয়",
    revenue_total_subscribers: "মোট গ্রাহক",
    revenue_active_subscribers: "সক্রিয় গ্রাহক",
    revenue_batch_enrollments: "ব্যাচ এনরোলমেন্ট",
    revenue_plan_breakdown: "প্ল্যান অনুযায়ী সাবস্ক্রিপশন",
    revenue_batch_breakdown: "ব্যাচ অনুযায়ী আয়",
    revenue_monthly_trend: "মাসিক আয়ের ধারা",
    plan_name: "প্ল্যানের নাম", subscribers: "গ্রাহক",
    revenue: "আয় (৳)", batch_name: "ব্যাচের নাম",
    enrolled: "এনরোল্ড", price: "মূল্য (৳)", total: "মোট (৳)",
    sub_revenue: "সাবস্ক্রিপশন আয় (৳)", batch_revenue: "ব্যাচ আয় (৳)",
  },
};

// ── HTML helpers ─────────────────────────────────────────────────────────────

function sectionHeading(title: string): string {
  return `
    <div style="background:${COLORS.blue};border-radius:6px;padding:8px 14px;margin:18px 0 10px;display:flex;align-items:center;gap:10px;">
      <div style="width:4px;height:18px;background:${COLORS.blueLight};border-radius:2px;flex-shrink:0;"></div>
      <span style="color:#fff;font-weight:700;font-size:13px;">${title}</span>
    </div>`;
}

function kpiCard(label: string, value: string): string {
  return `
    <div style="border:1.5px solid ${COLORS.border};border-radius:8px;padding:12px 14px;background:#fff;display:flex;flex-direction:column;gap:6px;min-width:0;">
      <div style="color:${COLORS.muted};font-size:10px;font-weight:500;">${label}</div>
      <div style="color:${COLORS.dark};font-size:18px;font-weight:700;">${value}</div>
    </div>`;
}

interface ColDef {
  header: string;
  key: string;
  align?: "left" | "right" | "center";
  flex?: number;
}

function dataTable(columns: ColDef[], rows: Record<string, any>[], headerBg = COLORS.blue): string {
  const colStyle = (col: ColDef) =>
    `flex:${col.flex ?? 1};text-align:${col.align ?? "left"};padding:0 8px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;

  const headerRow = `
    <div style="display:flex;background:${headerBg};border-radius:5px 5px 0 0;padding:8px 0;">
      ${columns.map(c => `<div style="${colStyle(c)}color:#fff;font-size:10px;font-weight:700;">${c.header}</div>`).join("")}
    </div>`;

  const dataRows = rows.map((row, i) => `
    <div style="display:flex;background:${i % 2 === 0 ? "#fff" : COLORS.rowAlt};padding:7px 0;border-bottom:1px solid ${COLORS.border};">
      ${columns.map(c => `<div style="${colStyle(c)}color:${COLORS.dark};font-size:10.5px;">${row[c.key] ?? "—"}</div>`).join("")}
    </div>`).join("");

  return `
    <div style="border:1px solid ${COLORS.border};border-radius:6px;overflow:hidden;margin-bottom:14px;">
      ${headerRow}
      ${dataRows}
    </div>`;
}

// ── Main HTML builder ─────────────────────────────────────────────────────────

export interface ReportSection {
  heading: string;
  content: string; // raw HTML
}

export function buildReportHtml(opts: {
  lang: Language;
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  logoBase64?: string;
  sections: ReportSection[];
}): string {
  const { lang, title, subtitle, meta, logoBase64, sections } = opts;
  const t = i18n[lang];
  const now = new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });
  const fontUrl =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap";

  const metaBadges = [{ label: t.date, value: now }, ...meta]
    .map(m => `<span style="font-size:9px;color:#bfdbfe;white-space:nowrap;">${m.label}: <strong style="color:#fff">${m.value}</strong></span>`)
    .join('<span style="color:#3b82f6;margin:0 6px;">|</span>');

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" style="height:48px;width:auto;object-fit:contain;" alt="ProshnoBank" />`
    : `<div style="width:48px;height:48px;background:#fff2;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;">P</div>`;

  const sectionsHtml = sections.map(s => sectionHeading(s.heading) + s.content).join("");

  const genTs = new Date().toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { dateStyle: "short", timeStyle: "short" });

  return `<!DOCTYPE html>
<html lang="${lang === "bn" ? "bn" : "en"}">
<head>
<meta charset="UTF-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
<link href="${fontUrl}" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{
  font-family:${lang === "bn" ? "'Noto Sans Bengali'" : "'Inter'"}, 'Noto Sans Bengali', 'Inter', sans-serif;
  background:#fff;width:794px;color:${COLORS.dark};
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
</style>
</head>
<body>
<!-- HEADER -->
<div style="background:${COLORS.blue};padding:18px 28px 0;">
  <div style="display:flex;align-items:center;gap:16px;padding-bottom:14px;">
    ${logoHtml}
    <div style="flex:1;">
      <div style="font-size:20px;font-weight:700;color:#fff;line-height:1.2;">${title}</div>
      <div style="font-size:11px;color:#bfdbfe;margin-top:4px;">${subtitle}</div>
    </div>
  </div>
  <div style="background:${COLORS.blueLight};height:3px;margin:0 -28px;"></div>
  <div style="background:${COLORS.blueFade};padding:7px 0;margin:0 -28px;padding-left:28px;padding-right:28px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
    ${metaBadges}
  </div>
</div>
<!-- WATERMARK BAR -->
<div style="background:#f1f5f9;padding:5px 28px;font-size:9px;color:${COLORS.muted};text-align:center;border-bottom:1px solid ${COLORS.border};">
  ${t.watermark}
</div>
<!-- CONTENT -->
<div style="padding:10px 28px 20px;">
  ${sectionsHtml}
</div>
<!-- FOOTER -->
<div style="background:${COLORS.blueFade};border-top:1px solid ${COLORS.border};padding:8px 28px;display:flex;justify-content:space-between;align-items:center;">
  <span style="font-size:9px;color:${COLORS.muted};">${t.confidential}</span>
  <span style="font-size:9px;color:${COLORS.muted};">${t.generated}: ${genTs}</span>
</div>
</body>
</html>`;
}

// ── KPI grid HTML ─────────────────────────────────────────────────────────────
export function buildKpiGrid(kpis: { label: string; value: string }[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:4px;">
    ${kpis.map(k => kpiCard(k.label, k.value)).join("")}
  </div>`;
}

// ── Table HTML ────────────────────────────────────────────────────────────────
export function buildTable(
  columns: ColDef[],
  rows: Record<string, any>[],
  headerBg = COLORS.blue,
): string {
  return dataTable(columns, rows, headerBg);
}

// ── Core: render HTML to PDF pages ───────────────────────────────────────────
export async function htmlToPdf(
  html: string,
  fileName: string,
): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  // Create hidden container
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-1;";
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  // Small extra wait for webfonts
  await new Promise(r => setTimeout(r, 600));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.97);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = 210;
    const pdfH = (canvas.height / canvas.width) * pdfW;
    const pageH = 297;

    // Multi-page support: slice canvas into A4 pages
    let yOffset = 0;
    let firstPage = true;
    const sliceH = Math.floor((pageH / pdfW) * canvas.width);

    while (yOffset < canvas.height) {
      if (!firstPage) pdf.addPage();
      firstPage = false;

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.min(sliceH, canvas.height - yOffset);
      const ctx = sliceCanvas.getContext("2d")!;
      ctx.drawImage(canvas, 0, -yOffset);

      const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.97);
      const sliceDisplayH = (sliceCanvas.height / canvas.width) * pdfW;
      pdf.addImage(sliceData, "JPEG", 0, 0, pdfW, sliceDisplayH);
      yOffset += sliceH;
    }

    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}
