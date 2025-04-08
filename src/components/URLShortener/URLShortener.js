// src/components/UrlShortener.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DefaultCopyField } from '@eisberg-labs/mui-copy-field';
import { shortenUrl } from '../../services/api';
import './URLShortener.css';

// Helper function to generate a random salt (16 bytes by default)
function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to compute SHA-256 hash of a given message and return it as a hex string
async function computeHash(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [password, setPassword] = useState(''); // New state for the optional password
  const [shortenedUrl, setShortenedUrl] = useState('');

  const handleSubmit = async () => {
    let salt = null;
    let hash = null;
    let uid  = null;
    let group = null;
    let description = null;

    // If a password is provided, generate a salt and compute its SHA-256 hash combined with the salt.
    if (password.trim() !== '') {
      salt = generateSalt();
      hash = await computeHash(password + salt);
    }

    const data = {
      url,
      custom_alias: customAlias || null,
      salt,  // Will be null if no password is provided.
      hash,  // Will be null if no password is provided.
      uid,  // Placeholder for user ID
      group,  // Placeholder for user group
      description,  // Placeholder for description
    };
    
    try {
      if (data.url.trim() !== '') {
        console.log('Submitting:', data);
        const result = await shortenUrl(data);
        console.log('Shortened URL:', result);
        // Construct the full URL by appending the shortened URL to the current origin.
        const fullShortenedUrl = `${window.location.origin}/${result.shortened_url}`;
        setShortenedUrl(fullShortenedUrl);
        console.log(`Shortened URL: ${fullShortenedUrl}`);
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
          label="Custom Name (optional)"
          variant="outlined"
          value={customAlias}
          onChange={(e) => setCustomAlias(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        {/* New input for the optional password */}
        <TextField
          id="password-field"
          label="Password (optional)"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        ReadOnly
        id="url-response"
        label="Copy Short URL"
        value={shortenedUrl}
      />
    </div>
  );
};

export default UrlShortener;
