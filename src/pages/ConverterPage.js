import React from 'react';
import QRSHeader from '../components/Header/QRSHeader';
import FileConverter from '../components/FileConverter/FileConverter';

// filepath: /home/lucah/RPI/Spring-25/RCOS/qr_frontend/src/pages/ConverterPage.js

const ConverterPage = () => {
    return (
        <div className="App">
            <header className="App-header">
                <QRSHeader />
            </header>
            <main>
                <FileConverter />
            </main>
        </div>
    );
};

export default ConverterPage;