import axios from "axios";
import tokenService from "../services/tokenService";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_MEDICAL;
const API_BASE_URL = "http://localhost:3000/api/medical";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getFilteredMedicalRecords = (filters) =>
  api.get("/filter", {
    params: filters,
  });
