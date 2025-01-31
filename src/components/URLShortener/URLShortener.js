// src/components/UrlShortener.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DefaultCopyField } from '@eisberg-labs/mui-copy-field';
import { shortenUrl } from '../../services/api';
import './URLShortener.css';

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
      console.log('Submitting:', data);
      const result = await shortenUrl(data);
      console.log('Shortened URL:', result);
      // Construct the full URL by appending the shortened URL to the current origin.
      const fullShortenedUrl = `${window.location.origin}/go/${result.shortened_url}`;
      setShortenedUrl(fullShortenedUrl);
      alert(`Shortened URL: ${fullShortenedUrl}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to shorten URL. Please try again.');
    }
  };

  return (
    <div className="short-link">
      <h1>Shorten URL</h1>
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
      <DefaultCopyField
        Readonly
        id="url-response"
        label="Copy Short URL"
        value={shortenedUrl}
      />
    </div>
  );
};

export default UrlShortener;
