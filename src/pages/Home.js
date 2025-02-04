// src/pages/Home.js
import React from 'react';
import SignIn from '../components/signin/signin';
import UrlShortener from '../components/URLShortener/URLShortener';

const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can include your logo or other header content here */}
      </header>
      <UrlShortener />
    </div>
  );
};

export default Home;
