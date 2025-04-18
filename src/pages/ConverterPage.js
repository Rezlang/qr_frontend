import React from 'react';
import QRSHeader from '../components/Header/QRSHeader';
import FileConverter from '../components/FileConverter';
import AppTheme from '../theme/AppTheme';

// filepath: /home/lucah/RPI/Spring-25/RCOS/qr_frontend/src/pages/ConverterPage.js

const ConverterPage = (props) => {
    return (
        <AppTheme {...props}>
            <div className="App">
                <header className="App-header">
                    <QRSHeader />
                </header>
                <main>
                    <FileConverter />
                </main>
            </div>
        </AppTheme>
    );
};

export default ConverterPage;