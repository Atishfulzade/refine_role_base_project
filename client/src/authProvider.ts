import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const authProvider = {
  login: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      const { token, role } = response.data;

      // Save token and role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      return Promise.resolve();
    } catch (error:any) {
      return Promise.reject(error.response?.data?.message || "Login failed");
    }
  },

  register: async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, { email, password });

      const { token, role } = response.data;

      // Optionally, store token and role after registration
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email);

      return Promise.resolve();
    } catch (error:any) {
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
    } catch (error:any) {
      return Promise.reject(error.response?.data?.message || "Logout failed");
    }
  },

  checkError: async (error: { status: number }) => {
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
        const response = await axios.get(`${API_URL}/me`, {
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
