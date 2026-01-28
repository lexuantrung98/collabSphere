import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProjects, getSubmissionsByProject, gradeSubmission } from "../../api/projectApi";
import { ChevronRight, FileText, MessageSquare, Star, Check, X, ArrowLeft } from "lucide-react";

export default function GradeProject() {
  const { projectId } = useParams(); // Lấy ID từ URL nếu có
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    loadData();
  }, [projectId]); // Chạy lại khi URL thay đổi

  const loadData = async () => {
    try {
        const allProjects = await getAllProjects();
        // Lọc dự án đang chạy (Status = 1)
        const activeProjects = allProjects.filter((p: any) => p.status === 1);
        setProjects(activeProjects);

        // Nếu trên URL có projectId -> Load chi tiết bài nộp của dự án đó
        if (projectId) {
            const current = activeProjects.find((p: any) => p.id === projectId);
            if (current) {
                setSelectedProject(current);
                await loadSubmissions(projectId);
            }
        } else {
            setSelectedProject(null);
        }
    } catch (err) {
        console.error(err);
    }
  };

  const loadSubmissions = async (id: string) => {
      try {
          const data = await getSubmissionsByProject(id);
          
          const formattedSubmissions = data.map((sub: any) => ({
              id: sub.id,
              studentName: sub.group?.name || "Nhóm chưa đặt tên",
              mssv: sub.group?.members?.[0]?.studentId || "N/A",
              milestone: sub.projectMilestone?.title || "Chưa xác định",
              submittedAt: new Date(sub.submittedAt).toLocaleString('vi-VN'),
              file: sub.content || "Chưa có file",
              studentNote: sub.description || "Không có ghi chú",
              status: sub.grade !== null && sub.grade !== undefined ? "Graded" : "Pending",
              grade: sub.grade,
              feedback: sub.feedback || ""
          }));
          
          setSubmissions(formattedSubmissions);
      } catch (err) {
          console.error("Lỗi tải bài nộp:", err);
          setSubmissions([]);
      }
  };

  const handleSelectProject = (id: string) => {
      navigate(`/lecturer/grade/${id}`);
  };

  const submitGrade = async () => {
      if(!gradingSubmission) return;
      
      try {
          await gradeSubmission(gradingSubmission.id, Number(score), feedback);
          alert(`Đã chấm điểm ${score} cho sinh viên ${gradingSubmission.studentName}`);
          
          if(projectId) {
              await loadSubmissions(projectId);
          }
          
          setGradingSubmission(null);
          setScore("");
          setFeedback("");
      } catch (err) {
          console.error("Lỗi khi chấm điểm:", err);
          alert("Có lỗi xảy ra khi lưu điểm. Vui lòng thử lại.");
      }
  };

  // --- TRƯỜNG HỢP 1: CHƯA CHỌN DỰ ÁN (HIỆN DANH SÁCH) ---
  if (!projectId) {
      return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>Chọn Dự Án Cần Chấm</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {projects.map((p) => (
                    <div key={p.id} style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                            <h3 style={{ margin: 0, color: "#1877f2" }}>{p.name}</h3>
                            <span style={{ background: "#e6f7ff", color: "#1890ff", padding: "2px 8px", borderRadius: 4, fontSize: 12, height: "fit-content" }}>
                                {p.className || "Chưa có lớp"}
                            </span>
                        </div>
                        <p style={{ color: "#666", fontSize: 14, margin: "0 0 15px 0" }}>
                            {p.description || "Chưa có mô tả"}
                        </p>
                        <button 
                            onClick={() => handleSelectProject(p.id)}
                            style={{ width: "100%", padding: "10px", background: "#52c41a", color: "white", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                        >
                            Xem bài nộp & Chấm điểm <ChevronRight size={16}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  // --- TRƯỜNG HỢP 2: ĐÃ CHỌN DỰ ÁN (HIỆN CHI TIẾT) ---
  return (
    <div style={{ display: "flex", height: "85vh", gap: 20 }}>
        {/* SIDEBAR DANH SÁCH DỰ ÁN (BÊN TRÁI) */}
        <div style={{ width: 300, background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: 15, paddingBottom: 15, borderBottom: "1px solid #eee" }}>
                <button onClick={() => navigate("/lecturer/grade")} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
                    <ArrowLeft size={14}/> Quay lại
                </button>
                <h3 style={{ margin: "10px 0 0 0", color: "#1877f2" }}>Dự Án Đang Chạy</h3>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {projects.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => handleSelectProject(p.id)}
                        style={{ 
                            padding: "12px", borderRadius: 8, cursor: "pointer",
                            background: p.id === projectId ? "#e6f7ff" : "transparent",
                            border: p.id === projectId ? "1px solid #1890ff" : "1px solid #eee",
                            fontWeight: p.id === projectId ? "bold" : "normal",
                            color: p.id === projectId ? "#1877f2" : "#333",
                            transition: "all 0.2s"
                        }}
                    >
                        {p.name}
                    </div>
                ))}
            </div>
        </div>

        {/* MAIN CONTENT: DANH SÁCH BÀI NỘP (BÊN PHẢI) */}
        <div style={{ flex: 1, background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: 30, overflowY: "auto" }}>
            {selectedProject && (
                <>
                    <h2 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
                        Bài nộp: {selectedProject.name}
                    </h2>
                    
                    <div style={{ display: "grid", gap: 15 }}>
                        {submissions.length === 0 && <p style={{color: "#999", textAlign: "center"}}>Chưa có bài nộp nào.</p>}
                        {submissions.map(sub => (
                            <div key={sub.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 20, background: sub.status === "Graded" ? "#f6ffed" : "white" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", gap: 15 }}>
                                        <div style={{ width: 50, height: 50, background: "#f0f0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#666" }}>
                                            {sub.studentName.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: "bold", fontSize: 16 }}>{sub.studentName} <span style={{ fontWeight: "normal", color: "#888", fontSize: 14 }}>({sub.mssv})</span></div>
                                            <div style={{ fontSize: 13, color: "#1890ff", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
                                                <Star size={12} /> Milestone: {sub.milestone}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Nộp lúc: {sub.submittedAt}</div>
                                            
                                            <div style={{ marginTop: 12, background: "#f9fafb", padding: 10, borderRadius: 6, border: "1px dashed #ddd" }}>
                                                <div style={{ fontSize: 11, fontWeight: "bold", color: "#666", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <MessageSquare size={12}/> Lời nhắn từ sinh viên:
                                                </div>
                                                <p style={{ margin: 0, fontSize: 13, color: "#333", fontStyle: "italic" }}>"{sub.studentNote}"</p>
                                            </div>

                                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#1877f2", cursor: "pointer", textDecoration: "underline" }}>
                                                <FileText size={14}/> File: {sub.file}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        {sub.status === "Graded" ? (
                                            <div>
                                                <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>{sub.grade}/10</div>
                                                <div style={{ fontSize: 12, color: "#52c41a" }}>Đã chấm</div>
                                                <button onClick={() => {setGradingSubmission(sub); setScore(sub.grade); setFeedback(sub.feedback);}} style={{ marginTop: 5, fontSize: 12, background: "transparent", border: "1px solid #ddd", cursor: "pointer", borderRadius: 4 }}>Sửa điểm</button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {setGradingSubmission(sub); setScore(""); setFeedback("");}}
                                                style={{ padding: "8px 20px", background: "#1877f2", color: "white", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer" }}
                                            >
                                                Chấm điểm
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>

        {/* MODAL CHẤM ĐIỂM */}
        {gradingSubmission && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
                <div style={{ background: "white", width: 500, padding: 30, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h3 style={{ margin: 0 }}>Chấm điểm: {gradingSubmission.studentName}</h3>
                        <X style={{ cursor: "pointer" }} onClick={() => setGradingSubmission(null)} />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Điểm số (Thang 10)</label>
                        <input 
                            type="number" 
                            max={10} min={0}
                            value={score} 
                            onChange={e => setScore(e.target.value)} 
                            style={{ width: "100%", padding: 12, fontSize: 16, borderRadius: 6, border: "1px solid #ddd" }}
                            placeholder="Nhập điểm..." 
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Nhận xét / Feedback</label>
                        <textarea 
                            value={feedback} 
                            onChange={e => setFeedback(e.target.value)} 
                            style={{ width: "100%", padding: 12, height: 100, borderRadius: 6, border: "1px solid #ddd" }}
                            placeholder="Nhập nhận xét cho sinh viên..." 
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                        <button onClick={() => setGradingSubmission(null)} style={{ padding: "10px 20px", background: "#f0f0f0", border: "none", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
                        <button onClick={submitGrade} style={{ padding: "10px 30px", background: "#52c41a", color: "white", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                            <Check size={16}/> Lưu Kết Quả
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}