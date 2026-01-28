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

export default function LecturerClassesPage() {
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
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Lớp của tôi</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Danh sách các lớp học bạn đang giảng dạy</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <p>Đang tải...</p>
        ) : classes.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Chưa có lớp học nào được phân công</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Mã lớp</th>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Môn học</th>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Học kỳ</th>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Năm</th>
                <th style={{ padding: 12, textAlign: 'right', color: '#666' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>{cls.code}</td>
                  <td style={{ padding: 12 }}>{cls.subjectName || cls.subject?.name || 'N/A'}</td>
                  <td style={{ padding: 12 }}>{cls.semester}</td>
                  <td style={{ padding: 12 }}>{cls.year}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <Link to={`/lecturer/resources?classId=${cls.id}`}>
                      <button style={{ 
                        padding: '6px 12px', 
                        background: '#18b8f2', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 4, 
                        cursor: 'pointer'
                      }}>
                        📁 Tài nguyên
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ 
        marginTop: 20, 
        padding: 16, 
        background: '#fff3cd', 
        borderRadius: 8, 
        border: '1px solid #ffc107' 
      }}>
        <strong>⚠️ Lưu ý:</strong> Hiện tại đang hiển thị tất cả lớp. Chức năng lọc theo giảng viên sẽ được cập nhật sau.
      </div>
    </div>
  );
}
