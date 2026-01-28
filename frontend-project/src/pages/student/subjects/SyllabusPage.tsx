import { useState, useEffect, useCallback } from 'react';
import courseApi from '../../../api/courseApi';
import { toast } from 'react-toastify';

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface Syllabus {
  id: number;
  subjectId: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export default function StudentSyllabusPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(0);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSyllabuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseApi.getSyllabusBySubject(selectedSubjectId);
      setSyllabuses((data as {data?: Syllabus[]}).data || (data as unknown as Syllabus[]) || []);
    } catch {
      console.log('No syllabus found');
      setSyllabuses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  // Load syllabuses when subject is selected
  useEffect(() => {
    if (selectedSubjectId > 0) {
      loadSyllabuses();
    } else {
      setSyllabuses([]);
    }
  }, [selectedSubjectId, loadSyllabuses]);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  // Load subjects từ classes mà sinh viên đã đăng ký
  useEffect(() => {
    const loadEnrolledSubjects = async () => {
      try {
        // Lấy email từ token
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const studentEmail = payload.email || payload.name;
        
        // Lấy danh sách lớp học của sinh viên
        const classesData = await courseApi.getClassesByStudent(studentEmail);
        const classes = (classesData as {data?: unknown[]}).data || (classesData as unknown as unknown[]) || [];
        
        // Extract unique subjects từ classes
        const uniqueSubjects = new Map<number, Subject>();
        classes.forEach((classItem: unknown) => {
          const item = classItem as { subject?: Subject };
          if (item.subject) {
            uniqueSubjects.set(item.subject.id, {
              id: item.subject.id,
              code: item.subject.code,
              name: item.subject.name
            });
          }
        });
        
        setSubjects(Array.from(uniqueSubjects.values()));
      } catch (error) {
        console.error('Error loading enrolled subjects:', error);
        toast.error('Lỗi tải danh sách môn học');
      }
    };
    loadEnrolledSubjects();
  }, []);

  const handleDownload = async (syllabusId: number, fileName: string) => {
    try {
      const response = await courseApi.downloadSyllabus(syllabusId);
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tải xuống thành công!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Lỗi tải file');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Giáo trình môn học</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Xem và tải giáo trình của các môn học</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Chọn môn học:</label>
        <select 
          value={selectedSubjectId} 
          onChange={(e) => setSelectedSubjectId(Number(e.target.value))} 
          style={{ width: '100%', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
        >
          <option value={0}>-- Chọn môn học để xem giáo trình --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} - {subject.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubjectId > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '2px solid #f0f0f0'
          }}>
            <h3 style={{ margin: 0, color: '#333' }}>
              📚 Giáo trình môn: <span style={{ color: '#667eea' }}>{selectedSubject?.name}</span>
            </h3>
            <span style={{ 
              padding: '6px 12px', 
              background: '#e7f3ff', 
              color: '#1890ff', 
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600
            }}>
              {syllabuses.length} giáo trình
            </span>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <p style={{ fontSize: 16 }}>Đang tải...</p>
            </div>
          ) : syllabuses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <p style={{ fontSize: 16, marginBottom: 10 }}>Chưa có giáo trình nào cho môn học này</p>
              <p style={{ fontSize: 14 }}>Vui lòng liên hệ giảng viên hoặc staff để được hỗ trợ</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {syllabuses.map((syllabus) => (
                <div
                  key={syllabus.id}
                  style={{
                    padding: 20,
                    background: '#fafafa',
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.background = '#f5f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      background: '#e7f3ff', 
                      borderRadius: 8, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: 24
                    }}>
                      📄
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 600, color: '#333' }}>
                        {syllabus.fileName}
                      </h4>
                      <p style={{ margin: '0 0 2px 0', fontSize: 13, color: '#888' }}>
                        Người đăng tải: <strong>{syllabus.uploadedBy || 'N/A'}</strong>
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                        Ngày đăng tải: {new Date(syllabus.uploadedAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(syllabus.id, syllabus.fileName)}
                    style={{
                      padding: '10px 20px',
                      background: '#52c41a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#389e0d';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#52c41a';
                    }}
                  >
                    📥 Tải xuống
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSubjectId === 0 && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 40, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
          <h2 style={{ fontSize: 20, color: '#333', marginBottom: 10 }}>Chọn môn học để xem giáo trình</h2>
          <p style={{ color: '#999', fontSize: 14 }}>
            Sử dụng dropdown phía trên để chọn môn học và xem danh sách giáo trình
          </p>
        </div>
      )}
    </div>
  );
}
