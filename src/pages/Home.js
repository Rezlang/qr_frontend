// src/pages/Home.js
import React from 'react';
import QRSHeader
 from '../components/Header/QRSHeader';
const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can include your logo or other header content here */}
        <QRSHeader />
      </header>
      <h1>Hey man, this is me testing</h1>
    </div>
  );
};

export default Home;
