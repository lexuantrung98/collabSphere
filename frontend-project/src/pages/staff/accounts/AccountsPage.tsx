import { useState, useEffect, useCallback } from 'react';
import accountApi from '../../../api/accountApi';
import { toast } from 'react-toastify';
import { getToken } from '../../../utils/authStorage';

interface Account {
  id: string;
  email: string;
  fullName: string;
  code?: string;  // Student code (SV000001)
  role: string;
  isActive: boolean;
}

export default function StaffAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errorDetails: string[] } | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Student');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountApi.getAccounts(roleFilter);
      setAccounts((data as { data?: Account[] }).data || (data as unknown as Account[]) || []);
    } catch {
      toast.error('Lỗi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    loadAccounts();

    // Get current user email from token
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserEmail(payload.email || payload.sub || '');
      } catch {
        console.error('Failed to parse token');
      }
    }
  }, [loadAccounts]);

  const handleCreate = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('Student');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await accountApi.createAccount({ email, password, fullName, role });
      toast.success('Tạo tài khoản thành công!');
      setShowModal(false);
      loadAccounts();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Lỗi tạo tài khoản');
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
      const response = await accountApi.importAccounts(selectedFile);
      const result = response.data || response;

      console.log('=== DEBUG IMPORT ===');
      console.log('Response:', response);
      console.log('Result:', result);
      console.log('Success:', result.successCount);
      console.log('Errors:', result.errorCount);
      console.log('Error list:', result.errorDetails);

      // Lưu kết quả để hiển thị trong modal
      setImportResult(result);

      if (result.successCount > 0) {
        toast.success(`✓ Import thành công ${result.successCount} tài khoản!`);
      }

      if (result.errorCount > 0) {
        toast.warning(`⚠️ Có ${result.errorCount} lỗi, xem chi tiết bên dưới`);
      }

      loadAccounts();
    } catch (error: unknown) {
      console.error('Import error:', error);

      // Nếu là lỗi network sau khi upload thành công, bỏ qua
      const err = error as { message?: string; code?: string; response?: { data?: { message?: string } } };
      if (err?.message?.includes('ERR_UPLOAD_FILE_CHANGED') ||
        err?.code === 'ERR_UPLOAD_FILE_CHANGED') {
        toast.info('File đã được upload, đang kiểm tra kết quả...');
        // Reload để xem kết quả
        setTimeout(() => {
          loadAccounts();
        }, 1000);
      } else {
        toast.error(err.response?.data?.message || 'Lỗi import file');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Quản lý Tài khoản</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Quản lý tài khoản Lecturer và Student</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{ padding: '10px 20px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            📤 Import Excel
          </button>
          <button
            onClick={handleCreate}
            style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Tạo tài khoản
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Lọc theo vai trò:</label>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}>
          <option value="">Tất cả tài khoản</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {loading ? <p>Đang tải...</p> : (
          <>
            {accounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <p style={{ fontSize: 16, marginBottom: 10 }}>📋 Chưa có tài khoản nào</p>
                <p style={{ fontSize: 14 }}>Bạn chỉ thấy tài khoản của mình và các tài khoản do bạn tạo</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Họ tên</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Mã SV</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Vai trò</th>
                    <th style={{ padding: 12, textAlign: 'left' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const isCurrentUser = account.email === currentUserEmail;
                    return (
                      <tr key={account.id} style={{ borderBottom: '1px solid #f0f0f0', background: isCurrentUser ? '#f0f9ff' : 'transparent' }}>
                        <td style={{ padding: 12 }}>
                          {account.email}
                          {isCurrentUser && <span style={{ marginLeft: 8, fontSize: 12, color: '#667eea', fontWeight: 600 }}>(Bạn)</span>}
                        </td>
                        <td style={{ padding: 12, fontWeight: 500 }}>{account.fullName}</td>
                        <td style={{ padding: 12 }}>
                          {account.role === 'Student' && account.code ? (
                            <span style={{ padding: '4px 8px', background: '#f0f9ff', color: '#667eea', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                              {account.code}
                            </span>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: 12 }}>
                          <span style={{ padding: '4px 8px', background: '#e7f3ff', color: '#1890ff', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                            {account.role}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          <span style={{ padding: '4px 8px', background: account.isActive ? '#f0f9ff' : '#fee', color: account.isActive ? '#52c41a' : '#ff4d4f', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
                            {account.isActive ? 'Hoạt động' : 'Vô hiệu'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 500 }}>
            <h2 style={{ marginTop: 0 }}>Tạo tài khoản mới</h2>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Password:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Họ tên:</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Vai trò:</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d9d9d9', borderRadius: 6 }}>
                <option value="Student">Student</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 600, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>📤 Import Excel</h2>

            <div style={{ background: '#f0f9ff', padding: 16, borderRadius: 8, marginBottom: 20, border: '1px solid #bae7ff' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1890ff' }}>📋 Format file Excel:</h4>
              <ul style={{ margin: '0 0 10px 0', paddingLeft: 20, fontSize: 14, color: '#666' }}>
                <li><strong>Cột A:</strong> Họ và tên (VD: Nguyễn Văn A)</li>
                <li><strong>Cột B:</strong> Email (VD: nguyenvana@student.uit.edu.vn)</li>
                <li><strong>Cột C:</strong> Vai trò - Role (VD: Student, Lecturer, Staff)</li>
              </ul>
              <p style={{ margin: 0, fontSize: 13, color: '#999' }}>
                💡 Dòng 1 là header (bỏ qua), dữ liệu bắt đầu từ dòng 2. Mã sinh viên sẽ tự động tạo (SV000001, SV000002...).
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
                      ✓ Thành công: {importResult.successCount} tài khoản
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
