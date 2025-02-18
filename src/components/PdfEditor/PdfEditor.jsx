import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { Button, Box, Typography, Paper, TextField, Slider } from '@mui/material';
import Draggable from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up the PDF.js worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

const PdfEditor = () => {
  // State for annotations (text and image objects)
  const [annotations, setAnnotations] = useState([]);
  // Holds the base PDF file, its blob URL, and dimensions
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });
  // State for the currently active annotation (not just images)
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);

  // Add a text box annotation (now with a scale property)
  const handleAddTextBox = () => {
    const newAnnotation = {
      id: Date.now(),
      type: 'text',
      text: 'Edit me',
      x: 50,
      y: 50,
      scale: 1, // default scale
    };
    setAnnotations([...annotations, newAnnotation]);
    setActiveAnnotationId(newAnnotation.id);
  };

  // Handle image upload for annotation (with scaling)
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const newAnnotation = {
          id: Date.now(),
          type: 'image',
          file,
          url,
          x: 100,
          y: 100,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          scale: 1, // initial scale (100%)
        };
        setAnnotations((prevAnnotations) => [...prevAnnotations, newAnnotation]);
        setActiveAnnotationId(newAnnotation.id);
      };
      img.src = url;
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

  // Update the scale for the active annotation (applies to both text and image)
  const handleActiveAnnotationScaleChange = (e, newScale) => {
    if (activeAnnotationId != null) {
      setAnnotations((prevAnnotations) =>
        prevAnnotations.map((ann) =>
          ann.id === activeAnnotationId ? { ...ann, scale: newScale } : ann
        )
      );
    }
  };

  // Delete an annotation by its id
  const handleDeleteAnnotation = (id) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.filter((ann) => ann.id !== id)
    );
    if (activeAnnotationId === id) {
      setActiveAnnotationId(null);
    }
  };

  // Find the active annotation (can be text or image)
  const activeAnnotation = annotations.find(
    (ann) => ann.id === activeAnnotationId
  );

  // Generate the final PDF using pdf-lib and open it in a new tab
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
          x: ann.x + 8,
          y: pageHeight - ann.y - 38,
          size: 16 * ann.scale,
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
        // Compute scaled dimensions using the slider's value
        const scaledWidth = ann.naturalWidth * ann.scale;
        const scaledHeight = ann.naturalHeight * ann.scale;
        // Adjust y-coordinate for PDF (subtract image height)
        const pdfY = pageHeight - ann.y - scaledHeight;
        page.drawImage(image, {
          x: ann.x + 9,
          y: pdfY - 9,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
    }

    // Serialize the PDF document to bytes and create a blob URL
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Open the generated PDF in a new browser tab
    window.open(url, '_blank');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        PDF Editor with pdf-lib and react-pdf
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

      {/* Global slider for the active annotation */}
      {activeAnnotation && (
        <Box sx={{ mb: 2, p: 1, border: '1px solid #ccc' }}>
          <Typography variant="body1" gutterBottom>
            Active Annotation Scale
          </Typography>
          <Slider
            value={activeAnnotation.scale}
            min={0.1}
            max={2}
            step={0.01}
            onChange={handleActiveAnnotationScaleChange}
            aria-labelledby="active-scale-slider"
            sx={{ width: "50%" }}
          />
        </Box>
      )}

      {/* Editor area with bounding box - any overflow is clipped */}
      <Box
        sx={{
          position: 'relative',
          width: pdfDimensions.width,
          height: pdfDimensions.height,
          border: '1px solid #ccc',
          backgroundColor: 'white',
          overflow: 'hidden', // This clips any content that overflows the PDF area.
        }}
      >
        {/* Display the base PDF using react-pdf */}
        {basePdfUrl && (
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
        )}

        {/* Render draggable annotations */}
        {annotations.map((ann) => (
          <Draggable
          key={ann.id}
          defaultPosition={{ x: ann.x, y: ann.y }}
          onStop={(e, data) => updateAnnotationPosition(ann.id, data.x, data.y)}
        >
          <Box
            onClick={() => setActiveAnnotationId(ann.id)}
            sx={{
              position: 'absolute', // Ensure it doesn't stretch to full width
              display: 'inline-block',
              cursor: 'move',
              zIndex: 5,
            }}
          >
            {/* Delete button pinned to the top-right of the annotation */}
            <Box
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAnnotation(ann.id);
              }}
              sx={{
                position: 'absolute',
                top: -10,
                right: -10, // Ensures it's snug to the annotation
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              X
            </Box>
        
            {/* Render the annotation content */}
            {ann.type === 'text' ? (
              <TextField
                variant="standard"
                value={ann.text}
                onChange={(e) => updateAnnotationText(ann.id, e.target.value)}
                InputProps={{
                  style: { fontSize: 16 * ann.scale },
                }}
                sx={{
                  padding: '2px',
                  display: 'inline-block',
                  border: '1px dashed #000',
                  p: 1,
                  borderRadius: '10px',
                }}
              />
            ) : (
              <Box
                sx={{
                  border: '1px dashed #000',
                  display: 'inline-block',
                  p: 1,
                  borderRadius: '10px',
                }}
              >
                <img
                  src={ann.url}
                  alt="annotation"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    width: ann.naturalWidth * ann.scale,
                    height: ann.naturalHeight * ann.scale,
                    userSelect: 'none',
                  }}
                />
              </Box>
            )}
          </Box>
        </Draggable>
        
        ))}
      </Box>
    </Box>
  );
};

export default PdfEditor;
