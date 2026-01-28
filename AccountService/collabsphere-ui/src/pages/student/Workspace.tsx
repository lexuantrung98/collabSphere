import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentProject, getStudentTeam, getTasks } from "../../api/projectApi";
import { getProfile } from "../../api/authApi";
import type { ProjectData, Task } from "../../api/projectApi";
import type { UserProfile } from "../../api/authApi";
import StudentKanban from "./StudentKanban";
import StudentMilestones from "./StudentMilestones";
import StudentPeerEval from "./StudentPeerEval";
import { CheckCircle, PieChart, Users, ListTodo, ArrowLeft } from "lucide-react";

const logoImage = "/logo2.jpg";

export default function Workspace() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError("");

        const profile = await getProfile();
        setUser(profile);

        const projData = await getStudentProject();
        setProject(projData);

        const teamData = await getStudentTeam();
        setTeamInfo(teamData);

        if (teamData && teamData.team) {
            const tasksRes = await getTasks(teamData.team.id);
            setTasks(Array.isArray(tasksRes) ? tasksRes : []);
        }

      } catch (err: any) {
        console.error("Workspace Error:", err);
        if (err.response && (err.response.status === 404 || err.response.status === 400)) {
           setError(err.response.data.message);
        } else {
           setError("Không thể kết nối đến máy chủ dự án.");
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => Number(t.status) === 3).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const memberStats = teamInfo?.members?.map((m: any) => {
    const myTasks = tasks.filter((t: any) => {
        const assignee = t.assignedTo || t.assignedToUserId;
        return assignee === m.userId;
    });
    const myDone = myTasks.filter((t: any) => Number(t.status) === 3).length;
    const contribution = totalTasks === 0 ? 0 : Math.round((myDone / totalTasks) * 100);
    
    return { ...m, doneCount: myDone, totalAssigned: myTasks.length, contribution };
  }) || [];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      <div style={{ width: 260, backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 50, height: 35, marginRight: 10 }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 16, color: "#28a745" }}>CollabSphere</h2>
            <span style={{ fontSize: 11, color: "#888" }}>Workspace</span>
          </div>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
          <div onClick={() => navigate("/student/dashboard")} style={{ padding: "10px", marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13, background: "#f5f5f5", borderRadius: 6 }}>
             <ArrowLeft size={14} /> Quay lại Dashboard
          </div>

          <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold", letterSpacing: 0.5 }}>Menu Không Gian</div>
          
          {[
            { id: "overview", label: "Tổng quan Dự án", icon: PieChart },
            { id: "kanban", label: "Kanban & Sprint", icon: ListTodo },
            { id: "milestones", label: "Lộ trình & Nộp bài", icon: CheckCircle },
            { id: "peereval", label: "Đánh giá Đồng đẳng", icon: Users },
          ].map((item) => (
            <div 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                style={{ 
                    padding: "12px 16px", 
                    background: activeTab === item.id ? "#f6ffed" : "transparent", 
                    color: activeTab === item.id ? "#28a745" : "#555", 
                    borderRadius: 8, 
                    fontWeight: activeTab === item.id ? "bold" : "500", 
                    cursor: "pointer", 
                    marginBottom: 5, 
                    display: "flex", alignItems: "center", gap: 10,
                    transition: "all 0.2s"
                }}
            >
                <item.icon size={18}/> {item.label}
            </div>
          ))}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid #f0f0f0" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#28a745", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Sinh viên</div>
                </div>
             </div>
        </div>
      </div>

      <div style={{ flex: 1, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 60, background: "white", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div>
                    <h1 style={{ fontSize: 16, margin: 0, fontWeight: "bold", color: "#333" }}>{project?.title || "Đang tải..."}</h1>
                    <div style={{ fontSize: 12, color: "#888" }}>Môn: {project?.subjectId}</div>
                </div>
                {teamInfo && (
                    <div style={{ height: 30, width: 1, background: "#eee" }}></div>
                )}
                {teamInfo && (
                    <div>
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#28a745" }}>{teamInfo.team?.name}</div>
                        <div style={{ fontSize: 11, color: "#666" }}>GVHD: Cô Nguyễn Thị Lan (Mock)</div>
                    </div>
                )}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Tiến độ chung</span>
                    <div style={{ width: 150, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${progressPercent}%`, height: "100%", background: "#1890ff", borderRadius: 3 }}></div>
                    </div>
                </div>
                <div style={{ background: "#e6f7ff", color: "#1890ff", padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>
                    {progressPercent}%
                </div>
            </div>
        </div>

        <div style={{ padding: 30, flex: 1 }}>
            {loading ? <div style={{ textAlign: "center", color: "#999", marginTop: 50 }}>Đang tải dữ liệu...</div> : 
             error ? <div style={{ color: "red", textAlign: "center" }}>{error}</div> : (
               <>
                  {activeTab === "overview" && (
                    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: 30 }}>
                            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>Đóng góp thành viên</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                                {memberStats.map((mem: any) => (
                                    <div key={mem.userId} style={{ padding: 15, border: "1px solid #f0f0f0", borderRadius: 8 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                            <span style={{ fontWeight: "bold", fontSize: 13 }}>{mem.studentCode || "..."}</span>
                                            <span style={{ fontSize: 12, color: "#888" }}>{mem.doneCount} tasks</span>
                                        </div>
                                        <div style={{ width: "100%", height: 6, background: "#f5f5f5", borderRadius: 3 }}>
                                            <div style={{ width: `${mem.contribution}%`, height: "100%", background: "#faad14", borderRadius: 3 }}></div>
                                        </div>
                                        <div style={{ textAlign: "right", fontSize: 11, color: "#faad14", marginTop: 4, fontWeight: "bold" }}>{mem.contribution}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                            <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: 15, color: "#333", fontSize: 18 }}>Thông tin dự án</h3>
                            <p style={{ lineHeight: 1.6, color: "#555" }}>{project?.description}</p>
                            <h4 style={{ marginTop: 20 }}>Mục tiêu:</h4>
                            <p style={{ lineHeight: 1.6, color: "#555", background: "#f9f9f9", padding: 15, borderRadius: 8 }}>{project?.objectives}</p>
                        </div>
                    </div>
                  )}

                  {activeTab === "kanban" && teamInfo && (
                    <StudentKanban teamId={teamInfo.team.id} />
                  )}

                  {activeTab === "milestones" && (
                    <StudentMilestones />
                  )}

                  {activeTab === "peereval" && (
                    <StudentPeerEval />
                  )}
               </>
            )}
        </div>
      </div>
    </div>
  );
}