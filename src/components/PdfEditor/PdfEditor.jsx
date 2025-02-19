import React, { useState, useRef } from 'react';
import {
  Button,
  Box,
  Typography,
  Modal,
  Paper,
} from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import PdfDocumentViewer from './PdfDocumentViewer';
import AnnotationLayer from './AnnotationLayer';
import { generatePdf } from './PdfGenerator';
import DigitalSignature from './DigitalSignature/DigitalSignature';
import Toolbar from './Toolbar';

const PdfEditor = () => {
  const [annotations, setAnnotations] = useState([]);
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [pendingImageAnnotationId, setPendingImageAnnotationId] = useState(null);
  const [pendingSignatureAnnotationId, setPendingSignatureAnnotationId] = useState(null);

  const imageInputRef = useRef(null);
  const jsonInputRef = useRef(null); // For loading JSON annotation data
  const digitalSignatureRef = useRef(null);

  const [selectionBox, setSelectionBox] = useState(null);

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
    const finalBox = { ...selectionBox, currentX: offsetX, currentY: offsetY, isDragging: false };
  
    let x, y, width, height;
    if (currentTool === 'checkbox') {
      const dx = finalBox.currentX - finalBox.startX;
      const dy = finalBox.currentY - finalBox.startY;
      const side = Math.min(Math.abs(dx), Math.abs(dy));
      x = dx >= 0 ? finalBox.startX : finalBox.startX - side;
      y = dy >= 0 ? finalBox.startY : finalBox.startY - side;
      width = side;
      height = side;
    } else {
      x = Math.min(finalBox.startX, finalBox.currentX);
      y = Math.min(finalBox.startY, finalBox.currentY);
      width = Math.abs(finalBox.currentX - finalBox.startX);
      height = Math.abs(finalBox.currentY - finalBox.startY);
    }
  
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
        if (imageInputRef.current) {
          imageInputRef.current.click();
        }
      } else if (currentTool === 'signature') {
        const newAnnotation = {
          id: Date.now(),
          type: 'signature',
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
        setOpenSignatureModal(true);
      } else if (currentTool === 'checkbox') {
        const newAnnotation = {
          id: Date.now(),
          type: 'checkbox',
          checked: false,
          x,
          y,
          width,
          height,
          scale: 1,
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
      }
    }
    setCurrentTool(null);
    setSelectionBox(null);
  };
  

  const handleAddTextBox = () => {
    setCurrentTool('text');
  };

  const handleAddImageTool = () => {
    setCurrentTool('image');
  };

  const handleAddSignatureTool = () => {
    setCurrentTool('signature');
  };

  const handleAddCheckboxTool = () => {
    setCurrentTool('checkbox');
  };

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

  const toggleCheckboxAnnotation = (id) => {
    setAnnotations((prev) =>
      prev.map((ann) =>
        ann.id === id && ann.type === 'checkbox'
          ? { ...ann, checked: !ann.checked }
          : ann
      )
    );
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
  };

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
    if (digitalSignatureRef.current && pendingSignatureAnnotationId) {
      const signatureDataUrl = digitalSignatureRef.current.getSignatureData();
      const signatureFile = dataURLtoFile(signatureDataUrl, 'signature.png');
      setAnnotations((prev) =>
        prev.map((ann) => {
          if (ann.id === pendingSignatureAnnotationId) {
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

  const handleSaveAnnotations = () => {
    const data = JSON.stringify(annotations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotations.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadAnnotations = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedAnnotations = JSON.parse(event.target.result);
          setAnnotations(loadedAnnotations);
        } catch (err) {
          console.error('Error parsing JSON:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <Box sx={{ display: 'flex', justifyContent: 'center'}}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          <Typography variant="h4" gutterBottom>
            PDF Editor
          </Typography>
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
              toggleCheckboxAnnotation={toggleCheckboxAnnotation}
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

          <Box sx={{ ml: 2, display: 'flex', gap: 1, mt: 2}}>
            <Button variant="contained" onClick={handleSaveAnnotations}>
              Save Annotations
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (jsonInputRef.current) jsonInputRef.current.click();
              }}
            >
              Load Annotations
            </Button>
          </Box>

          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={imageInputRef}
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
          />
          {/* Hidden file input for loading annotations JSON */}
          <input
            type="file"
            accept="application/json"
            ref={jsonInputRef}
            style={{ display: 'none' }}
            onChange={handleLoadAnnotations}
          />
        </Box>

        <Toolbar
          onUploadBasePdf={handleUploadBasePdf}
          onAddTextBox={handleAddTextBox}
          onAddImageTool={handleAddImageTool}
          onAddSignatureTool={handleAddSignatureTool}
          onAddCheckboxTool={handleAddCheckboxTool}
          onGeneratePdf={handleGeneratePdf}
        />
      </Box>

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
