// src/pages/Home.js
import React from 'react';
import QRSHeader
 from '../components/Header/QRSHeader';
import HomeTables from '../components/HomeTables';
const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        <QRSHeader />
      </header>
      <HomeTables />
    </div>
  );
};

export default Home;
