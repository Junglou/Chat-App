import axios from "axios";

// Tạo axios instance
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8080/api"
      : "/api",
  withCredentials: true, // Giữ lại cookie nếu có
});
