import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AccountPopover from "./AccountPopover";

export default function QRSHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const pages = [
        { label: "URL Shortener", path: "/shorten" },
        { label: "Analytics", path: "/about" },
        { label: "Document Signer", path: "/contact" },
    ];
    return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2", paddingX: 2 }}>
        <Toolbar sx={{ display: "flex",   padding:0 }}>
            {/* Maybe insert a logo here :) */}
            <Box sx={{ display: "flex"}}>
                {pages.map((page) => (
                    <Box
                        key={page.path}
                        onClick={() => navigate(page.path)}
                        sx={{
                            flexGrow: 1,
                            height: "100%",
                            display: "flex",
                            minHeight: "64px",
                            paddingX: 2,
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: location.pathname === page.path ? "default" : "pointer",
                            backgroundColor: location.pathname === page.path ? "rgba(255, 255, 255, 0.2)" : "transparent",
                            transition: "background-color 0.3s",
                            "&:hover": {
                            backgroundColor: location.pathname === page.path ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)",
                            }
                        }}
                    >
                        <Typography variant="h7" sx={{ color: "white" }}>
                            {page.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Box sx={{ marginLeft: "auto"}}>
                <AccountPopover />
            </Box>
        </Toolbar>
    </AppBar>);
}