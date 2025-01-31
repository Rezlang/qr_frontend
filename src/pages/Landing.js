// src/pages/Home.js
import React from 'react';
import SignIn from '../components/signin/signin';

const Landing = () => {
  return (
    <div className="App">
      <header className="App-header">
        {/* You can include your logo or other header content here */}
      </header>
      <SignIn />
    </div>
  );
};

export default Landing;
