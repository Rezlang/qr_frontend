import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function App() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');

  const handleSubmit = async () => {
    const data = {
      url: url,
      custom_alias: customAlias || null,
    };

    try {
      const response = await fetch('/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Shortened URL:', result);
        alert(`Shortened URL: ${result.shortened_url}`);
      } else {
        console.error('Failed to shorten URL:', response.statusText);
        alert('Failed to shorten URL. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please check the console for details.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
          label="Enter Custom Alias (Optional)"
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
      </header>
    </div>
  );
}

export default App;
