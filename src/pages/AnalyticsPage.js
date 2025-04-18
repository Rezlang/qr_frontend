// src/pages/AnalyticsPage.js
import React from 'react';
import Analytics from '../components/Analytics/Analytics';
import QRSHeader from '../components/Header/QRSHeader';
import AppTheme from '../components/signin/theme/AppTheme';

const AnalyticsPage = (props) => {
  return (
    <AppTheme {...props}>
      <div>
        <QRSHeader />
        <h1 style={{display:'flex', justifyContent:'center'}}>URL Analytics</h1>
        <Analytics />
      </div>
    </AppTheme>
  );
};

export default AnalyticsPage;
