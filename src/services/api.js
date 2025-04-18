// src/services/api.js

const APIURL = "127.0.0.1:8000";

function cleanData(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

export const shortenUrl = async (data) => {
  const response = await fetch(`http://${APIURL}/url/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanData(data)),
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

export const fetchSalt = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/${shortenedUrl}/salt`);
  if (!response.ok) {
    throw new Error('Failed to fetch salt');
  }
  return response.json();
};

export const fetchHash = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/${shortenedUrl}/hash`);
  if (!response.ok) {
    throw new Error('Failed to fetch hash');
  }
  return response.json();
};

export const fetchReferrers = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/analytics/${shortenedUrl}/referrers`);
  if (!response.ok) {
    throw new Error('Failed to fetch referrers data');
  }
  return response.json();
};

export const fetchAccessDates = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/analytics/${shortenedUrl}/access-dates`);
  if (!response.ok) {
    throw new Error('Failed to fetch access dates data');
  }
  return response.json();
};

export const fetchUniqueVisitors = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/analytics/${shortenedUrl}/unique-visitors`);
  if (!response.ok) {
    throw new Error('Failed to fetch unique visitors data');
  }
  return response.json();
}

export const fetchHourlyPatterns = async (shortendedUrl) => {
  const response = await fetch(`http://${APIURL}/analytics/${shortendedUrl}/hourly-patterns`);
  if (!response.ok) {
    throw new Error('Failed to fetch hourly patterns data');
  }
  return response.json();
};

export const fetchOriginalURLNoRedirect = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/${shortenedUrl}/url`);
  if (!response.ok) {
    throw new Error('Failed to fetch hourly patterns data');
  }
  return response.json();
};
export const fetchUserUrls = async (uid) => {
  const response = await fetch(`http://${APIURL}/analytics/${uid}/urls`, {
      method: 'GET',
      headers: {
     'Content-Type': 'application/json',
    },
  });
    
  if (!response.ok) {
    throw new Error('Failed to fetch user URLs');
  }
  return response.json();
};


export const fetchFullAnalytics = async (shortenedUrl) => {
  const response = await fetch(`http://${APIURL}/analytics/${shortenedUrl}/full-analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch full analytics data');
  }
  return response.json();
}