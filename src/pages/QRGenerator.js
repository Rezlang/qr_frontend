import QRGenerator from "../components/QRGenerator/QRGenerator";
import React from 'react';
import QRSHeader from "../components/Header/QRSHeader";
import AppTheme from "../components/signin/theme/AppTheme";

const QRGeneratorPage = (props) => {
  return (
    <AppTheme {...props}>
      <div>
        <QRSHeader />
        <QRGenerator></QRGenerator>
      </div>
    </AppTheme>
  );
};

export default QRGeneratorPage;