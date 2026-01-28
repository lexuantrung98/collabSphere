import { useState, ChangeEvent } from "react"; 
import { useNavigate } from "react-router-dom";
import { submitProject } from "../api/submissionApi";

const logoImage = "/logo2.jpg";

export default function SubmitProject() {
  const navigate = useNavigate();
  
  const [groupId, setGroupId] = useState(""); 
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

 
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!groupId || !desc) {
      setError("Vui lòng nhập Group ID và mô tả!");
      return;
    }

    try {
      setError("");
      setMsg("Đang nộp bài...");
      
      const res = await submitProject(groupId, url, desc, file);
      
      const subId = res?.submissionId || res?.SubmissionId || "Thành công";
      setMsg(`Nộp thành công! ID: ${subId}`);
      
      setUrl("");
      setDesc("");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setError("Lỗi khi nộp bài. Kiểm tra lại ID nhóm hoặc server.");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif" }}>
      
      <div style={{ width: 280, backgroundColor: "#ffffff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", zIndex: 10 }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 80, height: 50, marginRight: 12 }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Student Panel</span>
          </div>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
            <div style={{ padding: "12px 16px", background: "#e7f3ff", color: "#1877f2", borderRadius: 8, fontWeight: "bold", cursor: "pointer", marginBottom: 8 }}>
                Nộp Bài (Submit)
            </div>
            <div style={{ padding: "12px 16px", color: "#666", borderRadius: 8, cursor: "pointer" }} onClick={() => navigate("/")}>
                Quay về
            </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 5, marginTop: 0, color: "#333" }}>Nộp Đồ Án</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>Gửi link Github và file báo cáo cho giảng viên.</p>

        {msg && <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 20 }}>{msg}</div>}
        {error && <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: 6, marginBottom: 20 }}>{error}</div>}

        <div style={{ background: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", maxWidth: 800 }}>
            
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Group ID (Nhóm của bạn)</label>
                <input 
                  value={groupId} 
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="Dán ID nhóm vào đây..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
                />
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Link Source Code</label>
                <input
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
                />
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Mô tả / Ghi chú <span style={{color:"red"}}>*</span></label>
                <textarea 
                  value={desc} 
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  placeholder="Nhập ghi chú..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, fontFamily: "inherit" }}
                />
            </div>

            <div style={{ marginBottom: 30 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>File Báo Cáo</label>
                <div style={{ border: "2px dashed #ddd", padding: 20, borderRadius: 6, textAlign: "center", background: "#fafafa" }}>
                    <input type="file" onChange={handleFileChange} />
                    {file && <p style={{ marginTop: 10, color: "#1890ff" }}>Đã chọn: {file.name}</p>}
                </div>
            </div>

            <button 
                onClick={handleSubmit}
                style={{ 
                    padding: "12px 30px", background: "#1890ff", color: "white", 
                    border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: "pointer", width: "100%"
                }}
            >
                GỬI BÀI
            </button>
        </div>
      </div>
    </div>
  );
}