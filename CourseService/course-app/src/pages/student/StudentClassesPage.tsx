import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClasses } from '../../api/courseApi';
import { toast } from 'react-toastify';

interface ClassItem {
  id: number;
  code: string;
  subjectName?: string;
  subject?: { name: string };
  semester: string;
  year: number;
  lecturerEmail?: string;
}

export default function StudentClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data.data || data || []);
    } catch {
      toast.error('Lỗi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Lớp học đã đăng ký</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Danh sách các lớp học bạn đang tham gia</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <p>Đang tải...</p>
        ) : classes.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Bạn chưa đăng ký lớp học nào</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {classes.map((cls) => (
              <div 
                key={cls.id} 
                style={{ 
                  background: '#f9fafb', 
                  borderRadius: 12, 
                  padding: 20,
                  border: '1px solid #e0e0e0',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ 
                  background: '#18b8f2', 
                  color: '#fff', 
                  padding: '4px 10px', 
                  borderRadius: 4, 
                  display: 'inline-block',
                  fontSize: 12,
                  marginBottom: 10
                }}>
                  {cls.code}
                </div>
                <h3 style={{ margin: '10px 0', color: '#333' }}>
                  {cls.subjectName || cls.subject?.name || 'N/A'}
                </h3>
                <p style={{ color: '#666', fontSize: 14, margin: '5px 0' }}>
                  📅 {cls.semester} - {cls.year}
                </p>
                {cls.lecturerEmail && (
                  <p style={{ color: '#666', fontSize: 14, margin: '5px 0' }}>
                    👨‍🏫 {cls.lecturerEmail}
                  </p>
                )}
                <div style={{ marginTop: 15 }}>
                  <Link to={`/student/resources?classId=${cls.id}`}>
                    <button style={{ 
                      padding: '8px 16px', 
                      background: '#18b8f2', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      cursor: 'pointer',
                      width: '100%',
                      fontWeight: 'bold'
                    }}>
                      📚 Xem tài liệu
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: 20, 
        padding: 16, 
        background: '#d4edda', 
        borderRadius: 8, 
        border: '1px solid #28a745' 
      }}>
        <strong>💡 Mẹo:</strong> Click "Xem tài liệu" để truy cập tài liệu học tập của lớp.
      </div>
    </div>
  );
}
