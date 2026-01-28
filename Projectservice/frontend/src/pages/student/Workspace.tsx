import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PieChart, ListTodo, CheckCircle, Users, ArrowLeft, LogOut } from "lucide-react";
import { getMyGroup, getSubmissionsByProject, getTasksByGroup } from "../../api/projectApi";
import StudentKanban from "./StudentKanban";
import StudentMilestones from "./StudentMilestones";


const CURRENT_STUDENT_ID = "HE150001"; 

export default function Workspace() {
  const { groupId } = useParams(); 
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const myGroup = await getMyGroup(CURRENT_STUDENT_ID);
      setGroup(myGroup);

      if (myGroup) {
        if (myGroup.projectTemplateId) {
            const subs = await getSubmissionsByProject(myGroup.projectTemplateId);
            setSubmissions(subs.filter((s: any) => s.projectGroupId === myGroup.id));
        }
        const t = await getTasksByGroup(myGroup.id);
        setTasks(t);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const calculateContribution = (studentId: string) => {
      const totalDoneTasks = tasks.filter(t => t.status === 2).length;
      if (totalDoneTasks === 0) return 0;
      const myDoneTasks = tasks.filter(t => t.status === 2 && t.assignedToUserId === studentId).length;
      return Math.round((myDoneTasks / totalDoneTasks) * 100);
  };

  const projectProgress = group?.projectTemplate?.milestones 
    ? Math.round((submissions.length / group.projectTemplate.milestones.length) * 100) 
    : 0;

  if (loading) return <div>Đang tải...</div>;
  if (!group) return <div>Không tìm thấy nhóm.</div>;

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Segoe UI, sans-serif", overflow: "hidden" }}>
      <div style={{ width: 260, backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#28a745", borderRadius: 6 }}></div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, color: "#28a745" }}>CollabSphere</h2>
            <span style={{ fontSize: 11, color: "#888" }}>Workspace</span>
          </div>
        </div>

        <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
          <div onClick={() => navigate("/student/dashboard")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", color: "#666", cursor: "pointer", marginBottom: 20, background: "#f5f5f5", borderRadius: 6, fontSize: 13 }}>
            <ArrowLeft size={16}/> Quay lại Sảnh
          </div>
          
          <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu Chính</div>
          {[
            { id: "overview", label: "Tổng quan Dự án", icon: PieChart },
            { id: "kanban", label: "Kanban Board", icon: ListTodo },
            { id: "milestones", label: "Lộ trình & Nộp bài", icon: CheckCircle },
            { id: "peereval", label: "Đánh giá Đồng đẳng", icon: Users },
          ].map((item) => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} 
                style={{ padding: "12px 16px", background: activeTab === item.id ? "#f6ffed" : "transparent", color: activeTab === item.id ? "#28a745" : "#555", borderRadius: 8, fontWeight: activeTab === item.id ? "bold" : "500", cursor: "pointer", marginBottom: 5, display: "flex", alignItems: "center", gap: 10 }}>
                <item.icon size={18}/> {item.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 60, background: "white", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <h1 style={{ fontSize: 18, margin: 0, fontWeight: "bold", color: "#333" }}>{group.projectTemplate?.name}</h1>
                <span style={{ fontSize: 14, color: "#888" }}>|</span>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#28a745" }}>{group.name}</span>
            </div>
        </div>

        <div style={{ padding: 30, flex: 1, background: "#f5f7fa" }}>
            {activeTab === "overview" && (
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                     <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                        <div style={{ flex: 1, background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 30 }}>
                             <div style={{ position: "relative", width: 100, height: 100, borderRadius: "50%", background: `conic-gradient(#52c41a ${projectProgress}%, #f0f0f0 0)` }}>
                                <div style={{ position: "absolute", inset: 10, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20 }}>
                                    {projectProgress}%
                                </div>
                             </div>
                             <div>
                                 <h3 style={{ margin: 0, fontSize: 18 }}>Tiến độ hoàn thành</h3>
                                 <p style={{ color: "#888", marginTop: 5 }}>Dựa trên số Milestone đã nộp ({submissions.length}/{group.projectTemplate?.milestones?.length || 0})</p>
                             </div>
                        </div>
                     </div>

                     <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Thành viên & Đóng góp</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
                            {group.members?.map((m: any) => (
                                <div key={m.id} style={{ padding: 15, border: "1px solid #eee", borderRadius: 8 }}>
                                    <div style={{ fontWeight: "bold", marginBottom: 5 }}>{m.fullName}</div>
                                    <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{m.role}</div>
                                    <div style={{ height: 6, background: "#f5f5f5", borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ width: `${calculateContribution(m.studentId)}%`, height: "100%", background: "#1890ff" }}></div>
                                    </div>
                                    <div style={{ textAlign: "right", fontSize: 12, color: "#1890ff", marginTop: 5, fontWeight: "bold" }}>{calculateContribution(m.studentId)}%</div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            )}

            {activeTab === "kanban" && <StudentKanban groupId={group.id} members={group.members} />}
            
            {activeTab === "milestones" && <StudentMilestones project={group.projectTemplate} submissions={submissions} groupId={group.id} refreshData={loadData} />}
            
            {activeTab === "peereval" && <div style={{ textAlign: "center", padding: 50, background: "white", borderRadius: 12 }}><h3>Tính năng đang phát triển</h3></div>}
        </div>
      </div>
    </div>
  );
}