import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { fetchOriginalUrl, fetchSalt, fetchHash } from '../services/api';
import AppTheme from '../theme/AppTheme';

const Redirector = (props) => {
  const { shortenedUrl } = useParams();
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState('');
  const [salt, setSalt] = useState('');
  const [storedHash, setStoredHash] = useState('');

  // Helper function to compute SHA-256 hash of a given message.
  async function computeHash(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  useEffect(() => {
    const checkPasswordRequirement = async () => {
      try {
        // Fetch the salt and hash from the backend.
        const saltResponse = await fetchSalt(shortenedUrl);
        const hashResponse = await fetchHash(shortenedUrl);
        const fetchedSalt = saltResponse.salt;
        const fetchedHash = hashResponse.password_hash;

        // If both are empty, no password is needed.
        if (!fetchedSalt && !fetchedHash) {
          const data = await fetchOriginalUrl(shortenedUrl);
          if (data.url) {
            window.location.href = data.url;
          } else {
            setError('Original URL not found.');
          }
        } else {
          // A password is required.
          setSalt(fetchedSalt);
          setStoredHash(fetchedHash);
          setNeedsPassword(true);
        }
      } catch (err) {
        setError(err.message || 'Error fetching password requirements.');
      }
    };

    checkPasswordRequirement();
  }, [shortenedUrl]);

  const handlePasswordSubmit = async () => {
    try {
      // Compute the hash using the entered password and the fetched salt.
      const computedHash = await computeHash(password + salt);
      if (computedHash === storedHash) {
        // Password is correct; now retrieve and redirect to the original URL.
        const data = await fetchOriginalUrl(shortenedUrl);
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Original URL not found.');
        }
      } else {
        setError('Incorrect password.');
      }
    } catch (err) {
      setError('Error verifying password.');
    }
  };

  if (error) return <div>{error}</div>;

  return needsPassword ? (
    <AppTheme {...props}>
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2>This URL is password protected</h2>
        <TextField
          label="Enter Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="outlined"
          onClick={handlePasswordSubmit}
          style={{ marginLeft: '1rem' }}
        >
          Submit
        </Button>
      </div>
    </AppTheme>
  ) : (
    <AppTheme {...props}>
      <div>Loading...</div>
    </AppTheme>
  );
};

export default Redirector;
