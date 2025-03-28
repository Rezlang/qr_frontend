import React from "react";
import { IconButton, List, ListItem, ListItemText, Box } from "@mui/material";
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
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ListItemText primary={entry.file?.name || "Unnamed file"} />
          <IconButton onClick={() => onRemove(idx)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>
    ))}
  </List>
);

export default FileList;
