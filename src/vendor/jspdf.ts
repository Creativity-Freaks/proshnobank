type ImageEntry = {
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Tiny browser-only fallback for the bits of jsPDF this app uses.
 *
 * It keeps the existing htmlToPdf flow working without the external package
 * by rendering a printable document that the user can save as PDF.
 */
export default class jsPDF {
  private readonly pages: ImageEntry[][] = [[]];

  constructor(_options?: { orientation?: string; unit?: string; format?: string }) {}

  addPage() {
    this.pages.push([]);
  }

  addImage(dataUrl: string, _format: string, x: number, y: number, width: number, height: number) {
    this.pages[this.pages.length - 1].push({ dataUrl, x, y, width, height });
  }

  save(fileName: string) {
    const win = window.open("", "_blank");
    if (!win) return;

    const pagesHtml = this.pages
      .map(
        (page, pageIndex) => `
          <section style="page-break-after:${pageIndex === this.pages.length - 1 ? "auto" : "always"};position:relative;width:210mm;height:297mm;overflow:hidden;background:#fff;">
            ${page
              .map(
                img => `
                  <img
                    src="${img.dataUrl}"
                    style="position:absolute;left:${img.x}mm;top:${img.y}mm;width:${img.width}mm;height:${img.height}mm;display:block;"
                    alt="PDF page content"
                  />
                `,
              )
              .join("")}
          </section>
        `,
      )
      .join("");

    win.document.open();
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            html, body { margin: 0; padding: 0; background: #e5e7eb; }
            @media print {
              body { background: #fff; }
            }
          </style>
        </head>
        <body>${pagesHtml}</body>
      </html>
    `);
    win.document.close();
    win.focus();
  }
}
