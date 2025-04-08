import React, { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import { Box } from "@mui/material";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

const PDFPreview = ({ src, page = 1, scale = 1.5 }) => {
  const [preview, setPreview] = useState(null);         // currently displayed image
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    let isMounted = true;

    // Don't reset the current preview — keep it visible
    setLoading(true);

    pdfjs
      .getDocument(src)
      .promise.then((pdf) => {
        if (page > pdf.numPages) {
          console.warn(`Requested page ${page} exceeds total pages (${pdf.numPages})`);
          setLoading(false);
          return;
        }

        return pdf.getPage(page).then((pg) => {
          const viewport = pg.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = { canvasContext: context, viewport };
          return pg.render(renderContext).promise.then(() => {
            if (isMounted) {
              const dataUrl = canvas.toDataURL("image/png");
              setPreview(dataUrl);
              setCurrentPage(page);
              setLoading(false);
            }
          });
        });
      })
      .catch((err) => {
        console.error("Error loading PDF:", err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [src, page, scale]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {preview && (
        <img
          src={preview}
          alt={`PDF page ${currentPage}`}
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "opacity 0.2s ease-in-out",
            opacity: loading ? 0.5 : 1,
          }}
        />
      )}
    </Box>
  );
};

export default PDFPreview;
