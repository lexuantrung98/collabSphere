import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseApi from '../../../api/courseApi';
import { toast } from 'react-toastify';
import { getToken } from '../../../utils/authStorage';

interface Class {
  id: number;
  name: string;
  code: string;
  subjectId: number;
  subjectName?: string;
  semester: string;
  year: number;
  studentCount?: number;
}

interface ClassMember {
  id: number;
  userId: string;
  studentCode?: string;
  fullName?: string;
  email?: string;
}

interface Syllabus {
  id: number;
  fileName: string;
  uploadedBy?: string;
  uploadedAt: string;
  subjectId: number;
}

export default function LecturerClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loadingSyllabuses, setLoadingSyllabuses] = useState(false);

  const getUserEmail = () => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email || payload.sub || '';
      } catch {
        console.error('Failed to parse token');
        return '';
      }
    }
    return '';
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await courseApi.getClasses();
      let data = response.data?.data || response.data || [];
      
      // Filter by current lecturer email
      const userEmail = getUserEmail();
      if (userEmail) {
        data = data.filter((c: Class & { lecturerEmail?: string }) => 
          c.lecturerEmail === userEmail
        );
      }
      
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Lỗi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const loadClassMembers = async (classId: number) => {
    setLoadingMembers(true);
    try {
      const response = await courseApi.getClassMembers(classId);
      const data = response.data?.data || response.data || [];
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Lỗi tải danh sách sinh viên');
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadSyllabuses = async (subjectId: number) => {
    setLoadingSyllabuses(true);
    try {
      const response = await courseApi.getSyllabusBySubject(subjectId);
      
      // Parse response data
      let data = [];
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response)) {
        data = response;
      }
      
      setSyllabuses(data);
    } catch (error) {
      console.error('Error loading syllabuses:', error);
      setSyllabuses([]);
    } finally {
      setLoadingSyllabuses(false);
    }
  };

  const handleDownloadSyllabus = async (syllabusId: number, fileName: string) => {
    try {
      const response = await courseApi.downloadSyllabus(syllabusId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Tải file thành công!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Lỗi tải file');
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewClass = (classId: number) => {
    setSelectedClass(classId);
    const currentClass = classes.find(c => c.id === classId);
    loadClassMembers(classId);
    
    // Load syllabuses if we have subjectId
    if (currentClass?.subjectId) {
      loadSyllabuses(currentClass.subjectId);
    }
  };

  const handleBack = () => {
    setSelectedClass(null);
    setMembers([]);
  };

  if (selectedClass) {
    const currentClass = classes.find(c => c.id === selectedClass);
    
    return (
      <div>
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
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
                fontWeight: 600
              }}
            >
              ← Quay lại danh sách lớp
            </button>
            <button
              onClick={() => navigate(`/lecturer/projects/create?classId=${selectedClass}`)}
              style={{
                padding: '10px 20px',
                background: '#52c41a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              📁 Tạo dự án mới
            </button>
          </div>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>
            Chi tiết lớp: {currentClass?.name}
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>
            {currentClass?.code} • {currentClass?.semester} - {currentClass?.year}
          </p>
        </div>

        {/* Giáo trình section */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: 20
        }}>
          <h2 style={{ fontSize: 20, margin: '0 0 16px 0', color: '#333' }}>📚 Giáo trình môn học</h2>
          
          {loadingSyllabuses ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p>Đang tải giáo trình...</p>
            </div>
          ) : syllabuses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p style={{ fontSize: 16 }}>Chưa có giáo trình nào</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Tên file</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Người upload</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Ngày upload</th>
                  <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {syllabuses.map((syllabus) => (
                  <tr key={syllabus.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 12, fontWeight: 500 }}>
                      📄 {syllabus.fileName}
                    </td>
                    <td style={{ padding: 12, color: '#666' }}>
                      {syllabus.uploadedBy || 'N/A'}
                    </td>
                    <td style={{ padding: 12, color: '#666' }}>
                      {new Date(syllabus.uploadedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDownloadSyllabus(syllabus.id, syllabus.fileName)}
                        style={{
                          padding: '6px 12px',
                          background: '#1890ff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        ⬇️ Tải xuống
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Danh sách sinh viên section */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginBottom: 20
        }}>
          <h2 style={{ fontSize: 20, margin: '0 0 16px 0', color: '#333' }}>👥 Danh sách Sinh viên</h2>
          
          {loadingMembers ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p>Đang tải...</p>
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <p style={{ fontSize: 16 }}>Chưa có sinh viên nào trong lớp</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>STT</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Mã SV</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Họ tên</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 12 }}>{index + 1}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{
                        padding: '4px 8px',
                        background: '#e7f3ff',
                        color: '#1890ff',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {member.studentCode || member.userId}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontWeight: 500 }}>{member.fullName || 'N/A'}</td>
                    <td style={{ padding: 12, color: '#666' }}>{member.email || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{
          padding: '12px 16px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ color: '#0369a1', fontSize: 14, margin: 0 }}>
            📊 Tổng số sinh viên: <strong>{members.length}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Lớp học của tôi</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Xem danh sách lớp học được phân công</p>
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
        ) : classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏫</div>
            <p style={{ fontSize: 16, marginBottom: 10 }}>Bạn chưa được phân công lớp học nào</p>
            <p style={{ fontSize: 14 }}>Vui lòng liên hệ quản trị viên để được phân công</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => handleViewClass(classItem.id)}
                style={{
                  padding: 20,
                  background: '#fafafa',
                  border: '1px solid #e8e8e8',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.background = '#f5f9ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e8e8e8';
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{
                        padding: '4px 10px',
                        background: '#e7f3ff',
                        color: '#1890ff',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        marginRight: 8
                      }}>
                        {classItem.code || `C${classItem.id}`}
                      </span>
                      <span style={{
                        fontSize: 13,
                        color: '#999'
                      }}>
                        {classItem.semester} - {classItem.year}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px 0', color: '#333' }}>
                      {classItem.name}
                    </h3>
                    <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
                      📖 {classItem.subjectName || 'Chưa có môn học'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      padding: '8px 16px',
                      background: '#f0f9ff',
                      color: '#667eea',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      👥 {classItem.studentCount || 0} SV
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: '#667eea',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      Xem chi tiết →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && classes.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ color: '#0369a1', fontSize: 14, margin: 0 }}>
            📊 Bạn đang giảng dạy <strong>{classes.length}</strong> lớp học
          </p>
        </div>
      )}
    </div>
  );
}
