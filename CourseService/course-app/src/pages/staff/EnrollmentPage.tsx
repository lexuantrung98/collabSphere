import { useState, useEffect } from 'react';
import { getClasses, getClassMembers, addStudentToClass, removeStudentFromClass, importClassMembers } from '../../api/courseApi';
import { toast } from 'react-toastify';

interface ClassItem {
  id: number;
  code: string;
  subjectName?: string;
  subject?: { name: string };
}

interface Member {
  id: number;
  studentCode?: string;
  studentName?: string;
  studentEmail?: string;
}

export default function EnrollmentPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [studentCode, setStudentCode] = useState('');

  // Load classes on mount
  useEffect(() => {
    getClasses()
      .then(data => setClasses(data.data || data || []))
      .catch(() => toast.error('Lỗi tải danh sách lớp'));
  }, []);

  // Load members when class changes
  useEffect(() => {
    if (selectedClassId > 0) {
      getClassMembers(selectedClassId)
        .then(data => setMembers(data.data || data || []))
        .catch(() => toast.error('Lỗi tải danh sách sinh viên'));
    }
  }, [selectedClassId]);

  const refreshMembers = () => {
    if (selectedClassId > 0) {
      getClassMembers(selectedClassId)
        .then(data => setMembers(data.data || data || []))
        .catch(() => toast.error('Lỗi tải danh sách sinh viên'));
    }
  };

  const handleAddStudent = async () => {
    if (!studentCode.trim()) {
      toast.error('Vui lòng nhập mã sinh viên');
      return;
    }
    if (selectedClassId === 0) {
      toast.error('Vui lòng chọn lớp');
      return;
    }

    try {
      await addStudentToClass(selectedClassId, studentCode);
      toast.success('Thêm sinh viên thành công!');
      setStudentCode('');
      refreshMembers();
    } catch {
      toast.error('Lỗi thêm sinh viên');
    }
  };

  const handleRemove = async (memberId: number) => {
    if (!window.confirm('Xóa sinh viên khỏi lớp?')) return;
    
    try {
      await removeStudentFromClass(selectedClassId, memberId);
      toast.success('Xóa thành công!');
      refreshMembers();
    } catch {
      toast.error('Lỗi xóa sinh viên');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (selectedClassId === 0) {
      toast.error('Vui lòng chọn lớp trước');
      return;
    }
    
    try {
      await importClassMembers(selectedClassId, file);
      toast.success('Import thành công!');
      refreshMembers();
    } catch {
      toast.error('Lỗi import');
    }
    e.target.value = '';
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, marginTop: 0, color: '#333' }}>Quản lý Sinh viên</h1>
      <p style={{ color: '#666', marginBottom: 30 }}>Thêm sinh viên vào lớp học</p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Chọn lớp học:</label>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(Number(e.target.value))} style={{ width: '100%', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}>
          <option value={0}>-- Chọn lớp --</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.code} - {cls.subjectName || cls.subject?.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId > 0 && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input 
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="Nhập mã sinh viên"
              style={{ flex: 1, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
            />
            <button onClick={handleAddStudent} style={{ padding: '12px 24px', background: '#18b8f2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
              Thêm SV
            </button>
            <label style={{ padding: '12px 24px', background: '#52c41a', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
              Import Excel
              <input type="file" accept=".xlsx" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0 }}>Danh sách sinh viên ({members.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>MSSV</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Họ tên</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 12, fontWeight: 'bold' }}>{member.studentCode || 'N/A'}</td>
                    <td style={{ padding: 12 }}>{member.studentName || 'N/A'}</td>
                    <td style={{ padding: 12 }}>{member.studentEmail || 'N/A'}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button onClick={() => handleRemove(member.id)} style={{ padding: '6px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
