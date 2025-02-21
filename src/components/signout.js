import { Button } from "@mui/material";
import { auth } from "../App";
import { styled } from "@mui/material";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const RightAlignedBox = styled('div')({
    display: 'flex',
    justifyContent: 'flex-end',
  });

const SignOutButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.shape.borderRadius,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: theme.palette.primary.contrastText,
    color: theme.palette.primary.main,
    transition: 'background-color 0.3s ease-in-out, transform 0.2s',
  
    '&:hover': {
      backgroundColor: theme.palette.primary.contrastText,
      transform: 'scale(1.05)',
    },
  
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.grey[900],
  
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
    }),
  }));

export default function SignOut() {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Sign out successful, redirect to signin page
            navigate('/signin');
        } catch (e) {
            console.error(e.message);
        }
    };

    return (
        <RightAlignedBox>
            <SignOutButton>
                <Button variant="outlined"
                    onClick={handleSignOut}>
                    Sign out
                </Button>
            </SignOutButton>
        </RightAlignedBox>
    );
};