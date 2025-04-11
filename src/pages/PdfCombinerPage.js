import PdfCombiner from "../components/PdfCombiner/PdfCombiner";
import React from 'react';
import QRSHeader from "../components/Header/QRSHeader";
import AppTheme from "../components/signin/theme/AppTheme";

const PdfCombinerPage = (props) => {
  return (
    <AppTheme {...props}>
      <div>
        <QRSHeader />
        <PdfCombiner></PdfCombiner>
      </div>
    </AppTheme>
  );
};

export default PdfCombinerPage;