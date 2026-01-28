/**
 * RequireAuth Component - Debug version
 * Giản lược tối đa để debug
 */
import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { getToken, saveAuth } from "./authStorage";

export default function RequireAuth() {
  const [searchParams] = useSearchParams();
  
  const urlToken = searchParams.get("token");
  const urlRole = searchParams.get("role");
  
  // Bước 1: Nếu có token trong URL, lưu ngay
  if (urlToken && urlRole) {
    saveAuth({ accessToken: urlToken, role: urlRole });
    // Clean URL ngay lập tức (synchronous)
    window.history.replaceState({}, '', window.location.pathname);
  }
  
  // Bước 2: Kiểm tra token trong localStorage
  const token = getToken();
  
  // Bước 3: Nếu không có token, redirect
  useEffect(() => {
    if (!token && !urlToken) {
      const loginUrl = import.meta.env.VITE_ACCOUNT_SERVICE_URL || "http://localhost:5173";
      window.location.href = `${loginUrl}/login`;
    }
  }, [token, urlToken]);
  
  // Nếu có token hoặc đang xử lý URL params
  if (token) {
    return <Outlet />;
  }
  
  // Loading
  return (
    <div style={{ 
      padding: 50, 
      textAlign: "center",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7fa"
    }}>
      <div>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: "4px solid #e0e0e0",
          borderTopColor: "#18b8f2",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p style={{ color: "#666" }}>Đang xác thực...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}