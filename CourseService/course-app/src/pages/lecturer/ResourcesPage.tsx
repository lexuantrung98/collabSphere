import { useState, useEffect } from 'react';
import { getClasses, getClassResources, uploadResource, deleteResource } from '../../api/courseApi';
import { toast } from 'react-toastify';

interface ClassItem {
  id: number;
  code: string;
  subjectName?: string;
  subject?: { name: string };
}

interface Resource {
  id: number;
  fileName: string;
  uploadedAt: string;
}

export default function LecturerResourcesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(0);
  const [resources, setResources] = useState<Resource[]>([]);

  // Load classes on mount
  useEffect(() => {
    getClasses()
      .then(data => setClasses(data.data || data || []))
      .catch(() => toast.error('Lỗi tải lớp học'));
  }, []);

  // Load resources when class changes
  useEffect(() => {
    if (selectedClassId > 0) {
      getClassResources(selectedClassId)
        .then(data => setResources(data.data || data || []))
        .catch(() => toast.error('Lỗi tải tài nguyên'));
    }
  }, [selectedClassId]);

  const refreshResources = () => {
    if (selectedClassId > 0) {
      getClassResources(selectedClassId)
        .then(data => setResources(data.data || data || []))
        .catch(() => toast.error('Lỗi tải tài nguyên'));
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (selectedClassId === 0) {
      toast.error('Vui lòng chọn lớp');
      return;
    }

    try {
      await uploadResource(selectedClassId, file);
      toast.success('Upload thành công!');
      refreshResources();
    } catch {
      toast.error('Lỗi upload file');
    }
    e.target.value = '';
  };

  const handleDelete = async (resourceId: number) => {
    if (!window.confirm('Xóa tài liệu?')) return;
    
    try {
      await deleteResource(resourceId);
      toast.success('Xóa thành công!');
      refreshResources();
    } catch {
      toast.error('Lỗi xóa tài liệu');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, marginTop: 0, color: '#333' }}>Quản lý Tài nguyên</h1>
      <p style={{ color: '#666', marginBottom: 30 }}>Upload và quản lý tài liệu cho lớp học</p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Chọn lớp học:</label>
        <select value={selectedClassId} onChange={(e) => setSelectedClassId(Number(e.target.value))} style={{ width: '100%', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
          <option value={0}>-- Chọn lớp --</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>{cls.code} - {cls.subjectName || cls.subject?.name}</option>
          ))}
        </select>
      </div>

      {selectedClassId > 0 && (
        <>
          <div style={{ marginBottom: 20 }}>
            <label style={{ padding: '12px 24px', background: '#18b8f2', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
              + Upload File
              <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0 }}>Tài liệu đã upload ({resources.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Tên file</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Ngày upload</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((resource) => (
                  <tr key={resource.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 12, fontWeight: 'bold' }}>{resource.fileName}</td>
                    <td style={{ padding: 12 }}>{new Date(resource.uploadedAt).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <button onClick={() => handleDelete(resource.id)} style={{ padding: '6px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
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
