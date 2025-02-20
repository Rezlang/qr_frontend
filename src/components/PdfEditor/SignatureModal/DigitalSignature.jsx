// DigitalSignature.jsx
import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Box, Paper, Button, TextField, Typography } from '@mui/material';

const DigitalSignature = forwardRef((props, ref) => {
  const [mode, setMode] = useState('draw'); // 'draw' or 'type'
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [typedName, setTypedName] = useState('');

  // --- Canvas Drawing Handlers ---
  const startDrawing = (e) => {
    if (mode !== 'draw') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastPos({ x, y });
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(lastPos.x, lastPos.y);
    context.lineTo(x, y);
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    setLastPos({ x, y });
  };

  const endDrawing = () => {
    if (mode !== 'draw') return;
    setIsDrawing(false);
  };

  // --- Reset/Initialize the Canvas when mode switches to draw ---
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const context = canvas.getContext('2d');
      context.fillStyle = 'rgba(255, 255, 255, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [mode]);

  // Expose getSignatureData function to parent via ref
  useImperativeHandle(ref, () => ({
    getSignatureData: () => {
      if (mode === 'draw') {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const { width, height } = canvas;
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        let minX = width, minY = height, maxX = 0, maxY = 0;
        let found = false;
        
        // Loop through all pixels to find the bounding box
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const alpha = data[index + 3];
            if (alpha > 0) {
              found = true;
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        // If nothing was drawn, return the full canvas
        if (!found) {
          return canvas.toDataURL('image/png');
        }
        
        const cropWidth = maxX - minX + 1;
        const cropHeight = maxY - minY + 1;
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        const croppedContext = croppedCanvas.getContext('2d');
        croppedContext.putImageData(
          context.getImageData(minX, minY, cropWidth, cropHeight),
          0,
          0
        );
        return croppedCanvas.toDataURL('image/png');
      } else if (mode === 'type') {
        const text = typedName || 'Your Signature';
        const fontSize = 48;
        const margin = 10;
        
        // Create a temporary canvas to measure the text
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = `${fontSize}px 'Pacifico', cursive`;
        const textMetrics = tempCtx.measureText(text);
        const textWidth = Math.ceil(textMetrics.width);
        const textHeight = fontSize; // Approximate text height
        
        // Create a canvas just large enough for the text with some margin
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = textWidth + margin * 2;
        finalCanvas.height = textHeight + margin * 2;
        const ctx = finalCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.font = `${fontSize}px 'Pacifico', cursive`;
        ctx.fillStyle = '#000';
        ctx.textBaseline = 'top';
        ctx.fillText(text, margin, margin);
        return finalCanvas.toDataURL('image/png');
      }
    },
  }));

  return (
    <Paper
      elevation={2}
      sx={{
        width: 400,
        height: 300,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box
        sx={{
          flex: 1,
          border: '1px solid #ccc',
          borderRadius: 1,
          position: 'relative',
          p: 0,
          overflow: 'hidden',
        }}
      >
        {mode === 'draw' ? (
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Pacifico', cursive",
                textAlign: 'center',
                mt: 2,
                userSelect: 'none',
              }}
            >
              {typedName || 'Your Signature'}
            </Typography>
            <TextField
              fullWidth
              placeholder="Type your name..."
              variant="outlined"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant={mode === 'draw' ? 'contained' : 'outlined'}
          onClick={() => setMode('draw')}
        >
          Draw
        </Button>
        <Button
          variant={mode === 'type' ? 'contained' : 'outlined'}
          onClick={() => setMode('type')}
        >
          Type
        </Button>
      </Box>
    </Paper>
  );
});

export default DigitalSignature;
