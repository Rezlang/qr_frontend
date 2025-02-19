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
  const [openSignatureModal, setOpenSignatureModal] = useState(false);

  // --- New State for Drag-to-Place Annotations ---
  // currentTool can be 'text', 'image', or 'signature'
  const [currentTool, setCurrentTool] = useState(null);
  // For image annotations we store the pending annotation id to update later.
  const [pendingImageAnnotationId, setPendingImageAnnotationId] = useState(null);
  // Similarly, store pending signature annotation id.
  const [pendingSignatureAnnotationId, setPendingSignatureAnnotationId] = useState(null);

  // Refs
  const imageInputRef = useRef(null);
  const digitalSignatureRef = useRef(null);

  // --- State for tracking the selection box during drag ---
  const [selectionBox, setSelectionBox] = useState(null);

  // --- Mouse Handlers for Drag-to-Place ---
  const handleMouseDown = (e) => {
    if (!currentTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setSelectionBox({
      startX: offsetX,
      startY: offsetY,
      currentX: offsetX,
      currentY: offsetY,
      isDragging: true,
    });
  };

  const handleMouseMove = (e) => {
    if (!selectionBox || !selectionBox.isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    setSelectionBox((prev) => ({ ...prev, currentX: offsetX, currentY: offsetY }));
  };

  const handleMouseUp = (e) => {
    if (!selectionBox || !selectionBox.isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // Finalize the selection
    const finalBox = { ...selectionBox, currentX: offsetX, currentY: offsetY, isDragging: false };
    const x = Math.min(finalBox.startX, finalBox.currentX);
    const y = Math.min(finalBox.startY, finalBox.currentY);
    const width = Math.abs(finalBox.currentX - finalBox.startX);
    const height = Math.abs(finalBox.currentY - finalBox.startY);

    // Only create an annotation if the rectangle is large enough.
    if (width > 5 && height > 5) {
      if (currentTool === 'text') {
        const newAnnotation = {
          id: Date.now(),
          type: 'text',
          text: 'Edit me',
          x,
          y,
          width,
          height,
          scale: 1,
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
      } else if (currentTool === 'image') {
        // Create a placeholder for the image annotation.
        const newAnnotation = {
          id: Date.now(),
          type: 'image',
          file: null,
          url: null,
          x,
          y,
          width,
          height,
          scale: 1,
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
        setPendingImageAnnotationId(newAnnotation.id);
        // Open file selector for image.
        if (imageInputRef.current) {
          imageInputRef.current.click();
        }
      } else if (currentTool === 'signature') {
        // Create a placeholder for the signature annotation.
        const newAnnotation = {
          id: Date.now(),
          type: 'signature', // We'll render this like an image.
          file: null,
          url: null,
          x,
          y,
          width,
          height,
          scale: 1,
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
        setPendingSignatureAnnotationId(newAnnotation.id);
        // Open the signature modal automatically.
        setOpenSignatureModal(true);
      }
    }
    setCurrentTool(null);
    setSelectionBox(null);
  };

  // --- Annotation Tools Handlers ---
  const handleAddTextBox = () => {
    setCurrentTool('text');
  };

  // For images, we set the tool to 'image'
  const handleAddImageTool = () => {
    setCurrentTool('image');
  };

  // For signatures, we set the tool to 'signature'
  const handleAddSignatureTool = () => {
    setCurrentTool('signature');
  };

  // Handler when an image file is selected.
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !pendingImageAnnotationId) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setAnnotations((prev) =>
        prev.map((ann) => {
          if (ann.id === pendingImageAnnotationId) {
            return {
              ...ann,
              file: file,
              url: url,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
            };
          }
          return ann;
        })
      );
      setPendingImageAnnotationId(null);
    };
    img.src = url;
  };

  // Update annotation position after drag.
  const updateAnnotationPosition = (id, x, y) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, x, y } : ann))
    );
  };

  // Update text content.
  const updateAnnotationText = (id, text) => {
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, text } : ann))
    );
  };


  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

  // --- PDF Base Upload & Final Document Rendering ---
  const handleUploadBasePdf = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setBasePdf(file);
      const url = URL.createObjectURL(file);
      setBasePdfUrl(url);
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPages()[0];
      setPdfDimensions({ width: page.getWidth(), height: page.getHeight() });
    }
  };

  const handleGeneratePdf = async () => {
    await generatePdf({ basePdf, annotations, pdfDimensions });
  };

  // --- Digital Signature Section ---
  // Utility to convert dataURL to a File object.
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

  // When the user submits their signature from the modal,
  // update the pending signature annotation.
  const handleSubmitSignature = () => {
    if (digitalSignatureRef.current && pendingSignatureAnnotationId) {
      const signatureDataUrl = digitalSignatureRef.current.getSignatureData();
      const signatureFile = dataURLtoFile(signatureDataUrl, 'signature.png');
      setAnnotations((prev) =>
        prev.map((ann) => {
          if (ann.id === pendingSignatureAnnotationId) {
            // Optionally, you can use the drawn area's width/height
            // as the "natural" dimensions or use the canvas's fixed size.
            return {
              ...ann,
              file: signatureFile,
              url: signatureDataUrl,
              naturalWidth: ann.width,
              naturalHeight: ann.height,
            };
          }
          return ann;
        })
      );
      setPendingSignatureAnnotationId(null);
      setOpenSignatureModal(false);
    }
  };

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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
            />

            {/* Render selection rectangle while dragging */}
            {selectionBox && selectionBox.isDragging && (
              <div
                style={{
                  position: 'absolute',
                  border: '2px dashed #1976d2',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  left: Math.min(selectionBox.startX, selectionBox.currentX),
                  top: Math.min(selectionBox.startY, selectionBox.currentY),
                  width: Math.abs(selectionBox.currentX - selectionBox.startX),
                  height: Math.abs(selectionBox.currentY - selectionBox.startY),
                  pointerEvents: 'none',
                }}
              />
            )}
          </Box>
          {/* Hidden file input for image selection */}
          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={imageInputRef}
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
          />
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
              <ListItemButton onClick={handleAddImageTool}>
                <ListItemText primary="Add PNG/JPG Image" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleAddSignatureTool}>
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
          <Typography id="signature-modal-title" variant="h6" component="h2">
            Create Signature
          </Typography>
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
