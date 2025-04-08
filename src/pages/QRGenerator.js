import QRGenerator from "../components/QRGenerator/QRGenerator";
import React from 'react';
import QRSHeader from "../components/Header/QRSHeader";

const QRGeneratorPage = () => {
  return (
    <div>
      <QRSHeader />
      <QRGenerator></QRGenerator>
    </div>
  );
};

export default QRGeneratorPage;