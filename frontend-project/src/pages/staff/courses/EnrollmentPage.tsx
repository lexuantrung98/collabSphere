import { useState, useEffect, useCallback } from 'react';
import courseApi from '../../../api/courseApi';
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
  fullName?: string;
  email?: string;
}

export default function EnrollmentPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [studentCode, setStudentCode] = useState('');
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);

  useEffect(() => {
    courseApi.getClasses()
      .then(data => setClasses((data as {data?: ClassItem[]}).data || (data as unknown as ClassItem[]) || []))
      .catch(() => toast.error('Lỗi tải danh sách lớp'));
  }, []);

  const refreshMembers = useCallback(() => {
    if (selectedClassId > 0) {
      courseApi.getClassMembers(selectedClassId)
        .then(data => setMembers((data as {data?: Member[]}).data || (data as unknown as Member[]) || []))
        .catch(() => toast.error('Lỗi tải danh sách sinh viên'));
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId > 0) {
      refreshMembers();
    }
  }, [selectedClassId, refreshMembers]);

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
      await courseApi.addMember(selectedClassId, studentCode);
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
      await courseApi.removeMember(selectedClassId, memberId);
      toast.success('Xóa thành công!');
      refreshMembers();
    } catch {
      toast.error('Lỗi xóa sinh viên');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file Excel');
      return;
    }
    if (selectedClassId === 0) {
      toast.error('Vui lòng chọn lớp trước');
      return;
    }
    
    setImporting(true);
    setImportCount(null);
    
    try {
      const result = await courseApi.importMembers(selectedClassId, selectedFile);
      const count = (result as {data?: number}).data || (result as unknown as number) || 0;
      
      setImportCount(count);
      if (count > 0) {
        toast.success(`✓ Import thành công ${count} sinh viên!`);
        refreshMembers();
      } else {
        toast.warning('Không có sinh viên nào được thêm. Kiểm tra file Excel.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Lỗi import file');
    } finally {
      setImporting(false);
    }
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
            <button 
              onClick={() => setShowImportModal(true)}
              style={{ padding: '12px 24px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
            >
              📤 Import Excel
            </button>
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
                    <td style={{ padding: 12 }}>{member.fullName || 'N/A'}</td>
                    <td style={{ padding: 12 }}>{member.email || 'N/A'}</td>
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

      {/* Import Excel Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>📤 Import Excel Sinh Viên</h2>

            <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #bae7ff' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>📋 Format file Excel:</h4>
              <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, fontSize: 14, color: '#666' }}>
                <li><strong>Cột A:</strong> Mã sinh viên (VD: SV000001, SV000002)</li>
              </ul>
              <p style={{ margin: 0, fontSize: 13, color: '#999' }}>
                💡 Dòng 1 là header (bỏ qua), dữ liệu bắt đầu từ dòng 2. Hệ thống sẽ tự động lấy thông tin sinh viên từ AccountService.
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold', fontSize: 15 }}>Chọn file Excel (.xlsx):</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '2px dashed #d9d9d9',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: '#fafafa'
                }}
              />
              {selectedFile && (
                <p style={{ marginTop: 10, fontSize: 14, color: '#52c41a', fontWeight: 500 }}>
                  ✓ Đã chọn: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Kết quả import */}
            {importCount !== null && (
              <div style={{ marginBottom: 20 }}>
                {importCount > 0 ? (
                  <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, border: '1px solid #b7eb8f' }}>
                    <p style={{ margin: 0, color: '#52c41a', fontWeight: 600 }}>
                      ✓ Thành công: {importCount} sinh viên
                    </p>
                  </div>
                ) : (
                  <div style={{ background: '#fff2e8', padding: 12, borderRadius: 6, border: '1px solid #ffbb96' }}>
                    <p style={{ margin: 0, color: '#fa541c', fontWeight: 600 }}>
                      ⚠️ Không có sinh viên nào được thêm. Kiểm tra lại file Excel.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportCount(null);
                }}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                disabled={importing}
              >
                {importCount !== null ? 'Đóng' : 'Hủy'}
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                style={{
                  padding: '10px 24px',
                  background: selectedFile && !importing ? '#52c41a' : '#d9d9d9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: selectedFile && !importing ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: 14,
                  opacity: selectedFile && !importing ? 1 : 0.6
                }}
              >
                {importing ? '⏳ Đang import...' : '📤 Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
