import { useState, useEffect } from "react";
import { User, Star, Send, CheckCircle, BarChart } from "lucide-react";
import { getStudentProject, getMyTeam, getMyEvaluations, submitEvaluation } from "../../api/projectApi";
import type { ProjectData, PeerEvaluation } from "../../api/projectApi";

export default function StudentPeerEval() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [myEvaluations, setMyEvaluations] = useState<PeerEvaluation[]>([]);
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"evaluate" | "result">("evaluate");

  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [score, setScore] = useState(100);
  const [comment, setComment] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await getStudentProject();
      setProject(projRes);
      const teamRes = await getMyTeam();
      setTeamMembers(teamRes.members || []);
      setTeamId(teamRes.team.id);
      if (projRes) {
        const evals = await getMyEvaluations(projRes.id);
        setMyEvaluations(evals);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSelectMember = (member: any) => {
    const existing = myEvaluations.find(e => e.evaluateeId === member.userId);
    setSelectedMember(member);
    setScore(existing ? existing.score : 100);
    setComment(existing ? existing.comment : "");
  };

  const handleSubmit = async () => {
    if (!project || !selectedMember) return;
    try {
      await submitEvaluation({
        projectId: project.id, teamId: teamId, evaluateeId: selectedMember.userId,
        score: Number(score), comment: comment
      });
      alert(`Đã đánh giá thành công!`);
      setSelectedMember(null); fetchData();
    } catch (error) { alert("Lỗi khi gửi đánh giá"); }
  };

  if (loading) return <div>Đang tải...</div>;
  const myId = localStorage.getItem("userId");
  const targets = teamMembers.filter(m => m.userId !== myId);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div style={{ display: "flex", gap: 20, borderBottom: "1px solid #eee", marginBottom: 30 }}>
         <div onClick={() => setActiveTab("evaluate")} style={{ paddingBottom: 10, cursor: "pointer", borderBottom: activeTab === "evaluate" ? "2px solid #28a745" : "none", fontWeight: activeTab === "evaluate" ? "bold" : "normal" }}>Đánh giá thành viên</div>
         <div onClick={() => setActiveTab("result")} style={{ paddingBottom: 10, cursor: "pointer", borderBottom: activeTab === "result" ? "2px solid #28a745" : "none", fontWeight: activeTab === "result" ? "bold" : "normal" }}>Kết quả của tôi</div>
      </div>

      {activeTab === "evaluate" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 30 }}>
            <div>
              <h3 style={{ marginTop: 0 }}>Chọn thành viên ({targets.length})</h3>
              {targets.map((mem) => {
                const isEvaluated = myEvaluations.some(e => e.evaluateeId === mem.userId);
                return (
                  <div key={mem.userId} onClick={() => handleSelectMember(mem)}
                    style={{ 
                        padding: 15, marginBottom: 10, borderRadius: 8, cursor: "pointer", border: selectedMember?.userId === mem.userId ? "1px solid #fa8c16" : "1px solid #eee", background: selectedMember?.userId === mem.userId ? "#fff7e6" : "white", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "#eee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><User size={16}/></div>
                        <div>
                            <div style={{ fontWeight: "bold", fontSize: 13 }}>{mem.studentCode || "Thành viên"}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{mem.role === 1 ? "Leader" : "Member"}</div>
                        </div>
                    </div>
                    {isEvaluated && <CheckCircle size={16} color="#22c55e" />}
                  </div>
                );
              })}
            </div>

            <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
              {selectedMember ? (
                <>
                  <h3 style={{ marginTop: 0 }}>Đánh giá: {selectedMember.studentCode}</h3>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: 13 }}>Điểm đóng góp (0-100)</label>
                    <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} style={{ width: "100%" }} />
                    <div style={{ textAlign: "center", fontSize: 24, fontWeight: "bold", color: "#fa8c16", marginTop: 5 }}>{score}</div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold", fontSize: 13 }}>Nhận xét</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 8, height: 100 }} placeholder="Nhận xét chi tiết..."></textarea>
                  </div>
                  <button onClick={handleSubmit} style={{ width: "100%", padding: "12px", background: "#fa8c16", color: "white", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>Gửi đánh giá</button>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "#999", padding: 40 }}>Chọn thành viên bên trái để đánh giá</div>
              )}
            </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 50, background: "#f9f9f9", borderRadius: 12 }}>
            <BarChart size={48} color="#ddd" style={{ marginBottom: 10 }} />
            <h3 style={{ color: "#666" }}>Tính năng đang phát triển</h3>
            <p style={{ color: "#999" }}>Bạn sẽ xem được điểm đánh giá từ các thành viên khác tại đây sau khi kết thúc dự án.</p>
        </div>
      )}
    </div>
  );
}