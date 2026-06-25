/**
 * ProshnoBank — Official Report Generator
 * Shared PDF utility for all admin reports.
 *
 * Layout per page:
 *   ┌──────────────────────────────────┐
 *   │  HEADER  (logo + title + meta)   │  h=38mm
 *   │  thin accent line                │
 *   │  CONTENT                         │
 *   │  thin accent line                │
 *   │  FOOTER  (page X/Y + date)       │  h=12mm
 *   └──────────────────────────────────┘
 */

// Brand palette
export const BRAND = {
  blue:        [30,  64, 175] as [number, number, number],   // #1e40af
  blueLight:   [59,  130, 246] as [number, number, number],  // #3b82f6
  blueFade:    [239, 246, 255] as [number, number, number],  // #eff6ff
  teal:        [15,  118, 110] as [number, number, number],  // #0f766e
  green:       [22,  163, 74]  as [number, number, number],  // #16a34a
  amber:       [217, 119, 6]   as [number, number, number],  // #d97706
  red:         [220, 38,  38]  as [number, number, number],  // #dc2626
  dark:        [15,  23,  42]  as [number, number, number],  // #0f172a
  slate:       [51,  65,  85]  as [number, number, number],  // #334155
  muted:       [100, 116, 139] as [number, number, number],  // #64748b
  border:      [203, 213, 225] as [number, number, number],  // #cbd5e1
  rowAlt:      [248, 250, 252] as [number, number, number],  // #f8fafc
  white:       [255, 255, 255] as [number, number, number],
  pageGutter:  15, // mm left/right margin
};

// A4 dimensions
export const A4 = { W: 210, H: 297 };

export interface ReportPage {
  doc: any;       // jsPDF instance
  y: number;      // current Y cursor (mm)
  W: number;
  H: number;
  M: number;      // horizontal margin
  contentW: number;
}

/** Loads logo as HTMLImageElement (resolves or rejects silently) */
async function loadLogoImage(): Promise<HTMLImageElement | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/proshnobank.png";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("logo load fail"));
    });
    return img;
  } catch {
    return null;
  }
}

/**
 * Draw the full header on the current page.
 * Returns the Y position right after the header separator line.
 */
function drawHeader(
  doc: any,
  title: string,
  subtitle: string,
  logo: HTMLImageElement | null,
  meta: { label: string; value: string }[],
): number {
  const { W, M, blue, blueLight, blueFade, white, muted, dark, border } = {
    ...BRAND,
    W: A4.W,
    M: BRAND.pageGutter,
  };

  // ── Deep blue background band ─────────────────────────────────────────────
  doc.setFillColor(...blue);
  doc.rect(0, 0, W, 30, "F");

  // ── Accent gradient strip ─────────────────────────────────────────────────
  doc.setFillColor(...blueLight);
  doc.rect(0, 30, W, 2.5, "F");

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoH = 20; // mm height inside header
  const logoW = logoH * (1536 / 1024); // keep 3:2 aspect ratio
  if (logo) {
    doc.addImage(logo, "PNG", M, (30 - logoH) / 2, logoW, logoH);
  }

  // ── Title & subtitle ──────────────────────────────────────────────────────
  const textX = logo ? M + logoW + 5 : M;
  doc.setTextColor(...white);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(title, textX, 13);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(186, 213, 255);
  doc.text(subtitle, textX, 21);

  // ── Meta badges (right side) ──────────────────────────────────────────────
  let rx = W - M;
  const now = new Date().toLocaleDateString("bn-BD", {
    year: "numeric", month: "long", day: "numeric",
  });
  const allMeta = [{ label: "তারিখ", value: now }, ...meta];
  // draw right-to-left
  for (const m of [...allMeta].reverse()) {
    const txt = `${m.label}: ${m.value}`;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(186, 213, 255);
    const tw = doc.getTextWidth(txt);
    doc.text(txt, rx - tw, 26);
    rx = rx - tw - 8;
  }

  // ── Light background for info stripe ──────────────────────────────────────
  doc.setFillColor(...blueFade);
  doc.rect(0, 32.5, W, 8, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text(
    "প্রশ্নব্যাংক  |  www.proshnobank.com  |  এই রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে — গোপনীয়",
    W / 2,
    37.5,
    { align: "center" },
  );

  // ── Thin bottom border ────────────────────────────────────────────────────
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(M, 40.5, W - M, 40.5);

  return 46; // content starts at y=46
}

/**
 * Draw the footer on a specific page.
 */
function drawFooter(doc: any, pageNum: number, total: number) {
  const { W, M, blue, muted, border, blueFade } = {
    ...BRAND,
    W: A4.W,
    M: BRAND.pageGutter,
  };
  const H = A4.H;

  doc.setFillColor(...blueFade);
  doc.rect(0, H - 12, W, 12, "F");
  doc.setDrawColor(...border);
  doc.setLineWidth(0.3);
  doc.line(M, H - 12, W - M, H - 12);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...muted);
  doc.text("ProshnoBank — Official Report  |  Confidential", M, H - 5);
  doc.text(
    `পৃষ্ঠা ${pageNum} / ${total}`,
    W / 2,
    H - 5,
    { align: "center" },
  );
  const ts = new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
  doc.text(`Generated: ${ts}`, W - M, H - 5, { align: "right" });
}

/** Add footers to all pages after content is done */
export function finalizePages(doc: any) {
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    drawFooter(doc, p, total);
  }
}

/**
 * Initialise a new A4 jsPDF and draw the first page header.
 * Returns a ReportPage object that tracks the Y cursor.
 */
export async function createReport(
  jsPDF: any,
  title: string,
  subtitle: string,
  meta: { label: string; value: string }[],
): Promise<ReportPage> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = A4.W;
  const H = A4.H;
  const M = BRAND.pageGutter;

  const logo = await loadLogoImage();
  const y = drawHeader(doc, title, subtitle, logo, meta);

  return { doc, y, W, H, M, contentW: W - M * 2 };
}

/**
 * Checks if adding `neededMm` of content would overflow.
 * If so, adds a new page with header.
 */
export async function ensureSpace(
  page: ReportPage,
  neededMm: number,
  title: string,
  subtitle: string,
  meta: { label: string; value: string }[],
): Promise<void> {
  const bottomLimit = page.H - 18; // leave 18mm for footer
  if (page.y + neededMm > bottomLimit) {
    const logo = await loadLogoImage();
    page.doc.addPage();
    page.y = drawHeader(page.doc, title, subtitle, logo, meta);
  }
}

// ─── Section Heading ─────────────────────────────────────────────────────────
export function drawSectionHeading(page: ReportPage, text: string) {
  const { doc, M, contentW } = page;
  doc.setFillColor(...BRAND.blue);
  doc.rect(M, page.y, contentW, 7, "F");
  doc.setFillColor(...BRAND.blueLight);
  doc.rect(M, page.y, 3, 7, "F");
  doc.setTextColor(...BRAND.white);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(text, M + 6, page.y + 4.8);
  page.y += 10;
}

// ─── KPI Cards (3 per row) ───────────────────────────────────────────────────
export function drawKpiGrid(
  page: ReportPage,
  kpis: { label: string; value: string; sub?: string }[],
) {
  const { doc, M, contentW } = page;
  const cols = 3;
  const colW = contentW / cols;
  const cardH = 16;
  const rows = Math.ceil(kpis.length / cols);

  for (let i = 0; i < kpis.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = M + col * colW;
    const cy = page.y + row * (cardH + 2);

    // card bg
    doc.setFillColor(...BRAND.white);
    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(cx + 1, cy, colW - 2, cardH, 1.5, 1.5, "FD");

    // left accent
    doc.setFillColor(...BRAND.blueLight);
    doc.rect(cx + 1, cy, 2.5, cardH, "F");

    // label
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.muted);
    doc.text(kpis[i].label, cx + 6, cy + 5.5);

    // value
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.dark);
    doc.text(kpis[i].value, cx + 6, cy + 12.5);

    // sub
    if (kpis[i].sub) {
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...BRAND.muted);
      doc.text(kpis[i].sub!, cx + colW - 5, cy + 5.5, { align: "right" });
    }
  }

  page.y += rows * (cardH + 2) + 4;
}

// ─── Table ───────────────────────────────────────────────────────────────────
export interface TableColumn {
  header: string;
  key: string;
  width: number;       // mm
  align?: "left" | "right" | "center";
}

export function drawTable(
  page: ReportPage,
  columns: TableColumn[],
  rows: Record<string, any>[],
  accentColor: [number, number, number] = BRAND.blue,
) {
  const { doc, M } = page;
  const rowH = 7;

  // Header row
  let x = M;
  doc.setFillColor(...accentColor);
  const totalW = columns.reduce((s, c) => s + c.width, 0);
  doc.rect(M, page.y, totalW, rowH, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND.white);
  columns.forEach(col => {
    const tx = col.align === "right" ? x + col.width - 2 :
               col.align === "center" ? x + col.width / 2 : x + 2;
    doc.text(col.header, tx, page.y + 4.8, { align: col.align ?? "left" });
    x += col.width;
  });
  page.y += rowH;

  // Data rows
  rows.forEach((row, idx) => {
    // Page break check
    if (page.y + rowH > page.H - 18) {
      doc.addPage();
      page.y = 46; // approximate restart without new header (simple continuation)
    }

    const bg = idx % 2 === 0 ? BRAND.white : BRAND.rowAlt;
    doc.setFillColor(...bg);
    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.15);
    doc.rect(M, page.y, totalW, rowH, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.dark);

    let rx = M;
    columns.forEach(col => {
      const raw = row[col.key] ?? "";
      const str = String(raw);
      // truncate if too wide
      const maxChars = Math.floor(col.width / 2.2);
      const display = str.length > maxChars ? str.slice(0, maxChars - 1) + "…" : str;
      const tx = col.align === "right" ? rx + col.width - 2 :
                 col.align === "center" ? rx + col.width / 2 : rx + 2;
      doc.text(display, tx, page.y + 4.8, { align: col.align ?? "left" });
      rx += col.width;
    });

    page.y += rowH;
  });

  // Bottom border
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.3);
  const totalW2 = columns.reduce((s, c) => s + c.width, 0);
  doc.line(M, page.y, M + totalW2, page.y);

  page.y += 6;
}

// ─── Inline bar (for progress column) ────────────────────────────────────────
export function inlineBar(
  doc: any,
  x: number, y: number, w: number, h: number,
  pct: number,
  color: [number, number, number] = BRAND.blueLight,
) {
  doc.setFillColor(...BRAND.rowAlt);
  doc.rect(x, y, w, h, "F");
  doc.setFillColor(...color);
  doc.rect(x, y, w * Math.max(0, Math.min(pct, 1)), h, "F");
}
