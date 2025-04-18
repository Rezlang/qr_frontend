import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Container, Box, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/system';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json-browser';

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

const textMap = {
  'docx': ['txt', 'html'],
  'pdf': ['json', 'txt']
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
  'txt': 'text/plain',
  'html': 'text/html',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'pdf': 'application/pdf',
  'json': 'application/json',
}


export default function FileConverter() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [inputType, setInputType] = useState('');
  const [outputType, setOutputType] = useState('');

  const mapRef = useRef({});
  const ffmpegRef = useRef(new FFmpeg());
  const converterRef = useRef(null);
  const messageRef = useRef();


  const getOutputFilename = useCallback(() => {
    const fileNameNoExt = file.name.split('.')[0];
    return `${fileNameNoExt}.${outputType}`;
  }, [file, outputType]);

  useEffect(() => {
    if (!inputType) return;

    const readFile = async () => {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
    }

    const ffmpegConvert = async () => {
      await load();
      
      const ffmpeg = ffmpegRef.current
      const outputFile = getOutputFilename();
  
      await ffmpeg.writeFile(`${file.name}`, await fetchFile(file));
      await ffmpeg.exec(['-i', `${file.name}`, outputFile]);
      const data = await ffmpeg.readFile(outputFile);
      return data;
    }
    
    const selectTextConvert = (inputFile) => {
      switch (inputFile) {
        case 'docx':
          return docxConvert;
        case 'pdf':
          return pdfConvert;
        default:
          return null;
      }
    }

    const docxToText = async () => {
      try {
        const content = await readFile();
        const res = await mammoth.extractRawText({buffer: content});
        return res.value;
      } catch (err) {
        console.error("Error converting file:", err);
      }
    }

    const docxToHTML = async () => {
      try {
        const content = await readFile();
        const res = await mammoth.convertToHtml({arrayBuffer: content});
        return res.value;
      } catch (err) {
        console.error("Error converting file:", err);
      }
    }

    const parsePDF = async (needRaw) => {
      const content = await readFile();

      const parser = new PDFParser(null, needRaw, "");
      return new Promise((resolve, reject) => {
        parser.on('pdfParser_dataReady', pdfData => {
          resolve(pdfData);
        });
        parser.on('pdfParser_dataError', err => {
          console.error("Error parsing PDF:", err);
          reject(err);
        });
        parser.parseBuffer(content);
      });
    }

    const pdfToJson = async () => {
      console.log("PDF to HTML conversion");
      
      const res = await parsePDF(false);

      const json = JSON.stringify(res);
      return json;      

    }

    const pdfToTxt = async () => {
      console.log("PDF to HTML conversion");

      const res = await parsePDF(true);
      const text = res.MergedTextBlocks.map(block => block.text).join('\n');
      return text
    }

    const docxConvert = async () => {
      switch (outputType) {
        case 'html':
          return docxToHTML();
        case 'txt':
          return docxToText();
        default:
          // Do nothing
      }   
    }

    const pdfConvert = async () => {
      switch (outputType) {
        case 'json':
          return pdfToJson();
        case 'txt':
          return pdfToTxt();
        default:
          // Do nothing
      }
    }

    // Select based on input type, so that we can check output type
    // only when the user clicks convert
    if (ffmpegMap[inputType]) {
      mapRef.current = ffmpegMap;
      converterRef.current = ffmpegConvert;
      setUploadError('');
    } else if (textMap[inputType]) {
      mapRef.current = textMap;
      converterRef.current = selectTextConvert(inputType);
      setUploadError('');
    } else {
      mapRef.current = {};
      converterRef.current = null;
      setUploadError('Invalid file type');
      setFile(null);
      return;
    }

    // default to first available output for that type
    setOutputType(outputType ? outputType : mapRef.current[inputType][0]);
  }, [inputType, getOutputFilename, file, outputType]);

  function extToMime(ext) {
    return mimeTypes[ext] || 'application/octet-stream';
  } 

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} kB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const handleFileChange = (event) => {
    const f = event.target.files?.[0];
    if (!f) return;
    const extension = f.name.split('.').pop().toLowerCase();
    setInputType(extension);
    setFile(f);
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
    console.log("Attempting conversion");
    
    if (file && converterRef.current) {
      const res = await converterRef.current();      
      setResult(res);
    }

  };

  const handleDownload = () => {
    console.log("Attempting download");
    if (!result) return;
    const element = document.createElement('a');
    const fileBlob = 
      result.buffer != null
        ? new Blob([result.buffer], { type: extToMime(outputType) })
        : new Blob([result], { type: extToMime(outputType) });
    element.href = URL.createObjectURL(fileBlob);
    element.download = getOutputFilename();
    document.body.appendChild(element);
    element.click();
    element.remove();
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
        disabled={!file || !!uploadError}
      >
        Convert
      </Button>
      {inputType && Array.isArray(mapRef.current[inputType]) && (
        <FormControl style={{ marginLeft: '10px', minWidth: '100px' }}>
          <InputLabel>Output Type</InputLabel>
          <Select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value)}
          >
            {mapRef.current[inputType].map((type) => (
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
          <Typography variant="body1">{`${getOutputFilename()} (${formatFileSize(result.length)})`}</Typography>
          <Button variant="contained" color="secondary" onClick={handleDownload}>
            Download Result
          </Button>
        </ResultBox>
      )}
    </Container>
  );
};