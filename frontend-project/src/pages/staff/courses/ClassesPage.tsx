import { useState, useEffect } from 'react';
import courseApi from '../../../api/courseApi';
import accountApi from '../../../api/accountApi';
import type { LecturerDto } from '../../../api/accountApi';
import { toast } from 'react-toastify';

interface ClassItem {
  id: number;
  code: string;
  subjectName?: string;
  subject?: { name: string };
  semester: string;
  year: number;
  lecturerName?: string;
  lecturerEmail?: string;
}

interface SubjectItem {
  id: number;
  name: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [lecturers, setLecturers] = useState<LecturerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errorDetails: string[] } | null>(null);

  const [code, setCode] = useState('');
  const [subjectId, setSubjectId] = useState(0);
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState(2024);

  // Assign lecturer states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [assignEmail, setAssignEmail] = useState('');

  useEffect(() => {
    loadClasses();
    loadSubjects();
    loadLecturers();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await courseApi.getClasses();
      setClasses((data as { data?: ClassItem[] }).data || (data as unknown as ClassItem[]) || []);
    } catch {
      toast.error('Lỗi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await courseApi.getSubjects();
      setSubjects((data as { data?: SubjectItem[] }).data || (data as unknown as SubjectItem[]) || []);
    } catch (err) {
      console.error('Load subjects error:', err);
    }
  };

  const loadLecturers = async () => {
    try {
      const response = await accountApi.getLecturers();
      const lecturerData = response.data?.data || response.data || [];
      setLecturers(lecturerData);
    } catch (err) {
      console.error('Load lecturers error:', err);
    }
  };

  const handleCreate = () => {
    setCode('');
    setSubjectId(0);
    setSemester('');
    setYear(2024);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await courseApi.createClass({ code, subjectId, semester, year });
      toast.success('Tạo lớp thành công!');
      setShowModal(false);
      loadClasses();
    } catch {
      toast.error('Lỗi tạo lớp');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa lớp học?')) return;
    try {
      await courseApi.deleteClass(id);
      toast.success('Xóa thành công!');
      loadClasses();
    } catch {
      toast.error('Lỗi xóa lớp');
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

    setImporting(true);
    setImportResult(null);

    try {
      const response = await courseApi.importClasses(selectedFile);
      const result = (response as unknown as {data?: unknown}).data || response;

      setImportResult({
        successCount: (result as {successCount?: number}).successCount || 0,
        errorCount: (result as {errorCount?: number}).errorCount || 0,
        errorDetails: (result as {errorDetails?: string[]}).errorDetails || []
      });

      if ((result as {successCount?: number}).successCount && (result as {successCount?: number}).successCount! > 0) {
        toast.success(`✓ Import thành công ${(result as {successCount?: number}).successCount} lớp học!`);
        loadClasses();
      }

      if ((result as {errorCount?: number}).errorCount && (result as {errorCount?: number}).errorCount! > 0) {
        toast.warning(`⚠️ Có ${(result as {errorCount?: number}).errorCount} lỗi, xem chi tiết bên dưới`);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Lỗi import file');
    } finally {
      setImporting(false);
    }
  };

  const handleAssignLecturer = (classId: number) => {
    setSelectedClassId(classId);
    setAssignEmail('');
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedClassId || !assignEmail.trim()) {
      toast.error('Vui lòng nhập email giảng viên');
      return;
    }

    try {
      await courseApi.assignLecturer(selectedClassId, assignEmail);
      toast.success('Đã phân công giảng viên thành công!');
      setAssignModalOpen(false);
      loadClasses();
    } catch (err) {
      toast.error((err as Error).message || 'Lỗi phân công giảng viên. Kiểm tra email có tồn tại trong hệ thống.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Quản lý Lớp học</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Tạo, quản lý lớp học và phân công giảng viên</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{ padding: '10px 20px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            📤 Import Excel
          </button>
          <button onClick={handleCreate} style={{ padding: '10px 20px', background: '#18b8f2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
            + Tạo lớp
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {loading ? <p>Đang tải...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Mã lớp</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Môn học</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Giảng viên</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Học kỳ</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Năm</th>
                <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>{cls.code}</td>
                  <td style={{ padding: 12 }}>{cls.subjectName || cls.subject?.name || 'N/A'}</td>
                  <td style={{ padding: 12 }}>
                    {cls.lecturerName ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{cls.lecturerName}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{cls.lecturerEmail}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#ccc', fontStyle: 'italic' }}>Chưa phân công</span>
                    )}
                  </td>
                  <td style={{ padding: 12 }}>{cls.semester}</td>
                  <td style={{ padding: 12 }}>{cls.year}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button
                      onClick={() => handleAssignLecturer(cls.id)}
                      style={{ padding: '6px 12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontWeight: 500 }}
                    >
                      {cls.lecturerName ? '🔄 Đổi GV' : '👨‍🏫 Phân công'}
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      style={{ padding: '6px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 500 }}>
            <h2 style={{ marginTop: 0 }}>Tạo lớp học mới</h2>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Mã lớp:</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Môn học:</label>
              <select value={subjectId} onChange={(e) => setSubjectId(Number(e.target.value))} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <option value={0}>-- Chọn môn --</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Học kỳ:</label>
              <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="VD: HK1" style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Năm:</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#18b8f2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>📤 Import Excel Lớp Học</h2>

            <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #bae7ff' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>📋 Format file Excel:</h4>
              <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, fontSize: 14, color: '#666' }}>
                <li><strong>Cột A:</strong> Mã lớp học (VD: IT001.T1002)</li>
                <li><strong>Cột B:</strong> Mã môn học (VD: IT001)</li>
                <li><strong>Cột C:</strong> Học kỳ (VD: HK1)</li>
                <li><strong>Cột D:</strong> Email giảng viên (tùy chọn, bỏ trống để phân công sau)</li>
                <li><strong>Cột E:</strong> Năm (VD: 2024)</li>
              </ul>
              <p style={{ margin: 0, fontSize: 13, color: '#999' }}>
                💡 Dòng 1 là header (bỏ qua), dữ liệu bắt đầu từ dòng 2
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
            {importResult && (
              <div style={{ marginBottom: 20, maxHeight: '300px', overflow: 'auto' }}>
                {importResult.successCount > 0 && (
                  <div style={{ background: '#f6ffed', padding: 12, borderRadius: 6, marginBottom: 10, border: '1px solid #b7eb8f' }}>
                    <p style={{ margin: 0, color: '#52c41a', fontWeight: 600 }}>
                      ✓ Thành công: {importResult.successCount} lớp học
                    </p>
                  </div>
                )}

                {importResult.errorCount > 0 && (
                  <div style={{ background: '#fff2e8', padding: 12, borderRadius: 6, border: '1px solid #ffbb96' }}>
                    <p style={{ margin: '0 0 10px 0', color: '#fa541c', fontWeight: 600 }}>
                      ⚠️ Lỗi: {importResult.errorCount} dòng
                    </p>
                    <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                      {importResult.errorDetails.map((error: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            background: '#fff',
                            padding: '8px 12px',
                            marginBottom: 6,
                            borderRadius: 4,
                            fontSize: 13,
                            border: '1px solid #ffd591',
                            color: '#ad4e00'
                          }}
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setSelectedFile(null);
                  setImportResult(null);
                }}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
                disabled={importing}
              >
                {importResult ? 'Đóng' : 'Hủy'}
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

      {/* Assign Lecturer Modal */}
      {assignModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 500 }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>👨‍🏫 Phân công giảng viên</h2>
            <p style={{ color: '#666', marginBottom: 20 }}>
              Nhập email của giảng viên để tự động lấy thông tin từ AccountService
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', color: '#333' }}>
                Chọn giảng viên: <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                style={{ width: '100%', padding: 12, border: '2px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
              >
                <option value="">-- Chọn giảng viên --</option>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.email}>
                    {lecturer.fullName} ({lecturer.email})
                  </option>
                ))}
              </select>
              <small style={{ color: '#888', fontSize: 12 }}>
                Hệ thống sẽ tự động lấy thông tin giảng viên từ AccountService
              </small>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAssignModalOpen(false)}
                style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAssignment}
                style={{ padding: '10px 20px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
              >
                Phân công
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
