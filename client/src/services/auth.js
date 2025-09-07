import api from "../lib/api";

export const registerApi = (data) => api.post("/register", data);
export const loginApi = (data) => api.post("/login", data);
export const logoutApi = () => api.post("/logout");
export const isAuthApi = () => api.post("/is-authenticated");

export const sendVerifyOtpApi = () => api.post("/send-verify-otp");
export const verifyEmailApi = (data) => api.post("/verify-account", data);

export const sendResetOtpApi = (data) => api.post("/send-reset-otp", data);
export const resetPasswordApi = (data) => api.post("/reset-password", data);
