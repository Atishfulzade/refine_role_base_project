import axios from "axios";
import { AuthActionResponse, CheckResponse, OnErrorResponse, PermissionResponse, IdentityResponse } from "@refinedev/core";

const API_URL = "https://refine-role-base-project.onrender.com/api";

// Define TypeScript interfaces for request and response data
interface LoginResponse {
  token: string;
  role: string;
}

interface RegisterResponse extends LoginResponse {}

interface UserIdentityResponse {
  username: string;
  role: string;
}

interface ErrorResponse {
  status: number;
  message: string;
}

export const authProvider: any = {
  login: async ({ email, password }) => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });

      const { token, role } = response.data;

      // Save token and role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Login failed" };
    }
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_URL}/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear stored user data
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || "Logout failed" };
    }
  },

  check: async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await axios.get(`${API_URL}/check-auth`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return { valid: true };  // Adjust according to CheckResponse
      } catch (error) {
        // If token is invalid, clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        return { valid: false, error: "Invalid token" };  // Adjust according to CheckResponse
      }
    } else {
      return { valid: false, error: "No token found" };  // Adjust according to CheckResponse
    }
  },

  onError: async (error) => {
    console.error("An authentication error occurred:", error);
    return { error: "An error occurred" };  // Adjust according to OnErrorResponse
  },

  getPermissions: async () => {
    const role = localStorage.getItem("role");
    return role ? { permissions: role } : { permissions: [], error: "No role found" };  // Adjust according to PermissionResponse
  },

  getIdentity: async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const response = await axios.get<UserIdentityResponse>(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { username, role } = response.data;

        return { identity: { username, role } };  // Adjust according to IdentityResponse
      } catch (error) {
        return { identity: null, error: "Failed to fetch user identity" };  // Adjust according to IdentityResponse
      }
    } else {
      return { identity: null, error: "No token found" };  // Adjust according to IdentityResponse
    }
  },

  forgotPassword: async (params) => {
    // Implement forgotPassword if needed
    return { success: true };  // Adjust according to AuthActionResponse
  },

  updatePassword: async (params) => {
    // Implement updatePassword if needed
    return { success: true };  // Adjust according to AuthActionResponse
  },
};
