import { Link, useHistory } from "react-router-dom";
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useHistory(); // ✅ React Router v5

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate.push("/");
    }
  }, [navigate]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleReset = () => {
    setFormData({ username: "", password: "" });
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is required", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is required", { variant: "warning" });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", { variant: "warning" });
      return false;
    }
    return true;
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  const login = async (data) => {
    if (!validateInput(data)) return;

    setLoading(true);
    try {
      const response = await axios.post(`${config.endpoint}/auth/login`, {
        username: data.username,
        password: data.password,
      });

      if (response.status === 201 && response.data.success) {
        persistLogin(response.data.token, response.data.username, response.data.balance);
        enqueueSnackbar("Logged in successfully", { variant: "success" });
        navigate.push("/"); // ✅ React Router v5
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong. Check backend and try again.", {
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    login(formData);
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between" minHeight="100vh">
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="form-title">Login</h2>

          <TextField
            label="Username"
            variant="outlined"
            name="username"
            value={formData.username}
            onChange={handleInput}
            fullWidth
          />

          <TextField
            label="Password"
            variant="outlined"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInput}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              className="button"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN TO QKART"}
            </Button>
            <Button variant="outlined" onClick={handleReset} fullWidth>
              RESET
            </Button>
          </Stack>

          <div className="secondary-action">
            Don’t have an account?{" "}
            <Link to="/register" className="link">
              Register now
            </Link>
          </div>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
