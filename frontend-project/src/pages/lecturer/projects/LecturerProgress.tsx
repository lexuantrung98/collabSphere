import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getAllProjects, getProjectById, getGroupsByProject, getSubmissionsByProject, 
  gradeSubmission, mockStudentSubmit, 
  type ProjectTemplate, type ProjectGroup, type Submission 
} from "../../../api/projectApi";
import { ArrowLeft, Check, X, Clock, CheckCircle, AlertCircle, FileText, Award, TrendingUp, ChevronRight } from "lucide-react";
import { toast } from 'react-toastify';

export default function LecturerProgress() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectTemplate | null>(null);
  const [projects, setProjects] = useState<ProjectTemplate[]>([]); // Danh sách projects để chọn
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false); // Đổi từ true sang false
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (!projectId) {
        // Không có projectId -> load danh sách projects
        const allProjects = await getAllProjects();
        const activeProjects = allProjects.filter(p => p.status === 1);
        setProjects(activeProjects);
        setLoading(false);
        return;
      }
      
      // Có projectId -> load chi tiết
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const dataPromise = Promise.all([
        getProjectById(projectId),
        getGroupsByProject(projectId).catch(() => []),
        getSubmissionsByProject(projectId).catch(() => [])
      ]);
      
      const [proj, allG, allS] = await Promise.race([dataPromise, timeoutPromise]) as [ProjectTemplate | null, ProjectGroup[], Submission[]];
      
      setProject(proj);
      setGroups(Array.isArray(allG) ? allG : []);
      setSubmissions(Array.isArray(allS) ? allS : []);
    } catch (err) {
      if (err instanceof Error && err.message === 'Timeout') {
        toast.error("Tải dữ liệu quá lâu. Vui lòng thử lại.");
      } else {
        toast.error("Lỗi tải dữ liệu");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const findSub = (groupId: string, milestoneId: string) => {
    return submissions.find(s => s.projectGroupId === groupId && s.projectMilestoneId === milestoneId);
  };

  const handleOpenGrade = (sub: Submission) => {
    setSelectedSubmission(sub);
    setScore(sub.grade || 0);
    setComment(sub.feedback || "");
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    if (score < 0 || score > 10) {
      toast.error("Điểm phải từ 0-10!");
      return;
    }
    try {
      await gradeSubmission(selectedSubmission.id, score, comment);
      toast.success("Đã lưu điểm!");
      setSelectedSubmission(null);
      loadData();
    } catch {
      toast.error("Lỗi khi lưu điểm");
    }
  };

  const handleMockSubmit = async (groupId: string, milestoneId: string) => {
    const content = prompt("Nhập nội dung bài nộp giả lập (Link drive, github...):");
    if (content) {
      try {
        await mockStudentSubmit(groupId, milestoneId, content);
        toast.success("Đã tạo bài nộp mock!");
        loadData();
      } catch {
        toast.error("Lỗi tạo bài nộp");
      }
    }
  };

  // Stats
  const milestones = project?.milestones || [];
  const totalCells = groups.length * milestones.length;
  const submittedCells = submissions.length;
  const gradedCells = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
  const overallProgress = totalCells > 0 ? Math.round((submittedCells / totalCells) * 100) : 0;

  // Case 1: Không có projectId -> hiển thị danh sách projects để chọn
  if (!projectId) {
    return (
      <div style={{ minHeight: "100%" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#333" }}>Xem tiến độ dự án</h1>
          <p style={{ margin: "5px 0 0 0", color: "#888" }}>Chọn dự án để xem tiến độ</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <div style={{ textAlign: "center", color: "#999" }}>
              <div style={{ width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: "4px solid #667eea", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              Đang tải...
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ background: "white", padding: 60, borderRadius: 16, textAlign: "center", color: "#999" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p>Chưa có dự án nào đang hoạt động</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
            {projects.map((p) => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/lecturer/projects/progress/${p.id}`)}
                style={{ 
                  background: "white", 
                  padding: 24, 
                  borderRadius: 16, 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "1px solid transparent"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(102,126,234,0.15)"; e.currentTarget.style.borderColor = "#667eea" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "transparent" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ 
                    background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", 
                    color: "#389e0d", 
                    padding: "4px 12px", 
                    borderRadius: 12, 
                    fontSize: 12, 
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}>
                    <CheckCircle size={12} /> Đang chạy
                  </span>
                  <span style={{ fontSize: 13, color: "#999" }}>{p.subjectId}</span>
                </div>
                
                <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 600, color: "#333" }}>{p.name}</h3>
                <p style={{ color: "#777", fontSize: 14, margin: "0 0 16px 0", lineHeight: 1.5 }}>
                  {p.description || "Chưa có mô tả"}
                </p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#888" }}>
                    {p.milestones?.length || 0} milestones
                  </span>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6, 
                    color: "#667eea", 
                    fontWeight: 600, 
                    fontSize: 14 
                  }}>
                    Xem tiến độ <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Case 2: Đang loading data cho project cụ thể
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center", color: "#999" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: "4px solid #667eea", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
          Đang tải...
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Case 3: Không tìm thấy project
  if (!project) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#999" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <p>Không tìm thấy dự án</p>
        <button 
          onClick={() => navigate("/lecturer/projects/progress")}
          style={{ marginTop: 16, padding: "10px 20px", background: "#667eea", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button 
          onClick={() => navigate("/lecturer/projects")} 
          style={{ 
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", 
            color: "#667eea", cursor: "pointer", fontSize: 14,
            fontWeight: 500, marginBottom: 12, padding: 0
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#333" }}>Tiến độ dự án</h1>
        <p style={{ margin: "5px 0 0 0", color: "#888" }}>{project.name}</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{overallProgress}%</div>
            <div style={{ fontSize: 13, color: "#888" }}>Tiến độ chung</div>
          </div>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={24} color="#1890ff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{submittedCells}</div>
            <div style={{ fontSize: 13, color: "#888" }}>Bài nộp</div>
          </div>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f6ffed", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={24} color="#52c41a" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{gradedCells}</div>
            <div style={{ fontSize: 13, color: "#888" }}>Đã chấm</div>
          </div>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fffbe6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={24} color="#faad14" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#333" }}>{submittedCells - gradedCells}</div>
            <div style={{ fontSize: 13, color: "#888" }}>Chờ chấm</div>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#333" }}>Bảng tiến độ theo nhóm & milestone</h3>
        </div>
        
        {groups.length === 0 || milestones.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#999" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <p>Chưa có dữ liệu nhóm hoặc milestone</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", padding: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ 
                    padding: 14, 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                    color: "white",
                    textAlign: "left", 
                    fontWeight: 600,
                    borderRadius: "10px 0 0 0",
                    minWidth: 150
                  }}>
                    Nhóm
                  </th>
                  {milestones.map((m, idx) => (
                    <th 
                      key={m.id} 
                      style={{ 
                        padding: 14, 
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                        color: "white",
                        textAlign: "center", 
                        fontWeight: 600,
                        minWidth: 140,
                        borderRadius: idx === milestones.length - 1 ? "0 10px 0 0" : 0
                      }}
                    >
                      <div>{m.title}</div>
                      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                        {m.deadline ? new Date(m.deadline).toLocaleDateString('vi-VN') : ''}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((g, gIdx) => (
                  <tr key={g.id} style={{ background: gIdx % 2 === 0 ? "#fafbfc" : "white" }}>
                    <td style={{ padding: 14, borderBottom: "1px solid #f0f0f0", fontWeight: 600, color: "#333" }}>
                      <div>{g.name}</div>
                      <div style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>
                        {g.members?.length || 0} thành viên
                      </div>
                    </td>
                    
                    {milestones.map(m => {
                      const sub = findSub(g.id, m.id);
                      return (
                        <td key={m.id} style={{ padding: 12, borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                          {sub ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 11, color: "#888" }}>
                                {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                              </span>
                              
                              {sub.grade !== null && sub.grade !== undefined ? (
                                <div style={{ 
                                  display: "flex", alignItems: "center", gap: 4,
                                  background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)", 
                                  border: "1px solid #b7eb8f", 
                                  color: "#389e0d", 
                                  padding: "4px 12px", 
                                  borderRadius: 20, 
                                  fontWeight: 700,
                                  fontSize: 14
                                }}>
                                  <Award size={14} /> {sub.grade}
                                </div>
                              ) : (
                                <span style={{ 
                                  background: "#fffbe6", 
                                  border: "1px solid #ffe58f", 
                                  color: "#d48806", 
                                  padding: "4px 10px", 
                                  borderRadius: 12, 
                                  fontSize: 11,
                                  fontWeight: 500
                                }}>
                                  <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                  Chờ chấm
                                </span>
                              )}

                              <button 
                                onClick={() => handleOpenGrade(sub)}
                                style={{ 
                                  marginTop: 4, padding: "6px 12px", 
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                                  color: "white", border: "none", borderRadius: 6, 
                                  cursor: "pointer", fontSize: 11, fontWeight: 500
                                }}
                              >
                                ✍️ {sub.grade !== null ? "Sửa điểm" : "Chấm điểm"}
                              </button>
                            </div>
                          ) : (
                            <div style={{ color: "#ccc" }}>
                              <AlertCircle size={20} style={{ marginBottom: 4 }} />
                              <div style={{ fontSize: 11 }}>Chưa nộp</div>
                              <button 
                                onClick={() => handleMockSubmit(g.id, m.id)} 
                                style={{ 
                                  fontSize: 10, marginTop: 6, cursor: "pointer", 
                                  border: "1px dashed #d9d9d9", background: "white",
                                  padding: "4px 8px", borderRadius: 4, color: "#888"
                                }}
                              >
                                + Mock
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 30, borderRadius: 16, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#333" }}>Đánh giá bài nộp</h3>
              <X style={{ cursor: "pointer", color: "#999" }} onClick={() => setSelectedSubmission(null)} />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: "#333" }}>Nội dung bài làm:</label>
              <div style={{ padding: 14, background: "#f9fafb", borderRadius: 10, fontStyle: "italic", wordBreak: "break-all", border: "1px solid #f0f0f0", fontSize: 14, color: "#555" }}>
                {selectedSubmission.content || "Không có nội dung"}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: "#333" }}>Điểm số (0-10):</label>
              <input 
                type="number" max={10} min={0} step={0.5}
                value={score} onChange={e => setScore(Number(e.target.value))}
                style={{ 
                  width: "100%", padding: 14, borderRadius: 10, 
                  border: "2px solid #e8e8e8", fontSize: 18, 
                  fontWeight: 600, textAlign: "center", outline: "none"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={e => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: 14, color: "#333" }}>Nhận xét:</label>
              <textarea 
                rows={4}
                value={comment} onChange={e => setComment(e.target.value)}
                style={{ 
                  width: "100%", padding: 14, borderRadius: 10, 
                  border: "2px solid #e8e8e8", resize: "none", outline: "none"
                }}
                placeholder="Nhập lời nhận xét cho nhóm..."
                onFocus={e => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={e => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button 
                onClick={() => setSelectedSubmission(null)} 
                style={{ padding: "12px 24px", background: "#f0f0f0", border: "none", borderRadius: 8, cursor: "pointer" }}
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveGrade} 
                style={{ 
                  padding: "12px 32px", 
                  background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)", 
                  color: "white", border: "none", borderRadius: 8, 
                  cursor: "pointer", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6
                }}
              >
                <Check size={18} /> Lưu điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
