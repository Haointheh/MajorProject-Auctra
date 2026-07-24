// // src/api/client.js
// import axios from "axios";

// const client = axios.create({
//   baseURL: "http://localhost:8000",
// });

// // Attach token to every request automatically
// client.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default client;

// src/api/client.js
import axios from "axios";

export const BASE_URL = "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;