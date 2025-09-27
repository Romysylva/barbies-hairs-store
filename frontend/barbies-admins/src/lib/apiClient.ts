// import axios, { AxiosError } from "axios";
// import { User } from "./types/users";

// export interface ApiResponse<T> {
//   status: "success" | "fail" | "error";
//   data?: T;
//   message?: string;
//   token: string;
//   user: User;
// }

// const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,

//   // withCredentials: true, // include cookies!
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// apiClient.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("token");
//       // console.log("Attaching token to request:", token);
//       if (token && config.headers) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized! Redirecting to login...");
//       if (typeof window !== "undefined") {
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error.response?.data || error.message);
//   }
// );

// export default apiClient;

import axios, { AxiosError } from "axios";

export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
  data?: T;
  message?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Redirecting to login...");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
