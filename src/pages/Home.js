// src/pages/Home.js
import React from 'react';
import SignIn from '../components/signin/signin';
import UrlShortener from '../components/URLShortener/URLShortener';
import QRGenerator from '../components/QRGenerator/QRGenerator';


const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can include your logo or other header content here */}
      </header>
      <SignIn />
      <UrlShortener />
      <QRGenerator />
    </div>
  );
};

export default Home;
