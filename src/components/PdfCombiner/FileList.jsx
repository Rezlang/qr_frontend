// FileList.jsx
import React from "react";
import {
  IconButton,
  List,
  ListItem,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Close";

const FileList = ({ files, onRemove }) => (
  <List sx={{ mb: 2 }}>
    {files.map((entry, idx) => (
      <ListItem
        key={idx}
        sx={{
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* filename box only as wide as its text */}
        <Box
          sx={{
            backgroundColor: entry.color,
            color: "white",
            borderRadius: 1,
            p: "2px 6px",
            mr: 1,          // gap before the X
            flex: "none",   // prevent flex-grow
          }}
        >
          {entry.file.name || "Unnamed file"}
        </Box>

        <IconButton onClick={() => onRemove(idx)} size="small">
          <DeleteIcon fontSize="small" htmlColor="red" />
        </IconButton>
      </ListItem>
    ))}
  </List>
);

export default FileList;
