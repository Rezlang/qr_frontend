import React from "react";
import { IconButton, Popover, Box, MenuItem } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import { auth } from "../../App";
import { signOut } from "firebase/auth";

export default function AccountPopover() {
    const [anchor, setAnchor] = React.useState(null);
    const navigate = useNavigate();

    const handleOpen = (event) => {
        setAnchor(event.currentTarget);
    }

    const handleClose = () => {
        setAnchor(null);
    }

    const handleProfile = () => {
        navigate("/home");
        handleClose();
    }

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
        <Box>
            <IconButton color="inherit" onClick={handleOpen}>
                <AccountCircleIcon />
            </IconButton>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", width: 150 }}>
              <MenuItem onClick={handleProfile}>Go to Profile</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Box>



            </Popover>
        </Box>
    )
}