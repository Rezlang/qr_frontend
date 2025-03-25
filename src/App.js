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
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import URLShort from './pages/URLShortener';
import Analytics from './pages/Analytics';
import DocSigner from './pages/DocSigner';
import ConverterPage from './pages/ConverterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/go/:shortenedUrl" element={<RedirectPage />} />
        <Route path="/" element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path="/shorten" element={<URLShort />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/docsigner" element={<DocSigner />} />
        <Route path="/fileconv" element={<ConverterPage />} />
      </Routes>
    </BrowserRouter>
  );
}


const app = initializeApp(firebaseConfig);
const analytics = initializeAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default App;
