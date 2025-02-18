import React from 'react';
import { Box } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

const PdfDocumentViewer = ({ basePdfUrl, pdfDimensions }) => {
  if (!basePdfUrl) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Document file={basePdfUrl}>
        <Page
          pageNumber={1}
          width={pdfDimensions.width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </Box>
  );
};

export default PdfDocumentViewer;
