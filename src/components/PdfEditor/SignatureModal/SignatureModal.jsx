import React, { useRef } from 'react';
import { Modal, Paper, Typography, Box, Button } from '@mui/material';
import DigitalSignature from './DigitalSignature';

const SignatureModal = ({ open, onClose, onSubmit }) => {
  const digitalSignatureRef = useRef(null);

  const handleSubmit = () => {
    if (digitalSignatureRef.current) {
      const signatureDataUrl = digitalSignatureRef.current.getSignatureData();
      onSubmit(signatureDataUrl);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="signature-modal-title"
      aria-describedby="signature-modal-description"
    >
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          outline: 'none',
        }}
      >
        <Typography id="signature-modal-title" variant="h6" component="h2">
          Create Signature
        </Typography>
        <DigitalSignature ref={digitalSignatureRef} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit Signature
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default SignatureModal;
