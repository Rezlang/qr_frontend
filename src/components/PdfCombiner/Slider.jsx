import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Draggable from "react-draggable";
import PreviewModal from "./PreviewModal"; // Import the new modal component
import PDFPreview from "./PDFPreview";

const Slider = ({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  advancedMode,
  onDrag,
  onStop,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Opens the modal when a slider item is clicked.
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  // Closes the modal.
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: containerWidth,
          height: itemHeight,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflowX: "auto",
          mb: 3,
        }}
      >
        {items.map((item) => (
          <Draggable
            key={item.id}
            axis="x"
            position={{ x: item.x, y: 0 }}
            onDrag={(e, data) => onDrag(e, data, item.id)}
            onStop={(e, data) => onStop(e, data, item.id)}
          >
            <Box
              onClick={() => handleItemClick(item)}
              sx={{
                width: itemWidth,
                height: itemHeight,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor:
                  item.type === "file" ? "background.paper" : "grey.100",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                cursor: "move",
                userSelect: "none",
                p: 1,
              }}
            >
              <Box sx={{ width: "100%", height: "80%" }}>
                {/* Use PDFPreview to show a small preview in the slider */}
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
      {/* Render the modal if an item has been selected */}
      {selectedItem && (
        <PreviewModal
          open={modalOpen}
          onClose={handleModalClose}
          previewUrl={selectedItem.previewUrl}
          advancedMode={advancedMode}
          fileName={
            selectedItem.type === "file"
              ? selectedItem.file?.name || "Unnamed file"
              : selectedItem.name
          }
        />
      )}
    </>
  );
};

export default Slider;
