// src/pages/Home.js
import React from 'react';
import UrlShortener from '../components/URLShortener/URLShortener';
import SignOut from '../components/signout';

const Home = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can include your logo or other header content here */}
        <SignOut />
      </header>
      <UrlShortener />
    </div>
  );
};

export default Home;
