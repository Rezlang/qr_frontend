// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RedirectPage from './pages/RedirectPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import URLShort from './pages/URLShortener';
import ConverterPage from './pages/ConverterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PdfPage from './pages/PdfPage';
import PdfCombiner from './pages/PdfCombinerPage'
import QRGeneratorPage from './pages/QRGenerator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:shortenedUrl" element={<RedirectPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/url-shortener" element={<URLShort />} />
        <Route path="/qr-gen" element={<QRGeneratorPage />} />
        <Route path="/converter" element={<ConverterPage />} />
        <Route path="/:shortenedUrl/analytics" element={<AnalyticsPage />} />
        <Route path="/pdf" element={<PdfPage />} />
        <Route path="/combine" element={<PdfCombiner />} />
      </Routes>
    </BrowserRouter>
  );
}


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default App;
