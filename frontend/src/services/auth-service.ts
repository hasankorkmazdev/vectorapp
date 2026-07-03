import { api } from "@/api/axios";

export const authService = {
  login: (email: string, password: string, captchaToken?: string) =>
    api.post("/auth/login", { email, password, captchaToken }),

  register: (data: any) =>
    api.post("/auth/register", data),

  googleLogin: (idToken: string, role: string) =>
    api.post("/auth/google-login", { idToken, role }),

  resendVerification: (email: string) =>
    api.post("/auth/resend-verification", { email }),

  verifyEmail: (email: string, token: string) =>
    api.get(`/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`),

  forgotPassword: (email: string, captchaToken: string) =>
    api.post("/auth/forgot-password", { email, captchaToken }),

  resetPassword: (data: any) =>
    api.post("/auth/reset-password", data),
};
