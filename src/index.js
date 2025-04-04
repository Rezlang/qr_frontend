// src/index.js
import React from 'react';
import './index.css'; // if you have global styles

import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

