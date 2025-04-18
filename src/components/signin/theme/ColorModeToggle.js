// src/ColorModeToggle.js
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import { ColorModeContext } from './ColorModeContext';
import { useTheme } from '@mui/material/styles';

export default function ColorModeToggle() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  return (
    <IconButton onClick={colorMode.toggleColorMode}>
      {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  );
}
