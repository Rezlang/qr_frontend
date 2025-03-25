import React, { useState, useEffect } from "react";
import {
  Button,
  Switch,
  Typography,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Close";
import { PDFDocument } from "pdf-lib";
import Draggable from "react-draggable";

// A simple PDF preview component using an iframe
const PDFPreview = ({ src }) => (
  <iframe
    src={src}
    title="pdf-preview"
    style={{ width: "100%", height: "100%", border: "none" }}
  />
);

const PDFCombiner = () => {
  // Each file entry now always includes a full PDF preview URL and page data.
  // { file, previewUrl, pages: [ { name, bytes, previewUrl } ] }
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfPages, setPdfPages] = useState([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  // orderedItems used for final ordering.
  // Basic mode: { id, type:"file", file, previewUrl, x }
  // Advanced mode: { id, type:"page", file, name, bytes, previewUrl, x }
  const [orderedItems, setOrderedItems] = useState([]);

  // Dimensions for slider items.
  const itemWidth = advancedMode ? 120 : 160;
  const itemHeight = advancedMode ? 160 : 120;
  const gap = 16;

  // On file upload, always process the file into pages and compute preview URLs.
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - pdfFiles.length);
    const loadedFiles = await Promise.all(
      files.map(async (file) => {
        // Full PDF preview URL.
        const filePreviewUrl = URL.createObjectURL(file);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        // Process each page into its own PDF and compute its preview URL.
        const pages = await Promise.all(
          pdfDoc.getPages().map(async (_, idx) => {
            const newDoc = await PDFDocument.create();
            const [copiedPage] = await newDoc.copyPages(pdfDoc, [idx]);
            newDoc.addPage(copiedPage);
            const singlePageBytes = await newDoc.save();
            const pagePreviewUrl = URL.createObjectURL(
              new Blob([singlePageBytes], { type: "application/pdf" })
            );
            return {
              name: `${file.name} - Page ${idx + 1}`,
              bytes: singlePageBytes,
              previewUrl: pagePreviewUrl,
            };
          })
        );
        return { file, previewUrl: filePreviewUrl, pages };
      })
    );

    // Always update both arrays with the processed file entries.
    setPdfFiles((prev) => [...prev, ...loadedFiles]);
    setPdfPages((prev) => [...prev, ...loadedFiles]);
  };

  // Remove file and its pages.
  const removeFile = (index) => {
    const fileToRemove = pdfFiles[index]?.file;
    setPdfFiles((prev) => prev.filter((entry, i) => i !== index));
    setPdfPages((prev) =>
      prev.filter((entry) => entry.file !== fileToRemove)
    );
  };

  // Build the orderedItems list whenever the files/pages or mode changes.
  useEffect(() => {
    if (advancedMode) {
      // Flatten pages from each file, skipping any entry missing required data.
      const flatPages = pdfPages
        .filter((entry) => entry && entry.file && entry.pages)
        .flatMap((entry) =>
          entry.pages.map((page, idx) => ({
            id: `page-${entry.file?.name || "unknown"}-${idx}`,
            type: "page",
            file: entry.file,
            name: page.name,
            bytes: page.bytes,
            previewUrl: page.previewUrl,
          }))
        );
      const itemsWithPos = flatPages.map((item, i) => ({
        ...item,
        x: i * (itemWidth + gap),
      }));
      setOrderedItems(itemsWithPos);
    } else {
      // Basic mode: one item per file.
      const items = pdfFiles
        .filter((entry) => entry && entry.file)
        .map((entry, i) => ({
          id: `file-${entry.file.name}-${i}`,
          type: "file",
          file: entry.file,
          previewUrl: entry.previewUrl,
        }));
      const itemsWithPos = items.map((item, i) => ({
        ...item,
        x: i * (itemWidth + gap),
      }));
      setOrderedItems(itemsWithPos);
    }
  }, [advancedMode, pdfFiles, pdfPages, itemWidth, gap]);

  // Update an item's x position during drag.
  const handleDrag = (e, data, id) => {
    setOrderedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, x: data.x } : item
      )
    );
  };

  // On drag stop, reorder items based on x position and snap them to grid slots.
  const handleStop = (e, data, id) => {
    setOrderedItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, x: data.x } : item
      );
      updatedItems.sort((a, b) => a.x - b.x);
      const snappedItems = updatedItems.map((item, index) => ({
        ...item,
        x: index * (itemWidth + gap),
      }));
      return snappedItems;
    });
  };

  // Combine PDFs/pages based on the final ordering.
  const combinePDFs = async () => {
    const newPdf = await PDFDocument.create();
    if (advancedMode) {
      for (const item of orderedItems) {
        const loaded = await PDFDocument.load(item.bytes);
        const [copied] = await newPdf.copyPages(loaded, [0]);
        newPdf.addPage(copied);
      }
    } else {
      for (const item of orderedItems) {
        const arrayBuffer = await item.file.arrayBuffer();
        const loaded = await PDFDocument.load(arrayBuffer);
        const copiedPages = await newPdf.copyPages(
          loaded,
          loaded.getPageIndices()
        );
        copiedPages.forEach((p) => newPdf.addPage(p));
      }
    }
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "combined.pdf";
    link.click();
  };

  // Calculate slider container width.
  const containerWidth = orderedItems.length * (itemWidth + gap);

  return (
    <Box sx={{ padding: 4, fontFamily: "sans-serif" }}>
      <Typography variant="h4" gutterBottom>
        PDF Combiner
      </Typography>

      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileUpload}
        disabled={pdfFiles.length >= 5}
        style={{ marginBottom: 16 }}
      />

      <List>
        {pdfFiles.map((entry, idx) => (
          <ListItem key={idx}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <ListItemText primary={entry.file?.name || "Unnamed file"} />
              <IconButton onClick={() => removeFile(idx)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography>Basic</Typography>
        <Switch
          checked={advancedMode}
          onChange={() => setAdvancedMode((prev) => !prev)}
        />
        <Typography>Advanced</Typography>
      </Box>

      {/* Slider container */}
      <Box
        sx={{
          position: "relative",
          width: containerWidth,
          height: itemHeight,
          border: "1px solid #ccc",
          borderRadius: 2,
          overflowX: "auto",
          mb: 3,
        }}
      >
        {orderedItems.map((item) => (
          <Draggable
            key={item.id}
            axis="x"
            position={{ x: item.x, y: 0 }}
            onDrag={(e, data) => handleDrag(e, data, item.id)}
            onStop={(e, data) => handleStop(e, data, item.id)}
            cancel=""
          >
            <Box
              sx={{
                width: itemWidth,
                height: itemHeight,
                border: "1px solid #999",
                borderRadius: 2,
                backgroundColor:
                  item.type === "file" ? "#eaeaea" : "#f5f5f5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                cursor: "move",
                userSelect: "none",
              }}
            >
              <Box sx={{ width: "100%", height: "80%" }}>
                <PDFPreview src={item.previewUrl} />
              </Box>
              <Typography
                sx={{
                  fontSize: advancedMode ? 12 : 14,
                  mt: 0.5,
                  textAlign: "center",
                }}
              >
                {item.type === "file"
                  ? item.file?.name || "Unnamed file"
                  : item.name}
              </Typography>
            </Box>
          </Draggable>
        ))}
      </Box>

      <Button variant="contained" onClick={combinePDFs}>
        Combine
      </Button>
    </Box>
  );
};

export default PDFCombiner;
