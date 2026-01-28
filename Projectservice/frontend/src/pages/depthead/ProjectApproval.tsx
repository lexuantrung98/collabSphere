import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProjects, updateProjectStatus, assignClassToProject, ProjectTemplate } from "../../api/projectApi";

const logoImage = "/logo2.jpg";

export default function ProjectApproval() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [trigger]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Duyệt đề tài này?")) return;
    try {
      await updateProjectStatus(id, 1);
      setTrigger(t => t + 1);
    } catch (err) {
      alert("Lỗi khi duyệt.");
    }
  };

  const handleReject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Từ chối đề tài này?")) return;
    try {
      await updateProjectStatus(id, 2);
      setTrigger(t => t + 1);
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

 
  const toggleDetail = (id: string) => {
    if (expandedProjectId === id) setExpandedProjectId(null);
    else setExpandedProjectId(id); 
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

 
  const isApproved = (s: any) => s === 1 || s === "Approved";
  const isPending = (s: any) => s === 0 || s === "Pending";
  const isRejected = (s: any) => s === 2 || s === "Rejected";

  const getStatusBadge = (status: any) => {
    if (isApproved(status)) return <span style={{ background: "#52c41a", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" }}>ĐÃ DUYỆT</span>;
    if (isRejected(status)) return <span style={{ background: "#ff4d4f", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" }}>TỪ CHỐI</span>;
    return <span style={{ background: "#faad14", color: "white", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" }}>CHỜ DUYỆT</span>;
  };

 
  const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('vi-VN') : 'Không có';

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
          {projects.map((p) => (
            <div key={p.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: isPending(p.status) ? "4px solid #faad14" : (isApproved(p.status) ? "4px solid #52c41a" : "4px solid #ff4d4f") }}>
              
              {/* HEADER CARD */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    {getStatusBadge(p.status)}
                    <span style={{ fontSize: "12px", color: "#888", fontWeight: "bold" }}>MÃ MÔN: {p.subjectId}</span>
                    <span style={{ fontSize: "12px", color: "#aaa" }}>• Ngày tạo: {formatDate(p.createdAt)}</span>
                  </div>
                  
                  <h2 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "20px" }}>{p.name}</h2>
                  <p style={{ color: "#555", marginBottom: "10px", fontSize: "14px" }}>{p.description}</p>
                </div>

                {/* NÚT XEM CHI TIẾT */}
                <button 
                  onClick={() => toggleDetail(p.id)}
                  style={{ background: "#e6f7ff", color: "#1890ff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                >
                  {expandedProjectId === p.id ? "Thu gọn ▲" : "Xem chi tiết ▼"}
                </button>
              </div>

              {/* PHẦN CHI TIẾT (Sẽ ẩn hiện khi bấm nút) */}
              {expandedProjectId === p.id && (
                <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #eee", animation: "fadeIn 0.3s" }}>
                    
                    {/* Hạn nộp dự án */}
                    <div style={{ marginBottom: "15px", padding: "8px 12px", background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: "6px", display: "inline-block" }}>
                        📅 <strong>Hạn nộp dự án (Deadline):</strong> <span style={{ color: "#d4380d", fontWeight: "bold" }}>{formatDate(p.deadline)}</span>
                    </div>

                    {/* Bảng Milestones */}
                    <h4 style={{ margin: "10px 0", color: "#1890ff" }}>📍 Lộ trình thực hiện (Milestones):</h4>
                    {p.milestones && p.milestones.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", background: "#fafafa" }}>
                            <thead>
                                <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                                    <th style={{ padding: "8px", border: "1px solid #ddd" }}>Tên giai đoạn</th>
                                    <th style={{ padding: "8px", border: "1px solid #ddd" }}>Mô tả</th>
                                    <th style={{ padding: "8px", border: "1px solid #ddd", width: "120px" }}>Hạn chót</th>
                                </tr>
                            </thead>
                            <tbody>
                                {p.milestones.map((m: any, idx: number) => (
                                    <tr key={idx}>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", fontWeight: "500" }}>{m.title}</td>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", color: "#666" }}>{m.description}</td>
                                        <td style={{ padding: "8px", border: "1px solid #ddd", color: "#e67e22", fontWeight: "bold" }}>
                                            {formatDate(m.deadline)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ fontStyle: "italic", color: "#999" }}>Chưa có lộ trình cụ thể.</p>
                    )}
                </div>
              )}

              {/* KHU VỰC HÀNH ĐỘNG (Duyệt/Từ chối hoặc Phân công) */}
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", borderTop: "1px dashed #eee", paddingTop: "15px" }}>
                  
                  {/* Nếu ĐÃ DUYỆT -> Hiện phân công lớp */}
                  {isApproved(p.status) && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
                          <span style={{ fontSize: "13px", fontWeight: "bold", color: "#389e0d" }}>📢 Lớp phân công:</span>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                              {p.assignedClassIds ? p.assignedClassIds.split(',').map((cls: string, idx: number) => (
                                  <span key={idx} style={{ background: "#f6ffed", border: "1px solid #52c41a", color: "#52c41a", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold" }}>
                                      {cls}
                                  </span>
                              )) : <span style={{ fontSize: 12, color: "#999" }}>(Trống)</span>}
                          </div>
                          <button 
                            onClick={() => handleAddClass(p.id)}
                            style={{ marginLeft: "auto", background: "#389e0d", color: "white", border: "none", borderRadius: 4, padding: "8px 12px", fontSize: 12, cursor: "pointer", fontWeight: "bold" }}
                          >
                            + Thêm lớp
                          </button>
                      </div>
                  )}

                  {/* Nếu CHỜ DUYỆT -> Hiện nút Duyệt/Hủy */}
                  {isPending(p.status) && (
                      <>
                        <button onClick={(e) => handleReject(p.id, e)} style={{ padding: "8px 16px", background: "white", border: "1px solid #ff4d4f", color: "#ff4d4f", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Từ chối</button>
                        <button onClick={(e) => handleApprove(p.id, e)} style={{ padding: "8px 16px", background: "#52c41a", border: "none", color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>✓ DUYỆT NGAY</button>
                      </>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}