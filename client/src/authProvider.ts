import axios from "axios";

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

interface AuthProvider {
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkError: (error: ErrorResponse) => Promise<void>;
  checkAuth: () => Promise<void>;
  getPermissions: () => Promise<string>;
  getUserIdentity: () => Promise<{ username: string; role: string }>;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });

      const { token, role } = response.data;

      // Save token and role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error.response?.data?.message || "Login failed");
    }
  },

  register: async ({ email, password }) => {
    try {
      const response = await axios.post<RegisterResponse>(`${API_URL}/register`, { email, password });

      const { token, role } = response.data;

      // Optionally, store token and role after registration
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error.response?.data?.message || "Registration failed");
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

      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error.response?.data?.message || "Logout failed");
    }
  },

  checkError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      // Unauthorized or forbidden, clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await axios.get(`${API_URL}/check-auth`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return Promise.resolve();
      } catch (error) {
        // If token is invalid, clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        return Promise.reject();
      }
    } else {
      return Promise.reject("No token found");
    }
  },

  getPermissions: async () => {
    const role = localStorage.getItem("role");
    return role ? Promise.resolve(role) : Promise.reject("No role found");
  },

  getUserIdentity: async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const response = await axios.get<UserIdentityResponse>(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { username, role } = response.data;

        return Promise.resolve({ username, role });
      } catch (error) {
        return Promise.reject("Failed to fetch user identity");
      }
    } else {
      return Promise.reject("No token found");
    }
  },
};
