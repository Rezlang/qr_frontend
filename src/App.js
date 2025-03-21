// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RedirectPage from './pages/RedirectPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PdfPage from './pages/PdfPage';
import PdfCombiner from './pages/PdfCombinerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:shortenedUrl" element={<RedirectPage />} />
        <Route path="/:shortenedUrl/analytics" element={<AnalyticsPage />} />
        <Route path="/pdf" element={<PdfPage />} />
        <Route path="/combine" element={<PdfCombiner />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
