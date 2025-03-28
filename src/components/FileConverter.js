import React, { useRef, useState } from 'react';
import { Container, Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
  const [inputType, setInputType] = useState(null);
  const [outputType, setOutputType] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());

  const ffmpegMap = {
    'png': ['jpg', 'jpeg', 'gif', 'webp'],
    'jpg': ['png', 'jpeg', 'gif', 'webp'],
    'jpeg': ['png', 'jpg', 'gif', 'webp'],
    'gif': ['png', 'jpg', 'jpeg', 'webp'],
    'webp': ['png', 'jpg', 'jpeg', 'gif'],
  }

  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
  }

  function extToMime(ext) {
    return mimeTypes[ext] || null;
  } 

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} kB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log(file)
      // Get the type of the file
      const fileType = file.name.split('.')[1];
      if (fileType in ffmpegMap) {
        setInputType(fileType);
      }
      else {
        console.error('Invalid file type');
        return;
      }
      setInputType(fileType);
      setOutputType(ffmpegMap[fileType][0]);
      setFile(file);
    }
  };

  const load = async () => {
    console.log("Loading ffmpeg");
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on('log', ({msg}) => {
        console.log(msg);
    });

    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    console.log("Successfully loaded ffmpeg");
}

  const handleConvert = async () => {
      setResult(null);
      console.log("Attempting conversion")
    const fileNameNoExt = file.name.split('.')[0];
    const outputFile = `${fileNameNoExt}.${outputType}`;
    if (file) {
      await load();
      const ffmpeg = ffmpegRef.current
      await ffmpeg.writeFile(`${file.name}`, await fetchFile(file));
      await ffmpeg.exec(['-i', `${file.name}`, outputFile]);
      const data = await ffmpeg.readFile(outputFile);
      setResult(data);
      console.log("Completed Conversion");
    }
  };

  const handleDownload = () => {
    console.log("attempting download");
    if (result) {
      const element = document.createElement('a');
      const fileBlob = new Blob([result.buffer], { type: extToMime(outputType) });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `converted_result.${outputType}`;
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
        {file && 
        <Typography variant="body1">{file.name} ({formatFileSize(file.size)})</Typography>}
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
