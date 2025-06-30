import React from "react";
import { Typography, Button, Stack, Box } from "@mui/material";
import { useHistory } from "react-router-dom"; 
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    history.push("/");
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title" onClick={() => history.push("/")}>
        <img src="logo_dark.svg" alt="QKart-icon" /> 
      </Box>

      <Box>{children}</Box>

      {hasHiddenAuthButtons ? (
        <Button
          color="inherit"
          onClick={() => history.push("/")}
          data-testid="back-to-explore"
        >
          Back to explore
        </Button>
      ) : isLoggedIn ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <img src="avatar.png" alt={username} className="avatar" />
          <Typography>{username}</Typography>
          <Button color="inherit" onClick={handleLogout}>
            LOGOUT
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button color="inherit" onClick={() => history.push("/login")}>
            LOGIN
          </Button>
          <Button color="inherit" onClick={() => history.push("/register")}>
            REGISTER
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Header;

