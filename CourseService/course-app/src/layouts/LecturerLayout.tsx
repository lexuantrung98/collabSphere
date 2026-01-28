import { Outlet, Link, useLocation } from "react-router-dom";
import { getRole, clearAuth } from "../components/authStorage";

export default function LecturerLayout() {
  const location = useLocation();
  const role = getRole();

  const handleLogout = () => {
    clearAuth();
    const loginUrl = import.meta.env.VITE_ACCOUNT_SERVICE_URL || "http://localhost:5173";
    window.location.href = `${loginUrl}/login`;
  };

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ 
        width: 280, 
        backgroundColor: "#ffffff", 
        borderRight: "1px solid #e0e0e0", 
        display: "flex", 
        flexDirection: "column",
        position: "fixed",
        height: "100%",
        zIndex: 10
      }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#18b8f2" }}>CourseService</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Lecturer Panel</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ 
            background: "#f0f8ff", 
            padding: "16px", 
            borderRadius: 8, 
            marginBottom: 30 
          }}>
            <p style={{ margin: "0 0 5px 0", fontSize: 12, color: "#666" }}>Đang đăng nhập:</p>
            <span style={{ 
              background: "#18b8f2", 
              color: "white", 
              padding: "2px 8px", 
              borderRadius: 10, 
              fontSize: 11 
            }}>{role}</span>
          </div>
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu</div>
          
          <Link to="/lecturer/classes" style={{ textDecoration: "none" }}>
            <div style={{ 
              padding: "12px 16px", 
              background: isActive('classes') ? "#e7f3ff" : "transparent",
              color: isActive('classes') ? "#18b8f2" : "#666",
              borderRadius: 8, 
              fontWeight: isActive('classes') ? "bold" : "normal",
              cursor: "pointer",
              marginBottom: 8
            }}>
              🏫 Lớp của tôi
            </div>
          </Link>

          <Link to="/lecturer/resources" style={{ textDecoration: "none" }}>
            <div style={{ 
              padding: "12px 16px",
              background: isActive('resources') ? "#e7f3ff" : "transparent",
              color: isActive('resources') ? "#18b8f2" : "#666",
              borderRadius: 8,
              fontWeight: isActive('resources') ? "bold" : "normal",
              cursor: "pointer",
              marginBottom: 8
            }}>
              📁 Quản lý Tài nguyên
            </div>
          </Link>
        </div>

        <div style={{ padding: 24, borderTop: "1px solid #f0f0f0" }}>
          <button
            onClick={handleLogout}
            style={{ 
              width: "100%", 
              padding: "12px", 
              background: "#fff", 
              color: "#ff4d4f", 
              border: "1px solid #ff4d4f", 
              borderRadius: 6, 
              cursor: "pointer", 
              fontWeight: "bold"
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 280, padding: "30px 40px" }}>
        <Outlet />
      </div>
    </div>
  );
}
