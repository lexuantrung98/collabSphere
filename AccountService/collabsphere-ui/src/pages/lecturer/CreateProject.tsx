import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../api/projectApi";
import type { Milestone } from "../../api/projectApi";
import { getProfile } from "../../api/authApi";
import type { UserProfile } from "../../api/authApi";

const logoImage = "/logo2.jpg";

export default function CreateProject() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [obj, setObj] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  
  const [mName, setMName] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mCrit, setMCrit] = useState("");
  const [mDur, setMDur] = useState(7);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleAddMilestone = () => {
    if (!mName) {
      setError("Vui lòng nhập tên giai đoạn");
      return;
    }
    setError("");
    setMilestones([...milestones, { name: mName, description: mDesc, criteria: mCrit, durationDays: mDur }]);
    setMName(""); setMDesc(""); setMCrit(""); setMDur(7);
  };

  const handleDeleteMilestone = (index: number) => {
    const newList = [...milestones];
    newList.splice(index, 1);
    setMilestones(newList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setError("");
    
    try {
      const mockSubjectId = "11111111-1111-1111-1111-111111111111"; 
      
      await createProject({
        title,
        description: desc,
        objectives: obj,
        subjectId: mockSubjectId,
        milestones
      });
      setMsg("Tạo dự án thành công!");
      
      setTitle("");
      setDesc("");
      setObj("");
      setMilestones([]);
    } catch (err: any) {
      console.error(err);
      setError("Lỗi khi tạo dự án. Vui lòng kiểm tra lại kết nối.");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      
      <div style={{ 
        width: 280, 
        backgroundColor: "#ffffff", 
        borderRight: "1px solid #e0e0e0", 
        display: "flex", 
        flexDirection: "column",
        height: "100%",
        zIndex: 10
      }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 80, height: 50, marginRight: 12 }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Lecturer Panel</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {user && (
            <div style={{ marginBottom: 30, padding: "16px", background: "#f0f8ff", borderRadius: 8 }}>
              <p style={{ margin: "0 0 5px 0", fontSize: 12, color: "#666" }}>Đang đăng nhập:</p>
              <strong style={{ display: "block", marginBottom: 4, color: "#333", fontSize: 14 }}>{user.email}</strong>
              <span style={{ 
                background: "#faad14", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11 
              }}>{user.role}</span>
            </div>
          )}
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu</div>
          <div style={{ 
            padding: "12px 16px", background: "#e7f3ff", color: "#1877f2", borderRadius: 8, fontWeight: "bold", cursor: "pointer", marginBottom: 8
          }}>
            + Tạo Dự Án Mới
          </div>
          <div style={{ 
            padding: "12px 16px", color: "#666", borderRadius: 8, cursor: "pointer", marginBottom: 8
          }}>
            Danh sách Dự án
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

      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto", height: "100%" }}>
        <h1 style={{ fontSize: 28, marginBottom: 5, marginTop: 0, color: "#333" }}>Quản lý Dự án</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>Tạo đề tài, đồ án mới cho sinh viên đăng ký.</p>

        {msg && <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 20 }}>{msg}</div>}
        {error && <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: 6, marginBottom: 20 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 40 }}>
          
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: "fit-content" }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#1890ff", borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              1. Thông tin chung
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Tên Dự Án / Đề Tài</label>
                <input 
                  value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                  placeholder="Ví dụ: Xây dựng website bán hàng..." 
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Mô tả chi tiết</label>
                <textarea 
                  value={desc} onChange={e => setDesc(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box", fontFamily: "inherit" }}
                  placeholder="Mô tả yêu cầu nghiệp vụ..." 
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Mục tiêu đầu ra (Objectives)</label>
                <textarea 
                  value={obj} onChange={e => setObj(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box", fontFamily: "inherit" }}
                  placeholder="Sinh viên cần đạt được gì..." 
                />
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: "fit-content" }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#52c41a", borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              2. Lộ trình (Milestones)
            </h3>
            
            <div style={{ background: "#f9f9f9", padding: 15, borderRadius: 8, marginBottom: 20, border: "1px solid #eee" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: "bold", color: "#555" }}>Tên cột mốc</label>
                  <input 
                    value={mName} onChange={e => setMName(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: 4, boxSizing: "border-box" }} 
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                   <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: "bold", color: "#555" }}>Thời gian</label>
                   <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #ddd", borderRadius: 4, paddingRight: 10 }}>
                      <input 
                        type="number" 
                        value={mDur} onChange={e => setMDur(Number(e.target.value))}
                        style={{ width: "100%", padding: "8px", border: "none", outline: "none", background: "transparent" }} 
                      />
                      <span style={{ whiteSpace: "nowrap", color: "#888", fontSize: 13, fontWeight: "500" }}>ngày</span>
                   </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input 
                  placeholder="Mô tả ngắn" 
                  value={mDesc} onChange={e => setMDesc(e.target.value)}
                  style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: 4 }} 
                />
                <input 
                  placeholder="Tiêu chí đánh giá" 
                  value={mCrit} onChange={e => setMCrit(e.target.value)}
                  style={{ flex: 1, padding: "8px", border: "1px solid #ddd", borderRadius: 4 }} 
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddMilestone}
                style={{ width: "100%", padding: "8px", background: "#52c41a", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}
              >
                + Thêm Cột mốc
              </button>
            </div>

            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {milestones.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", fontSize: 14 }}>Chưa có cột mốc nào.</div>
              ) : (
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                      <th style={{ padding: 8, textAlign: "left" }}>Tên</th>
                      <th style={{ padding: 8, textAlign: "center" }}>Thời gian</th>
                      <th style={{ padding: 8, textAlign: "right" }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: 8, fontWeight: "500" }}>{m.name}</td>
                        <td style={{ padding: 8, textAlign: "center" }}>{m.durationDays} ngày</td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          <span 
                            onClick={() => handleDeleteMilestone(idx)}
                            style={{ color: "red", cursor: "pointer", fontWeight: "bold" }}
                          >
                            &times;
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        <div style={{ textAlign: "right" }}>
           <button 
             onClick={handleSubmit}
             style={{ 
               padding: "15px 40px", background: "#1890ff", color: "white", 
               border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold",
               boxShadow: "0 4px 10px rgba(24, 144, 255, 0.3)", cursor: "pointer"
             }}
           >
             LƯU DỰ ÁN
           </button>
        </div>

      </div>
    </div>
  );
}