import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://localhost:5127", // ⚠️ đổi đúng port AccountService của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// 👉 Interceptor để gắn JWT (chưa dùng ngay, nhưng cần sẵn)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
