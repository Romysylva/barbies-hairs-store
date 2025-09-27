import axios from "axios";

// const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/user-settings`;

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export default apiClient;
