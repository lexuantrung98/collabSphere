import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import courseApi from '../../../api/courseApi';
import { toast } from 'react-toastify';

interface Class {
  id: number;
  name: string;
  code: string;
  subjectName?: string;
  semester: string;
  year: number;
  lecturerName?: string;
  lecturerEmail?: string;
}

export default function StudentClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  const getStudentCode = () => {
    // Try to get from user object in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Return code (mã sinh viên như HE150001)
        if (user.code) return user.code;
        if (user.studentCode) return user.studentCode;
      } catch {
        console.error('Failed to parse user');
      }
    }
    
    // Fallback: try to get from token
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.code || payload.studentCode || payload.sub || '';
      } catch {
        console.error('Failed to parse token');
      }
    }
    
    return '';
  };

  const loadClasses = async () => {
    setLoading(true);
    try {
      // Get studentCode from user object
      const studentCode = getStudentCode();
      console.log('=== DEBUG Student Classes ===');
      console.log('studentCode:', studentCode);
      console.log('localStorage user:', localStorage.getItem('user'));
      
      if (!studentCode) {
        toast.error('Không thể xác định người dùng');
        setClasses([]);
        return;
      }

      // NEW: Use optimized endpoint - no more loop!
      console.log('Calling API: /classes/student/' + studentCode);
      const response = await courseApi.getClassesByStudent(studentCode);
      console.log('API Response:', response.data);
      const data = response.data?.data || response.data || [];
      
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Lỗi tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
            <p style={{ fontSize: 16, marginBottom: 10 }}>Bạn chưa đăng ký lớp học nào</p>
            <p style={{ fontSize: 14 }}>Vui lòng liên hệ giảng viên hoặc quản trị viên để được thêm vào lớp</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                onClick={() => navigate(`/student/classes/${classItem.id}`)}
                style={{
                  padding: 20,
                  background: '#fff',
                  border: '2px solid #e8e8e8',
                  borderRadius: 12,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(102,126,234,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e8e8e8';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    padding: '6px 12px',
                    background: '#667eea',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    marginRight: 8
                  }}>
                    {classItem.code || `C${classItem.id}`}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {classItem.semester} - {classItem.year}
                  </span>
                </div>
                
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px 0', color: '#333' }}>
                  {classItem.name}
                </h3>
                
                <div style={{ 
                  padding: '12px', 
                  background: '#f5f9ff', 
                  borderRadius: 8,
                  marginBottom: 12
                }}>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
                    📖 <strong>Môn học:</strong> {classItem.subjectName || 'Chưa có'} 
                  </div>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    👨‍🏫 <strong>Giảng viên:</strong> {classItem.lecturerName || classItem.lecturerEmail || 'Chưa có'}
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
            🎓 Bạn đang học <strong>{classes.length}</strong> lớp trong học kỳ này
          </p>
        </div>
      )}
    </div>
  );
}
