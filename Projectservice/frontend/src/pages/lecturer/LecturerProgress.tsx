import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProjects, getGroupsByProject, getSubmissionsByProject, gradeSubmission, mockStudentSubmit, ProjectTemplate, ProjectGroup, ProjectSubmission } from "../../api/projectApi";
import LecturerLayout from "../layouts/LecturerLayout";

export default function LecturerProgress() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<ProjectTemplate | null>(null);
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmission | null>(null);
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if(!projectId) return;
    const allP = await getAllProjects();
    setProject(allP.find(p => p.id === projectId) || null);
    
    const allG = await getGroupsByProject(projectId);
    setGroups(allG);

    const allS = await getSubmissionsByProject(projectId);
    setSubmissions(allS);
  };

  const findSub = (groupId: string, milestoneId: string) => {
      return submissions.find(s => s.projectGroupId === groupId && s.projectMilestoneId === milestoneId);
  };

  const handleOpenGrade = (sub: ProjectSubmission) => {
      setSelectedSubmission(sub);
      setScore(sub.grade || 0);
      setComment(sub.feedback || "");
  };

  const handleSaveGrade = async () => {
      if(!selectedSubmission) return;
      try {
          await gradeSubmission(selectedSubmission.id, score, comment);
          alert("✅ Đã lưu điểm!");
          setSelectedSubmission(null);
          loadData();
      } catch(err) {
          alert("Lỗi khi lưu điểm");
      }
  };

  const handleMockSubmit = async (groupId: string, milestoneId: string) => {
      const content = prompt("Nhập nội dung bài nộp giả lập (Link drive, github...):");
      if(content) {
          await mockStudentSubmit(groupId, milestoneId, content);
          loadData();
      }
  };

  if (!project) return <p>Đang tải...</p>;

  return (
    <LecturerLayout title={`Tiến độ: ${project.name}`} subtitle="Theo dõi và chấm điểm các cột mốc">
        <button onClick={() => navigate("/lecturer/projects")} style={{marginBottom: 20, cursor: 'pointer', border: 'none', background: 'none', color: '#1890ff'}}>← Quay lại danh sách</button>

        <div style={{overflowX: 'auto', background: 'white', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 20}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                    <tr style={{background: '#f0f2f5'}}>
                        <th style={{padding: 12, border: '1px solid #ddd', textAlign: 'left', minWidth: 150}}>Nhóm Sinh Viên</th>
                        {project.milestones.map((m: any) => (
                            <th key={m.id} style={{padding: 12, border: '1px solid #ddd', textAlign: 'center', minWidth: 120}}>
                                {m.title} <br/>
                                <span style={{fontSize: 10, color: '#888'}}>{new Date(m.deadline).toLocaleDateString()}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {groups.map(g => (
                        <tr key={g.id}>
                            <td style={{padding: 12, border: '1px solid #ddd', fontWeight: 'bold'}}>{g.name}</td>
                            
                            {/* Render các ô cột mốc tương ứng */}
                            {project.milestones.map((m: any) => {
                                const sub = findSub(g.id, m.id);
                                return (
                                    <td key={m.id} style={{padding: 12, border: '1px solid #ddd', textAlign: 'center'}}>
                                        {sub ? (
                                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5}}>
                                                {/* Trạng thái bài nộp */}
                                                <span style={{fontSize: 11, color: '#555'}}>
                                                    {new Date(sub.submittedAt).toLocaleDateString()}
                                                </span>
                                                
                                                {sub.grade !== null && sub.grade !== undefined ? (
                                                     <span style={{background: '#f6ffed', border: '1px solid #b7eb8f', color: '#389e0d', padding: '2px 8px', borderRadius: 4, fontWeight: 'bold'}}>
                                                        Điểm: {sub.grade}
                                                     </span>
                                                ) : (
                                                    <span style={{background: '#fffbe6', border: '1px solid #ffe58f', color: '#d48806', padding: '2px 8px', borderRadius: 4, fontSize: 11}}>
                                                        Chờ chấm
                                                    </span>
                                                )}

                                                <button 
                                                    onClick={() => handleOpenGrade(sub)}
                                                    style={{marginTop: 5, padding: '4px 8px', background: '#1890ff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11}}
                                                >
                                                    ✍️ Chấm điểm
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{color: '#999', fontSize: 12, fontStyle: 'italic'}}>
                                                Chưa nộp
                                                <br/>
                                                {/* Nút giả lập để test */}
                                                <button onClick={() => handleMockSubmit(g.id, m.id)} style={{fontSize: 10, marginTop: 5, cursor: 'pointer', border: '1px solid #ddd'}}>+ Mock Submit</button>
                                            </div>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* MODAL CHẤM ĐIỂM */}
        {selectedSubmission && (
            <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100}}>
                <div style={{background: 'white', padding: 30, borderRadius: 12, width: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
                    <h3 style={{marginTop: 0, color: '#1890ff'}}>Đánh giá bài nộp</h3>
                    
                    <div style={{marginBottom: 15}}>
                        <label style={{display: 'block', fontWeight: 'bold', marginBottom: 5}}>Nội dung bài làm:</label>
                        <div style={{padding: 10, background: '#f5f5f5', borderRadius: 6, fontStyle: 'italic', wordBreak: 'break-all'}}>
                            {selectedSubmission.content}
                        </div>
                    </div>

                    <div style={{marginBottom: 15}}>
                        <label style={{display: 'block', fontWeight: 'bold', marginBottom: 5}}>Điểm số (0-10):</label>
                        <input 
                            type="number" max={10} min={0}
                            value={score} onChange={e => setScore(Number(e.target.value))}
                            style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd'}}
                        />
                    </div>

                    <div style={{marginBottom: 20}}>
                        <label style={{display: 'block', fontWeight: 'bold', marginBottom: 5}}>Nhận xét / Feedback:</label>
                        <textarea 
                            rows={4}
                            value={comment} onChange={e => setComment(e.target.value)}
                            style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd'}}
                            placeholder="Nhập lời nhận xét cho nhóm..."
                        />
                    </div>

                    <div style={{textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                        <button onClick={() => setSelectedSubmission(null)} style={{padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Hủy</button>
                        <button onClick={handleSaveGrade} style={{padding: '8px 20px', background: '#52c41a', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>LƯU ĐIỂM</button>
                    </div>
                </div>
            </div>
        )}

    </LecturerLayout>
  );
}