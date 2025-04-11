import React, { useRef, useState } from 'react';
import { Container, Box, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
  const [uploadError, setUploadError] = useState(null);
  const [result, setResult] = useState(null);
  const [inputType, setInputType] = useState(null);
  const [outputType, setOutputType] = useState(null);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef(null);

  const ffmpegMap = {
    'png': ['jpg', 'jpeg', 'gif', 'webp'],
    'jpg': ['png', 'jpeg', 'gif', 'webp'],
    'jpeg': ['png', 'jpg', 'gif', 'webp'],
    'gif': ['png', 'jpg', 'jpeg', 'webp'],
    'webp': ['png', 'jpg', 'jpeg', 'gif'],
    'mp3' : ['wav', 'ogg'],
    'wav' : ['mp3', 'ogg'],
    'ogg' : ['mp3', 'wav'],
    'mp4' : ['mkv', 'avi', 'mov'],
    'mkv' : ['mp4', 'avi', 'mov'],
    'avi' : ['mp4', 'mkv', 'mov'],
    'mov' : ['mp4', 'mkv', 'avi'],
  }


  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'mkv': 'video/x-matroska',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
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
      // Get the type of the file
      const fileType = file.name.split('.')[1].toLowerCase();
      if (fileType in ffmpegMap) {
        setUploadError(null);
        setInputType(fileType);
        setOutputType(ffmpegMap[fileType][0]);
        setFile(file);
      }
      else {
        setUploadError('Invalid file type');
        setFile(null);
        return;
      }
    }
  };

  const load = async () => {
    console.log("Loading ffmpeg");
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;

    ffmpeg.on('progress', ({ progress, time }) => {
      messageRef.current.innerHTML = `${(progress * 100).toFixed(2)}% (Time Elapsed: ${time / 1000000} s)`;
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
      element.download = `converted-file.${outputType}`;
      document.body.appendChild(element);
      element.click();
    }
  };

  const handleOutputTypeChange = (event) => {
    setOutputType(event.target.value);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        File Converter
      </Typography>
      <Typography variant="body1" gutterBottom>
        Upload a file to convert it to a different format. Supports common image, audio, and video formats.
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
            Upload File (Max. 2GB)
          </Button>
        </label>
        {file && 
        <Typography variant="body1">
          {file.name} ({formatFileSize(file.size)})
        </Typography>
        }
        {uploadError && ( // Display error message if uploadError is set
          <Typography variant="body2" color="error" style={{ marginTop: '10px' }}>
            {uploadError}
          </Typography>
        )}
      </UploadBox>
      <Button
        variant="contained"
        color="primary"
        onClick={handleConvert}
        disabled={!file}
      >
        Convert
      </Button>
      {inputType && (
        <FormControl  style={{ marginLeft: '10px', minWidth: '100px' }}>
          <InputLabel  id="output-type-label">Output Type</InputLabel>
          <Select
            labelId="output-type-label"
            value={outputType}
            onChange={handleOutputTypeChange}
          >
            {ffmpegMap[inputType].map((type) => (
              <MenuItem key={type} value={type}>
                {type.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <p ref={messageRef}></p>
      {result && (
        <ResultBox>
          <Typography variant="body1">{`converted-file.${outputType} (${formatFileSize(result.length)})`}</Typography>
          <Button variant="contained" color="secondary" onClick={handleDownload}>
            Download Result
          </Button>
        </ResultBox>
      )}
    </Container>
  );
};

export default FileConverter;
