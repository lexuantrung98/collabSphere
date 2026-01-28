import { useNavigate, useLocation, Outlet } from "react-router-dom";

export default function LecturerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.includes(path);

  const getMenuStyle = (path: string) => ({
    padding: "12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 8,
    fontWeight: "bold",
    background: isActive(path) ? "#e7f3ff" : "transparent",
    color: isActive(path) ? "#1877f2" : "#666",
    transition: "all 0.2s"
  });

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      
      <div style={{ width: 280, backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", zIndex: 10 }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Lecturer Panel</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
            <div style={{ marginBottom: 30, padding: "16px", background: "#f0f8ff", borderRadius: 8 }}>
              <strong style={{ display: "block", marginBottom: 4, color: "#333", fontSize: 14 }}>giangvien@fe.edu.vn</strong>
              <span style={{ background: "#faad14", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11 }}>Lecturer</span>
            </div>
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu</div>
          
          <div style={getMenuStyle("dashboard")} onClick={() => navigate("/lecturer/dashboard")}>
            Quản Lý Dự Án
          </div>
          <div style={getMenuStyle("create")} onClick={() => navigate("/lecturer/create")}>
            Tạo Dự Án Mới
          </div>
          <div style={getMenuStyle("grade")} onClick={() => navigate("/lecturer/grade")}>
            Chấm Điểm
          </div>
           <div style={getMenuStyle("groups")} onClick={() => navigate("/lecturer/groups")}>
            Quản Lý Nhóm
          </div>
        </div>

        <div style={{ padding: 24, borderTop: "1px solid #f0f0f0" }}>
          <button onClick={handleLogout} style={{ width: "100%", padding: "12px", background: "#fff", color: "#ff4d4f", border: "1px solid #ff4d4f", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto", height: "100%" }}>
        <Outlet /> 
      </div>
    </div>
  );
}