import React from 'react';
import {
  Button,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Box,
  Input,
  Typography,
} from '@mui/material';

const Toolbar = ({
  onUploadBasePdf,
  onAddTextBox,
  onAddImageTool,
  onAddSignatureTool,
  onAddCheckboxTool,
  onGeneratePdf,
  onAddPencilTool,
  onAddPenTool,
  onAddHighlighterTool,
  // Optional props for active spline modifiers:
  activeSpline,
  updateActiveSpline,
}) => {
  return (
    <Card sx={{ ml: 2, width: 200, mt: 6.5, mb: 6.5, p: 1 }}>
      <List component="nav" sx={{ pl: 2, pr: 2 }}>
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
            <ListItemText primary="Add Text Box" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddImageTool} sx={{ justifyContent: 'center' }}>
            <ListItemText primary="Add PNG/JPG Image" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddSignatureTool} sx={{ justifyContent: 'center' }}>
            <ListItemText primary="Signature" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddCheckboxTool} sx={{ justifyContent: 'center' }}>
            <ListItemText primary="Check Box" />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={onAddPencilTool} sx={{ justifyContent: 'center' }}>
            <ListItemText primary="Pencil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddPenTool} sx={{ justifyContent: 'center' }}>
            <ListItemText primary="Pen" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={onAddHighlighterTool} sx={{ justifyContent: 'center' }}>
            <ListItemText primary="Highlighter" />
          </ListItemButton>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <Button
            variant="contained"
            onClick={onGeneratePdf}
            sx={{ justifyContent: 'center', width: '100%' }}
          >
            <ListItemText primary="Generate PDF" />
          </Button>
        </ListItem>
      </List>

      {activeSpline && (
        <Box sx={{ mt: 2, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Spline Modifiers
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption">Color:</Typography>
            <Input
              type="color"
              value={activeSpline.strokeColor}
              onChange={(e) =>
                updateActiveSpline({ ...activeSpline, strokeColor: e.target.value })
              }
              sx={{ ml: 1, width: 40, height: 40 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption">Width:</Typography>
            <Input
              type="range"
              min="1"
              max="10"
              value={activeSpline.strokeWidth}
              onChange={(e) =>
                updateActiveSpline({ ...activeSpline, strokeWidth: Number(e.target.value) })
              }
              sx={{ ml: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption">Opacity:</Typography>
            <Input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={activeSpline.opacity}
              onChange={(e) =>
                updateActiveSpline({ ...activeSpline, opacity: parseFloat(e.target.value) })
              }
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Toolbar;
