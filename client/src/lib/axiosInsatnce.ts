import axios from "axios";

// Determine the backend URL based on the environment
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "api";

// Create and export an Axios instance with credentials enabled
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
