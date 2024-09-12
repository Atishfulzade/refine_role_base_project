import React, { useState } from 'react';
import { AuthPage } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { authProvider } from "../../authProvider";
import { notification } from "antd";
import { AxiosError } from "axios";  // Import AxiosError for better error handling

interface RegisterValues {
  username: string;
  password: string;
  email: string;
  // Add other fields if needed
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: RegisterValues) => {
    setLoading(true);
    try {
      await authProvider.register(values);
      
      notification.success({
        message: "Registration Successful",
        description: "You have been registered successfully!",
      });

      navigate("/dashboard");
    } catch (error) {
      // Type guard to ensure error is an AxiosError
      if (error instanceof AxiosError) {
        // Handle AxiosError
        notification.error({
          message: "Registration Failed",
          description: error.response?.data?.message || "An error occurred during registration.",
        });
      } else {
        // Handle other types of errors
        notification.error({
          message: "Registration Failed",
          description: (error as Error).message || "An error occurred during registration.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage
      type="register"
      formProps={{
        onFinish: handleFinish,
        // Other form props if needed
      }}
    />
  );
};
