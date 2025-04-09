import React from 'react';
import {
  Button,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';

const Toolbar = ({
  onUploadBasePdf,
  onAddTextBox,
  onAddImageTool,
  onAddSignatureTool,
  onAddCheckboxTool,
  onGeneratePdf,
  onAddPencilTool
}) => {
  return (
    <Card sx={{ ml: 2, width: 200, mt: 6.5, mb: 6.5 }}>
      <List component="nav"
      sx={{pl: 2, pr: 2}}>
        <ListItem disablePadding>
          <Button
            variant="outlined"
            component="label"
            sx={{ mb: 2, width: '100%' }}
          >
            Upload Base PDF
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={onUploadBasePdf}
            />
          </Button>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddTextBox} sx={{ justifyContent: 'center' }}>
            <ListItemText
              primary="Add Text Box"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddImageTool} sx={{ justifyContent: 'center' }}>
            <ListItemText
              primary="Add PNG/JPG Image"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddSignatureTool} sx={{ justifyContent: 'center' }}>
            <ListItemText
              primary="Signature"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddCheckboxTool} sx={{ justifyContent: 'center' }}>
            <ListItemText
              primary="Check Box"
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddPencilTool} sx={{ justifyContent: 'center' }}>
            <ListItemText
              primary="Pencil"
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <Button variant="contained"
            onClick={onGeneratePdf} sx={{ justifyContent: 'center', width: '100%'}}>
            <ListItemText
              primary="Generate PDF"
            />
          </Button>
        </ListItem>
      </List>
    </Card>
  );
};

export default Toolbar;
