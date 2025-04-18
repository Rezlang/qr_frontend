// src/components/QRGenerator.js
import React, { useState, useRef } from 'react';
import { TextField, Button, Card } from '@mui/material';
import { shortenUrl } from '../../services/api';
import QRCode from 'react-qr-code';
import { HuePicker } from 'react-color';
import html2canvas from 'html2canvas';
import './QRGenerator.css';

const QRGenerator = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [qrColor, setQrColor] = useState('#000000'); // Initial color: black
  const [uploadedIcon, setUploadedIcon] = useState(null); // Store the uploaded icon data URL

  // Reference to the QR code container for downloading
  const qrRef = useRef(null);

  const handleSubmit = async () => {
    const data = {
      url,
      custom_alias: customAlias || null,
    };

    try {
      if (data.url.trim() !== '') {
        console.log('Submitting:', data);
        const result = await shortenUrl(data);
        console.log('Shortened URL:', result);
        // **Modified:** Construct the shortened URL to match the backend route.
        const fullShortenedUrl = `${window.location.origin}/${result.shortened_url}`;
        setShortenedUrl(fullShortenedUrl);
      } else {
        console.log("URL is empty");
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Failed to shorten URL. Please try again.');
    }
  };

  // Handle file upload for the custom icon
  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedIcon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Download the QR code as a PNG image using html2canvas
  const handleDownloadPNG = async () => {
    if (qrRef.current) {
      try {
        const canvas = await html2canvas(qrRef.current, { backgroundColor: null });
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating PNG:', error);
      }
    }
  };

  // Download the QR code as an SVG image with the icon embedded
  const handleDownloadSVG = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        // Clone the SVG so that we don't modify the on-screen version
        const clonedSvg = svg.cloneNode(true);

        if (uploadedIcon) {
          const xmlns = "http://www.w3.org/2000/svg";
          const imageEl = document.createElementNS(xmlns, 'image');
          imageEl.setAttributeNS(null, 'href', uploadedIcon);

          // Assume the SVG viewBox is "0 0 256 256" (adjust as needed)
          const viewBox = clonedSvg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 256, 256];
          const [x, y, width, height] = viewBox;
          const iconWidth = width * 0.2;
          const iconHeight = height * 0.2;
          const iconX = x + (width - iconWidth) / 2;
          const iconY = y + (height - iconHeight) / 2;

          imageEl.setAttributeNS(null, 'x', iconX);
          imageEl.setAttributeNS(null, 'y', iconY);
          imageEl.setAttributeNS(null, 'width', iconWidth);
          imageEl.setAttributeNS(null, 'height', iconHeight);

          clonedSvg.appendChild(imageEl);
        }

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSvg);
        if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
          svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!svgString.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
          svgString = svgString.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'qr-code.svg';
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <Card className="qr-gen">
      <h1>Generate QR</h1>
      <div className="input-line">
        <TextField
          id="url-field"
          label="Enter URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <TextField
          id="custom-alias-field"
          label="Custom Name"
          variant="outlined"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
        />
        <Button
          id="submit-button"
          variant="outlined"
          onClick={handleSubmit}
        >
          Submit URL
        </Button>
      </div>
      <div className="customize">
        <div className="color-picker">
          <h2>Select QR Code Color</h2>
          <HuePicker
            color={qrColor}
            onChange={(color) => setQrColor(color.hex)}
            width="300px"
          />
        </div>

        <div className="icon-upload">
          <Button variant="contained" component="label">
            Upload Custom Icon
            <input 
              type="file" 
              hidden 
              accept="image/*" 
              onChange={handleIconUpload} 
            />
          </Button>
        </div>
      </div>

      {shortenedUrl && (
        <div className="results">
          <h2>Your Shortened URL QR Code</h2>
          <div 
            className="qr-code-container" 
            style={{ 
              position: 'relative', 
              display: 'inline-block' 
            }} 
            ref={qrRef}
          >
            <QRCode value={shortenedUrl} fgColor={qrColor} />
            {uploadedIcon && (
              <img 
                src={uploadedIcon} 
                alt="QR Icon" 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '20%',
                  height: '20%',
                  objectFit: 'contain',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>

          <div className="download-buttons">
            <Button variant="contained" onClick={handleDownloadPNG}>
              Download PNG
            </Button>
            <Button variant="contained" onClick={handleDownloadSVG}>
              Download SVG
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default QRGenerator;
