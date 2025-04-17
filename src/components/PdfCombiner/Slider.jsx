import React, { useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import Draggable from "react-draggable";
import PreviewModal from "./PDFModal";
import PDFPreview from "./ModalPreview";

const Slider = ({
items,
itemWidth,
itemHeight,
containerWidth,
advancedMode,
draggingId,
onDrag,
onStop,
}) => {
const [modalOpen, setModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// ref to track if a drag actually happened
const draggingRef = useRef(false);

const handleItemClick = (item) => {
 if (draggingRef.current) {
   // it was just a drag, not a click
   return;
 }
 setSelectedItem(item);
 setModalOpen(true);
};

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
           // reset at the start of every drag sequence
           draggingRef.current = false;
         }}
         onDrag={(e, data) => {
           // mark that movement occurred
           draggingRef.current = true;
           onDrag(e, data, item.id);
         }}
         onStop={(e, data) => {
           onStop(e, data, item.id);
           // clear flag right after click events fire
           setTimeout(() => {
             draggingRef.current = false;
           }, 0);
         }}
       >
         <Box
           onClick={(e) => handleItemClick(item)}
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
