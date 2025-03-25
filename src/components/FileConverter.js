import React, { useState } from 'react';
import { Container, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';

const UploadBox = styled(Box)({
  border: '2px dashed #ccc',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '20px',
});

const ResultBox = styled(Box)({
  border: '1px solid #ccc',
  padding: '20px',
  marginTop: '20px',
  marginBottom: '20px',
});

const FileConverter = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleConvert = () => {
    // Placeholder for file conversion logic
    if (file) {
      setResult(`Converted content of ${file.name}`);
    }
  };

  const handleDownload = () => {
    if (result) {
      const element = document.createElement('a');
      const fileBlob = new Blob([result], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = 'converted_result.txt';
      document.body.appendChild(element);
      element.click();
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        File Converter
      </Typography>
      <UploadBox>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span">
            Upload File
          </Button>
        </label>
      </UploadBox>
      <Button
        variant="contained"
        color="primary"
        onClick={handleConvert}
        disabled={!file}
      >
        Convert
      </Button>
      {result && (
        <ResultBox>
          <Typography variant="body1">{result}</Typography>
          <Button variant="contained" color="secondary" onClick={handleDownload}>
            Download Result
          </Button>
        </ResultBox>
      )}
    </Container>
  );
};

export default FileConverter;
