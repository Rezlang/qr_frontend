// src/pages/RedirectPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOriginalUrl } from '../services/api';

const RedirectPage = () => {
  const { shortenedUrl } = useParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOriginalUrl = async () => {
      try {
        const result = await fetchOriginalUrl(shortenedUrl);
        // Assuming the API returns { original_url: "http://..." }
        window.location.href = result.original_url;
      } catch (err) {
        console.error('Redirect error:', err);
        setError('Invalid or expired link.');
      }
    };

    getOriginalUrl();
  }, [shortenedUrl]);

  return (
    <div>
      {error ? <p>{error}</p> : <p>Redirecting...</p>}
    </div>
  );
};

export default RedirectPage;
