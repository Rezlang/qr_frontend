import React from 'react';
import { Box } from '@mui/material';

const ImageAnnotation = ({ ann, onImageClick }) => {
  return (
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
  );
};

export default ImageAnnotation;
