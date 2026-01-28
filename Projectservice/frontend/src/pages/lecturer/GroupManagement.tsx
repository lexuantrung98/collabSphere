import { useState, useEffect } from "react";
import { getAllProjects } from "../../api/projectApi";
import { Users, Plus, X } from "lucide-react";

export default function GroupManagement() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: "", deadline: "", description: "", target: "ALL", targetGroupId: "" });

  useEffect(() => {
    // Load dự án khi vào trang
    getAllProjects().then(data => {
        const activeProjects = data.filter((p: any) => p.status === 1); 
        setProjects(activeProjects);
        if(activeProjects.length > 0) handleSelectProject(activeProjects[0]);
    });
  }, []);

  const handleSelectProject = (project: any) => {
      setSelectedProject(project);
      
      // Mock data groups để test, thực tế sẽ gọi API getGroupsByProject(project.id)
      const mockGroups = [
          { id: "G01", name: "Nhóm 1", members: ["Nguyễn Văn A", "Trần Thị B"], progress: 80 },
          { id: "G02", name: "Nhóm 2", members: ["Lê Văn C", "Phạm Văn D"], progress: 45 },
          { id: "G03", name: "Nhóm 3", members: ["Hoàng Văn E"], progress: 20 },
      ];
      setGroups(mockGroups);
  };

  const handleCreateMilestone = () => {
      if(!newMilestone.name || !newMilestone.deadline) return alert("Nhập đủ thông tin");
      alert(`Đã tạo milestone "${newMilestone.name}" thành công!`);
      setShowMilestoneModal(false);
  };

  return (
    <div style={{ display: "flex", height: "85vh", gap: 20 }}>
      {/* SIDEBAR DANH SÁCH DỰ ÁN */}
      <div style={{ width: 300, background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 20, display: "flex", flexDirection: "column" }}>
        <h3 style={{ marginTop: 0, color: "#1877f2", borderBottom: "1px solid #eee", paddingBottom: 15 }}>Dự Án Đang Chạy</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", flex: 1 }}>
            {projects.length === 0 && <p style={{color: "#999", textAlign: "center"}}>Không có dự án nào</p>}
            {projects.map(p => (
                <div 
                    key={p.id} 
                    onClick={() => handleSelectProject(p)}
                    style={{ 
                        padding: "12px", borderRadius: 8, cursor: "pointer",
                        background: selectedProject?.id === p.id ? "#e6f7ff" : "transparent",
                        border: selectedProject?.id === p.id ? "1px solid #1890ff" : "1px solid #eee",
                        fontWeight: selectedProject?.id === p.id ? "bold" : "normal",
                        color: selectedProject?.id === p.id ? "#1877f2" : "#333"
                    }}
                >
                    {p.name}
                    <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{p.className || "Chưa có lớp"}</div>
                </div>
            ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {selectedProject ? (
            <>
                <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{selectedProject.name}</h2>
                        <div style={{ color: "#666", marginTop: 5 }}>Quản lý nhóm và tiến độ</div>
                    </div>
                    <button 
                        onClick={() => setShowMilestoneModal(true)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#52c41a", color: "white", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
                    >
                        <Plus size={18} /> Tạo Mốc Mới
                    </button>
                </div>

                <div style={{ flex: 1, background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
                        {groups.map(group => (
                            <div key={group.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 15, background: "#fafafa" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                    <h4 style={{ margin: 0, color: "#333" }}>{group.name}</h4>
                                    <span style={{ fontSize: 12, padding: "2px 8px", background: "#e6f7ff", color: "#1890ff", borderRadius: 10 }}>{group.id}</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#666", marginBottom: 15, display: "flex", alignItems: "center", gap: 5 }}>
                                    <Users size={14} /> {group.members.length} Thành viên
                                </div>
                                <div style={{ marginBottom: 15 }}>
                                    {group.members.map((m: string, i: number) => (
                                        <div key={i} style={{ fontSize: 13, padding: "4px 0", borderBottom: "1px dashed #eee" }}>• {m}</div>
                                    ))}
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                                        <span>Tiến độ</span>
                                        <span>{group.progress}%</span>
                                    </div>
                                    <div style={{ width: "100%", height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ width: `${group.progress}%`, height: "100%", background: group.progress > 70 ? "#52c41a" : "#faad14" }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : (
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#999" }}>Vui lòng chọn dự án bên trái</div>
        )}
      </div>
      
      {/* MODAL (GIỮ NGUYÊN CODE MODAL CŨ) */}
      {showMilestoneModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
              <div style={{ background: "white", padding: 30, borderRadius: 12, width: 500 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                      <h3 style={{ margin: 0 }}>Thêm Mốc (Milestone)</h3>
                      <X style={{ cursor: "pointer" }} onClick={() => setShowMilestoneModal(false)} />
                  </div>
                  
                  <div style={{ marginBottom: 15 }}>
                      <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: 13 }}>Tên cột mốc</label>
                      <input value={newMilestone.name} onChange={e => setNewMilestone({...newMilestone, name: e.target.value})} style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }} placeholder="Ví dụ: Nộp báo cáo giai đoạn 2" />
                  </div>
                  
                  <div style={{ marginBottom: 15 }}>
                      <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: 13 }}>Hạn chót</label>
                      <input type="date" value={newMilestone.deadline} onChange={e => setNewMilestone({...newMilestone, deadline: e.target.value})} style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                      <button onClick={() => setShowMilestoneModal(false)} style={{ padding: "8px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
                      <button onClick={handleCreateMilestone} style={{ padding: "8px 20px", background: "#1877f2", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Xác nhận</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}