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
      // context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [mode]);

  // Expose getSignatureData function to parent via ref
  useImperativeHandle(ref, () => ({
    getSignatureData: () => {
      if (mode === 'draw') {
        const canvas = canvasRef.current;
        return canvas.toDataURL('image/png');
      } else if (mode === 'type') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 400;
        tempCanvas.height = 300;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.font = "48px 'Pacifico', cursive";
        ctx.fillStyle = '#000';
        const text = typedName || 'Your Signature';
        const textMetrics = ctx.measureText(text);
        const x = (tempCanvas.width - textMetrics.width) / 2;
        const y = (tempCanvas.height + 48) / 2;
        ctx.fillText(text, x, y);
        return tempCanvas.toDataURL('image/png');
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
