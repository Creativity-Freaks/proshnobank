type Html2CanvasOptions = {
  scale?: number;
  width?: number;
};

/**
 * Minimal browser fallback for html2canvas.
 *
 * This keeps the app buildable even when the package is missing.
 * It returns a white canvas sized to the target element so the PDF flow
 * can continue without crashing.
 */
export default async function html2canvas(
  element: HTMLElement,
  options: Html2CanvasOptions = {},
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const scale = options.scale ?? 1;
  const width = options.width ?? (element.getBoundingClientRect().width || 794);
  const height = Math.max(element.scrollHeight, element.getBoundingClientRect().height, 1);

  canvas.width = Math.max(1, Math.floor(width * scale));
  canvas.height = Math.max(1, Math.floor(height * scale));

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  return canvas;
}
