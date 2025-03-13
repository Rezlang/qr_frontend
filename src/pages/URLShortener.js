// src/pages/Home.js
import React from 'react';
import UrlShortener from '../components/URLShortener/URLShortener';
import QRSHeader
 from '../components/Header/QRSHeader';
 
const URLShort = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can include your logo or other header content here */}
        <QRSHeader />
      </header>
      <UrlShortener />
    </div>
  );
};

export default URLShort;
