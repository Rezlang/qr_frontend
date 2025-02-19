import React from 'react';
import { Box, TextField } from '@mui/material';
import Draggable from 'react-draggable';

const AnnotationLayer = ({
  annotations,
  updateAnnotationPosition,
  updateAnnotationText,
  handleDeleteAnnotation,
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
                    // You can adjust the font size as needed
                    fontSize: 16,
                    width: '100%',
                    height: '100%',
                  },
                }}
                sx={{
                  padding: '4px',
                }}
              />
            ) : (
              <img
                src={ann.url}
                alt="annotation"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                }}
              />
            )}
          </Box>
        </Draggable>
      ))}
    </>
  );
};

export default AnnotationLayer;
