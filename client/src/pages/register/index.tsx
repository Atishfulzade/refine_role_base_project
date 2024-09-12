import React from 'react';
import { AuthPage } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { authProvider } from "../../authProvider";
import { notification } from "antd";
import { FormInstance } from 'antd/es/form';

interface RegisterValues {
  username: string;
  password: string;
  email: string;
  // Add other fields if needed
}

export const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthPage
      type="register"
      formProps={{
        onFinish: async (values: RegisterValues) => {
          try {
            await authProvider.register(values);
            
            notification.success({
              message: "Registration Successful",
              description: "You have been registered successfully!",
            });

            navigate("/dashboard");
          } catch (error) {
            console.error("Registration failed:", error);

            notification.error({
              message: "Registration Failed",
              description: (error as Error).message || "An error occurred during registration.",
            });
          }
        },
      }}
    />
  );
};
