import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getAllProjects, 
  createGroup, 
  addMemberToGroup, 
  assignClassToProject,
  getGroupsByProject,
  getSubmissionsByProject
} from "../../api/projectApi";
import { 
  Search, Plus, Folder, Clock, 
  Settings, ChevronRight, X, FlaskConical 
} from "lucide-react";

const mockGetClassStudents = async (classId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Array.from({ length: 45 }, (_, i) => ({
    studentId: `HE15${1000 + i}`,
    fullName: `Sinh viên ${classId} - ${i + 1}`,
    email: `student${i}@fe.edu.vn`
  }));
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [inputClassId, setInputClassId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
        const data = await getAllProjects();
        
        const enhancedData = await Promise.all(data.map(async (p: any) => {
            let progress = 0;
            try {
                const [groups, submissions] = await Promise.all([
                    getGroupsByProject(p.id).catch(() => []),
                    getSubmissionsByProject(p.id).catch(() => [])
                ]);

                const milestones = p.milestones || [];
                
                if (groups.length > 0 && milestones.length > 0) {
                    const totalExpected = groups.length * milestones.length;
                    const totalSubmitted = submissions.length; 
                    progress = Math.min(100, Math.round((totalSubmitted / totalExpected) * 100));
                }
            } catch (e) {
                console.error("Lỗi tính tiến độ dự án " + p.id, e);
            }

            return { ...p, progress };
        }));

        setProjects(enhancedData);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const getStatusStyle = (status: number) => {
    switch(status) {
        case 0: return { bg: "#fff7e6", text: "#d46b08", label: "Chờ duyệt" };
        case 1: return { bg: "#f6ffed", text: "#389e0d", label: "Đang chạy" };
        default: return { bg: "#fff1f0", text: "#cf1322", label: "Dừng / Hủy" };
    }
  };

  const handleCreateTestGroup = async () => {
    setProcessing(true);
    setProcessLog(["Đang khởi tạo dữ liệu test..."]);

    try {
        const testClassId = "SE_TEST_01";
        
        setProcessLog(prev => [...prev, `Gán lớp ${testClassId} vào dự án...`]);
        await assignClassToProject(selectedProject.id, testClassId);

        const groupName = "Nhóm Test Demo";
        setProcessLog(prev => [...prev, `Đang tạo nhóm: ${groupName}...`]);
        const newGroup = await createGroup(selectedProject.id, groupName, testClassId);
        
        if (newGroup && newGroup.id) {
            setProcessLog(prev => [...prev, "Thêm HE150001 (Leader)..."]);
            await addMemberToGroup(newGroup.id, "HE150001", "Nguyễn Văn A");

            setProcessLog(prev => [...prev, "Thêm HE150002 (Thành viên)..."]);
            await addMemberToGroup(newGroup.id, "HE150002", "Trần Thị B");
            
            setProcessLog(prev => [...prev, "✅ Tạo dữ liệu test thành công!"]);
            
            setTimeout(() => {
                setIsModalOpen(false);
                setProcessing(false);
                setProcessLog([]);
                alert("Đã tạo nhóm test thành công!");
                loadProjects(); 
            }, 1500);
        }
    } catch (error) {
        console.error(error);
        setProcessLog(prev => [...prev, "❌ Lỗi: Không thể tạo nhóm test."]);
        setProcessing(false);
    }
  };

  const handleAutoGroup = async () => {
    if(!inputClassId.trim()) return alert("Vui lòng nhập mã lớp!");
    
    setProcessing(true);
    setProcessLog(["Đang lấy danh sách sinh viên..."]);

    try {
        await assignClassToProject(selectedProject.id, inputClassId);
        setProcessLog(prev => [...prev, `Đã gán lớp ${inputClassId} vào dự án.`]);

        const students = await mockGetClassStudents(inputClassId);
        setProcessLog(prev => [...prev, `Tìm thấy ${students.length} sinh viên.`]);

        const chunkSize = 10;
        const chunks = [];
        for (let i = 0; i < students.length; i += chunkSize) {
            chunks.push(students.slice(i, i + chunkSize));
        }

        for (let i = 0; i < chunks.length; i++) {
            const groupName = `Group ${i + 1} - ${inputClassId}`;
            const groupMembers = chunks[i];

            setProcessLog(prev => [...prev, `Đang tạo ${groupName}...`]);
            const newGroup = await createGroup(selectedProject.id, groupName, inputClassId);
            
            if(newGroup && newGroup.id) {
                for (const student of groupMembers) {
                    await addMemberToGroup(newGroup.id, student.studentId, student.fullName);
                }
                setProcessLog(prev => [...prev, `-> Đã thêm ${groupMembers.length} thành viên vào ${groupName}`]);
            }
        }

        setProcessLog(prev => [...prev, "✅ Hoàn tất phân nhóm!"]);
        setTimeout(() => {
            setIsModalOpen(false);
            setProcessing(false);
            setProcessLog([]);
            setInputClassId("");
            loadProjects(); 
        }, 2000);

    } catch (error) {
        console.error(error);
        setProcessLog(prev => [...prev, "❌ Có lỗi xảy ra. Vui lòng thử lại."]);
        setProcessing(false);
    }
  };

  const openGroupModal = (e: any, project: any) => {
      e.stopPropagation(); 
      setSelectedProject(project);
      setIsModalOpen(true);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.subjectId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "0 20px 40px 20px" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
            <h1 style={{ margin: 0, fontSize: 26, color: "#1f1f1f" }}>Quản lý Dự án</h1>
            <p style={{ margin: "5px 0 0 0", color: "#8c8c8c" }}>Theo dõi và quản lý các lớp học phần.</p>
        </div>
        <button 
            onClick={() => navigate("/lecturer/create")}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#1890ff", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 10px rgba(24,144,255,0.3)" }}
        >
            <Plus size={18} /> Tạo Đề Tài Mới
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#e6f7ff", color: "#1890ff", display: "flex", alignItems: "center", justifyContent: "center" }}><Folder size={24}/></div>
              <div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>{projects.length}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>Tổng số dự án</div>
              </div>
          </div>
          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.03)", display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#f6ffed", color: "#52c41a", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={24}/></div>
              <div>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>{projects.filter(p => p.status === 1).length}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>Đang hoạt động</div>
              </div>
          </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 8, padding: "8px 12px", width: 300 }}>
                <Search size={18} color="#999" />
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm dự án..."
                    style={{ border: "none", background: "transparent", marginLeft: 10, outline: "none", width: "100%", fontSize: 14 }}
                />
            </div>
        </div>

        {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>Đang tải dữ liệu...</div>
        ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead style={{ background: "#fafafa" }}>
                    <tr>
                        <th style={{ padding: "16px 24px", textAlign: "left", color: "#666", fontWeight: 600 }}>Tên Dự Án</th>
                        <th style={{ padding: "16px 24px", textAlign: "left", color: "#666", fontWeight: 600 }}>Trạng Thái</th>
                        <th style={{ padding: "16px 24px", textAlign: "left", color: "#666", fontWeight: 600 }}>Tiến Độ</th>
                        <th style={{ padding: "16px 24px", textAlign: "right", color: "#666", fontWeight: 600 }}>Cấu hình</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProjects.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: 40, textAlign: "center", color: "#999" }}>Không tìm thấy dự án nào</td></tr>
                    ) : (
                        filteredProjects.map((p) => {
                            const status = getStatusStyle(p.status);
                            return (
                                <tr 
                                    key={p.id} 
                                    onClick={() => navigate(`/lecturer/grade/${p.id}`)} 
                                    style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer", transition: "background 0.2s" }} 
                                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"} 
                                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                                >
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ fontWeight: 600, color: "#333", fontSize: 15 }}>{p.name}</div>
                                        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                                            {p.subjectId}
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <span style={{ background: status.bg, color: status.text, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.text }}></span>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px", width: 200 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: "#666" }}>
                                            <span>Hoàn thành</span>
                                            <span>{p.progress}%</span>
                                        </div>
                                        <div style={{ width: "100%", height: 6, background: "#f0f0f0", borderRadius: 10, overflow: "hidden" }}>
                                            <div style={{ width: `${p.progress}%`, height: "100%", background: p.progress === 100 ? "#52c41a" : "#1890ff", borderRadius: 10 }}></div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                        <button 
                                            onClick={(e) => openGroupModal(e, p)}
                                            style={{ 
                                                display: "inline-flex", alignItems: "center", gap: 6, 
                                                padding: "8px 16px", borderRadius: 6, border: "1px solid #d9d9d9", 
                                                background: "white", color: "#555", cursor: "pointer", fontWeight: 500,
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={e => {e.currentTarget.style.borderColor = "#1890ff"; e.currentTarget.style.color = "#1890ff"}}
                                            onMouseLeave={e => {e.currentTarget.style.borderColor = "#d9d9d9"; e.currentTarget.style.color = "#555"}}
                                        >
                                            <Settings size={16} /> Phân Nhóm
                                        </button>
                                        <div style={{ display: "inline-block", marginLeft: 10, color: "#ccc" }}>
                                            <ChevronRight size={18} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        )}
      </div>

      {isModalOpen && selectedProject && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
              <div style={{ background: "white", padding: 30, borderRadius: 12, width: 500, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                      <h3 style={{ margin: 0 }}>Cấu hình nhóm</h3>
                      {!processing && <X style={{ cursor: "pointer", color: "#999" }} onClick={() => setIsModalOpen(false)} />}
                  </div>

                  {!processing ? (
                      <>
                        <div style={{ marginBottom: 20 }}>
                            <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
                                Bạn có thể tạo nhóm tự động từ danh sách lớp hoặc tạo nhanh một nhóm test để kiểm thử chức năng.
                            </p>
                            
                            <div style={{ background: "#f9fafb", padding: 15, borderRadius: 8, border: "1px solid #eee", marginTop: 15 }}>
                                <label style={{ fontSize: 12, fontWeight: "bold", color: "#333", display: "block", marginBottom: 5 }}>MÃ LỚP (Class ID)</label>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <input 
                                        value={inputClassId}
                                        onChange={e => setInputClassId(e.target.value.toUpperCase())}
                                        placeholder="Ví dụ: SE1801"
                                        style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 16, fontWeight: "bold" }}
                                    />
                                    <button onClick={handleAutoGroup} style={{ padding: "10px 15px", background: "#1890ff", color: "white", border: "none", borderRadius: 6, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                                        <Settings size={16} /> Chạy Auto
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: 15, textAlign: "center", borderTop: "1px dashed #eee", paddingTop: 15 }}>
                                <span style={{fontSize: 12, color: "#999", display: "block", marginBottom: 8}}>Hoặc tạo dữ liệu giả lập để test</span>
                                <button 
                                    onClick={handleCreateTestGroup} 
                                    style={{ width: "100%", padding: "10px", background: "white", border: "1px dashed #52c41a", color: "#52c41a", borderRadius: 6, cursor: "pointer", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
                                >
                                    <FlaskConical size={16} /> Tạo Nhóm Test (Có sẵn Leader HE150001)
                                </button>
                            </div>
                        </div>
                      </>
                  ) : (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                          <div style={{ width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: "4px solid #1890ff", borderRadius: "50%", margin: "0 auto 20px auto", animation: "spin 1s linear infinite" }}></div>
                          <h4 style={{ margin: "0 0 10px 0", color: "#1890ff" }}>Đang xử lý...</h4>
                          <div style={{ height: 150, overflowY: "auto", background: "#f5f5f5", padding: 10, borderRadius: 6, textAlign: "left", fontSize: 12, color: "#555", border: "1px solid #eee" }}>
                              {processLog.map((log, idx) => (
                                  <div key={idx} style={{ marginBottom: 4 }}>{log}</div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}