import axios from "axios";

// Use the correct backend URL in production
const baseUrl =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://carlos1.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});
