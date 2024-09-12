import React from 'react';
import { AuthPage } from "@refinedev/antd";
import { useNavigate } from "react-router-dom"; // Using useNavigate from react-router-dom for navigation
import { useNotification } from "@refinedev/core"; // Import useNotification
import { authProvider } from "../../authProvider";

export const Login: React.FC = () => {
  const navigate = useNavigate(); // Using useNavigate hook for navigation
  const { open } = useNotification(); // Using useNotification for toast notifications

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await authProvider.login(values);

      // Show success toast notification
      open?.({
        type: "success",
        message: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect the user after successful login
      navigate("/dashboard"); // Use navigate from react-router-dom
    } catch (error) {
      console.error("Login failed:", error);

      // Show error toast notification
      open?.({
        type: "error",
        message: "Login Failed",
        description: "Please check your credentials and try again.",
      });
    }
  };

  return (
    <AuthPage
      type="login"
      formProps={{
        onFinish: handleLogin,
      }}
    />
  );
};
