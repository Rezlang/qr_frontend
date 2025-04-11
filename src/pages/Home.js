// src/pages/Home.js
import React from 'react';
import QRSHeader
  from '../components/Header/QRSHeader';
import HomeTables from '../components/HomeTables';
import AppTheme from '../components/signin/theme/AppTheme';

const Home = (props) => {
  return (
    <AppTheme {...props}>
      <div className="App">
        <header className="App-header">
          <QRSHeader />
        </header>
        <HomeTables />
      </div>
    </AppTheme>
  );
};

export default Home;
