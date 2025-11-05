import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log(`Error ${error.response?.status} for ${originalRequest?.url}`);

    // Check for TOKEN_EXPIRED
    if (
      error.response?.status === 401 &&
      ["TOKEN_EXPIRED", "NO_TOKEN"].includes(error.response?.data?.errorCode) &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/v1/auth/refresh"
    ) {
      console.log("Token expired, refreshing...");

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        // Clear everything and redirect ONCE
        localStorage.clear();
        sessionStorage.clear();

        if (!window.location.pathname.includes("/login")) {
          window.location.replace("/login"); // Use replace to prevent back button issues
        }

        return Promise.reject(refreshError);
      }
    }

    // Other 401 errors
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      console.log("401 error, redirecting to login");
      localStorage.clear();
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default api;
