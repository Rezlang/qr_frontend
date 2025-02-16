import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { Button, Box, Typography, Paper, TextField } from '@mui/material';
import Draggable from 'react-draggable';

const PdfEditor = () => {
  // State for annotations (text and image objects)
  const [annotations, setAnnotations] = useState([]);
  // Holds the URL for the generated PDF for download/display
  const [pdfUrl, setPdfUrl] = useState(null);

  // New state for base PDF file, its blob URL, and dimensions
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });

  // Add a text box annotation
  const handleAddTextBox = () => {
    const newAnnotation = {
      id: Date.now(),
      type: 'text',
      text: 'Edit me',
      x: 50,
      y: 50,
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  // Handle image upload for annotation
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAnnotation = {
        id: Date.now(),
        type: 'image',
        file,
        url,
        x: 100,
        y: 100,
      };
      setAnnotations([...annotations, newAnnotation]);
    }
  };

  // Upload a base PDF to start with
  const handleUploadBasePdf = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setBasePdf(file);
      const url = URL.createObjectURL(file);
      setBasePdfUrl(url);

      // Load the PDF with pdf-lib to extract the first page's dimensions
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPages()[0];
      setPdfDimensions({ width: page.getWidth(), height: page.getHeight() });
    }
  };

  // Update annotation position after dragging
  const updateAnnotationPosition = (id, x, y) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((ann) =>
        ann.id === id ? { ...ann, x, y } : ann
      )
    );
  };

  // Update text for text annotations
  const updateAnnotationText = (id, text) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((ann) =>
        ann.id === id ? { ...ann, text } : ann
      )
    );
  };

  // Generate the final PDF using pdf-lib
  const handleGeneratePdf = async () => {
    let pdfDoc, page, pageWidth, pageHeight;

    if (basePdf) {
      // Load the uploaded base PDF
      const basePdfBytes = await basePdf.arrayBuffer();
      pdfDoc = await PDFDocument.load(basePdfBytes);
      // For simplicity, we annotate only the first page
      page = pdfDoc.getPages()[0];
      pageWidth = page.getWidth();
      pageHeight = page.getHeight();
    } else {
      // If no base PDF was uploaded, create a new PDF with default dimensions
      pdfDoc = await PDFDocument.create();
      page = pdfDoc.addPage([pdfDimensions.width, pdfDimensions.height]);
      pageWidth = pdfDimensions.width;
      pageHeight = pdfDimensions.height;
    }

    // Loop through each annotation and add it to the PDF
    for (const ann of annotations) {
      if (ann.type === 'text') {
        // Convert UI y (top-left origin) to PDF y (bottom-left origin)
        page.drawText(ann.text, {
          x: ann.x,
          y: pageHeight - ann.y,
          size: 12,
          color: rgb(0, 0, 0),
        });
      } else if (ann.type === 'image') {
        // Read the image file as an ArrayBuffer
        const imageBytes = await ann.file.arrayBuffer();
        let image;
        if (ann.file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (
          ann.file.type === 'image/jpeg' ||
          ann.file.type === 'image/jpg'
        ) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          // Skip unsupported image types
          continue;
        }
        const { width, height } = image.scale(0.2);
        // Adjust y-coordinate for PDF (subtract image height)
        const pdfY = pageHeight - ann.y - height;
        page.drawImage(image, {
          x: ann.x,
          y: pdfY,
          width,
          height,
        });
      }
    }

    // Serialize the PDF document to bytes and create a blob URL for download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        PDF Editor with pdf-lib
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Button variant="contained" component="label" sx={{ mr: 2 }}>
          Upload Base PDF
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleUploadBasePdf}
          />
        </Button>

        <Button variant="contained" sx={{ mr: 2 }} onClick={handleAddTextBox}>
          Add Text Box
        </Button>

        <Button variant="contained" component="label" sx={{ mr: 2 }}>
          Add PNG/JPG Image
          <input
            type="file"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleAddImage}
          />
        </Button>

        <Button variant="contained" onClick={handleGeneratePdf}>
          Generate PDF
        </Button>
      </Paper>

      {/* Editor area */}
      <Box
        sx={{
          position: 'relative',
          width: pdfDimensions.width,
          height: pdfDimensions.height,
          border: '1px solid #ccc',
          backgroundColor: 'white',
        }}
      >
        {/* Display the base PDF as a background if uploaded */}
        {basePdfUrl && (
          <embed
            src={basePdfUrl}
            type="application/pdf"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            
          />
        )}

        {/* Render draggable annotations */}
        {annotations.map((ann) => (
          <Draggable
            key={ann.id}
            defaultPosition={{ x: ann.x, y: ann.y }}
            onStop={(e, data) =>
              updateAnnotationPosition(ann.id, data.x, data.y)
            }
          >
            <Box
              sx={{
                position: 'absolute',
                border: '1px dashed #000',
                p: 1,
                backgroundColor:
                  ann.type === 'text'
                    ? 'rgba(255,255,255,0.7)'
                    : 'transparent',
                cursor: 'move',
              }}
            >
              {ann.type === 'text' ? (
                <TextField
                  variant="standard"
                  value={ann.text}
                  onChange={(e) =>
                    updateAnnotationText(ann.id, e.target.value)
                  }
                />
              ) : (
                <img
                  src={ann.url}
                  alt="annotation"
                  style={{ maxWidth: '100px', maxHeight: '100px' }}
                />
              )}
              <Typography variant="caption" color="red">
                Position: ({ann.x}, {ann.y})
              </Typography>
            </Box>
          </Draggable>
        ))}
      </Box>

      {/* Display download link for the generated PDF */}
      {pdfUrl && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Generated PDF:</Typography>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </Box>
      )}
    </Box>
  );
};

export default PdfEditor;
