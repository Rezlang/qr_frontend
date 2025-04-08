import PdfCombiner from "../components/PdfCombiner/PdfCombiner";
import React from 'react';
import QRSHeader from "../components/Header/QRSHeader";

const PdfCombinerPage = () => {
  return (
    <div>
      <QRSHeader />
      <PdfCombiner></PdfCombiner>
    </div>
  );
};

export default PdfCombinerPage;