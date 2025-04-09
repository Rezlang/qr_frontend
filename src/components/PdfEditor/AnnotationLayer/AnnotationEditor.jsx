import React, { useState } from 'react';
import { Box } from '@mui/material';
import Draggable from 'react-draggable';
import TextAnnotation from './AnnotationTools/TextAnnotation.jsx';
import CheckboxAnnotation from './AnnotationTools/CheckboxAnnotation';
import SignatureAnnotation from './AnnotationTools/SignatureAnnotation';
import ImageAnnotation from './AnnotationTools/ImageAnnotation';
import SplineAnnotation from './AnnotationTools/SplineAnnotation';

export const createAnnotation = (tool, startX, startY, currentX, currentY) => {
  let x, y, width, height;
  if (tool === 'checkbox') {
    const dx = currentX - startX;
    const dy = currentY - startY;
    const side = Math.min(Math.abs(dx), Math.abs(dy));
    x = dx >= 0 ? startX : startX - side;
    y = dy >= 0 ? startY : startY - side;
    width = side;
    height = side;
  } else {
    x = Math.min(startX, currentX);
    y = Math.min(startY, currentY);
    width = Math.abs(currentX - startX);
    height = Math.abs(currentY - startY);
  }
  if (width <= 5 || height <= 5) return null;

  const baseAnnotation = {
    id: Date.now(),
    x,
    y,
    width,
    height,
    scale: 1,
  };

  switch (tool) {
    case 'text':
      return { ...baseAnnotation, type: 'text', text: 'Edit me' };
    case 'image':
      return { ...baseAnnotation, type: 'image', file: null, url: null };
    case 'signature':
      return { ...baseAnnotation, type: 'signature', file: null, url: null };
    case 'checkbox':
      return { ...baseAnnotation, type: 'checkbox', checked: false };
    case 'pencil': // pencil/spline tool
      // Initialize with a single point to start drawing from
      const centerX = (startX + currentX) / 2;
      const centerY = (startY + currentY) / 2; 
      return {
        ...baseAnnotation,
        type: 'spline',
        points: [], // Will be initialized when drawing starts
        strokeColor: '#000000',
        strokeWidth: 2,
        complete: false, // Indicates that the stroke is in drawing mode
      };
    default:
      return null;
  }
};


// Wrapper component to detect a click versus a drag
const ClickableAnnotationWrapper = ({ children, onClick }) => {
  const [mouseDownPos, setMouseDownPos] = useState(null);

  const handleMouseDown = (e) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (mouseDownPos) {
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);
      const threshold = 5; // threshold in pixels
      if (dx < threshold && dy < threshold) {
        onClick(e);
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}>
      {children}
    </div>
  );
};

const AnnotationEditor = ({
  annotations,
  updateAnnotationPosition,
  updateAnnotationText,
  toggleCheckboxAnnotation,
  handleDeleteAnnotation,
  onSignatureClick,
  onImageClick,
  currentTool,
  onCreateAnnotation,
  updateSplineAnnotation,
  pdfDimensions,
  mode,
}) => {
  const [selectionBox, setSelectionBox] = useState(null);

  const handleMouseDown = (e) => {
    // Only start annotation creation if the click is directly on the container
    if (e.target !== e.currentTarget) return;
    if (!currentTool || mode === 'sign') return;
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
    setSelectionBox((prev) => ({
      ...prev,
      currentX: offsetX,
      currentY: offsetY,
    }));
  };

  const handleMouseUp = (e) => {
    if (!selectionBox || !selectionBox.isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const finalBox = {
      ...selectionBox,
      currentX: offsetX,
      currentY: offsetY,
      isDragging: false,
    };

    const annotation = createAnnotation(
      currentTool,
      finalBox.startX,
      finalBox.startY,
      finalBox.currentX,
      finalBox.currentY
    );
    if (annotation && onCreateAnnotation) {
      onCreateAnnotation(annotation);
    }
    setSelectionBox(null);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        width: pdfDimensions.width,
        height: pdfDimensions.height,
        top: 0,
        left: 0,
        zIndex: 4,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {annotations.map((ann) => (
        <Draggable
          key={ann.id}
          // Use controlled positioning to ensure exact coordinates are used
          position={{ x: ann.x, y: ann.y }}
          onStop={(e, data) => updateAnnotationPosition(ann.id, data.x, data.y)}
          disabled={mode === 'sign' || (ann.type === 'spline' && !ann.complete)}
        >
          <Box
            sx={{
              position: 'absolute',
              width: ann.width + 4,
              height: ann.height + 4,
              cursor: mode === 'edit' ? 'move' : 'default',
              zIndex: 5,
              border: '2px dashed #1976d2',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(25,118,210,0.1)',
              borderRadius: 0,
            }}
          >
            {mode === 'edit' && (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAnnotation(ann.id);
                }}
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
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
            )}
            {ann.type === 'text' && (
              <TextAnnotation ann={ann} updateAnnotationText={updateAnnotationText} />
            )}
            {ann.type === 'checkbox' && (
              <CheckboxAnnotation ann={ann} toggleCheckboxAnnotation={toggleCheckboxAnnotation} />
            )}
            {ann.type === 'signature' && (
              <ClickableAnnotationWrapper onClick={() => onSignatureClick(ann)}>
                <SignatureAnnotation ann={ann} />
              </ClickableAnnotationWrapper>
            )}
            {ann.type === 'image' && (
              <ClickableAnnotationWrapper onClick={() => onImageClick(ann)}>
                <ImageAnnotation ann={ann} />
              </ClickableAnnotationWrapper>
            )}
            {ann.type === 'spline' && (
              <SplineAnnotation
                annotation={ann}
                updateAnnotation={updateSplineAnnotation}
              />
            )}

          </Box>
        </Draggable>
      ))}
      {selectionBox && selectionBox.isDragging && (
        <div
          style={{
            position: 'absolute',
            border: '2px dashed #1976d2',
            backgroundColor: 'rgba(25,118,210,0.1)',
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
};

export default AnnotationEditor;
