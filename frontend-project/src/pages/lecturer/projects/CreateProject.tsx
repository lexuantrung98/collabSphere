import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, type CreateProjectRequest } from "../../../api/projectApi";
import courseApi from "../../../api/courseApi";
import { Plus, Trash2, Calendar, FileText, BookOpen, Box, Clock, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

interface Subject {
  id: number;
  code: string;
  name: string;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subjectId: "",
    deadline: ""
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [milestones, setMilestones] = useState<any[]>([
    { title: "", deadline: "", description: "" }
  ]);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await courseApi.getSubjects();
        const subjectsList = response.data?.data || response.data || [];
        setSubjects(subjectsList);
      } catch (error) {
        console.error('Error loading subjects:', error);
        toast.error('Không thể tải danh sách môn học');
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, []);

  // When subject selected, update subjectId
  const handleSubjectChange = (subjectCode: string) => {
    setFormData(prev => ({
      ...prev,
      subjectId: subjectCode
    }));
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: "", deadline: "", description: "" }]);
  };

  const handleRemoveMilestone = (index: number) => {
    const newMs = milestones.filter((_, i) => i !== index);
    setMilestones(newMs);
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    const newMs = [...milestones];
    newMs[index][field] = value;
    setMilestones(newMs);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if(!formData.name) return toast.error("Vui lòng điền tên đề tài.");
    if(!formData.subjectId) return toast.error("Vui lòng chọn môn học.");
    const validMilestones = milestones.filter(m => m.title && m.deadline);
    if(validMilestones.length === 0) return toast.error("Vui lòng tạo ít nhất một cột mốc có tên và hạn chót.");

    try {
        // Format milestones theo đúng backend yêu cầu
        const formattedMilestones = validMilestones.map((m, index) => ({
            title: m.title,
            description: m.description || "",
            orderIndex: index,
            deadline: m.deadline ? new Date(m.deadline).toISOString() : null,
            questions: []
        }));

        const payload = {
            subjectId: formData.subjectId,
            name: formData.name,
            description: formData.description || "",
            deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
            milestones: formattedMilestones
        };
        
        const response = await createProject(payload as unknown as CreateProjectRequest);
        await response.data; // Ensure request completes
        
        toast.success("Tạo dự án và thiết lập lộ trình thành công!");
        navigate("/lecturer/projects");
    } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tạo dự án. Vui lòng thử lại.");
    }
  };
  const inputWrapperStyle = {
      display: "flex",
      alignItems: "center",
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: "0 12px",
      transition: "all 0.2s",
  };

  const inputStyle = {
      flex: 1,
      border: "none",
      background: "transparent",
      padding: "12px 8px",
      fontSize: 14,
      outline: "none",
      color: "#374151"
  };

  return (
    <div style={{ padding: "20px 40px", background: "#f8f9fa", minHeight: "100%" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 8px 0" }}>Khởi Tạo Đề Tài Mới</h1>
            <p style={{ color: "#6b7280", margin: 0 }}>Thiết lập thông tin dự án và xây dựng lộ trình thực hiện cho sinh viên.</p>
        </div>

        <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr" }}>
                
                {/* CỘT TRÁI: THÔNG TIN CHUNG */}
                <div style={{ padding: 40, borderRight: "1px solid #f3f4f6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 25 }}>
                        <div style={{ background: "#e6f7ff", padding: 8, borderRadius: 8, color: "#1890ff" }}><Box size={20}/></div>
                        <h3 style={{ margin: 0, fontSize: 18, color: "#374151" }}>Thông tin cơ bản</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#4b5563" }}>Tên đề tài <span style={{color:"red"}}>*</span></label>
                            <div style={inputWrapperStyle}>
                                <FileText size={18} color="#9ca3af"/>
                                <input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    style={inputStyle}
                                    placeholder="Ví dụ: Xây dựng hệ thống CRM..."
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#4b5563" }}>Môn học <span style={{color:"red"}}>*</span></label>
                            <div style={{...inputWrapperStyle, position: "relative"}}>
                                <BookOpen size={18} color="#9ca3af"/>
                                <select 
                                    value={formData.subjectId || ""}
                                    onChange={e => handleSubjectChange(e.target.value)}
                                    style={{
                                        ...inputStyle, 
                                        cursor: "pointer",
                                        minWidth: "100%",
                                        whiteSpace: "normal"
                                    }}
                                    disabled={loadingSubjects}
                                >
                                    <option value="">{loadingSubjects ? "Đang tải..." : "-- Chọn môn học --"}</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.code}>
                                            {subject.code} - {subject.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0 0" }}>
                                💡 Trưởng phòng sẽ phân công lớp học sau khi duyệt đề tài
                            </p>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#4b5563" }}>Hạn nộp tổng <span style={{color:"red"}}>*</span></label>
                            <div style={inputWrapperStyle}>
                                <Calendar size={18} color="#9ca3af"/>
                                <input 
                                    type="date"
                                    value={formData.deadline || ''}
                                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                                    style={inputStyle}
                                    placeholder="Chọn hạn nộp tổng"
                                />
                            </div>
                            <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0 0" }}>
                                ⏰ Thời hạn cuối cùng để hoàn thành toàn bộ dự án
                            </p>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#4b5563" }}>Mô tả chi tiết yêu cầu</label>
                            <div style={{...inputWrapperStyle, alignItems: "flex-start", padding: "12px"}}>
                                <FileText size={18} color="#9ca3af" style={{marginTop: 4}}/>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    style={{...inputStyle, padding: "0 8px", resize: "vertical", height: 150, fontFamily: "inherit"}}
                                    placeholder="Mô tả mục tiêu, phạm vi và các yêu cầu kỹ thuật của đề tài..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TIMELINE MILESTONES */}
                <div style={{ padding: 40, background: "#fafafa" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 25 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ background: "#fff1f0", padding: 8, borderRadius: 8, color: "#ff4d4f" }}><Calendar size={20}/></div>
                            <h3 style={{ margin: 0, fontSize: 18, color: "#374151" }}>Lộ trình & Cột mốc</h3>
                        </div>
                    </div>
                    
                    <div style={{ position: "relative", paddingLeft: 20 }}>
                        {/* Đường kẻ dọc timeline */}
                        <div style={{ position: "absolute", left: 14, top: 10, bottom: 30, width: 2, background: "#e5e7eb" }}></div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {milestones.map((ms, index) => (
                                <div key={index} style={{ position: "relative", display: "flex", gap: 15 }}>
                                    {/* Node tròn trên timeline */}
                                    <div style={{ zIndex: 2, width: 30, height: 30, borderRadius: "50%", background: "#1877f2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 14, border: "4px solid #fafafa" }}>
                                        {index + 1}
                                    </div>
                                    
                                    {/* Card nhập liệu milestone */}
                                    <div style={{ flex: 1, background: "white", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 2px 5px rgba(0,0,0,0.03)", position: "relative" }}>
                                        {milestones.length > 1 && (
                                            <button onClick={() => handleRemoveMilestone(index)} style={{ position: "absolute", right: 10, top: 10, border: "none", background: "transparent", color: "#9ca3af", cursor: "pointer", padding: 4 }} title="Xóa mốc này">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        
                                        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 15, marginBottom: 15 }}>
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4, display: "block" }}>Tên giai đoạn <span style={{color:"red"}}>*</span></label>
                                                <input 
                                                    value={ms.title}
                                                    onChange={e => handleMilestoneChange(index, 'title', e.target.value)}
                                                    placeholder="VD: Nộp báo cáo Requirement"
                                                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <Clock size={12}/> Hạn chót <span style={{color:"red"}}>*</span>
                                                </label>
                                                <input 
                                                    type="date"
                                                    value={ms.deadline}
                                                    onChange={e => handleMilestoneChange(index, 'deadline', e.target.value)}
                                                    style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "inherit" }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                             <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4, display: "block" }}>Yêu cầu đầu ra (Deliverables)</label>
                                             <input 
                                                value={ms.description}
                                                onChange={e => handleMilestoneChange(index, 'description', e.target.value)}
                                                placeholder="VD: File PDF báo cáo, Diagram ảnh..."
                                                style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                                             />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         {/* Nút thêm mốc ở cuối timeline */}
                        <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
                             <div style={{ width: 30, display: "flex", justifyContent: "center" }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: "#d1d5db" }}></div></div>
                             <button type="button" onClick={handleAddMilestone} style={{ flex: 1, padding: "12px", background: "white", border: "2px dashed #d1d5db", borderRadius: 12, color: "#6b7280", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                                <Plus size={18}/> Thêm cột mốc tiếp theo
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER SUBMIT */}
            <div style={{ padding: "20px 40px", background: "#fff", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 20 }}>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Đã thiết lập <strong style={{color: "#1877f2"}}>{milestones.length}</strong> cột mốc</div>
                <button onClick={handleSubmit} style={{ padding: "12px 36px", background: "linear-gradient(to right, #1877f2, #1659b8)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(24, 119, 242, 0.3)" }}>
                    <CheckCircle size={18} /> Hoàn tất & Tạo Dự Án
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
