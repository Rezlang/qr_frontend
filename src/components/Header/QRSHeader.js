import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AccountPopover from "./AccountPopover";
import ColorModeSelect from "../signin/theme/ColorModeSelect";
import AppTheme from "../signin/theme/AppTheme"

export default function QRSHeader(props) {
    const navigate = useNavigate();
    const location = useLocation();

    const pages = [
        { label: "URL Shortener", path: "/url-shortener" },
        { label: "QR Generator", path: "/qr-gen" },
        { label: "Document Signer", path: "/pdf" },
        { label: "File Converter", path: "/converter" },
        { label: "Combine PDFs", path: "/combine" },
    ];

    return (
        <AppTheme {...props}>
            <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
                <Toolbar sx={{ display: "flex" }}>
                    {/* Navigation Links */}
                    <Box sx={{ display: "flex" }}>
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
                                        backgroundColor: location.pathname === page.path
                                            ? "rgba(255, 255, 255, 0.3)"
                                            : "rgba(0, 0, 0, 0.2)",
                                    },
                                }}
                            >
                                <Typography variant="h7" sx={{ color: "white" }}>
                                    {page.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Right Section: ColorModeSelect and AccountPopover */}
                    <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 2 }}>
                        <ColorModeSelect /> {/* Add the ColorModeSelect component */}
                        <AccountPopover />
                    </Box>
                </Toolbar>
            </AppBar>
        </AppTheme>
    );
}