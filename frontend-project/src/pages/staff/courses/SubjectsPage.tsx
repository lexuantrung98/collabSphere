import { useState, useEffect } from 'react';
import courseApi from '../../../api/courseApi';
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errorDetails: string[] } | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await courseApi.getSubjects();
      setSubjects((data as { data?: Subject[] }).data || (data as unknown as Subject[]) || []);
    } catch {
      toast.error('Lỗi tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCode('');
    setName('');
    setCredits(3);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await courseApi.createSubject({ code, name, credits });
      toast.success('Tạo môn học thành công!');
      setShowModal(false);
      loadSubjects();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await courseApi.deleteSubject(id);
      toast.success('Xóa thành công!');
      loadSubjects();
    } catch {
      toast.error('Lỗi xóa môn học');
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
      const response = await courseApi.importSubjects(selectedFile);

      console.log('=== DEBUG IMPORT SUBJECTS ===');
      console.log('Full Response:', response);
      console.log('response.data:', response.data);

      // ApiResponse structure: { success, message, data: ImportResultDto }
      const apiResponse = response.data || response;
      const result = apiResponse.data || apiResponse;

      console.log('ApiResponse:', apiResponse);
      console.log('ImportResult:', result);
      console.log('successCount:', result?.successCount);
      console.log('errorCount:', result?.errorCount);
      console.log('errorDetails:', result?.errorDetails);

      // Kiểm tra result có hợp lệ không
      if (!result || (result.successCount === undefined && result.errorCount === undefined)) {
        console.error('❌ Invalid result structure:', result);
        toast.error('Lỗi: Không nhận được kết quả import từ server');
        return;
      }

      setImportResult({
        successCount: result.successCount || 0,
        errorCount: result.errorCount || 0,
        errorDetails: result.errorDetails || []
      });

      if (result.successCount > 0) {
        toast.success(`✓ Import thành công ${result.successCount} môn học!`);
      }

      if (result.errorCount > 0) {
        toast.warning(`⚠️ Có ${result.errorCount} lỗi, xem chi tiết bên dưới`);
      }

      if (result.successCount === 0 && result.errorCount === 0) {
        toast.info('Không có dữ liệu nào được import');
      }

      loadSubjects();
    } catch (error: unknown) {
      console.error('Import error:', error);

      const err = error as { message?: string; code?: string };
      if (err?.message?.includes('ERR_UPLOAD_FILE_CHANGED') ||
        err?.code === 'ERR_UPLOAD_FILE_CHANGED') {
        toast.info('File đã được upload, đang kiểm tra kết quả...');
        setTimeout(() => {
          loadSubjects();
        }, 1000);
      } else {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Lỗi import file');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Quản lý Môn học</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Tạo, sửa, xóa và import môn học</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{ padding: '10px 20px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            📤 Import Excel
          </button>
          <button onClick={handleCreate} style={{ padding: '10px 20px', background: '#18b8f2', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
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
                    <button onClick={() => handleDelete(subject.id)} style={{ padding: '6px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
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
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 500, maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Tạo môn học mới</h2>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Mã môn:</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Tên môn:</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Số tín chỉ:</label>
              <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }} />
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
            <h2 style={{ marginTop: 0, color: '#333' }}>📤 Import Excel Môn Học</h2>

            <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #bae7ff' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>📋 Format file Excel:</h4>
              <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, fontSize: 14, color: '#666' }}>
                <li><strong>Cột A:</strong> Mã môn (VD: IT001, IT002)</li>
                <li><strong>Cột B:</strong> Tên môn học</li>
                <li><strong>Cột C:</strong> Số tín chỉ (số nguyên)</li>
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
                      ✓ Thành công: {importResult.successCount} môn học
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
    </div>
  );
}
