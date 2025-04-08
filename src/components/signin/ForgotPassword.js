import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { auth } from '../../App';
import { sendPasswordResetEmail } from 'firebase/auth';



function ForgotPassword({ open, handleClose }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    handleClose();
  }

  async function handlePasswordRecovery(email) {
    console.log("Sending recovery email!")
    try {
      await sendPasswordResetEmail(auth, email);
      setConfirmOpen(true);
    } catch (e) {
      console.log(e.message);
    }
  }




  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const email = data.get('email');
          await handlePasswordRecovery(email);
        },
        sx: { backgroundImage: 'none' },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText>
          Enter your account&apos;s email address, and we&apos;ll send you a link to
          reset your password.
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="email"
          name="email"
          label="Email address"
          placeholder="Email address"
          type="email"
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" type="submit">
          Continue
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={confirmOpen}
      onClose={handleConfirmClose}
    >
      <DialogTitle>Email Sent!</DialogTitle>
      <DialogContent>
        <DialogContentText>
            If an account with that email exists, a password reset link has been sent.
            Please check your inbox.
          </DialogContentText>
      </DialogContent>
      <DialogActions>
          <Button variant="contained" onClick={handleConfirmClose}>
            OK
          </Button>
        </DialogActions>
    </Dialog>
  </>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;