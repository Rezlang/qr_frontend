// src/pages/URLShortener.js
import React from 'react';
import UrlShortener from '../components/URLShortener/URLShortener';
import QRSHeader from '../components/Header/QRSHeader';
import AppTheme from '../theme/AppTheme';

const URLShort = (props) => {
  return (
    <AppTheme {...props}>
      <div className="App">
        <header className="App-header">
          {/* You can include your logo or other header content here */}
          <QRSHeader />
        </header>
        <UrlShortener />
      </div>
    </AppTheme>
  );
};

export default URLShort;
