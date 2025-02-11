// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RedirectPage from './pages/RedirectPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import { initializeApp } from 'firebase/app';
import { initializeAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/go/:shortenedUrl" element={<RedirectPage />} />
        <Route path="/" element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}


const app = initializeApp(firebaseConfig);
const analytics = initializeAnalytics(app);

export const auth = getAuth(app);
export default App;
