import { useState, useEffect } from 'react';
import courseApi from '../../../api/courseApi';
import { toast } from 'react-toastify';

interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string;
}

interface Syllabus {
  id: number;
  title: string;
  description?: string;
  academicYear: string;
  filePath?: string;
}

export default function StudentSubjectsPage() {
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
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Lỗi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const loadSyllabuses = async (subjectId: number) => {
    setLoadingSyllabuses(true);
    try {
      const response = await courseApi.getSyllabusBySubject(subjectId);
      const data = response.data?.data || response.data || [];
      setSyllabuses(data);
    } catch (error) {
      console.error('Error loading syllabuses:', error);
      setSyllabuses([]);
    } finally {
      setLoadingSyllabuses(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    loadSyllabuses(subject.id);
  };

  const handleBack = () => {
    setSelectedSubject(null);
    setSyllabuses([]);
  };

  if (selectedSubject) {
    return (
      <div>
        <div style={{ marginBottom: 30 }}>
          <button
            onClick={handleBack}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: '#667eea',
              border: '1px solid #667eea',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 16
            }}
          >
            ← Quay lại danh sách môn học
          </button>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>
            {selectedSubject.name}
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            {selectedSubject.code} • {selectedSubject.credits} tín chỉ
          </p>
        </div>

        {selectedSubject.description && (
          <div style={{
            background: '#f5f9ff',
            padding: 16,
            borderRadius: 8,
            border: '1px solid #e0f2fe',
            marginBottom: 20
          }}>
            <p style={{ color: '#0369a1', fontSize: 14, margin: 0 }}>
              📝 {selectedSubject.description}
            </p>
          </div>
        )}

        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
        }}>
          <h2 style={{ fontSize: 20, margin: '0 0 16px 0', color: '#333' }}>📚 Giáo trình</h2>
          
          {loadingSyllabuses ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p>Đang tải...</p>
            </div>
          ) : syllabuses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <p style={{ fontSize: 16 }}>Chưa có giáo trình cho môn học này</p>
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
                    borderRadius: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: '#333' }}>
                        📄 {syllabus.title}
                      </h3>
                      {syllabus.description && (
                        <p style={{ fontSize: 14, color: '#666', margin: '0 0 8px 0' }}>
                          {syllabus.description}
                        </p>
                      )}
                      <div style={{ fontSize: 13, color: '#999' }}>
                        Năm học: <strong>{syllabus.academicYear}</strong>
                      </div>
                    </div>
                    {syllabus.filePath && (
                      <div style={{
                        padding: '6px 12px',
                        background: '#52c41a',
                        color: '#fff',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        Có file
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Môn học & Giáo trình</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Xem chi tiết môn học và chương trình học</p>
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
            <p style={{ fontSize: 16 }}>Chưa có môn học nào</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSelectSubject(subject)}
                style={{
                  padding: 20,
                  background: '#fff',
                  border: '1px solid #e8e8e8',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e8e8e8';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    padding: '6px 12px',
                    background: '#e7f3ff',
                    color: '#1890ff',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {subject.code}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    background: '#f0f9ff',
                    color: '#667eea',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    {subject.credits} TC
                  </span>
                </div>
                
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: '#333' }}>
                  {subject.name}
                </h3>
                
                {subject.description && (
                  <p style={{ 
                    fontSize: 13, 
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
                  background: '#667eea',
                  color: '#fff',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  Xem giáo trình →
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
            📚 Tổng cộng: <strong>{subjects.length}</strong> môn học
          </p>
        </div>
      )}
    </div>
  );
}
