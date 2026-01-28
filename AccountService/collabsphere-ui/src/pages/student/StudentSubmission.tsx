import { useState, useEffect } from "react";
import { Upload, FileText, Link as LinkIcon, CheckCircle, Clock, X } from "lucide-react";
import { getStudentProject, getMyTeam, getSubmissions, submitWork } from "../../api/projectApi";
import type { ProjectData, Milestone, Submission } from "../../api/projectApi";

export default function StudentSubmission() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [teamId, setTeamId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  // State Form
  const [submitType, setSubmitType] = useState<"file" | "link">("file");
  const [submitLink, setSubmitLink] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitDesc, setSubmitDesc] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await getStudentProject();
      setProject(projRes);

      const teamRes = await getMyTeam();
      const myTeamId = teamRes.team.id;
      setTeamId(myTeamId);

      if (projRes && myTeamId) {
        const subRes = await getSubmissions(projRes.id, myTeamId);
        setSubmissions(subRes);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (milestone: Milestone) => {
    const existing = submissions.find(s => s.milestoneId === milestone.id);
    setSelectedMilestone(milestone);
    
    // Check xem bài cũ là file hay link
    if (existing?.content && existing.content.startsWith("/uploads/")) {
        setSubmitType("file");
        setSubmitLink("");
    } else {
        setSubmitType("link");
        setSubmitLink(existing?.content || "");
    }
    
    setSubmitFile(null);
    setSubmitDesc(existing?.description || "");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!project || !teamId || !selectedMilestone || !selectedMilestone.id) return;
    
    try {
      await submitWork({
        projectId: project.id,
        milestoneId: selectedMilestone.id,
        teamId: teamId,
        content: submitType === "link" ? submitLink : "",
        description: submitDesc,
        file: submitType === "file" && submitFile ? submitFile : undefined
      });
      alert("Nộp bài thành công!");
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert("Lỗi khi nộp bài. Vui lòng thử lại.");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Đang tải dữ liệu...</div>;
  if (!project) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Chưa có dự án nào được phân công.</div>;

  return (
    <div style={{ padding: "20px 40px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 30 }}>
        <div style={{ background: "#e0e7ff", padding: 10, borderRadius: "50%", color: "#4f46e5" }}>
          <Upload size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: "#333" }}>Cổng Nộp Bài</h2>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Quản lý các bài nộp theo từng giai đoạn</p>
        </div>
      </div>

      {/* Danh sách Milestone */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {project.milestones.map((ms, index) => {
          const sub = submissions.find(s => s.milestoneId === ms.id);
          const isSubmitted = !!sub;
          
          return (
            <div key={index} style={{ 
              position: "relative", 
              paddingLeft: 30, 
              borderLeft: `3px solid ${isSubmitted ? "#22c55e" : "#e5e7eb"}`,
              paddingBottom: 20
            }}>
              {/* Chấm tròn trên timeline */}
              <div style={{ 
                position: "absolute", 
                left: -9, 
                top: 0, 
                width: 16, 
                height: 16, 
                borderRadius: "50%", 
                background: isSubmitted ? "#22c55e" : "white", 
                border: `2px solid ${isSubmitted ? "#22c55e" : "#d1d5db"}` 
              }} />

              <div style={{ 
                background: "white", 
                borderRadius: 12, 
                padding: 24, 
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #f0f0f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
                  <div>
                    <h3 style={{ margin: "0 0 5px 0", fontSize: 18, color: "#333", display: "flex", alignItems: "center", gap: 8 }}>
                      {ms.name}
                      {isSubmitted && (
                        <span style={{ background: "#dcfce7", color: "#166534", fontSize: 12, padding: "2px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={12}/> Đã nộp
                        </span>
                      )}
                    </h3>
                    <div style={{ fontSize: 13, color: "#666", display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={14} /> Thời hạn: {ms.durationDays} ngày
                    </div>
                  </div>

                  {/* Điểm số */}
                  {sub?.grade !== undefined && sub?.grade !== null ? (
                    <div style={{ textAlign: "right", background: "#eff6ff", padding: "5px 12px", borderRadius: 8 }}>
                       <span style={{ display: "block", fontSize: 11, color: "#3b82f6", fontWeight: "bold", textTransform: "uppercase" }}>Điểm số</span>
                       <span style={{ fontSize: 20, fontWeight: "bold", color: "#1d4ed8" }}>{sub.grade}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "#9ca3af", background: "#f3f4f6", padding: "4px 8px", borderRadius: 4 }}>Chưa chấm</span>
                  )}
                </div>

                <div style={{ background: "#f9fafb", padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 14, color: "#4b5563" }}>
                   <strong style={{ display: "block", marginBottom: 5, color: "#374151" }}>Yêu cầu:</strong>
                   {ms.description}
                </div>

                {isSubmitted && (
                  <div style={{ marginBottom: 15, fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>Bài đã nộp:</span>
                    {sub.content.startsWith("/uploads/") ? (
                      <a href={`http://localhost:5006${sub.content}`} target="_blank" rel="noreferrer" style={{ color: "#4f46e5", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                        <FileText size={16} /> Tải file về
                      </a>
                    ) : (
                      <a href={sub.content} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                        <LinkIcon size={16} /> Mở liên kết
                      </a>
                    )}
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>({new Date(sub.submittedAt).toLocaleString()})</span>
                  </div>
                )}
                
                {sub?.feedback && (
                  <div style={{ marginBottom: 15, background: "#fefce8", border: "1px solid #fef9c3", padding: 12, borderRadius: 8, color: "#854d0e", fontSize: 14 }}>
                    <strong>Giảng viên nhận xét:</strong> {sub.feedback}
                  </div>
                )}

                <button 
                  onClick={() => handleOpenSubmit(ms)}
                  style={{ 
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "600",
                    background: isSubmitted ? "white" : "#4f46e5",
                    color: isSubmitted ? "#374151" : "white",
                    border: isSubmitted ? "1px solid #d1d5db" : "none",
                    boxShadow: isSubmitted ? "none" : "0 2px 5px rgba(79, 70, 229, 0.4)"
                  }}
                >
                  <Upload size={16} /> {isSubmitted ? "Nộp lại" : "Nộp bài ngay"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL OVERLAY (Đè lên toàn màn hình) --- */}
      {showModal && selectedMilestone && (
        <div style={{
          position: "fixed",
          top: 0, 
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", // Nền tối làm mờ phía sau
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999 // Đảm bảo luôn nằm trên cùng
        }}>
          <div style={{
            background: "white",
            padding: 0,
            borderRadius: 16,
            width: 500,
            maxWidth: "90%",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            overflow: "hidden",
            animation: "fadeIn 0.2s ease-out"
          }}>
            
            {/* Modal Header */}
            <div style={{ background: "#f9fafb", padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#111827" }}>Nộp bài: {selectedMilestone.name}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {/* Tabs chọn File/Link */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button 
                  onClick={() => setSubmitType("file")}
                  style={{ 
                    flex: 1, padding: "10px", borderRadius: 8, border: "1px solid", cursor: "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center",
                    borderColor: submitType === "file" ? "#4f46e5" : "#e5e7eb",
                    background: submitType === "file" ? "#eef2ff" : "white",
                    color: submitType === "file" ? "#4f46e5" : "#6b7280",
                    fontWeight: "bold"
                  }}
                >
                  <FileText size={18} /> File
                </button>
                <button 
                  onClick={() => setSubmitType("link")}
                  style={{ 
                    flex: 1, padding: "10px", borderRadius: 8, border: "1px solid", cursor: "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center",
                    borderColor: submitType === "link" ? "#4f46e5" : "#e5e7eb",
                    background: submitType === "link" ? "#eef2ff" : "white",
                    color: submitType === "link" ? "#4f46e5" : "#6b7280",
                    fontWeight: "bold"
                  }}
                >
                  <LinkIcon size={18} /> Link
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                {submitType === "file" ? (
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#374151" }}>Chọn file đính kèm</label>
                    <div style={{ 
                      border: "2px dashed #d1d5db", borderRadius: 12, padding: 30, textAlign: "center", background: "#f9fafb", position: "relative", cursor: "pointer"
                    }}>
                      <input 
                        type="file" 
                        onChange={(e) => setSubmitFile(e.target.files ? e.target.files[0] : null)}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                      />
                      <Upload size={32} color="#9ca3af" style={{ marginBottom: 10 }} />
                      <div style={{ color: "#4b5563", fontWeight: 500 }}>
                        {submitFile ? submitFile.name : "Nhấn để chọn file hoặc kéo thả vào đây"}
                      </div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 5 }}>PDF, Word, Excel, Ảnh, ZIP...</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#374151" }}>Đường dẫn bài làm</label>
                    <input 
                      type="text" 
                      placeholder="https://drive.google.com/..."
                      value={submitLink}
                      onChange={(e) => setSubmitLink(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14 }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#374151" }}>Ghi chú</label>
                <textarea 
                  placeholder="Lời nhắn cho giảng viên..."
                  value={submitDesc}
                  onChange={(e) => setSubmitDesc(e.target.value)}
                  style={{ width: "100%", height: 100, padding: "12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, fontFamily: "inherit", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button 
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "white", color: "#374151", fontWeight: 600, cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSubmit}
                  style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#4f46e5", color: "white", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 5px rgba(79, 70, 229, 0.4)" }}
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}