import { useState, useEffect, useCallback } from "react";
import { getAllProjects, getGroupsByProject, type ProjectTemplate, type ProjectGroup } from "../../../api/projectApi";
import { Users, Plus, X, UserPlus, Trash2, Crown, User } from "lucide-react";
import { toast } from 'react-toastify';

export default function GroupManagement() {
  const [projects, setProjects] = useState<ProjectTemplate[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectTemplate | null>(null);
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: "", deadline: "", description: "" });

  const loadGroups = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const data = await getGroupsByProject(projectId);
      console.log('🔍 GroupManagement - RAW API Response:', data);
      console.log('🔍 GroupManagement - Is Array?:', Array.isArray(data));
      const groups = Array.isArray(data) ? data : [];
      console.log('🔍 GroupManagement - Groups count:', groups.length);
      if (groups.length > 0) {
        console.log('🔍 GroupManagement - First group:', groups[0]);
        console.log('🔍 GroupManagement - First group members:', groups[0].members);
      }
      setGroups(groups);
    } catch (error) {
      console.error('❌ GroupManagement - Error loading groups:', error);
      toast.error("Lỗi tải danh sách nhóm");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectProject = useCallback((project: ProjectTemplate) => {
    setSelectedProject(project);
    loadGroups(project.id);
  }, [loadGroups]);

  useEffect(() => {
    getAllProjects().then(data => {
      const activeProjects = data.filter(p => p.status === 1);
      setProjects(activeProjects);
      if (activeProjects.length > 0) {
        handleSelectProject(activeProjects[0]);
      }
    }).catch(() => {
      toast.error("Lỗi tải danh sách dự án");
    });
  }, [handleSelectProject]);

  const handleCreateMilestone = () => {
    if (!newMilestone.name || !newMilestone.deadline) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }
    toast.success(`Đã tạo milestone "${newMilestone.name}"`);
    setShowMilestoneModal(false);
    setNewMilestone({ name: "", deadline: "", description: "" });
  };

  // Stats
  const stats = {
    totalGroups: groups.length,
    totalMembers: groups.reduce((acc, g) => acc + (g.members?.length || 0), 0),
  };

  return (
    <div style={{ display: "flex", gap: 24, minHeight: "calc(100vh - 120px)" }}>
      {/* Sidebar */}
      <div style={{ width: 280, background: "white", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: 20, display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: "#333", paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
          Dự án đang chạy
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
          {projects.length === 0 && (
            <p style={{ color: "#999", textAlign: "center", padding: 20 }}>Không có dự án nào</p>
          )}
          {projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => handleSelectProject(p)}
              style={{ 
                padding: 14, borderRadius: 10, cursor: "pointer",
                background: selectedProject?.id === p.id 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                  : "#f9fafb",
                color: selectedProject?.id === p.id ? "white" : "#333",
                fontWeight: selectedProject?.id === p.id ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontSize: 14 }}>{p.name}</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                {p.subjectId || "Chưa có môn"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {selectedProject ? (
          <>
            {/* Header */}
            <div style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
              padding: 24, borderRadius: 16, color: "white",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{selectedProject.name}</h2>
                <p style={{ margin: "6px 0 0 0", opacity: 0.85, fontSize: 14 }}>Quản lý nhóm sinh viên</p>
              </div>
              <button 
                onClick={() => setShowMilestoneModal(true)}
                style={{ 
                  display: "flex", alignItems: "center", gap: 8, 
                  padding: "12px 20px", background: "rgba(255,255,255,0.2)", 
                  color: "white", border: "1px solid rgba(255,255,255,0.3)", 
                  borderRadius: 10, fontWeight: 600, cursor: "pointer",
                  backdropFilter: "blur(10px)"
                }}
              >
                <Plus size={18} /> Tạo Mốc Mới
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{stats.totalGroups}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>Nhóm</div>
                </div>
              </div>
              <div style={{ flex: 1, background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f6ffed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={24} color="#52c41a" />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{stats.totalMembers}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>Thành viên</div>
                </div>
              </div>
            </div>

            {/* Groups Grid */}
            <div style={{ flex: 1, background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflowY: "auto" }}>
              <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "#333" }}>Danh sách nhóm</h3>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Đang tải...</div>
              ) : groups.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                  <p>Chưa có nhóm nào</p>
                  <p style={{ fontSize: 13 }}>Sử dụng chức năng "Phân Nhóm" trong trang Danh sách Dự án</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {groups.map(group => (
                    <div 
                      key={group.id} 
                      style={{ 
                        border: "1px solid #f0f0f0", 
                        borderRadius: 12, 
                        padding: 20, 
                        background: "#fafbfc",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#667eea"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(102,126,234,0.1)" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "none" }}
                    >
                      {/* Group Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 style={{ margin: 0, color: "#333", fontSize: 16, fontWeight: 600 }}>{group.name}</h4>
                        <span style={{ 
                          fontSize: 11, padding: "4px 10px", 
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                          color: "white", borderRadius: 12, fontWeight: 600
                        }}>
                          {group.members?.length || 0} SV
                        </span>
                      </div>
                      
                      {/* Class ID */}
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ background: "#e7f3ff", color: "#1890ff", padding: "2px 8px", borderRadius: 4 }}>
                          {group.classId || "Chưa có lớp"}
                        </span>
                      </div>

                      {/* Members */}
                      <div style={{ marginBottom: 16 }}>
                        {group.members && group.members.length > 0 ? (
                          group.members.slice(0, 4).map((m, i) => (
                            <div 
                              key={m.id || i} 
                              style={{ 
                                display: "flex", alignItems: "center", gap: 10,
                                fontSize: 13, padding: "8px 0", 
                                borderBottom: i < Math.min(group.members!.length - 1, 3) ? "1px solid #f0f0f0" : "none"
                              }}
                            >
                              <div style={{ 
                                width: 28, height: 28, borderRadius: "50%", 
                                background: i === 0 ? "#fffbe6" : "#f5f5f5",
                                display: "flex", alignItems: "center", justifyContent: "center"
                              }}>
                                {i === 0 ? <Crown size={14} color="#faad14" /> : <User size={14} color="#888" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: i === 0 ? 600 : 400, color: "#333" }}>
                                  {m.fullName || `Thành viên ${i + 1}`}
                                </div>
                                <div style={{ fontSize: 11, color: "#999" }}>{m.studentCode || m.studentId}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: "#999", fontSize: 13, fontStyle: "italic" }}>Chưa có thành viên</div>
                        )}
                        {group.members && group.members.length > 4 && (
                          <div style={{ fontSize: 12, color: "#667eea", marginTop: 8, fontWeight: 500 }}>
                            +{group.members.length - 4} thành viên khác
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ 
                          flex: 1, padding: "8px", fontSize: 12, 
                          background: "transparent", border: "1px solid #d9d9d9", 
                          borderRadius: 6, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                        }}>
                          <UserPlus size={14} /> Thêm SV
                        </button>
                        <button style={{ 
                          padding: "8px 12px", fontSize: 12, 
                          background: "transparent", border: "1px solid #ffa39e", 
                          color: "#ff4d4f", borderRadius: 6, cursor: "pointer"
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#999", background: "white", borderRadius: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
              <p>Chọn dự án bên trái để xem nhóm</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 30, borderRadius: 16, width: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#333" }}>Thêm Milestone</h3>
              <X style={{ cursor: "pointer", color: "#999" }} onClick={() => setShowMilestoneModal(false)} />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#333" }}>Tên cột mốc</label>
              <input 
                value={newMilestone.name} 
                onChange={e => setNewMilestone({...newMilestone, name: e.target.value})} 
                style={{ width: "100%", padding: 12, border: "2px solid #e8e8e8", borderRadius: 10, fontSize: 14, outline: "none" }} 
                placeholder="VD: Nộp báo cáo giai đoạn 2"
                onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={e => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#333" }}>Hạn chót</label>
              <input 
                type="date" 
                value={newMilestone.deadline} 
                onChange={e => setNewMilestone({...newMilestone, deadline: e.target.value})} 
                style={{ width: "100%", padding: 12, border: "2px solid #e8e8e8", borderRadius: 10, fontSize: 14, outline: "none" }}
                onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={e => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#333" }}>Mô tả (tùy chọn)</label>
              <textarea 
                value={newMilestone.description} 
                onChange={e => setNewMilestone({...newMilestone, description: e.target.value})} 
                style={{ width: "100%", padding: 12, border: "2px solid #e8e8e8", borderRadius: 10, fontSize: 14, height: 80, resize: "none", outline: "none" }}
                placeholder="Mô tả yêu cầu..."
                onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={e => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                onClick={() => setShowMilestoneModal(false)} 
                style={{ padding: "12px 24px", background: "#f0f0f0", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateMilestone} 
                style={{ 
                  padding: "12px 24px", 
                  background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)", 
                  color: "white", border: "none", borderRadius: 8, 
                  fontWeight: 600, cursor: "pointer" 
                }}
              >
                Tạo Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
