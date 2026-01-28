import { useState, useEffect } from 'react';
import { getClasses, getClassResources, downloadResource } from '../../api/courseApi';
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

export default function StudentResourcesPage() {
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
        .catch(() => toast.error('Lỗi tải tài liệu'));
    }
  }, [selectedClassId]);

  const handleDownload = async (resourceId: number, fileName: string) => {
    try {
      const response = await downloadResource(resourceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tải xuống thành công!');
    } catch {
      toast.error('Lỗi tải file');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 28, marginTop: 0, color: '#333' }}>Tài liệu học tập</h1>
      <p style={{ color: '#666', marginBottom: 30 }}>Xem và tải tài liệu của các lớp đã đăng ký</p>

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
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>Tài liệu ({resources.length})</h3>
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
                    <button onClick={() => handleDownload(resource.id, resource.fileName)} style={{ padding: '6px 12px', background: '#18b8f2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                      Tải xuống
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
