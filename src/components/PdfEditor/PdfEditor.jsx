import React, { useState } from 'react';
import { Button, Box, Typography, Slider, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import Card from '@mui/material/Card';
import PdfDocumentViewer from './PdfDocumentViewer';
import AnnotationLayer from './AnnotationLayer';
import { generatePdf } from './PdfGenerator';

const PdfEditor = () => {
  // Global state for annotations, base PDF, dimensions, etc.
  const [annotations, setAnnotations] = useState([]);
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);

  // --- Annotation Section ---
  const handleAddTextBox = () => {
    const newAnnotation = {
      id: Date.now(),
      type: 'text',
      text: 'Edit me',
      x: 50,
      y: 50,
      scale: 1,
    };
    setAnnotations([...annotations, newAnnotation]);
    setActiveAnnotationId(newAnnotation.id);
  };

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
          scale: 1,
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
        setActiveAnnotationId(newAnnotation.id);
      };
      img.src = url;
    }
  };

  const updateAnnotationPosition = (id, x, y) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, x, y } : ann))
    );
  };

  const updateAnnotationText = (id, text) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, text } : ann))
    );
  };

  const handleActiveAnnotationScaleChange = (e, newScale) => {
    if (activeAnnotationId != null) {
      setAnnotations((prev) =>
        prev.map((ann) =>
          ann.id === activeAnnotationId ? { ...ann, scale: newScale } : ann
        )
      );
    }
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
    if (activeAnnotationId === id) {
      setActiveAnnotationId(null);
    }
  };

  // --- PDF Base Upload & Final Document Rendering Section ---
  const handleUploadBasePdf = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setBasePdf(file);
      const url = URL.createObjectURL(file);
      setBasePdfUrl(url);

      // Use pdf-lib to load the file and extract the first page's dimensions
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPages()[0];
      setPdfDimensions({ width: page.getWidth(), height: page.getHeight() });
    }
  };

  const handleGeneratePdf = async () => {
    await generatePdf({ basePdf, annotations, pdfDimensions });
  };

  const activeAnnotation = annotations.find(
    (ann) => ann.id === activeAnnotationId
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        PDF Editor with pdf-lib and react-pdf
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {/* PDF Container */}
        <Box>
          <Button variant="contained" component="label" sx={{ mb: 2 }}>
            Upload Base PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleUploadBasePdf}
            />
          </Button>
          <Box
            sx={{
              position: 'relative',
              width: pdfDimensions.width,
              height: pdfDimensions.height,
              border: '1px solid #ccc',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}
          >
            <PdfDocumentViewer basePdfUrl={basePdfUrl} pdfDimensions={pdfDimensions} />

            <AnnotationLayer
              annotations={annotations}
              updateAnnotationPosition={updateAnnotationPosition}
              updateAnnotationText={updateAnnotationText}
              handleDeleteAnnotation={handleDeleteAnnotation}
              setActiveAnnotationId={setActiveAnnotationId}
            />
          </Box>
        </Box>

        {/* Tools List */}
        <Card sx={{ ml: 2, width: 200, marginTop: 6.5 }}>
          <List component="nav">
            <ListItem disablePadding>
              <ListItemButton onClick={handleAddTextBox}>
                <ListItemText primary="Add Text Box" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="label">
                <ListItemText primary="Add PNG/JPG Image" />
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  hidden
                  onChange={handleAddImage}
                />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleGeneratePdf}>
                <ListItemText primary="Generate PDF" />
              </ListItemButton>
            </ListItem>
          </List>

          {/* Active Annotation Scale Slider */}
          {activeAnnotation && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Scale Text/Image
              </Typography>
              <Slider
                value={activeAnnotation.scale}
                min={0.1}
                max={2}
                step={0.01}
                onChange={handleActiveAnnotationScaleChange}
                aria-labelledby="active-scale-slider"
              />
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default PdfEditor;
