import { useState } from "react";
import { Upload, FileText, Link as LinkIcon, CheckCircle, Clock, X } from "lucide-react";
import { submitWork } from "../../api/projectApi";
export default function StudentMilestones({ project, submissions, groupId, refreshData }: any) {
  const [activeMilestone, setActiveMilestone] = useState<any>(project?.milestones?.[0] || null);
  const [showModal, setShowModal] = useState(false);
  const [submitType, setSubmitType] = useState<"file" | "link">("file");
  const [submitLink, setSubmitLink] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitDesc, setSubmitDesc] = useState("");

  const currentSubmission = activeMilestone ? submissions.find((s:any) => s.projectMilestoneId === activeMilestone.id) : null;

  const handleOpenModal = () => {
      if (currentSubmission?.content?.includes("/uploads/")) {
          setSubmitType("file"); setSubmitLink("");
      } else {
          setSubmitType("link"); setSubmitLink(currentSubmission?.content || "");
      }
      setSubmitDesc(currentSubmission?.description || "");
      setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!activeMilestone) return;
    try {
      await submitWork({
        projectId: project.id,
        milestoneId: activeMilestone.id,
        teamId: groupId,
        content: submitType === "link" ? submitLink : "",
        description: submitDesc,
        file: submitType === "file" ? (submitFile || undefined) : undefined
      });
      alert("Nộp bài thành công!");
      setShowModal(false);
      if(refreshData) refreshData();
    } catch (err) { alert("Lỗi khi nộp bài."); }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 150px)", border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden", background: "white" }}>
      {/* Sidebar chọn Giai đoạn */}
      <div style={{ width: 280, borderRight: "1px solid #e0e0e0", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #eee", fontWeight: "bold", color: "#333" }}>Các Giai đoạn</div>
        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
            {project?.milestones?.map((ms: any) => {
                const sub = submissions.find((s:any) => s.projectMilestoneId === ms.id);
                const isActive = activeMilestone?.id === ms.id;
                return (
                    <div 
                        key={ms.id} onClick={() => setActiveMilestone(ms)}
                        style={{ 
                            padding: "12px 15px", marginBottom: 8, borderRadius: 8, cursor: "pointer",
                            background: isActive ? "white" : "transparent",
                            boxShadow: isActive ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
                            border: isActive ? "1px solid #28a745" : "1px solid transparent",
                            display: "flex", justifyContent: "space-between", alignItems: "center"
                        }}
                    >
                        <div>
                            <div style={{ fontSize: 14, fontWeight: isActive ? "bold" : "500", color: isActive ? "#28a745" : "#333" }}>{ms.title || ms.name}</div>
                            <div style={{ fontSize: 11, color: "#888" }}>Deadline: {ms.deadline ? new Date(ms.deadline).toLocaleDateString() : "--"}</div>
                        </div>
                        {sub ? <CheckCircle size={16} color="#22c55e" /> : <Clock size={16} color="#ccc" />}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Nội dung chi tiết */}
      <div style={{ flex: 1, padding: 30, overflowY: "auto" }}>
        {activeMilestone ? (
            <>
                <h2 style={{ marginTop: 0 }}>{activeMilestone.title || activeMilestone.name}</h2>
                <div style={{ background: "#f0f9ff", padding: 20, borderRadius: 8, color: "#0c4a6e", marginBottom: 20 }}>
                    <strong>Yêu cầu:</strong> {activeMilestone.description}
                </div>

                <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ padding: 20, background: currentSubmission ? "#f6ffed" : "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                            <div style={{ width: 40, height: 40, background: currentSubmission ? "#22c55e" : "#eee", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                {currentSubmission ? <CheckCircle size={20}/> : <Upload size={20} color="#666"/>}
                            </div>
                            <div>
                                <div style={{ fontWeight: "bold", fontSize: 15 }}>Trạng thái nộp bài</div>
                                <div style={{ fontSize: 12, color: "#666" }}>{currentSubmission ? "Đã nộp thành công" : "Chưa có bài nộp"}</div>
                            </div>
                        </div>
                        <div>
                            {currentSubmission ? (
                                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                                    <span style={{ fontSize: 12, color: "#22c55e", fontWeight: "bold" }}>Đã nộp: {new Date(currentSubmission.submittedAt).toLocaleDateString()}</span>
                                    {currentSubmission.content.includes("/uploads/") ? (
                                        <a href={`http://localhost:5234${currentSubmission.content}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#1890ff", display: "flex", alignItems: "center", gap: 5 }}><FileText size={14}/> Tải file bài làm</a>
                                    ) : (
                                        <a href={currentSubmission.content} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#1890ff", display: "flex", alignItems: "center", gap: 5 }}><LinkIcon size={14}/> Link bài làm</a>
                                    )}
                                    <button onClick={handleOpenModal} style={{ background: "transparent", border: "1px solid #ddd", fontSize: 11, cursor: "pointer", borderRadius: 4, padding: "2px 8px" }}>Nộp lại</button>
                                </div>
                            ) : (
                                <button onClick={() => setShowModal(true)} style={{ background: "#1890ff", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Nộp bài ngay</button>
                            )}
                        </div>
                    </div>
                    {currentSubmission?.grade !== null && currentSubmission?.grade !== undefined && (
                        <div style={{ padding: 15, background: "#fffbe6", borderTop: "1px solid #ffe58f", color: "#d48806", fontSize: 14 }}>
                            <strong>Điểm số:</strong> {currentSubmission.grade}/10
                            <div style={{ marginTop: 5 }}>" {currentSubmission.feedback} "</div>
                        </div>
                    )}
                </div>
            </>
        ) : (
            <div style={{ textAlign: "center", color: "#999", marginTop: 50 }}>Chọn một giai đoạn để xem chi tiết</div>
        )}
      </div>

      {/* Modal Nộp bài */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "white", padding: 30, borderRadius: 12, width: 500 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                     <h3 style={{ margin: 0 }}>Nộp bài: {activeMilestone?.title || activeMilestone?.name}</h3>
                     <X size={20} style={{ cursor: "pointer" }} onClick={() => setShowModal(false)} />
                </div>
                
                <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                    <button onClick={() => setSubmitType("file")} style={{ flex: 1, padding: 10, border: submitType === "file" ? "1px solid #1890ff" : "1px solid #ddd", color: submitType === "file" ? "#1890ff" : "#666", borderRadius: 6, background: submitType === "file" ? "#e6f7ff" : "white", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><FileText size={18}/> File Upload</button>
                    <button onClick={() => setSubmitType("link")} style={{ flex: 1, padding: 10, border: submitType === "link" ? "1px solid #1890ff" : "1px solid #ddd", color: submitType === "link" ? "#1890ff" : "#666", borderRadius: 6, background: submitType === "link" ? "#e6f7ff" : "white", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><LinkIcon size={18}/> Link Online</button>
                </div>

                {submitType === "file" ? (
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold" }}>Chọn file:</label>
                        <input type="file" onChange={e => setSubmitFile(e.target.files ? e.target.files[0] : null)} style={{ width: "100%", padding: 5, border: "1px dashed #ddd", borderRadius: 6 }} />
                    </div>
                ) : (
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold" }}>Đường dẫn:</label>
                        <input type="text" placeholder="https://..." value={submitLink} onChange={e => setSubmitLink(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6 }} />
                    </div>
                )}
                
                <div style={{ marginBottom: 20 }}>
                     <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "bold" }}>Ghi chú:</label>
                     <textarea value={submitDesc} onChange={e => setSubmitDesc(e.target.value)} placeholder="Lời nhắn cho giảng viên..." style={{ width: "100%", height: 80, padding: 10, border: "1px solid #ddd", borderRadius: 6 }}></textarea>
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
                    <button onClick={handleSubmit} style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Nộp bài</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}