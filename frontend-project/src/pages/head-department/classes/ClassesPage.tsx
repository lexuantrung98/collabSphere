import { useState, useEffect } from 'react';
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
  studentCount?: number;
}

export default function HeadDepartmentClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await courseApi.getClasses();
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
  }, []);

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Danh sách Lớp học</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Xem tất cả các lớp học trong hệ thống</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên lớp, mã lớp, hoặc môn học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: 14,
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            outline: 'none',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#d9d9d9'}
        />
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
        ) : filteredClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏫</div>
            <p style={{ fontSize: 16, marginBottom: 10 }}>
              {searchTerm ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
            </p>
            <p style={{ fontSize: 14 }}>
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Danh sách lớp học sẽ hiển thị tại đây khi có dữ liệu'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Mã lớp</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Tên lớp</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Môn học</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Học kỳ</th>
                <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Giảng viên</th>
                <th style={{ padding: 12, textAlign: 'center', fontWeight: 600, color: '#333' }}>Số SV</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((classItem) => (
                <tr 
                  key={classItem.id} 
                  style={{ 
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 12 }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: '#e7f3ff', 
                      color: '#1890ff', 
                      borderRadius: 4, 
                      fontSize: 12, 
                      fontWeight: 600 
                    }}>
                      {classItem.code || `C${classItem.id}`}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontWeight: 500, color: '#333' }}>{classItem.name}</td>
                  <td style={{ padding: 12, color: '#666' }}>{classItem.subjectName || '-'}</td>
                  <td style={{ padding: 12, color: '#666' }}>
                    {classItem.semester} - {classItem.year}
                  </td>
                  <td style={{ padding: 12, color: '#666' }}>
                    {classItem.lecturerName || classItem.lecturerEmail || 'Chưa phân công'}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: '#f0f9ff',
                      color: '#667eea',
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      {classItem.studentCount || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filteredClasses.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ color: '#0369a1', fontSize: 14, margin: 0 }}>
            📊 {searchTerm ? `Tìm thấy: ${filteredClasses.length}/${classes.length}` : `Tổng cộng: ${classes.length}`} lớp học
          </p>
        </div>
      )}
    </div>
  );
}
