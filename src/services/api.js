// src/services/api.js

const APIURL = "127.0.0.1:8000";

export const shortenUrl = async (data) => {
  const response = await fetch(`http://${APIURL}/url/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to shorten URL');
  }
  return response.json();
};

// Modified retrieval function: if a password payload is provided,
// use POST; otherwise, use GET.
export const fetchOriginalUrl = async (shortenedUrl, passwordData = null) => {
  const options = {
    method: passwordData ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
  };

  if (passwordData) {
    options.body = JSON.stringify(passwordData);
  }
  console.log(shortenUrl)
  const response = await fetch(`http://${APIURL}/${shortenedUrl}`, options);
  if (!response.ok) {
    throw new Error('Failed to fetch the original URL');
  }
  return response.json();
};
