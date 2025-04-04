import PdfEditor from "../components/PdfEditor/PdfEditor";
import React from 'react';
import QRSHeader from "../components/Header/QRSHeader";
const PdfPage = () => {
  return (
    <div>
      <QRSHeader />
      <PdfEditor></PdfEditor>
    </div>
  );
};

export default PdfPage;