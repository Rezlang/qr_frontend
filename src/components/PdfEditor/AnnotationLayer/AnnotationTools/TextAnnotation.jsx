import React from 'react';
import { TextField } from '@mui/material';

const TextAnnotation = ({ ann, updateAnnotationText }) => {
  return (
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
  );
};

export default TextAnnotation;
