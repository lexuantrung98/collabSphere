import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingProjects, getApprovedProjects, approveProject, rejectProject, assignProjectToClass } from "../../api/projectApi";
import type { ProjectData } from "../../api/projectApi";
import { getProfile } from "../../api/authApi";
import type { UserProfile } from "../../api/authApi";

const logoImage = "/logo2.jpg"; 

const mockClasses = [
  { id: "SE104.O11", name: "Nhập môn KTPM - Lớp O11" },
  { id: "SE104.O12", name: "Nhập môn KTPM - Lớp O12" },
  { id: "SE347.O21", name: "Công nghệ Web - Lớp O21" },
  { id: "SE501.M11", name: "Đồ án chuyên ngành - M11" }
];

export default function DeptHeadDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        loadProjects("pending");
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const loadProjects = async (tab: "pending" | "approved") => {
    try {
      setLoading(true);
      setActiveTab(tab);
      let data;
      if (tab === "pending") {
        data = await getPendingProjects();
      } else {
        data = await getApprovedProjects();
      }
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Xác nhận DUYỆT dự án này?")) return;
    try {
      await approveProject(id);
      setMsg("Đã duyệt dự án thành công!");
      loadProjects("pending"); 
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert("Lỗi khi duyệt dự án.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Xác nhận TỪ CHỐI dự án này?")) return;
    try {
      await rejectProject(id);
      setMsg("Đã từ chối dự án.");
      loadProjects("pending");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      alert("Lỗi khi từ chối dự án.");
    }
  };

  const openAssignModal = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedClassId("");
    setShowModal(true);
  };

  const handleAssign = async () => {
    if (!selectedClassId) {
      alert("Vui lòng chọn lớp học!");
      return;
    }
    try {
      await assignProjectToClass(selectedProjectId, selectedClassId);
      setMsg(`Đã phân công cho lớp ${selectedClassId} thành công!`);
      setShowModal(false);
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Lỗi phân công. Hãy đảm bảo lớp học tồn tại.");
    }
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      
      <div style={{ 
        width: 280, 
        backgroundColor: "#ffffffff", 
        borderRight: "1px solid #e0e0e0", 
        display: "flex", 
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
        zIndex: 10
      }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 60, height: 40, marginRight: 12 }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Department Head</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          {user && (
            <div style={{ marginBottom: 30, padding: "16px", background: "#f0f8ff", borderRadius: 8 }}>
              <p style={{ margin: "0 0 5px 0", fontSize: 12, color: "#666" }}>Đang đăng nhập:</p>
              <strong style={{ display: "block", marginBottom: 4, color: "#333", fontSize: 14 }}>{user.email}</strong>
              <span style={{ 
                background: "#1877f2", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11 
              }}>Dept Head</span>
            </div>
          )}
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu Quản lý</div>
          
          <div 
            onClick={() => loadProjects("pending")}
            style={{ 
              padding: "12px 16px", 
              background: activeTab === "pending" ? "#e7f3ff" : "transparent",
              color: activeTab === "pending" ? "#1877f2" : "#666",
              borderRadius: 8, 
              fontWeight: "bold", 
              cursor: "pointer",
              marginBottom: 8,
              transition: "all 0.2s"
            }}>
            Duyệt Đề Tài (Pending)
          </div>

          <div 
            onClick={() => loadProjects("approved")}
            style={{ 
              padding: "12px 16px", 
              background: activeTab === "approved" ? "#e7f3ff" : "transparent",
              color: activeTab === "approved" ? "#1877f2" : "#666",
              borderRadius: 8, 
              fontWeight: "bold", 
              cursor: "pointer",
              transition: "all 0.2s"
            }}>
            Phân Công (Approved)
          </div>
        </div>

        <div style={{ padding: 24, borderTop: "1px solid #f0f0f0" }}>
          <button
            onClick={handleLogout}
            style={{ 
              width: "100%", padding: "12px", background: "#fff", color: "#ff4d4f", 
              border: "1px solid #ff4d4f", borderRadius: 6, cursor: "pointer", fontWeight: "bold"
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ flex: 1, height: "100%", overflowY: "auto", padding: "30px 40px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 5, marginTop: 0, color: "#333" }}>
            {activeTab === "pending" ? "Phê Duyệt Đề Tài" : "Phân Công Đề Tài"}
        </h1>
        <p style={{ color: "#666", marginBottom: 30 }}>
            {activeTab === "pending" 
                ? "Xem xét và phê duyệt các đề tài do giảng viên đề xuất." 
                : "Phân công các đề tài đã duyệt về cho các lớp học."}
        </p>

        {msg && <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 20 }}>{msg}</div>}

        <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minHeight: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
               <h3 style={{ margin: 0, color: "#333" }}>Danh Sách Dự Án</h3>
               <span style={{ background: "#eee", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>
                 Total: {projects.length}
               </span>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#888" }}>Đang tải dữ liệu...</div>
            ) : projects.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#888", fontStyle: "italic" }}>
                    Không có dự án nào trong mục này.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {projects.map((p) => (
                        <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 20, background: "#fafafa" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                                <div>
                                    <h3 style={{ margin: "0 0 5px 0", color: "#1877f2", fontSize: 18 }}>{p.title}</h3>
                                    <div style={{ fontSize: 13, color: "#666" }}>
                                        <strong>Môn học:</strong> {p.subjectId} &bull; 
                                        <span style={{ marginLeft: 5, padding: "2px 8px", borderRadius: 4, background: activeTab === "pending" ? "#fff7e6" : "#f6ffed", color: activeTab === "pending" ? "#fa8c16" : "#52c41a", fontSize: 12, fontWeight: "bold", border: activeTab === "pending" ? "1px solid #ffd591" : "1px solid #b7eb8f" }}>
                                            {activeTab === "pending" ? "Pending" : "Approved"}
                                        </span>
                                    </div>
                                </div>
                                {activeTab === "approved" && (
                                    <button 
                                        onClick={() => openAssignModal(p.id)}
                                        style={{ padding: "8px 16px", background: "#1877f2", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", fontSize: 13 }}
                                    >
                                        + Phân Công Lớp
                                    </button>
                                )}
                            </div>

                            <p style={{ fontSize: 14, color: "#555", lineHeight: "1.5", marginBottom: 15 }}>{p.description}</p>
                            
                            <div style={{ marginBottom: 15 }}>
                                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Mục tiêu (Objectives):</div>
                                <div style={{ fontSize: 13, color: "#666", background: "white", padding: 10, borderRadius: 6, border: "1px dashed #ddd" }}>{p.objectives}</div>
                            </div>

                            <div style={{ marginBottom: 15 }}>
                                <div style={{ fontSize: 13, fontWeight: "bold", marginBottom: 6 }}>Giai đoạn (Milestones):</div>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {p.milestones?.map((m, idx) => (
                                        <div key={idx} style={{ background: "white", border: "1px solid #d9d9d9", padding: "4px 10px", borderRadius: 4, fontSize: 12, color: "#666" }}>
                                            {m.name} ({m.durationDays} ngày)
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {activeTab === "pending" && (
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e0e0e0", paddingTop: 15, marginTop: 10 }}>
                                    <button 
                                        onClick={() => handleReject(p.id)}
                                        style={{ padding: "8px 20px", background: "white", color: "#ff4d4f", border: "1px solid #ff4d4f", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
                                    >
                                        Từ Chối
                                    </button>
                                    <button 
                                        onClick={() => handleApprove(p.id)}
                                        style={{ padding: "8px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}
                                    >
                                        Duyệt Dự Án
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {showModal && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 12, width: 450, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginTop: 0, marginBottom: 15, color: "#333", borderBottom: "1px solid #eee", paddingBottom: 10 }}>Phân Công Dự Án</h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>Chọn lớp học để áp dụng đề tài này.</p>
            
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Chọn Lớp Học:</label>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: "100%", padding: "10px", marginBottom: 25, borderRadius: 6, border: "1px solid #ddd", fontSize: 14 }}
            >
              <option value="">-- Vui lòng chọn --</option>
              {mockClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Hủy</button>
              <button onClick={handleAssign} style={{ padding: "10px 20px", background: "#1877f2", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Xác Nhận</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}