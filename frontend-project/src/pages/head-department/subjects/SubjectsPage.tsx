import { useState, useEffect, useCallback } from 'react';
import courseApi from '../../../api/courseApi';
import { toast } from 'react-toastify';
import { ArrowLeft, Download } from 'lucide-react';

interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string;
}

interface Syllabus {
  id: number;
  subjectId: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export default function HeadDepartmentSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loadingSyllabuses, setLoadingSyllabuses] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await courseApi.getSubjects();
      const data = response.data?.data || response.data || [];
      setSubjects(data);
    } catch {
      toast.error('Lỗi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const loadSyllabuses = useCallback(async (subjectId: number) => {
    setLoadingSyllabuses(true);
    try {
      const data = await courseApi.getSyllabusBySubject(subjectId);
      setSyllabuses((data as {data?: Syllabus[]}).data || (data as unknown as Syllabus[]) || []);
    } catch {
      setSyllabuses([]);
    } finally {
      setLoadingSyllabuses(false);
    }
  }, []);

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    loadSyllabuses(subject.id);
  };

  const handleBackToList = () => {
    setSelectedSubject(null);
    setSyllabuses([]);
  };

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
    } catch {
      toast.error('Lỗi tải file');
    }
  };

  // Show syllabuses view if subject is selected
  if (selectedSubject) {
    return (
      <div>
        <div style={{ marginBottom: 30 }}>
          <button
            onClick={handleBackToList}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: 6,
              cursor: 'pointer',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft size={16} />
            Quay lại danh sách môn học
          </button>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>
            Giáo trình môn: {selectedSubject.name}
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            {selectedSubject.code} • {selectedSubject.credits} tín chỉ
          </p>
        </div>

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
              📚 Danh sách giáo trình
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
          
          {loadingSyllabuses ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <p style={{ fontSize: 16 }}>Đang tải...</p>
            </div>
          ) : syllabuses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <p style={{ fontSize: 16, marginBottom: 10 }}>Chưa có giáo trình nào cho môn học này</p>
              <p style={{ fontSize: 14 }}>Liên hệ Staff hoặc Admin để upload giáo trình</p>
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
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                        Người upload: <strong>{syllabus.uploadedBy || 'N/A'}</strong>
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                        Ngày upload: {new Date(syllabus.uploadedAt).toLocaleString('vi-VN', {
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
                      gap: 8
                    }}
                  >
                    <Download size={16} />
                    Tải xuống
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show subjects list
  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Danh sách Môn học</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Xem tất cả các môn học và giáo trình trong hệ thống</p>
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: 24, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <p style={{ fontSize: 16 }}>Đang tải...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
            <p style={{ fontSize: 16, marginBottom: 10 }}>Chưa có môn học nào</p>
            <p style={{ fontSize: 14 }}>Danh sách môn học sẽ hiển thị tại đây khi có dữ liệu</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSelectSubject(subject)}
                style={{
                  padding: 20,
                  background: '#fff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 12,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e8e8e8';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    padding: '6px 12px',
                    background: '#e7f3ff',
                    color: '#1890ff',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {subject.code}
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    background: '#f0f9ff',
                    color: '#667eea',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {subject.credits} TC
                  </div>
                </div>
                
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0', color: '#333' }}>
                  {subject.name}
                </h3>
                
                {subject.description && (
                  <p style={{ 
                    fontSize: 14, 
                    color: '#666', 
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {subject.description}
                  </p>
                )}
                
                <div style={{
                  marginTop: 12,
                  padding: '6px 12px',
                  background: '#f0f9ff',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#667eea',
                  textAlign: 'center',
                  fontWeight: 600
                }}>
                  📚 Xem giáo trình →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && subjects.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ color: '#0369a1', fontSize: 14, margin: 0 }}>
            📊 Tổng cộng: <strong>{subjects.length}</strong> môn học | <strong>{subjects.reduce((sum, s) => sum + s.credits, 0)}</strong> tín chỉ
          </p>
        </div>
      )}
    </div>
  );
}
