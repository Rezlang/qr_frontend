// src/pages/Analytics.js
import React from 'react';
import QRSHeader from '../components/Header/QRSHeader';
import AppTheme from '../components/signin/theme/AppTheme';

const Analytics = (props) => {

  return (
    <AppTheme {...props}>
      <div className="App">
        <header className="App-header">
          {/* You can include your logo or other header content here */}
          <QRSHeader />
        </header>
        <h2>Analytics placeholder</h2>
      </div>
    </AppTheme>
  );
};

export default Analytics;
``