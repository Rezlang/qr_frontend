import { PDFDocument, rgb } from 'pdf-lib';

export const generatePdf = async ({ basePdf, annotations, pdfDimensions }) => {
  let pdfDoc, page, pageWidth, pageHeight;

  if (basePdf) {
    const basePdfBytes = await basePdf.arrayBuffer();
    pdfDoc = await PDFDocument.load(basePdfBytes);
    page = pdfDoc.getPages()[0];
    pageWidth = page.getWidth();
    pageHeight = page.getHeight();
  } else {
    pdfDoc = await PDFDocument.create();
    page = pdfDoc.addPage([pdfDimensions.width, pdfDimensions.height]);
    pageWidth = pdfDimensions.width;
    pageHeight = pdfDimensions.height;
  }

  for (const ann of annotations) {
    if (ann.type === 'text') {
      // Convert UI coordinates (top-left) to PDF coordinates (bottom-left)
      page.drawText(ann.text, {
        x: ann.x + 8,
        y: pageHeight - ann.y - 38,
        size: 16 * ann.scale,
        color: rgb(0, 0, 0),
      });
    } else if (ann.type === 'image') {
      const imageBytes = await ann.file.arrayBuffer();
      let image;
      if (ann.file.type === 'image/png') {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (ann.file.type === 'image/jpeg' || ann.file.type === 'image/jpg') {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        continue;
      }
      const scaledWidth = ann.naturalWidth * ann.scale;
      const scaledHeight = ann.naturalHeight * ann.scale;
      const pdfY = pageHeight - ann.y - scaledHeight;
      page.drawImage(image, {
        x: ann.x + 9,
        y: pdfY - 9,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};
