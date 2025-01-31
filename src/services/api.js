// src/services/api.js

const APIURL = "127.0.0.1:8000";

export const shortenUrl = async (data) => {
  const response = await fetch(`http://${APIURL}/url/shorten`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to shorten URL');
  }
  return response.json();
};

export const fetchOriginalUrl = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/url/${shortenedUrl}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch the original URL');
  }
  return response.json();
};
