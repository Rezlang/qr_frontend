import PdfEditor from "../components/PdfEditor/PdfEditor";
import React from 'react';
import QRSHeader from "../components/Header/QRSHeader";
import AppTheme from "../components/signin/theme/AppTheme";

const PdfPage = (props) => {
  return (
    <AppTheme {...props}>
      <div>
        <QRSHeader />
        <PdfEditor></PdfEditor>
      </div>
    </AppTheme>
  );
};

export default PdfPage;