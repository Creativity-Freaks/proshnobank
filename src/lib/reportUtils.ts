/**
 * ProshnoBank — Official Report Generator
 *
 * Approach: Build a styled HTML string, inject it into a hidden off-screen
 * div, capture it with html2canvas (so the browser handles Bengali font
 * rendering), then slice the resulting image into A4 pages inside jsPDF.
 *
 * This avoids ALL jsPDF font-embedding issues with Bengali Unicode.
 */

// ── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  blue:      "#1e40af",
  blueMid:   "#2563eb",
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
};

export const BRAND = {
  blue:        [30,  64, 175] as [number, number, number],
  blueLight:   [59,  130, 246] as [number, number, number],
  blueFade:    [239, 246, 255] as [number, number, number],
  teal:        [15,  118, 110] as [number, number, number],
  amber:       [217, 119, 6]   as [number, number, number],
  dark:        [15,  23,  42]  as [number, number, number],
  muted:       [100, 116, 139] as [number, number, number],
  white:       [255, 255, 255] as [number, number, number],
};

// ── HTML helpers ──────────────────────────────────────────────────────────────

function css(styles: Record<string, string | number>): string {
  return Object.entries(styles)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
    .join(";");
}

function headerHtml(
  title: string,
  subtitle: string,
  meta: { label: string; value: string }[],
  now: string,
): string {
  const metaItems = [{ label: "তারিখ", value: now }, ...meta]
    .map(m => `<span style="${css({ marginLeft: "16px", fontSize: "11px", color: "#bfdbfe" })}">${m.label}: <b>${m.value}</b></span>`)
    .join("");

  return `
    <div style="${css({ background: C.blue, padding: "20px 28px 14px", display: "flex", alignItems: "center", gap: "20px" })}">
      <img src="/proshnobank.png" crossorigin="anonymous"
           style="${css({ height: "52px", width: "78px", objectFit: "contain", borderRadius: "6px", background: C.white, padding: "4px" })}" />
      <div style="${css({ flex: "1" })}">
        <div style="${css({ fontSize: "20px", fontWeight: "700", color: C.white, letterSpacing: "-0.3px" })}">${title}</div>
        <div style="${css({ fontSize: "12px", color: "#bfdbfe", marginTop: "3px" })}">${subtitle}</div>
        <div style="${css({ marginTop: "6px" })}">${metaItems}</div>
      </div>
    </div>
    <div style="${css({ background: C.blueFade, borderBottom: `1px solid ${C.border}`, padding: "6px 28px", fontSize: "11px", color: C.muted, display: "flex", justifyContent: "space-between" })}">
      <span>প্রশ্নব্যাংক  |  www.proshnobank.com</span>
      <span>এই রিপোর্টটি স্বয়ংক্রিয়ভাবে তৈরি — গোপনীয়</span>
    </div>`;
}

function sectionHtml(text: string, accentColor = C.blue): string {
  return `
    <div style="${css({
      background: accentColor,
      margin: "18px 0 8px",
      padding: "7px 12px 7px 16px",
      borderLeft: `4px solid ${C.blueLight}`,
      borderRadius: "3px",
      fontSize: "13px",
      fontWeight: "700",
      color: C.white,
      letterSpacing: "0.2px",
    })}">${text}</div>`;
}

function kpiHtml(kpis: { label: string; value: string; sub?: string }[]): string {
  const cards = kpis.map(k => `
    <div style="${css({
      background: C.white,
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${C.blueLight}`,
      borderRadius: "6px",
      padding: "10px 14px",
      minWidth: "0",
    })}">
      <div style="${css({ fontSize: "10px", color: C.muted, marginBottom: "4px" })}">${k.label}</div>
      <div style="${css({ fontSize: "20px", fontWeight: "700", color: C.blue })}">${k.value}</div>
      ${k.sub ? `<div style="${css({ fontSize: "10px", color: C.muted, marginTop: "2px" })}">${k.sub}</div>` : ""}
    </div>`).join("");

  return `<div style="${css({
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    margin: "0 0 6px",
  })}">${cards}</div>`;
}

function tableHtml(
  columns: { header: string; key: string; align?: string }[],
  rows: Record<string, any>[],
  accentColor = C.blue,
): string {
  const thStyle = css({ padding: "7px 10px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: C.white, whiteSpace: "nowrap" });
  const headers = columns.map(c =>
    `<th style="${thStyle}; text-align:${c.align ?? "left"}">${c.header}</th>`
  ).join("");

  const dataRows = rows.map((row, i) => {
    const bg = i % 2 === 0 ? C.white : C.rowAlt;
    const tds = columns.map(c => {
      const val = row[c.key] ?? "";
      return `<td style="${css({ padding: "6px 10px", fontSize: "11px", color: C.dark, textAlign: c.align ?? "left", borderBottom: `1px solid ${C.border}` })}">${val}</td>`;
    }).join("");
    return `<tr style="background:${bg}">${tds}</tr>`;
  }).join("");

  return `
    <table style="${css({ width: "100%", borderCollapse: "collapse", marginBottom: "6px", border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden" })}">
      <thead>
        <tr style="background:${accentColor}">${headers}</tr>
      </thead>
      <tbody>${dataRows}</tbody>
    </table>`;
}

function footerHtml(page: number, total: number): string {
  const ts = new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
  return `
    <div style="${css({
      background: C.blueFade,
      borderTop: `1px solid ${C.border}`,
      padding: "6px 28px",
      display: "flex",
      justifyContent: "space-between",
      fontSize: "10px",
      color: C.muted,
      marginTop: "auto",
    })}">
      <span>ProshnoBank — Official Report | Confidential</span>
      <span>পৃষ্ঠা ${page} / ${total}</span>
      <span>Generated: ${ts}</span>
    </div>`;
}

// ── ReportBuilder ─────────────────────────────────────────────────────────────

export class ReportBuilder {
  private title: string;
  private subtitle: string;
  private meta: { label: string; value: string }[];
  private sections: string[] = [];
  private now: string;

  constructor(title: string, subtitle: string, meta: { label: string; value: string }[]) {
    this.title = title;
    this.subtitle = subtitle;
    this.meta = meta;
    this.now = new Date().toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
  }

  addSection(text: string, accentColor?: string): this {
    this.sections.push(sectionHtml(text, accentColor));
    return this;
  }

  addKpiGrid(kpis: { label: string; value: string; sub?: string }[]): this {
    this.sections.push(kpiHtml(kpis));
    return this;
  }

  addTable(
    columns: { header: string; key: string; align?: string }[],
    rows: Record<string, any>[],
    accentColor?: string,
  ): this {
    this.sections.push(tableHtml(columns, rows, accentColor));
    return this;
  }

  addRaw(html: string): this {
    this.sections.push(html);
    return this;
  }

  private buildHtml(): string {
    return `
      <div id="__report_root__" style="${css({
        width: "794px",          // A4 at 96dpi
        fontFamily: "'Noto Sans Bengali', 'SolaimanLipi', 'Hind Siliguri', Arial, sans-serif",
        background: C.white,
        color: C.dark,
        display: "flex",
        flexDirection: "column",
        minHeight: "1123px",
      })}">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet" />
        ${headerHtml(this.title, this.subtitle, this.meta, this.now)}
        <div style="${css({ flex: "1", padding: "12px 28px 20px" })}">
          ${this.sections.join("\n")}
        </div>
        ${footerHtml(1, 1)}
      </div>`;
  }

  /** Render to PDF and trigger download */
  async savePdf(filename: string): Promise<void> {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    // Inject into document
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:fixed;left:-9999px;top:-9999px;z-index:-1;";
    wrapper.innerHTML = this.buildHtml();
    document.body.appendChild(wrapper);

    const root = wrapper.querySelector("#__report_root__") as HTMLElement;

    // Wait a tick for images / fonts to load
    await new Promise(r => setTimeout(r, 600));

    try {
      const canvas = await html2canvas(root, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: C.white,
        logging: false,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgW = 210; // A4 mm width
      const imgH = (canvas.height * imgW) / canvas.width;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const A4H = 297;

      if (imgH <= A4H) {
        doc.addImage(imgData, "PNG", 0, 0, imgW, imgH);
      } else {
        // Slice into pages
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d")!;
        const pageHeightPx = Math.floor((A4H / imgW) * canvas.width);

        let yOffset = 0;
        let isFirst = true;
        while (yOffset < canvas.height) {
          const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceH;
          ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

          const sliceData = pageCanvas.toDataURL("image/png");
          const sliceH_mm = (sliceH * imgW) / canvas.width;

          if (!isFirst) doc.addPage();
          doc.addImage(sliceData, "PNG", 0, 0, imgW, sliceH_mm);
          isFirst = false;
          yOffset += sliceH;
        }
      }

      doc.save(filename);
    } finally {
      document.body.removeChild(wrapper);
    }
  }
}
