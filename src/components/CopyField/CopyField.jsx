import React, { useState } from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const CopyField = ({ value, label = '', fullWidth = true, size = 'small', ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <Box>
      <TextField
        label={label}
        value={value}
        fullWidth={fullWidth}
        size={size}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton onClick={handleCopy} edge="end">
                  {copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        {...props}
      />
    </Box>
  );
};

export default CopyField;
