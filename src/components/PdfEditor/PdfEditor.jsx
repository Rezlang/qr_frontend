import React, { useState, useRef } from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PDFDocument } from 'pdf-lib';
import PdfDocumentViewer from './PdfDocumentViewer';
import AnnotationLayer from './AnnotationLayer/AnnotationEditor';
import { generatePdf } from './PdfGenerator';
import Toolbar from './Toolbar';
import SignatureModal from './SignatureModal/SignatureModal';
import AnnotationSaver from './AnnotationLayer/AnnotationSaver';

// Import free‑floating spline tool components.
import PencilTool from './SplineTools/PencilTool';
import PenTool from './SplineTools/PenTool';
import HighlighterTool from './SplineTools/HighlighterTool';

const PdfEditor = () => {
  // State for non‑spline annotations.
  const [annotations, setAnnotations] = useState([]);
  // State for free‑floating spline tools.
  const [splineTools, setSplineTools] = useState([]);
  const [basePdf, setBasePdf] = useState(null);
  const [basePdfUrl, setBasePdfUrl] = useState(null);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 600, height: 800 });
  const [openSignatureModal, setOpenSignatureModal] = useState(false);
  // Global “current tool” state for all annotations (text, image, signature, checkbox, or free‑floating spline tools)
  const [currentTool, setCurrentTool] = useState(null);
  // Keep track of the selected free‑floating spline.
  const [activeSplineId, setActiveSplineId] = useState(null);

  // For file‑handling annotations.
  const [pendingImageAnnotationId, setPendingImageAnnotationId] = useState(null);
  const [pendingSignatureAnnotationId, setPendingSignatureAnnotationId] = useState(null);
  const [mode, setMode] = useState('edit');

  // A ref for the hidden image input.
  const imageInputRef = useRef(null);

  // Utility: When selecting a spline tool (or any annotation tool), clear active free‑floating spline.
  const selectTool = (tool) => {
    setCurrentTool(tool);
    setActiveSplineId(null);
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

  // When generating the PDF, combine all annotations.
  const handleGeneratePdf = async () => {
    const allAnnotations = [...annotations, ...splineTools];
    await generatePdf({ basePdf, annotations: allAnnotations, pdfDimensions });
  };

  // Callbacks for non‑spline annotations.
  const handleAddAnnotation = (annotation) => {
    setAnnotations((prev) => [...prev, annotation]);
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

  // When deleting an annotation, also remove any free‑floating spline with that id.
  const handleDeleteAnnotation = (id) => {
    if (mode === 'edit') {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      setSplineTools((prev) => prev.filter((spline) => spline.id !== id));
      if (activeSplineId === id) setActiveSplineId(null);
    }
  };

  // --- Spline Tools State Management ---

  // When a free‑floating spline is updated, update it in state.
  const updateSplineTool = (updatedSpline) => {
    setSplineTools((prev) =>
      prev.map((s) => (s.id === updatedSpline.id ? updatedSpline : s))
    );
  };

  // Creation handlers for free‑floating spline tools.
  // Note: Calling selectTool ensures that the current tool is updated and any active selection is cleared.
  const handleAddPencilTool = () => {
    selectTool('pencil');
    const newSpline = {
      id: Date.now(),
      tool: 'pencil',
      points: [],
      strokeColor: '#000000',
      strokeWidth: 2,
      complete: false,
      opacity: 1,
    };
    setSplineTools((prev) => [...prev, newSpline]);
    setActiveSplineId(newSpline.id);
  };

  const handleAddPenTool = () => {
    selectTool('pen');
    const newSpline = {
      id: Date.now(),
      tool: 'pen',
      points: [],
      strokeColor: '#000000',
      strokeWidth: 2,
      complete: false,
      opacity: 1,
    };
    setSplineTools((prev) => [...prev, newSpline]);
    setActiveSplineId(newSpline.id);
  };

  const handleAddHighlighterTool = () => {
    selectTool('highlighter');
    const newSpline = {
      id: Date.now(),
      tool: 'highlighter',
      points: [],
      strokeColor: '#ffff00',
      strokeWidth: 8,
      complete: false,
      opacity: 0.5,
    };
    setSplineTools((prev) => [...prev, newSpline]);
    setActiveSplineId(newSpline.id);
  };

  // --- File‑handling for image and signature annotations (non‑spline) ---

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

  // Get the currently active free‑floating spline.
  const activeSpline = splineTools.find((s) => s.id === activeSplineId);

  // Handler for clicks on the PDF canvas background.
  // (Clicking anywhere on the background deselects any active spline.)
  const handleCanvasBackgroundClick = (e) => {
    // If the click target is exactly the container (not an annotation or PDF element), then clear active spline.
    if (e.target === e.currentTarget) {
      setActiveSplineId(null);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            PDF Editor
          </Typography>
          <Box
            onClick={handleCanvasBackgroundClick}
            sx={{
              position: 'relative',
              width: pdfDimensions.width,
              height: pdfDimensions.height,
              border: '1px solid #ccc',
              backgroundColor: 'white',
              overflow: 'hidden',
            }}
          >
            <PdfDocumentViewer
              basePdfUrl={basePdfUrl}
              pdfDimensions={pdfDimensions}
            />

            {/* Non‑spline annotations */}
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
              pdfDimensions={pdfDimensions}
              mode={mode}
            />

            {/* Free‑floating spline tools */}
            {splineTools.map((spline) => {
              const commonProps = {
                key: spline.id,
                id: spline.id,
                initialSpline: spline,
                onUpdate: updateSplineTool,
                onSelect: (id) => setActiveSplineId(id),
                onDelete: () => handleDeleteAnnotation(spline.id),
              };
              switch (spline.tool) {
                case 'pencil':
                  return <PencilTool {...commonProps} />;
                case 'pen':
                  return <PenTool {...commonProps} />;
                case 'highlighter':
                  return <HighlighterTool {...commonProps} />;
                default:
                  return null;
              }
            })}
          </Box>

          <AnnotationSaver
            annotations={annotations}
            setAnnotations={setAnnotations}
          />

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
            // These callbacks set the current tool and create the appropriate annotation mode.
            onAddTextBox={() => selectTool('text')}
            onAddImageTool={() => selectTool('image')}
            onAddSignatureTool={() => selectTool('signature')}
            onAddCheckboxTool={() => selectTool('checkbox')}
            // For spline annotations, call the corresponding add function.
            onAddPencilTool={handleAddPencilTool}
            onAddPenTool={handleAddPenTool}
            onAddHighlighterTool={handleAddHighlighterTool}
            onGeneratePdf={handleGeneratePdf}
            // Pass active spline info so the toolbar can display controls for it.
            activeSpline={activeSpline}
            updateActiveSpline={(updated) => {
              updateSplineTool(updated);
              setActiveSplineId(updated.id);
            }}
            // Pass currentTool so the toolbar highlights the active tool.
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
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
