import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import PdfDocumentViewer from './PdfDocumentViewer';
import AnnotationLayer from './AnnotationLayer/AnnotationEditor';
import { generatePdf } from './PdfGenerator';
import Toolbar from './Toolbar';
import SignatureModal from './SignatureModal/SignatureModal';
import AnnotationSaver from './AnnotationLayer/AnnotationSaver'; 

const PdfEditor = () => {
  const [annotations, setAnnotations] = useState([]);
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [pendingImageAnnotationId, setPendingImageAnnotationId] = useState(null);
  const [pendingSignatureAnnotationId, setPendingSignatureAnnotationId] = useState(null);
  const [mode, setMode] = useState('edit');

  const imageInputRef = useRef(null);

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

  const updateSplineAnnotation = (updatedAnnotation) => {
    setAnnotations((prevAnnotations) =>
      prevAnnotations.map((ann) =>
        ann.id === updatedAnnotation.id ? updatedAnnotation : ann
      )
    );
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

  const handleSubmitSignature = (signatureDataUrl) => {
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
              updateSplineAnnotation={updateSplineAnnotation}
              pdfDimensions={pdfDimensions}
              mode={mode}
            />
          </Box>

          <AnnotationSaver annotations={annotations} setAnnotations={setAnnotations} />

          <input
            type="file"
            accept="image/png, image/jpeg"
            ref={imageInputRef}
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
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
            onAddPencilTool={() => setCurrentTool('pencil')}
          />
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
      <SignatureModal
        open={openSignatureModal}
        onClose={() => setOpenSignatureModal(false)}
        onSubmit={handleSubmitSignature}
      />
    </Box>
  );
};

export default PdfEditor;
