import { IconButton, List, ListItem, ListItemText, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Close";

const FileList = ({ files, onRemove }) => (
  <List>
    {files.map((entry, idx) => (
      <ListItem key={idx}>
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <ListItemText primary={entry.file?.name || "Unnamed file"} />
          <IconButton onClick={() => onRemove(idx)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </ListItem>
    ))}
  </List>
);

export default FileList;
