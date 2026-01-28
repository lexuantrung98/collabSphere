import { useState, useEffect } from 'react';
import { getClasses, createClass, deleteClass, importClasses, assignLecturer, getLecturers } from '../../api/courseApi';
import { getSubjects } from '../../api/courseApi';
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
  const [lecturers, setLecturers] = useState<Array<{id: string, email: string, fullName: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [code, setCode] = useState('');
  const [subjectId, setSubjectId] = useState(0);
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState(2024);
  const [lecturerEmail, setLecturerEmail] = useState('');

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
      const data = await getClasses();
      setClasses(data.data || data || []);
    } catch {
      toast.error('Lỗi tải danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data.data || data || []);
    } catch (err) {
      console.error('Load subjects error:', err);
    }
  };

  const loadLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(data.data || data || []);
    } catch (err) {
      console.error('Load subjects error:', err);
    }
  };

  const handleCreate = () => {
    setCode('');
    setSubjectId(0);
    setSemester('');
    setYear(2024);
    setLecturerEmail('');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await createClass({ code, subjectId, semester, year, lecturerEmail });
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
      await deleteClass(id);
      toast.success('Xóa thành công!');
      loadClasses();
    } catch {
      toast.error('Lỗi xóa lớp');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await importClasses(file);
      toast.success('Import thành công!');
      loadClasses();
    } catch {
      toast.error('Lỗi import');
    }
    e.target.value = '';
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
      await assignLecturer(selectedClassId, assignEmail);
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
          <label style={{ padding: '10px 20px', background: '#52c41a', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
            Import Excel
            <input type="file" accept=".xlsx" onChange={handleImport} style={{ display: 'none' }} />
          </label>
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

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Email giảng viên (optional):</label>
              <input value={lecturerEmail} onChange={(e) => setLecturerEmail(e.target.value)} placeholder="lecturer@example.com" style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#18b8f2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Lưu</button>
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
                Email giảng viên: <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                type="email"
                list="lecturer-suggestions"
                value={assignEmail} 
                onChange={(e) => setAssignEmail(e.target.value)}
                placeholder="lecturer@example.com"
                style={{ width: '100%', padding: 12, border: '2px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAssignment()}
              />
              <datalist id="lecturer-suggestions">
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.email}>
                    {lecturer.fullName} - {lecturer.email}
                  </option>
                ))}
              </datalist>
              <small style={{ color: '#888', fontSize: 12 }}>
                Hệ thống sẽ tự động tìm giảng viên theo email này từ AccountService
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
