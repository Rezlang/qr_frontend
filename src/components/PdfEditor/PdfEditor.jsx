import React, { useState, useRef } from 'react';
import {
  Button,
  Box,
  Typography,
  Modal,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
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
  const [mode, setMode] = useState('edit'); // new state for mode

  const imageInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const digitalSignatureRef = useRef(null);

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

  // Callback when AnnotationLayer creates a new annotation
  const handleAddAnnotation = (annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
  };

  // Called after an annotation is created to clear the current tool
  const handleToolFinish = () => {
    setCurrentTool(null);
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

  // In sign mode, deletion is disabled
  const handleDeleteAnnotation = (id) => {
    if (mode === 'edit') {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
    }
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
              file,
              url,
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

  const handleSignatureClick = (annotation) => {
    if (annotation.type === 'signature') {
      setPendingSignatureAnnotationId(annotation.id);
      setOpenSignatureModal(true);
    }
  };

  const handleImageClick = (annotation) => {
    setPendingImageAnnotationId(annotation.id);
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
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
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            flexDirection: 'column',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            PDF Editor
          </Typography>
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
              toggleCheckboxAnnotation={toggleCheckboxAnnotation}
              handleDeleteAnnotation={handleDeleteAnnotation}
              onSignatureClick={handleSignatureClick}
              onImageClick={handleImageClick}
              currentTool={currentTool}
              onCreateAnnotation={handleAddAnnotation}
              onToolFinish={handleToolFinish}
              pdfDimensions={pdfDimensions}
              mode={mode} // pass mode to AnnotationLayer
            />
          </Box>

          <Box sx={{ ml: 2, display: 'flex', gap: 1, mt: 2 }}>
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
          <input
            type="file"
            accept="application/json"
            ref={jsonInputRef}
            style={{ display: 'none' }}
            onChange={handleLoadAnnotations}
          />
        </Box>
        <Box sx={{ ml: 2 }}>
          <Toolbar
            onUploadBasePdf={handleUploadBasePdf}
            onAddTextBox={() => setCurrentTool('text')}
            onAddImageTool={() => setCurrentTool('image')}
            onAddSignatureTool={() => setCurrentTool('signature')}
            onAddCheckboxTool={() => setCurrentTool('checkbox')}
            onGeneratePdf={handleGeneratePdf}
          />
          {/* Edit/Sign mode toggle switch */}
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode !== null) {
                setMode(newMode);
              }
            }}
            sx={{ mt: 2 }}
          >
            <ToggleButton value="edit">Edit Mode</ToggleButton>
            <ToggleButton value="sign">Sign Mode</ToggleButton>
          </ToggleButtonGroup>
        </Box>
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
