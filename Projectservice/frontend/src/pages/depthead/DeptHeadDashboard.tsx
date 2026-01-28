import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects, updateProjectStatus, assignClassToProject, ProjectTemplate } from "../../api/projectApi";
import { X, FileText, Calendar, User, BookOpen } from "lucide-react"; 

const logoImage = "/logo2.jpg";

export default function DeptHeadDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, [trigger]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const enrichedData = sorted.map((p: any) => ({
        ...p,
        lecturerName: p.lecturerName || "Chưa phân công", 
        milestones: p.milestones || [
            { id: 1, name: "Giai đoạn 1: Requirement", deadline: "2025-02-15", status: "Done" },
            { id: 2, name: "Giai đoạn 2: Design & Database", deadline: "2025-03-01", status: "In Progress" },
            { id: 3, name: "Giai đoạn 3: Development & API", deadline: "2025-03-20", status: "Pending" },
            { id: 4, name: "Giai đoạn 4: Final Presentation", deadline: "2025-04-10", status: "Pending" }
        ]
      }));

      setProjects(enrichedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm("Duyệt đề tài này?")) return;
    try {
      await updateProjectStatus(id, 1);
      setTrigger(t => t + 1);
      if(selectedProject?.id === id) setSelectedProject(null);  
    } catch (err) {
      alert("Lỗi khi duyệt.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Từ chối đề tài này?")) return;
    try {
      await updateProjectStatus(id, 2);  
      setTrigger(t => t + 1);
      if(selectedProject?.id === id) setSelectedProject(null);
    } catch (err) {
      alert("Lỗi khi từ chối.");
    }
  };

  const handleAddClass = async (id: string) => {
    const classId = window.prompt("Nhập mã lớp muốn phân công (Ví dụ: SE1801):");
    if (!classId) return;

    try {
      await assignClassToProject(id, classId.toUpperCase().trim());
      alert(`Đã thêm lớp ${classId} thành công!`);
      setTrigger(t => t + 1); 
    } catch (err) {
      alert("Lỗi khi phân công lớp.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
        case 0: return <span style={{ background: "#faad14", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>CHỜ DUYỆT</span>;
        case 1: return <span style={{ background: "#52c41a", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>ĐÃ DUYỆT</span>;
        case 2: return <span style={{ background: "#ff4d4f", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>TỪ CHỐI</span>;
        default: return null;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: 280, backgroundColor: "#fff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 80, height: 50, marginRight: 12 }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Dept. Head Panel</span>
          </div>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
            <div style={{ marginBottom: 30, padding: "16px", background: "#f0f8ff", borderRadius: 8 }}>
                <strong>truongbomon@fe.edu.vn</strong>
            </div>
          <div style={{ padding: "12px 16px", background: "#e7f3ff", color: "#1877f2", borderRadius: 8, fontWeight: "bold", marginBottom: 8 }}>✅ Quản lý Đề Tài</div>
        </div>
        <div style={{ padding: 24 }}>
          <button onClick={handleLogout} style={{ width: "100%", padding: "12px", border: "1px solid #ff4d4f", background: "white", color: "#ff4d4f", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}>Đăng xuất</button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <h1 style={{ fontSize: 28, color: "#333", marginBottom: "5px" }}>Quản lý Đề Tài</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>Duyệt đề tài và phân công cho các lớp.</p>

        {loading && <p>Đang tải...</p>}

        <div style={{ display: "grid", gap: "20px" }}>
          {projects.map((p: any) => (
            <div key={p.id} style={{ background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: p.status === 0 ? "4px solid #faad14" : (p.status === 1 ? "4px solid #52c41a" : "4px solid #ff4d4f") }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {getStatusBadge(p.status)}
                    <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>{p.subjectId} • {new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>{p.name}</h2>
                  <p style={{ color: "#555", marginBottom: "15px", maxHeight: "60px", overflow: "hidden", textOverflow: "ellipsis" }}>{p.description}</p>
                  
                  {/* DANH SÁCH LỚP (Hiển thị rút gọn ở ngoài) */}
                  <div style={{display: "flex", alignItems: "center", gap: 10}}>
                      {p.assignedClassIds ? (
                          <div style={{fontSize: 13, color: "#389e0d", background: "#f6ffed", padding: "4px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 5}}>
                              <BookOpen size={14}/> 
                              <strong>{p.assignedClassIds}</strong>
                          </div>
                      ) : <span style={{fontSize: 12, color: "#999"}}>Chưa có lớp</span>}
                      
                      {/* NÚT XEM CHI TIẾT */}
                      <button 
                        onClick={() => setSelectedProject(p)}
                        style={{ background: "transparent", border: "1px solid #1890ff", color: "#1890ff", padding: "4px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: "bold" }}
                      >
                        Xem chi tiết
                      </button>
                  </div>
                </div>

                {/* CỘT ACTION BUTTONS (Chỉ hiện khi chờ duyệt) */}
                {p.status === 0 && (
                    <div style={{ display: "flex", gap: "10px", marginLeft: 20, alignItems: "flex-start" }}>
                        <button onClick={() => handleReject(p.id)} style={{ padding: "8px 16px", background: "white", border: "1px solid #ff4d4f", color: "#ff4d4f", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Từ chối</button>
                        <button onClick={() => handleApprove(p.id)} style={{ padding: "8px 16px", background: "#52c41a", border: "none", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Duyệt</button>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL CHI TIẾT --- */}
      {selectedProject && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", width: "700px", maxWidth: "90%", maxHeight: "90vh", borderRadius: 12, padding: 30, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                
                {/* Header Modal */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
                    <div>
                        <div style={{ marginBottom: 5 }}>{getStatusBadge(selectedProject.status)}</div>
                        <h2 style={{ margin: 0, color: "#333" }}>{selectedProject.name}</h2>
                    </div>
                    <button onClick={() => setSelectedProject(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666" }}><X size={24} /></button>
                </div>

                {/* Body Modal (Scrollable) */}
                <div style={{ overflowY: "auto", paddingRight: 5 }}>
                    
                    {/* Thông tin chung */}
                    <div style={{ background: "#f9fafb", padding: 15, borderRadius: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 4 }}><BookOpen size={12}/> MÔN HỌC</div>
                            <div style={{ fontWeight: "bold", fontSize: 15 }}>{selectedProject.subjectId}</div>
                        </div>
                         <div>
                            <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 4 }}><User size={12}/> GIẢNG VIÊN</div>
                            <div style={{ fontWeight: "bold", fontSize: 15 }}>{selectedProject.lecturerName}</div>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                            <div style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12}/> LỚP ĐƯỢC PHÂN CÔNG</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                                {selectedProject.assignedClassIds ? (
                                    <span style={{ background: "#e6f7ff", color: "#1890ff", padding: "4px 8px", borderRadius: 4, fontWeight: "bold", border: "1px solid #91d5ff" }}>
                                        {selectedProject.assignedClassIds}
                                    </span>
                                ) : <span style={{ color: "#999", fontStyle: "italic" }}>Chưa phân công</span>}
                                
                                {selectedProject.status === 1 && (
                                    <button 
                                        onClick={() => handleAddClass(selectedProject.id)}
                                        style={{ fontSize: 12, color: "#389e0d", background: "transparent", border: "1px dashed #389e0d", padding: "2px 8px", borderRadius: 4, cursor: "pointer" }}
                                    >
                                        + Cập nhật lớp
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#555", borderBottom: "2px solid #1890ff", display: "inline-block", paddingBottom: 4 }}>Mô tả đề tài</h4>
                        <p style={{ lineHeight: 1.6, color: "#333", background: "#fff", border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
                            {selectedProject.description}
                        </p>
                    </div>

                    {/* Danh sách Mốc (Milestones) */}
                    <div>
                        <h4 style={{ margin: "0 0 15px 0", color: "#555", borderBottom: "2px solid #1890ff", display: "inline-block", paddingBottom: 4 }}>Các cột mốc (Milestones)</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {selectedProject.milestones?.map((m: any, index: number) => (
                                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e0e0e0", borderRadius: 8, background: "white" }}>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <div style={{ background: "#e6f7ff", padding: 10, borderRadius: "50%", color: "#1890ff" }}>
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: "bold", color: "#333" }}>{m.name}</div>
                                            <div style={{ fontSize: 12, color: "#888" }}>Deadline: {m.deadline}</div>
                                        </div>
                                    </div>
                                    <span style={{ 
                                        fontSize: 12, padding: "4px 10px", borderRadius: 12, fontWeight: "bold",
                                        background: m.status === "Done" ? "#f6ffed" : (m.status === "In Progress" ? "#e6f7ff" : "#fffbe6"),
                                        color: m.status === "Done" ? "#52c41a" : (m.status === "In Progress" ? "#1890ff" : "#faad14")
                                    }}>
                                        {m.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Modal Buttons */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: 15, marginTop: 15, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    {selectedProject.status === 0 && (
                        <>
                             <button onClick={() => handleReject(selectedProject.id)} style={{ padding: "8px 20px", background: "white", border: "1px solid #ff4d4f", color: "#ff4d4f", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Từ chối</button>
                             <button onClick={() => handleApprove(selectedProject.id)} style={{ padding: "8px 20px", background: "#52c41a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Duyệt ngay</button>
                        </>
                    )}
                    <button onClick={() => setSelectedProject(null)} style={{ padding: "8px 20px", background: "#f0f0f0", border: "none", borderRadius: 6, cursor: "pointer" }}>Đóng</button>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}