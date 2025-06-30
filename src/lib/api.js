import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  console.log(`📋 Processing queue with ${failedQueue.length} requests`);
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
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
    
    console.log(`🚨 API Error: ${error.response?.status} for ${originalRequest?.url}`);
    console.log(`🔍 Error response data:`, error.response?.data);
    
    // Check for 401 status and TOKEN_EXPIRED error code specifically
    if (
      error.response?.status === 401 && 
      error.response?.data?.errorCode === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      console.log("🔄 Token expired, attempting refresh...");
      
      if (isRefreshing) {
        console.log("⏳ Already refreshing, queueing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        try {
          console.log("🔄 Calling refresh endpoint...");
          
          // Fixed: Use POST method with JSON body, and correct endpoint
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/getRefreshToken`,
            { refreshToken: refreshToken },
            {
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
          
          console.log("✅ Refresh response received:", refreshResponse.status);
          console.log("📄 Refresh response data:", refreshResponse.data);
          
          const newAccessToken = refreshResponse.data.accessToken;
          
          if (newAccessToken) {
            // Update localStorage
            localStorage.setItem("accessToken", newAccessToken);
            console.log("✅ New access token saved!");
            
            // Update user data if available
            const userData = refreshResponse.data;
            if (userData.email) {
              const user = {
                id: userData.email,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                verified: userData.verified || userData.isVerified
              };
              localStorage.setItem("user", JSON.stringify(user));
              localStorage.setItem("userId", userData.email);
            }
            
            // Set new token in original request
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            
            // Process queued requests
            processQueue(null, newAccessToken);
            isRefreshing = false;
            
            console.log("🔄 Retrying original request...");
            return api(originalRequest);
          } else {
            throw new Error("No access token in refresh response");
          }
          
        } catch (refreshError) {
          console.error("❌ Refresh failed:", refreshError.response?.status, refreshError.message);
          console.error("❌ Refresh error data:", refreshError.response?.data);
          
          // Clear tokens and redirect to login
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
          
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Optionally redirect to login page
          if (typeof window !== 'undefined') {
            console.log("🔄 Redirecting to login...");
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        console.log("❌ No refresh token found");
        isRefreshing = false;
        
        // Clear any remaining tokens and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    }
    
    // For other types of 401 errors (invalid token, malformed, etc.)
    if (error.response?.status === 401) {
      console.log("Authentication failed, clearing tokens...");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;