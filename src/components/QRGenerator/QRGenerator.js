// src/components/UrlShortener.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DefaultCopyField } from '@eisberg-labs/mui-copy-field';
import { shortenUrl } from '../../services/api';
import QRCode from 'react-qr-code'; // Import the QR code component
import './QRGenerator.css';

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');

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
        // Construct the full URL by appending the shortened URL to the current origin.
        const fullShortenedUrl = `${window.location.origin}/go/${result.shortened_url}`;
        // Set the state so that the QR code can be generated.
        setShortenedUrl(fullShortenedUrl);
      } else {
        console.log("URL is empty");
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Failed to shorten URL. Please try again.');
    }
  };

  return (
    <div className="short-link">
      <h1>Generate QR</h1>
      <div className="input-line">
        <TextField
          id="url-field"
          label="Enter URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <TextField
          id="custom-alias-field"
          label="Custom Name"
          variant="outlined"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Button
          id="submit-button"
          variant="outlined"
          onClick={handleSubmit}
        >
          Submit URL
        </Button>
      </div>

      {/* Display the QR code only if a shortened URL exists */}
      {shortenedUrl && (
        <div className="qr-code-container" style={{ marginTop: '24px' }}>
          <h2>Your Shortened URL QR Code</h2>
          <QRCode value={shortenedUrl} />
          {/* Optionally display the shortened URL as text */}
          <p>{shortenedUrl}</p>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
