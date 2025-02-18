import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, Button, TextField, Typography } from '@mui/material';

const DigitalSignature = () => {
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
      // Set canvas size based on the element’s offset dimensions
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const context = canvas.getContext('2d');
      // Fill with white background
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [mode]);

  return (
    <Paper
      elevation={3}
      sx={{
        width: 400,
        height: 300,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Signature Display Area */}
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
            onMouseLeave={endDrawing}
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

      {/* Mode Selection Buttons */}
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
};

export default DigitalSignature;
