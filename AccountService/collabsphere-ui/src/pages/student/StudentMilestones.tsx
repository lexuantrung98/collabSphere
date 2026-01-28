import { useState, useEffect } from "react";
import { Upload, FileText, Link as LinkIcon, CheckCircle, Clock, X, ChevronRight, AlertCircle, HelpCircle, Send } from "lucide-react";
import { getStudentProject, getMyTeam, getSubmissions, submitWork, getReflections, postReflection } from "../../api/projectApi";
import type { ProjectData, Milestone, Submission, Reflection } from "../../api/projectApi";

export default function StudentMilestones() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [teamId, setTeamId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "checkpoints">("overview");

  const [showModal, setShowModal] = useState(false);
  const [submitType, setSubmitType] = useState<"file" | "link">("file");
  const [submitLink, setSubmitLink] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitDesc, setSubmitDesc] = useState("");

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem("userId"));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeMilestone) {
        getReflections(activeMilestone.id)
            .then(data => setReflections(data))
            .catch(err => console.error("Lỗi tải phản tư:", err));
    }
  }, [activeMilestone]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await getStudentProject();
      setProject(projRes);
      if (projRes && projRes.milestones.length > 0) setActiveMilestone(projRes.milestones[0]);

      const teamRes = await getMyTeam();
      const myTeamId = teamRes.team.id;
      setTeamId(myTeamId);

      if (projRes && myTeamId) {
        const subRes = await getSubmissions(projRes.id, myTeamId);
        setSubmissions(subRes);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleOpenSubmit = () => {
    if (!activeMilestone) return;
    const existing = submissions.find(s => s.milestoneId === activeMilestone.id);
    
    if (existing?.content && existing.content.startsWith("/uploads/")) {
        setSubmitType("file"); setSubmitLink("");
    } else {
        setSubmitType("link"); setSubmitLink(existing?.content || "");
    }
    setSubmitFile(null);
    setSubmitDesc(existing?.description || "");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!project || !teamId || !activeMilestone || !activeMilestone.id) return;
    try {
      await submitWork({
        projectId: project.id,
        milestoneId: activeMilestone.id,
        teamId: teamId,
        content: submitType === "link" ? submitLink : "",
        description: submitDesc,
        file: submitType === "file" && submitFile ? submitFile : undefined
      });
      alert("Nộp checkpoint thành công!");
      setShowModal(false);
      fetchData();
    } catch (error) { alert("Lỗi khi nộp bài."); }
  };

  const handleSendReflection = async () => {
    if (!activeMilestone || !chatInput.trim()) return;
    try {
        const newMsg = await postReflection(activeMilestone.id, chatInput);
        setReflections([...reflections, newMsg]);
        setChatInput("");
    } catch (error) {
        alert("Lỗi gửi tin nhắn");
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!project) return <div>Chưa có dự án.</div>;

  const currentSubmission = activeMilestone ? submissions.find(s => s.milestoneId === activeMilestone.id) : null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 150px)", border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden", background: "white" }}>
      
      {/* SIDEBAR TRÁI: DANH SÁCH MILESTONE */}
      <div style={{ width: 280, borderRight: "1px solid #e0e0e0", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #eee", fontWeight: "bold", color: "#333" }}>Các Giai đoạn (Milestones)</div>
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
            {project.milestones.map((ms) => {
                const sub = submissions.find(s => s.milestoneId === ms.id);
                const isActive = activeMilestone?.id === ms.id;
                return (
                    <div 
                        key={ms.id} 
                        onClick={() => setActiveMilestone(ms)}
                        style={{ 
                            padding: "12px 15px", marginBottom: 8, borderRadius: 8, cursor: "pointer",
                            background: isActive ? "white" : "transparent",
                            boxShadow: isActive ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                            border: isActive ? "1px solid #28a745" : "1px solid transparent",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 14, fontWeight: isActive ? "bold" : "500", color: isActive ? "#28a745" : "#333" }}>{ms.name}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>{ms.durationDays} ngày</div>
                        </div>
                        {sub ? <CheckCircle size={16} color="#22c55e" /> : <Clock size={16} color="#ccc" />}
                    </div>
                );
            })}
        </div>
      </div>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeMilestone ? (
            <>
                <div style={{ padding: "15px 30px", borderBottom: "1px solid #eee", display: "flex", gap: 30 }}>
                    <div onClick={() => setActiveTab("overview")} style={{ paddingBottom: 10, cursor: "pointer", borderBottom: activeTab === "overview" ? "2px solid #28a745" : "none", fontWeight: activeTab === "overview" ? "bold" : "normal", color: activeTab === "overview" ? "#28a745" : "#666" }}>Tổng quan Mốc</div>
                    <div onClick={() => setActiveTab("checkpoints")} style={{ paddingBottom: 10, cursor: "pointer", borderBottom: activeTab === "checkpoints" ? "2px solid #28a745" : "none", fontWeight: activeTab === "checkpoints" ? "bold" : "normal", color: activeTab === "checkpoints" ? "#28a745" : "#666" }}>Điểm kiểm tra & Nộp bài</div>
                </div>

                <div style={{ padding: 30, flex: 1, overflowY: "auto" }}>
                    {/* TAB TỔNG QUAN & CHAT REFLECTION */}
                    {activeTab === "overview" && (
                        <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", height: "100%" }}>
                             <h2 style={{ marginTop: 0 }}>{activeMilestone.name}</h2>
                             <div style={{ background: "#f0f9ff", padding: 20, borderRadius: 8, color: "#0c4a6e", marginBottom: 20, lineHeight: 1.6 }}>
                                <strong>Mô tả:</strong> {activeMilestone.description}
                             </div>
                             
                             <h3 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 15 }}>
                                <HelpCircle size={18}/> Thảo luận & Phản tư (Reflection)
                             </h3>
                             
                             {/* KHUNG CHAT */}
                             <div style={{ 
                                flex: 1, 
                                border: "1px solid #e0e0e0", 
                                borderRadius: 12, 
                                display: "flex", 
                                flexDirection: "column", 
                                background: "#f9fafb",
                                overflow: "hidden",
                                minHeight: 400
                             }}>
                                {/* Danh sách tin nhắn */}
                                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 15 }}>
                                    {reflections.length === 0 && (
                                        <div style={{ textAlign: "center", color: "#999", fontStyle: "italic", marginTop: 20 }}>
                                            Chưa có thảo luận nào. Hãy bắt đầu chia sẻ về khó khăn hoặc bài học rút ra!
                                        </div>
                                    )}
                                    
                                    {reflections.map((msg) => {
                                        const isMe = msg.userId === currentUserId;
                                        return (
                                            <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                                                <div style={{ fontSize: 11, color: "#666", marginBottom: 4, textAlign: isMe ? "right" : "left", marginLeft: 4, marginRight: 4 }}>
                                                    {isMe ? "Bạn" : (msg.userCode || msg.userEmail?.split('@')[0])} • {new Date(msg.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                                <div style={{ 
                                                    padding: "10px 15px", 
                                                    borderRadius: isMe ? "15px 15px 2px 15px" : "15px 15px 15px 2px", 
                                                    background: isMe ? "#28a745" : "white", 
                                                    color: isMe ? "white" : "#333",
                                                    border: isMe ? "none" : "1px solid #e5e7eb",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                    lineHeight: 1.5
                                                }}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Ô nhập liệu */}
                                <div style={{ padding: 15, background: "white", borderTop: "1px solid #e0e0e0", display: "flex", gap: 10 }}>
                                    <input 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendReflection()}
                                        placeholder="Chia sẻ khó khăn, bài học hoặc thảo luận..." 
                                        style={{ flex: 1, padding: "10px 15px", borderRadius: 20, border: "1px solid #ddd", outline: "none" }}
                                    />
                                    <button 
                                        onClick={handleSendReflection}
                                        style={{ width: 40, height: 40, borderRadius: "50%", background: "#28a745", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* TAB CHECKPOINTS & NỘP BÀI */}
                    {activeTab === "checkpoints" && (
                        <div>
                             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <h3>Danh sách Điểm kiểm tra (Checkpoints)</h3>
                                <button style={{ background: "#eee", border: "none", padding: "8px 12px", borderRadius: 6, cursor: "not-allowed", color: "#999", fontSize: 12 }}>+ Tạo điểm kiểm tra (Leader)</button>
                             </div>

                             <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
                                <div style={{ padding: 20, background: currentSubmission ? "#f6ffed" : "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                                        <div style={{ width: 40, height: 40, background: currentSubmission ? "#22c55e" : "#eee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                            {currentSubmission ? <CheckCircle size={20}/> : "1"}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: "bold", fontSize: 15 }}>Nộp báo cáo giai đoạn {activeMilestone.name}</div>
                                            <div style={{ fontSize: 12, color: "#666" }}>Hạn chót: Theo timeline dự án</div>
                                        </div>
                                    </div>
                                    <div>
                                        {currentSubmission ? (
                                            <div style={{ textAlign: "right" }}>
                                                <span style={{ fontSize: 12, color: "#22c55e", fontWeight: "bold", display: "block" }}>Đã nộp</span>
                                                <span style={{ fontSize: 11, color: "#888" }}>{new Date(currentSubmission.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        ) : (
                                            <button onClick={handleOpenSubmit} style={{ background: "#1890ff", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Nộp bài ngay</button>
                                        )}
                                    </div>
                                </div>
                                {currentSubmission?.grade && (
                                    <div style={{ padding: 15, background: "#fffbe6", borderTop: "1px solid #ffe58f", color: "#d48806", fontSize: 14 }}>
                                        <strong>Giảng viên chấm điểm:</strong> {currentSubmission.grade}/10
                                        <div style={{ marginTop: 5 }}>" {currentSubmission.feedback} "</div>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>Chọn một cột mốc bên trái</div>
        )}
      </div>

      {/* MODAL NỘP BÀI */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", padding: 30, borderRadius: 12, width: 500 }}>
                <h3 style={{ marginTop: 0 }}>Nộp bài: {activeMilestone?.name}</h3>
                <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                    <button onClick={() => setSubmitType("file")} style={{ flex: 1, padding: 8, border: submitType === "file" ? "1px solid #1890ff" : "1px solid #ddd", color: submitType === "file" ? "#1890ff" : "#666", borderRadius: 6, cursor: "pointer", background: "white" }}>File Upload</button>
                    <button onClick={() => setSubmitType("link")} style={{ flex: 1, padding: 8, border: submitType === "link" ? "1px solid #1890ff" : "1px solid #ddd", color: submitType === "link" ? "#1890ff" : "#666", borderRadius: 6, cursor: "pointer", background: "white" }}>Link Online</button>
                </div>
                {submitType === "file" ? (
                    <input type="file" onChange={e => setSubmitFile(e.target.files ? e.target.files[0] : null)} style={{ marginBottom: 15 }} />
                ) : (
                    <input type="text" placeholder="https://..." value={submitLink} onChange={e => setSubmitLink(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, marginBottom: 15 }} />
                )}
                <textarea placeholder="Ghi chú..." value={submitDesc} onChange={e => setSubmitDesc(e.target.value)} style={{ width: "100%", height: 80, padding: 10, border: "1px solid #ddd", borderRadius: 6, marginBottom: 20 }}></textarea>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={() => setShowModal(false)} style={{ padding: "8px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
                    <button onClick={handleSubmit} style={{ padding: "8px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Nộp</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}