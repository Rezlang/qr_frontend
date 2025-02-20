import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import Draggable from 'react-draggable';

// Utility function to create an annotation based on the active tool and mouse positions.
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
    default:
      return null;
  }
};

const AnnotationLayer = ({
  annotations,
  updateAnnotationPosition,
  updateAnnotationText,
  toggleCheckboxAnnotation,
  handleDeleteAnnotation,
  onSignatureClick,
  onImageClick,
  currentTool,
  onCreateAnnotation,
  onToolFinish,
  pdfDimensions,
  mode, // new prop to control behavior based on mode
}) => {
  const [selectionBox, setSelectionBox] = useState(null);

  // Disable annotation creation when in sign mode
  const handleMouseDown = (e) => {
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
    if (onToolFinish) {
      onToolFinish();
    }
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
          defaultPosition={{ x: ann.x, y: ann.y }}
          onStop={(e, data) => updateAnnotationPosition(ann.id, data.x, data.y)}
          disabled={mode === 'sign'} // disable dragging in sign mode
        >
          <Box
            sx={{
              position: 'absolute',
              width: ann.width,
              height: ann.height,
              cursor: mode === 'edit' ? 'move' : 'default',
              zIndex: 5,
              border: '1px dashed #000',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: 3,
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
            {ann.type === 'text' ? (
              <TextField
                variant="standard"
                value={ann.text}
                onChange={(e) => updateAnnotationText(ann.id, e.target.value)}
                multiline
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  style: { fontSize: 16, width: '100%', height: '100%' },
                }}
                sx={{ padding: '4px' }}
              />
            ) : ann.type === 'checkbox' ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheckboxAnnotation(ann.id);
                }}
              >
                {ann.checked ? (
                  <Box
                    sx={{
                      width: '80%',
                      height: '80%',
                      border: '2px solid black',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5em',
                    }}
                  >
                    ✓
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '80%',
                      height: '80%',
                      border: '2px solid black',
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>
            ) : ann.type === 'signature' ? (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSignatureClick) onSignatureClick(ann);
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(220,220,220,0.5)',
                }}
              >
                {ann.url ? (
                  <img
                    src={ann.url}
                    alt="signature"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />
                ) : (
                  <Box>Click to sign</Box>
                )}
              </Box>
            ) : ann.type === 'image' ? (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (onImageClick) onImageClick(ann);
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(240,240,240,0.5)',
                }}
              >
                {ann.url ? (
                  <img
                    src={ann.url}
                    alt="image annotation"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />
                ) : (
                  <Box>Click to add image</Box>
                )}
              </Box>
            ) : null}
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

export default AnnotationLayer;
