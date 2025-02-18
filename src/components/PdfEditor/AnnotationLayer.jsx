import React from 'react';
import { Box, TextField } from '@mui/material';
import Draggable from 'react-draggable';

const AnnotationLayer = ({
  annotations,
  updateAnnotationPosition,
  updateAnnotationText,
  handleDeleteAnnotation,
  setActiveAnnotationId,
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
            onClick={() => setActiveAnnotationId(ann.id)}
            sx={{
              position: 'absolute',
              display: 'inline-block',
              cursor: 'move',
              zIndex: 5,
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
                InputProps={{
                  style: { fontSize: 16 * ann.scale },
                }}
                sx={{
                  padding: '2px',
                  display: 'inline-block',
                  border: '1px dashed #000',
                  p: 1,
                  borderRadius: '10px',
                }}
              />
            ) : (
              <Box
                sx={{
                  border: '1px dashed #000',
                  display: 'inline-block',
                  p: 1,
                  borderRadius: '10px',
                }}
              >
                <img
                  src={ann.url}
                  alt="annotation"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  style={{
                    width: ann.naturalWidth * ann.scale,
                    height: ann.naturalHeight * ann.scale,
                    userSelect: 'none',
                  }}
                />
              </Box>
            )}
          </Box>
        </Draggable>
      ))}
    </>
  );
};

export default AnnotationLayer;
