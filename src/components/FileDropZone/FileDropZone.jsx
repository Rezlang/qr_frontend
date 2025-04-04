import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";

const FileDropZone = ({ onFilesAdded, disabled }) => {
  const [globalDragActive, setGlobalDragActive] = useState(false);
  const [error, setError] = useState(null);
  const dropZoneRef = useRef(null);

  // Set up the dropzone for the visible box (for click & drop on the box)
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setError(null);
      onFilesAdded(acceptedFiles);
    },
    onDropRejected: () => {
      setError("Supported file types: PDF");
    },
    accept: { "application/pdf": [".pdf"] },
    disabled,
    multiple: true,
  });

  // Global listeners to handle drag events anywhere on the page.
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      setGlobalDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setGlobalDragActive(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      // Reset drag counter and hide overlay.
      dragCounter = 0;
      setGlobalDragActive(false);

      // If drop happens on the visible drop zone, let its handler take over.
      if (dropZoneRef.current && dropZoneRef.current.contains(e.target)) {
        return;
      }

      // Process files dropped outside the visible box.
      const files = Array.from(e.dataTransfer.files);
      const acceptedFiles = files.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf")
      );
      const rejectedFiles = files.filter(
        (file) =>
          !(file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf"))
      );
      if (rejectedFiles.length > 0) {
        setError("Supported file types: PDF");
      } else {
        setError(null);
      }
      if (acceptedFiles.length > 0) {
        onFilesAdded(acceptedFiles);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onFilesAdded]);

  return (
    <>
      {/* Visible file drop box for clicking/dropping */}
      <Box
        {...getRootProps()}
        ref={dropZoneRef}
        sx={{
          border: "2px dashed",
          borderColor: "grey.400",
          borderRadius: 1,
          p: 2,
          textAlign: "center",
          cursor: "pointer",
          mb: 2,
        }}
      >
        <input {...getInputProps()} />
        <Typography>
          Drag &amp; drop PDF files here, or click to select files
        </Typography>
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
      </Box>

      {/* Full-page overlay when dragging files anywhere on the page */}
      {globalDragActive && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255,255,255,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Typography variant="h4">
            {error ? error : "Supported file types: PDF"}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default FileDropZone;
