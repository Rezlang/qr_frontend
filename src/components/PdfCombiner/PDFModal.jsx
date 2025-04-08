import React, { useState } from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PDFPreview from "./ModalPreview";

const PreviewModal = ({ open, onClose, previewUrl, advancedMode, fileName }) => {
  const [page, setPage] = useState(1);

  const handlePrev = (e) => {
    e.stopPropagation();
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setPage((prev) => prev + 1);
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
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
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            backgroundColor: "background.paper",
            p: 2,
            maxHeight: "90vh",
            maxWidth: "90vw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <PDFPreview src={previewUrl} page={advancedMode ? 1 : page} />
          </Box>

          {!advancedMode && (
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
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default PreviewModal;
