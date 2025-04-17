import React, { useState, useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import Draggable from "react-draggable";
import CloseIcon from "@mui/icons-material/Close";
import PreviewModal from "./PDFModal";
import PDFPreview from "./ModalPreview";

const Slider = ({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  advancedMode,
  draggingId,
  onStart,
  onDrag,
  onStop,
  removeFile,
  removePage,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const draggingRef = useRef(false);

  const handleItemClick = (item) => {
    if (draggingRef.current) return;
    setSelectedItem(item);
    setModalOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: containerWidth,
          height: itemHeight + 17,
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
            onStart={() => {
              draggingRef.current = false;
              onStart();
            }}
            onDrag={(e, data) => {
              draggingRef.current = true;
              onDrag(e, data, item.id);
            }}
            onStop={(e, data) => {
              onStop(e, data, item.id);
              setTimeout(() => {
                draggingRef.current = false;
              }, 0);
            }}
          >
            <Box
              onClick={() => handleItemClick(item)}
              sx={{
                width: itemWidth,
                height: itemHeight,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "grey.100",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                position: "absolute",
                cursor: "move",
                userSelect: "none",
                p: 1,
                zIndex: item.id === draggingId ? 1300 : "auto",
              }}
            >
              {advancedMode && item.type === "page" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: item.color,
                    color: "#fff",
                    fontSize: 12,
                    px: 0.5,
                    py: 0.5,
                    borderTopLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    zIndex: 2,
                  }}
                >
                  Page {item.pageNumber}
                </Box>
              )}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.type === "file") {
                    removeFile(item.fileIndex);
                  } else {
                    removePage(item.fileIndex, item.pageOriginalIndex);
                  }
                }}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  zIndex: 2,
                }}
              >
                <CloseIcon fontSize="small" htmlColor="red" />
              </IconButton>

              <Box sx={{ width: "100%", height: "calc(100% - 25px)" }}>
                <PDFPreview
                  src={item.previewUrl}
                  advancedMode={advancedMode}
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  textAlign: "center",
                  height: "25px",
                  lineHeight: "25px",
                  ...( !advancedMode && {
                    border: "1px solid",
                    borderColor: item.color,
                    borderRadius: 1,
                    px: 0.5,
                  }),
                }}
              >
                {item.name}
              </Typography>
            </Box>
          </Draggable>
        ))}
      </Box>
      {selectedItem && (
        <PreviewModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          previewUrl={selectedItem.previewUrl}
          advancedMode={advancedMode}
          fileName={
            selectedItem.type === "file"
              ? selectedItem.file?.name
              : selectedItem.name
          }
        />
      )}
    </>
  );
};

export default Slider;
