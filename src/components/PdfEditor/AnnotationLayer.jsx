import React from 'react';
import { Box, TextField } from '@mui/material';
import Draggable from 'react-draggable';

const AnnotationLayer = ({
  annotations,
  updateAnnotationPosition,
  updateAnnotationText,
  toggleCheckboxAnnotation,
  handleDeleteAnnotation,
  onSignatureClick, // Handler for signature annotations
  onImageClick,     // Handler for image annotations
}) => {
  return (
    <>
      {annotations.map((ann) => (
        <Draggable
          key={ann.id}
          defaultPosition={{ x: ann.x, y: ann.y }}
          onStop={(e, data) => updateAnnotationPosition(ann.id, data.x, data.y)}
        >
          <Box
            sx={{
              position: 'absolute',
              width: ann.width,
              height: ann.height,
              cursor: 'move',
              zIndex: 5,
              border: '1px dashed #000',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: 3,
            }}
          >
            {/* Delete button */}
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

            {ann.type === 'text' ? (
              <TextField
                variant="standard"
                value={ann.text}
                onChange={(e) => updateAnnotationText(ann.id, e.target.value)}
                multiline
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  style: {
                    fontSize: 16,
                    width: '100%',
                    height: '100%',
                  },
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
                      color: 'black',
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
    </>
  );
};

export default AnnotationLayer;
