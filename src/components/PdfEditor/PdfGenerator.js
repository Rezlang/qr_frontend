// pdfGenerator.js
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

function hexToRgb(hex) {
  const h = hex.replace(/^#/, '');
  const bigint = parseInt(h, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

// ——— Catmull‑Rom interpolation (unchanged) ———
function interpolate(points, segments = 16) {
  if (points.length < 2) return points;
  const result = [];
  const pts = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < pts.length - 2; i++) {
    for (let j = 0; j < segments; j++) {
      const t = j / segments;
      const t2 = t * t;
      const t3 = t2 * t;
      const { x: x0, y: y0 } = pts[i - 1];
      const { x: x1, y: y1 } = pts[i];
      const { x: x2, y: y2 } = pts[i + 1];
      const { x: x3, y: y3 } = pts[i + 2];
      const x = 0.5 * (
        (2 * x1) +
        (-x0 + x2) * t +
        (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 +
        (-x0 + 3 * x1 - 3 * x2 + x3) * t3
      );
      const y = 0.5 * (
        (2 * y1) +
        (-y0 + y2) * t +
        (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 +
        (-y0 + 3 * y1 - 3 * y2 + y3) * t3
      );
      result.push({ x, y });
    }
  }
  result.push(points[points.length - 1]);
  return result;
}

// ——— Text‑wrapping without DOM ———
function wrapText(font, text, fontSize, maxWidth) {
  const lines = [];
  const paragraphs = text.split('\n');
  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width <= maxWidth) {
        line = testLine;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export const generatePdf = async ({ basePdf, annotations, pdfDimensions }) => {
  // 1) create or load
  let pdfDoc, page;
  if (basePdf) {
    const bytes = await basePdf.arrayBuffer();
    pdfDoc = await PDFDocument.load(bytes);
    page   = pdfDoc.getPages()[0];
  } else {
    pdfDoc = await PDFDocument.create();
    page   = pdfDoc.addPage([pdfDimensions.width, pdfDimensions.height]);
  }

  const pageWidth  = page.getWidth();
  const pageHeight = page.getHeight();

  pdfDoc.registerFontkit(fontkit);
  const robotoUrl   = '/fonts/Roboto-Regular.ttf';
  const robotoBytes = await fetch(robotoUrl).then((r) => r.arrayBuffer());
  const robotoFont  = await pdfDoc.embedFont(robotoBytes);

  // 3) draw non‑spline annotations
  for (const ann of annotations) {
    const topY = pageHeight - ann.y;

    // — Text —
    if (ann.type === 'text') {
      const scale      = ann.scale ?? 1;
      const padding    = 4;
      const fontSize   = 16 * scale;        
      const lineHeight = fontSize * 1.25;  
      const maxWidth   = ann.width - 2 * padding;
      const startX     = ann.x + padding;
      let   cursorY    = topY - padding - fontSize;

      // wrap text using font metrics
      const lines = wrapText(robotoFont, ann.text, fontSize, maxWidth);

      for (const line of lines) {
        if (!line) continue;
        page.drawText(line, {
          x:     startX,
          y:     cursorY,
          size:  fontSize,
          font:  robotoFont,
          color: rgb(0, 0, 0),
        });
        cursorY -= lineHeight;
      }
    }

    // — Image / Signature —
    else if ((ann.type === 'image' || ann.type === 'signature') && (ann.file || ann.url)) {
      let imgBytes;
      if (ann.file) {
        imgBytes = await ann.file.arrayBuffer();
      } else {
        const resp = await fetch(ann.url);
        imgBytes   = await resp.arrayBuffer();
      }
      const isPng = (ann.file?.type === 'image/png') || ann.url?.endsWith('.png');
      const image = isPng
        ? await pdfDoc.embedPng(imgBytes)
        : await pdfDoc.embedJpg(imgBytes);

      const origW = image.width, origH = image.height;
      const boxW  = ann.width, boxH = ann.height;
      const scale = Math.min(boxW / origW, boxH / origH);
      const drawW = origW * scale, drawH = origH * scale;
      const x = ann.x + (boxW - drawW) / 2;
      const y = topY - boxH + (boxH - drawH) / 2;

      page.drawImage(image, { x, y, width: drawW, height: drawH, opacity: ann.opacity ?? 1 });
    }

    // — Checkbox —
    else if (ann.type === 'checkbox') {
      const boxX = ann.x;
      const boxY = topY - ann.height;
      page.drawRectangle({
        x:          boxX,
        y:          boxY,
        width:      ann.width,
        height:     ann.height,
        borderColor: rgb(0, 0, 0),
        borderWidth: ann.strokeWidth || 2,
      });
      if (ann.checked) {
        const inset = ann.width * 0.2;
        const [sx, sy] = [boxX + inset, boxY + ann.height * 0.5];
        const [mx, my] = [boxX + ann.width * 0.45, boxY + inset];
        const [ex, ey] = [boxX + ann.width * 0.8, boxY + ann.height - inset];
        page.drawLine({ start: { x: sx, y: sy }, end: { x: mx, y: my }, thickness: 2, color: rgb(0, 0, 0) });
        page.drawLine({ start: { x: mx, y: my }, end: { x: ex, y: ey }, thickness: 2, color: rgb(0, 0, 0) });
      }
    }
  }

  // 4) draw splines (unchanged)
  for (const spline of annotations) {
    if (Array.isArray(spline.points) && spline.points.length > 1) {
      const pts = interpolate(spline.points, 20);
      const { r, g, b } = hexToRgb(spline.strokeColor || '#000000');
      for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i - 1], p2 = pts[i];
        page.drawLine({
          start:     { x: p1.x,                   y: pageHeight - p1.y },
          end:       { x: p2.x,                   y: pageHeight - p2.y },
          thickness: spline.strokeWidth || 2,
          color:     rgb(r, g, b),
          opacity:   spline.opacity ?? 1,
        });
      }
    }
  }

  // 5) finalize and open
  const pdfBytes = await pdfDoc.save();
  const blob     = new Blob([pdfBytes], { type: 'application/pdf' });
  const url      = URL.createObjectURL(blob);
  window.open(url, '_blank');
};
