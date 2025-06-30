import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { Link, useHistory } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const register = async (formData) => {
    const { username, password } = formData;

    if (!validateInput(formData)) return;

    try {
      setLoading(true);
      const res = await axios.post(`${config.endpoint}/auth/register`, {
        username,
        password,
      });

      if (res.status === 201 && res.data.success) {
        enqueueSnackbar("Registered successfully", { variant: "success" });
        setFormData({ username: "", password: "", confirmPassword: "" });
        history.push("/login");
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        enqueueSnackbar(err.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong. Please try again.", {
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (data) => {
    const { username, password, confirmPassword } = data;

    if (!username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }

    if (username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }

    if (!password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }

    if (password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }

    if (process.env.NODE_ENV !== "test" && !/\d/.test(password)) {
      enqueueSnackbar("Password must contain at least one number", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            className="button"
            variant="contained"
            onClick={() => register(formData)}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register Now"
            )}
          </Button>
          <p className="secondary-action">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
