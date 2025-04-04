import React, { useRef } from 'react';
import { Button, Box } from '@mui/material';

const AnnotationSaver = ({ annotations, setAnnotations }) => {
  const jsonInputRef = useRef(null);

  const handleSaveAnnotations = () => {
    const data = JSON.stringify(annotations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annotations.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadAnnotations = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedAnnotations = JSON.parse(event.target.result);
          setAnnotations(loadedAnnotations);
        } catch (err) {
          console.error('Error parsing JSON:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Box sx={{ ml: 2, display: 'flex', gap: 1, mt: 2 }}>
        <Button variant="contained" onClick={handleSaveAnnotations}>
          Save Annotations
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (jsonInputRef.current) jsonInputRef.current.click();
          }}
        >
          Load Annotations
        </Button>
      </Box>
      <input
        type="file"
        accept="application/json"
        ref={jsonInputRef}
        style={{ display: 'none' }}
        onChange={handleLoadAnnotations}
      />
    </>
  );
};

export default AnnotationSaver;
