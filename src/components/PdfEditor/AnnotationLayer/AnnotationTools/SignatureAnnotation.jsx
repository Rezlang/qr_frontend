import React from 'react';
import { Box } from '@mui/material';

const SignatureAnnotation = ({ ann, onSignatureClick }) => {
  return (
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
  );
};

export default SignatureAnnotation;
