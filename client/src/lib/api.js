import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/auth", // your backend URL
  withCredentials: true, // important for cookies
});

export default api;
