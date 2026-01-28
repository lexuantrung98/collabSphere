import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject, importSubjects } from '../../api/courseApi';
import { toast } from 'react-toastify';

interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data.data || data || []);
    } catch {
      toast.error('Lỗi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setCode('');
    setName('');
    setCredits(3);
    setShowModal(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setCode(subject.code);
    setName(subject.name);
    setCredits(subject.credits);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, { code, name, credits });
        toast.success('Cập nhật thành công!');
      } else {
        await createSubject({ code, name, credits });
        toast.success('Tạo môn học thành công!');
      }
      setShowModal(false);
      loadSubjects();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await deleteSubject(id);
      toast.success('Xóa thành công!');
      loadSubjects();
    } catch {
      toast.error('Lỗi xóa môn học');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await importSubjects(file);
      toast.success('Import thành công!');
      loadSubjects();
    } catch {
      toast.error('Lỗi import file');
    }
    e.target.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Quản lý Môn học</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Tạo, sửa, xóa và import môn học</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ 
            padding: '10px 20px', 
            background: '#52c41a', 
            color: '#fff', 
            borderRadius: 6, 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Import Excel
            <input type="file" accept=".xlsx" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button onClick={handleCreate} style={{ 
            padding: '10px 20px', 
            background: '#18b8f2', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 6, 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            + Tạo mới
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Mã môn</th>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Tên môn học</th>
                <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Số tín chỉ</th>
                <th style={{ padding: 12, textAlign: 'right', color: '#666' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>{subject.code}</td>
                  <td style={{ padding: 12 }}>{subject.name}</td>
                  <td style={{ padding: 12 }}>{subject.credits}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <button onClick={() => handleEdit(subject)} style={{ 
                      padding: '6px 12px', 
                      background: '#1890ff', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      cursor: 'pointer',
                      marginRight: 8
                    }}>
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(subject.id)} style={{ 
                      padding: '6px 12px', 
                      background: '#ff4d4f', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      cursor: 'pointer'
                    }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: '#fff', 
            padding: 30, 
            borderRadius: 12, 
            width: 500,
            maxWidth: '90%'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>{editingSubject ? 'Sửa môn học' : 'Tạo môn học mới'}</h2>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Mã môn:</label>
              <input 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: 10, 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Tên môn:</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: 10, 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Số tín chỉ:</label>
              <input 
                type="number"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                style={{ 
                  width: '100%', 
                  padding: 10, 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ 
                padding: '10px 20px', 
                background: '#fff', 
                border: '1px solid #d9d9d9', 
                borderRadius: 6, 
                cursor: 'pointer'
              }}>
                Hủy
              </button>
              <button onClick={handleSave} style={{ 
                padding: '10px 20px', 
                background: '#18b8f2', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
