// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RedirectPage from './pages/RedirectPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:shortenedUrl" element={<RedirectPage />} />
        <Route path="/:shortenedUrl/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
