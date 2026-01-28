import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FolderKanban, Users, ArrowRight, Layout, BarChart3, PieChart } from "lucide-react";

import { getMyProjects, getStudentTeam, getTasks } from "../../api/projectApi";
import { getProfile } from "../../api/authApi";
import type { ProjectData, Task } from "../../api/projectApi";
import type { UserProfile } from "../../api/authApi";

const logoImage = "/logo2.jpg"; 

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projectStats, setProjectStats] = useState<Record<string, any>>({});

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const userInfo = await getProfile();
        setUser(userInfo);

        const data = await getMyProjects();
        let projList: ProjectData[] = [];
        if (Array.isArray(data)) {
            projList = data;
        } else if (data) {
            projList = [data];
        }
        setProjects(projList);

        const teamData = await getStudentTeam();
        
        if (teamData && teamData.team) {
            const teamId = teamData.team.id;
            const tasksRes = await getTasks(teamId);
            const tasks: Task[] = Array.isArray(tasksRes) ? tasksRes : []; 
            
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t: Task) => Number(t.status) === 3).length;
            const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

            const memberStats = teamData.members?.map((m: any) => {
                const myTasks = tasks.filter((t: any) => {
                    const assignee = t.assignedTo || t.assignedToUserId; 
                    return assignee === m.userId;
                });
                const myDone = myTasks.filter((t: any) => Number(t.status) === 3).length;
                const contribution = totalTasks === 0 ? 0 : Math.round((myDone / totalTasks) * 100);
                return { ...m, contribution, doneCount: myDone };
            }) || [];

            const projectIdKey = teamData.team.projectId || (projList.length > 0 ? projList[0].id : "unknown");
            
            setProjectStats(prev => ({
                ...prev,
                [projectIdKey]: {
                    progress: progressPercent,
                    completed: completedTasks,
                    total: totalTasks,
                    members: memberStats
                }
            }));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const goToWorkspace = () => {
    navigate("/student/workspace");
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      
      {/* SIDEBAR TRÁI */}
      <div style={{ width: 280, backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 60, height: 40, marginRight: 12 }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#28a745" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Sảnh chờ</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
          {user && (
            <div style={{ marginBottom: 30, padding: "16px", background: "#f6ffed", borderRadius: 8 }}>
              <p style={{ margin: "0 0 5px 0", fontSize: 12, color: "#666" }}>Sinh viên:</p>
              <strong style={{ display: "block", marginBottom: 4, color: "#333", fontSize: 14 }}>{user.email}</strong>
              <span style={{ background: "#28a745", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11 }}>Student</span>
            </div>
          )}
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu Chính</div>
          
          <div style={{ padding: "12px 16px", background: "#f6ffed", color: "#28a745", borderRadius: 8, fontWeight: "bold", cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <Layout size={18}/> Dự án của tôi
          </div>
        </div>

        <div style={{ padding: 24, borderTop: "1px solid #f0f0f0" }}>
          <button onClick={handleLogout} style={{ width: "100%", padding: "12px", background: "#fff", color: "#ff4d4f", border: "1px solid #ff4d4f", borderRadius: 6, cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, height: "100%", overflowY: "auto", padding: "40px 50px" }}>
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, color: "#0f172a", marginBottom: 10, marginTop: 0 }}>Xin chào, {user?.email?.split('@')[0]}! 👋</h1>
            <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>Chào mừng bạn quay trở lại. Dưới đây là các dự án của bạn.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Đang tải danh sách dự án...</div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <FolderKanban size={60} color="#cbd5e1" style={{ marginBottom: 20 }} />
            <h3 style={{ color: "#334155", marginBottom: 10 }}>Chưa có dự án nào</h3>
            <p style={{ color: "#64748b" }}>Bạn chưa được phân công vào nhóm hoặc dự án nào.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 30 }}>
            {projects.map((proj) => {
              const stats = projectStats[proj.id] || { progress: 0, completed: 0, total: 0, members: [] };
              
              return (
                <div key={proj.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", transition: "transform 0.2s" }}>
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${stats.progress === 100 ? "#22c55e" : "#1890ff"}, #e2e8f0)` }}></div>
                  
                  <div style={{ padding: 25, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
                      <span style={{ background: "#e6f7ff", color: "#1890ff", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: "bold", textTransform: "uppercase" }}>
                        {proj.subjectId}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", background: "#f8fafc", padding: "4px 8px", borderRadius: 20 }}>
                        <Users size={14} /> Nhóm của bạn
                      </span>
                    </div>

                    <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 10, lineHeight: 1.4 }}>{proj.title}</h3>
                    
                    <div style={{ marginTop: "auto", paddingTop: 15 }}>
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><BarChart3 size={14}/> Tiến độ chung</span>
                                <span style={{ color: stats.progress === 100 ? "#22c55e" : "#1890ff" }}>{stats.progress}%</span>
                            </div>
                            <div style={{ width: "100%", height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${stats.progress}%`, height: "100%", background: stats.progress === 100 ? "#22c55e" : "#1890ff", borderRadius: 4, transition: "width 0.5s" }}></div>
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                                Hoàn thành {stats.completed}/{stats.total} công việc
                            </div>
                        </div>

                        {stats.members.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>Đóng góp thành viên</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {stats.members.slice(0, 3).map((mem: any, idx: number) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                                            <div style={{ width: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#334155", fontWeight: 500 }}>
                                                {mem.studentCode || "Member"}
                                            </div>
                                            <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                                <div style={{ width: `${mem.contribution}%`, height: "100%", background: "#faad14", borderRadius: 3 }}></div>
                                            </div>
                                            <div style={{ width: 30, textAlign: "right", color: "#64748b" }}>{mem.contribution}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ paddingTop: 20, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#64748b" }}>
                          <PieChart size={16} /> <span>Chi tiết</span>
                      </div>
                      <button 
                        onClick={goToWorkspace}
                        style={{ 
                          display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, 
                          background: "#28a745", color: "white", border: "none", fontWeight: "600", cursor: "pointer",
                          boxShadow: "0 4px 10px rgba(40, 167, 69, 0.2)", transition: "all 0.2s"
                        }}
                      >
                        Vào Workspace <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}