// src/components/Redirector.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { fetchOriginalUrl } from '../services/api';

const Redirector = () => {
  const { shortenedUrl } = useParams(); // from the URL path parameter
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState('');

  // Try to fetch the original URL immediately via GET.
  useEffect(() => {
    const getUrl = async () => {
      try {
        const data = await fetchOriginalUrl(shortenedUrl);
        // If your backend indicates a password is required, e.g. by sending { requiresPassword: true }
        if (data.requiresPassword) {
          setNeedsPassword(true);
        } else if (data.original_url) {
          // Redirect the user to the original URL.
          window.location.href = data.original_url;
        }
      } catch (err) {
        setError(err.message);
      }
    };
    getUrl();
  }, [shortenedUrl]);

  // Called when the user enters a password and clicks Submit.
  const handlePasswordSubmit = async () => {
    try {
      // Send the password to the backend via a POST request.
      const data = await fetchOriginalUrl(shortenedUrl, { password });
      if (data.original_url) {
        window.location.href = data.original_url;
      }
    } catch (err) {
      setError('Incorrect password or unable to retrieve URL.');
    }
  };

  if (error) return <div>{error}</div>;

  // If a password is needed, show a prompt; otherwise, display a simple loading message.
  return needsPassword ? (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>This URL is password protected</h2>
      <TextField
        label="Enter Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="outlined" onClick={handlePasswordSubmit} style={{ marginLeft: '1rem' }}>
        Submit
      </Button>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default Redirector;
