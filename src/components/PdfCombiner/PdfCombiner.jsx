import React from "react";
import { Box, Button, Switch, Typography } from "@mui/material";
import FileList from "./FileList";
import Slider from "./Slider";
import { usePDFProcessor } from "./usePDFProcessor";
import FileDropZone from "../FileDropZone/FileDropZone";

const PDFCombiner = () => {
  const {
    pdfFiles,
    orderedItems,
    advancedMode,
    itemHeight,
    itemWidth,
    gap,
    draggingId,
    handleFileUpload,
    removeFile,
    removePage,
    toggleMode,
    handleDragStart,
    handleDrag,
    handleStop,
    combinePDFs,
  } = usePDFProcessor();

  const containerWidth = "100%";

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        PDF Combiner
      </Typography>

      <FileDropZone
        onFilesAdded={handleFileUpload}
        disabled={pdfFiles.length >= 5}
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
        draggingId={draggingId}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleStop}
        removeFile={removeFile}
        removePage={removePage}
      />

      <Button variant="contained" onClick={combinePDFs}>
        Combine
      </Button>
    </Box>
  );
};

export default PDFCombiner;
