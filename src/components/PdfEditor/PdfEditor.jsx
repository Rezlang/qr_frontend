import React, { useState, useRef } from 'react';
import {
  Button,
  Box,
  Typography,
  Slider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Card,
  Modal,
  Paper,
} from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import PdfDocumentViewer from './PdfDocumentViewer';
import AnnotationLayer from './AnnotationLayer';
import { generatePdf } from './PdfGenerator';
import DigitalSignature from './DigitalSignature/DigitalSignature';

const PdfEditor = () => {
  // Global state for annotations, base PDF, dimensions, etc.
  const [annotations, setAnnotations] = useState([]);
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });
  const [activeAnnotationId, setActiveAnnotationId] = useState(null);
  const [openSignatureModal, setOpenSignatureModal] = useState(false);

  // Ref to access the DigitalSignature component’s methods
  const digitalSignatureRef = useRef(null);

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

  // --- New: Handle Digital Signature submission ---
  // Utility to convert dataURL to a File object
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmitSignature = () => {
    if (digitalSignatureRef.current) {
      const signatureDataUrl = digitalSignatureRef.current.getSignatureData();
      // Convert the data URL into a File object (if needed)
      const signatureFile = dataURLtoFile(signatureDataUrl, 'signature.png');

      // Create the new annotation as an image annotation.
      // Note: The canvas used in DigitalSignature is 400 x 300,
      // so we set naturalWidth and naturalHeight accordingly.
      const newAnnotation = {
        id: Date.now(),
        type: 'image', // Use 'image' so AnnotationLayer renders it as an image.
        file: signatureFile,
        url: signatureDataUrl,
        x: 50, // default position; adjust as needed
        y: 50,
        scale: 1,
        naturalWidth: 400,  // match the canvas dimensions in DigitalSignature
        naturalHeight: 300, // match the canvas dimensions in DigitalSignature
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setActiveAnnotationId(newAnnotation.id);
      setOpenSignatureModal(false);
    }
  };


  const activeAnnotation = annotations.find(
    (ann) => ann.id === activeAnnotationId
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        PDF Editor
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
            <ListItem disablePadding>
              <ListItemButton onClick={() => setOpenSignatureModal(true)}>
                <ListItemText primary="Signature" />
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

      {/* Signature Modal */}
      <Modal
        open={openSignatureModal}
        onClose={() => setOpenSignatureModal(false)}
        aria-labelledby="signature-modal-title"
        aria-describedby="signature-modal-description"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            outline: 'none',
          }}
        >
          <Typography id="signature-modal-title" variant="h6" component="h2" sx={{ }}>
            Create Signature
          </Typography>
          {/* The DigitalSignature component now accepts a forwarded ref */}
          <DigitalSignature ref={digitalSignatureRef} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenSignatureModal(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmitSignature}>
              Submit Signature
            </Button>
          </Box>
        </Paper>
      </Modal>

    </Box>
  );
};

export default PdfEditor;
