import { useState, useEffect, useCallback } from 'react';
import { getSubjects, getSyllabusBySubject, uploadSyllabus, deleteSyllabus } from '../../api/courseApi';
import { toast } from 'react-toastify';

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface Syllabus {
  id: number;
  subjectId: number;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

export default function SyllabusPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(0);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSyllabuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSyllabusBySubject(selectedSubjectId);
      setSyllabuses(data.data || data || []);
    } catch {
      console.log('No syllabus found');
      setSyllabuses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data.data || data || []);
      } catch {
        toast.error('Lỗi tải danh sách môn học');
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId > 0) {
      loadSyllabuses();
    }
  }, [selectedSubjectId, loadSyllabuses]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (selectedSubjectId === 0) {
      toast.error('Vui lòng chọn môn học trước');
      return;
    }

    try {
      await uploadSyllabus(selectedSubjectId, file);
      toast.success('Upload giáo trình thành công!');
      loadSyllabuses();
    } catch {
      toast.error('Lỗi upload giáo trình');
    }
    e.target.value = '';
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa giáo trình này?')) return;
    
    try {
      await deleteSyllabus(id);
      toast.success('Xóa thành công!');
      loadSyllabuses();
    } catch {
      toast.error('Lỗi xóa giáo trình');
    }
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Quản lý Giáo trình</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Upload và quản lý giáo trình cho các môn học</p>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Chọn môn học:</label>
        <select 
          value={selectedSubjectId} 
          onChange={(e) => setSelectedSubjectId(Number(e.target.value))} 
          style={{ width: '100%', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}
        >
          <option value={0}>-- Chọn môn học --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code} - {subject.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubjectId > 0 && (
        <>
          <div style={{ 
            background: '#e7f3ff', 
            borderRadius: 12, 
            padding: 24, 
            marginBottom: 20,
            border: '2px dashed #18b8f2',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 15px 0', color: '#666' }}>
              📚 Upload giáo trình cho môn: <strong>{selectedSubject?.name}</strong>
            </p>
            <label style={{ 
              display: 'inline-block',
              padding: '12px 30px', 
              background: '#18b8f2', 
              color: '#fff', 
              borderRadius: 8, 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              📤 Chọn file để upload
              <input 
                type="file" 
                accept=".pdf,.doc,.docx,.ppt,.pptx" 
                onChange={handleUpload} 
                style={{ display: 'none' }} 
              />
            </label>
            <p style={{ margin: '10px 0 0 0', fontSize: 12, color: '#888' }}>
              Hỗ trợ: PDF, Word, PowerPoint
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>
              Giáo trình đã upload ({syllabuses.length})
            </h3>
            
            {loading ? (
              <p>Đang tải...</p>
            ) : syllabuses.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: 30 }}>
                Chưa có giáo trình nào cho môn học này
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Tên file</th>
                    <th style={{ padding: 12, textAlign: 'left', color: '#666' }}>Ngày upload</th>
                    <th style={{ padding: 12, textAlign: 'right', color: '#666' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {syllabuses.map((syllabus) => (
                    <tr key={syllabus.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: 12, fontWeight: 'bold' }}>
                        📄 {syllabus.fileName}
                      </td>
                      <td style={{ padding: 12 }}>
                        {new Date(syllabus.uploadedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(syllabus.id)} 
                          style={{ 
                            padding: '6px 12px', 
                            background: '#ff4d4f', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4, 
                            cursor: 'pointer' 
                          }}
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
        </>
      )}
    </div>
  );
}
