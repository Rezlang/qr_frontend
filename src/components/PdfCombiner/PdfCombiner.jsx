import React, { useState, useEffect } from "react";
import { Box, Button, Switch, Typography } from "@mui/material";
import FileList from "./FileList";
import PDFPreview from "./PDFPreview";
import Slider from "./Slider";
import { usePDFProcessor } from "./usePDFProcessor";

const PDFCombiner = () => {
  const {
    pdfFiles,
    pdfPages,
    orderedItems,
    advancedMode,
    itemHeight,
    itemWidth,
    gap,
    handleFileUpload,
    removeFile,
    toggleMode,
    handleDrag,
    handleStop,
    combinePDFs,
  } = usePDFProcessor();

  const containerWidth = orderedItems.length * (itemWidth + gap);

  return (
    <Box sx={{ padding: 4, fontFamily: "sans-serif" }}>
      <Typography variant="h4" gutterBottom>PDF Combiner</Typography>

      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileUpload}
        disabled={pdfFiles.length >= 5}
        style={{ marginBottom: 16 }}
      />

      <FileList files={pdfFiles} onRemove={removeFile} />

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography>Basic</Typography>
        <Switch checked={advancedMode} onChange={toggleMode} />
        <Typography>Advanced</Typography>
      </Box>

      <Slider
        items={orderedItems}
        itemWidth={itemWidth}
        itemHeight={itemHeight}
        gap={gap}
        containerWidth={containerWidth}
        advancedMode={advancedMode}
        onDrag={handleDrag}
        onStop={handleStop}
      />

      <Button variant="contained" onClick={combinePDFs}>
        Combine
      </Button>
    </Box>
  );
};

export default PDFCombiner;
