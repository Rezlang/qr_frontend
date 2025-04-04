import React from 'react';
import { Box } from '@mui/material';

const CheckboxAnnotation = ({ ann, toggleCheckboxAnnotation }) => {
  return (
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
  );
};

export default CheckboxAnnotation;
