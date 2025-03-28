import React, { useEffect, useState } from "react";
import {pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;


const PDFPreview = ({ src }) => {
    
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let isMounted = true;
    console.log("Attempting to load PDF:", src);
    pdfjs.getDocument(src).promise.then(pdf => {
      console.log("PDF loaded", pdf);
      pdf.getPage(1).then(page => {
        console.log("Page 1 loaded", page);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
  
        const renderContext = { canvasContext: context, viewport };
        page.render(renderContext).promise.then(() => {
          console.log("Page rendered");
          if (isMounted) {
            const dataUrl = canvas.toDataURL("image/png");
            setPreview(dataUrl);
          }
        });
      });
    }).catch(err => {
      console.error("Error loading PDF:", err);
    });
  
    return () => { isMounted = false; };
  }, [src]);
  

  return preview ? (
    <img
        src={preview}
        alt="PDF preview"
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ) : (
    <div>Loading preview...</div>
  );
};

export default PDFPreview;
