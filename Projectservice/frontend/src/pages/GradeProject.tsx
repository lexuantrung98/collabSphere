import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gradeSubmission, downloadFile } from "../api/submissionApi";

const logoImage = "/logo2.jpg";

export default function GradeProject() {
  const navigate = useNavigate();

  const [subId, setSubId] = useState(""); 
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!subId) {
        setError("Vui lòng nhập ID bài nộp để tải file.");
        return;
    }
    try {
        setMsg("Đang tải file...");
        await downloadFile(subId, "BaiTapSinhVien.dat"); 
        setMsg("Đã tải file thành công!");
    } catch (err) {
        console.error(err);
        setError("Không tìm thấy file hoặc lỗi server.");
    }
  };

  const handleGrade = async () => {
    if (!subId) {
        setError("Thiếu ID bài nộp.");
        return;
    }
    try {
        await gradeSubmission(subId, score, feedback);
        setMsg("Đã chấm điểm thành công!");
        setError("");
    } catch (err) {
        console.error(err);
        setError("Lỗi khi chấm điểm.");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif" }}>
      
      <div style={{ width: 280, backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", zIndex: 10 }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 80, height: 50, marginRight: 12 }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Lecturer Panel</span>
          </div>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
            <div style={{ padding: "12px 16px", background: "#e7f3ff", color: "#1877f2", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>
                Chấm Điểm (Grading)
            </div>
             <div style={{ padding: "12px 16px", color: "#666", borderRadius: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
                Quay về
            </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 5, marginTop: 0, color: "#333" }}>Chấm Điểm Đồ Án</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>Xem bài làm và đánh giá kết quả.</p>

        {msg && <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 20 }}>{msg}</div>}
        {error && <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: 6, marginBottom: 20 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            
            <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <h3 style={{ marginTop: 0, color: "#1890ff", borderBottom: "1px solid #eee", paddingBottom: 10 }}>1. Chọn Bài Nộp</h3>
                
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Submission ID</label>
                    <input 
                      value={subId} onChange={e => setSubId(e.target.value)}
                      placeholder="Dán ID bài nộp vào đây..."
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
                    />
                </div>

                <button 
                    onClick={handleDownload}
                    style={{ 
                        width: "100%", padding: "10px", background: "#faad14", color: "white", 
                        border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold"
                    }}
                >
                    ⬇ TẢI FILE BÁO CÁO
                </button>
            </div>

            <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <h3 style={{ marginTop: 0, color: "#52c41a", borderBottom: "1px solid #eee", paddingBottom: 10 }}>2. Đánh Giá</h3>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Điểm số (0-10)</label>
                    <input 
                      type="number" step="0.1"
                      value={score} onChange={e => setScore(Number(e.target.value))}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
                    />
                </div>

                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: "block", marginBottom: 6, fontWeight: "bold" }}>Nhận xét / Feedback</label>
                    <textarea 
                      rows={4}
                      value={feedback} onChange={e => setFeedback(e.target.value)}
                      placeholder="Nhập nhận xét chi tiết..."
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, fontFamily: "inherit" }}
                    />
                </div>

                <button 
                    onClick={handleGrade}
                    style={{ 
                        width: "100%", padding: "12px", background: "#52c41a", color: "white", 
                        border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold"
                    }}
                >
                    XÁC NHẬN CHẤM ĐIỂM
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}