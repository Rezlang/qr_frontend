import React, { useState } from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PDFPreview from "./PDFPreview";

const PreviewModal = ({ open, onClose, previewUrl, advancedMode, fileName }) => {
  // Only used in basic mode to navigate pages
  const [page, setPage] = useState(1);

  const handlePrev = (e) => {
    // Prevent the modal from closing if the button is clicked
    e.stopPropagation();
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setPage((prev) => prev + 1);
  };

  // Clicking the backdrop closes the modal.
  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      {/* Fullscreen container catches backdrop clicks */}
      <Box
        onClick={handleBackdropClick}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        {/* Prevent click events inside the modal content from propagating */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            backgroundColor: "background.paper",
            p: 2,
            maxHeight: "90%",
            maxWidth: "90%",
            overflowY: advancedMode ? "hidden" : "auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {fileName}
          </Typography>
          {advancedMode ? (
            // In advanced mode, show only a single (first) page.
            <PDFPreview src={previewUrl} page={1} />
          ) : (
            <>
              {/* In basic mode, show the selected page. You may need to adjust PDFPreview to accept a "page" prop. */}
              <PDFPreview src={previewUrl} page={page} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <IconButton onClick={handlePrev} disabled={page === 1}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="body1" sx={{ mx: 2 }}>
                  {page}
                </Typography>
                <IconButton onClick={handleNext}>
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default PreviewModal;
