import axiosClient from "./axiosClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAccountRequest {
  email: string;
  password: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await axiosClient.post("/api/auth/login", data);
  return res.data;
};

// Hàm này sẽ được StudentDashboard gọi
export const getProfile = async (): Promise<UserProfile> => {
  const res = await axiosClient.get("/api/auth/me");
  return res.data;
};

export const createAccount = async (data: CreateAccountRequest): Promise<any> => {
  const res = await axiosClient.post("/api/auth/create-account", data);
  return res.data;
};

export const getAccounts = async (role: string = ""): Promise<UserProfile[]> => {
  const res = await axiosClient.get(`/api/auth/accounts?role=${role}`);
  return res.data;
};

export const deactivateAccount = async (id: string): Promise<any> => {
  const res = await axiosClient.put(`/api/auth/deactivate/${id}`);
  return res.data;
};

export const reactivateAccount = async (id: string): Promise<any> => {
  const res = await axiosClient.put(`/api/auth/reactivate/${id}`);
  return res.data;
};

export const importAccounts = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await axiosClient.post("/api/auth/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<any> => {
  const res = await axiosClient.post("/api/auth/forgot-password", data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<any> => {
  const res = await axiosClient.post("/api/auth/reset-password", data);
  return res.data;
};