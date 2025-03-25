import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

const PDFPreview = ({ src }) => {
    
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let isMounted = true;
    pdfjsLib.getDocument(src).promise.then(pdf => {
      pdf.getPage(1).then(page => {
        const scale = 1.5; // adjust scale as needed
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = { canvasContext: context, viewport };
        page.render(renderContext).promise.then(() => {
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
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  ) : (
    <div>Loading preview...</div>
  );
};

export default PDFPreview;
