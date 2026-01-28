import { useState, useEffect, useCallback } from 'react';
import accountApi from '../../../api/accountApi';
import { toast } from 'react-toastify';
import { getToken } from '../../../utils/authStorage';

interface Account {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Staff');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountApi.getAccounts(roleFilter);
      setAccounts((data as {data?: Account[]}).data || (data as unknown as Account[]) || []);
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
    setRole('Staff');
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

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Vô hiệu hóa tài khoản này?')) return;
    try {
      await accountApi.deactivateAccount(id);
      toast.success('Đã vô hiệu hóa!');
      loadAccounts();
    } catch {
      toast.error('Lỗi vô hiệu hóa');
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await accountApi.reactivateAccount(id);
      toast.success('Đã kích hoạt lại!');
      loadAccounts();
    } catch {
      toast.error('Lỗi kích hoạt');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa vĩnh viễn tài khoản này? Hành động không thể hoàn tác!')) return;
    try {
      await accountApi.deleteAccount(id);
      toast.success('Đã xóa tài khoản!');
      loadAccounts();
    } catch {
      toast.error('Lỗi xóa tài khoản');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Quản lý Tài khoản</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Quản lý tài khoản Staff và Head Department</p>
        </div>
        <div>
          <button onClick={handleCreate} style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
            + Tạo tài khoản
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 10, fontWeight: 'bold' }}>Lọc theo vai trò:</label>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '100%', padding: 12, border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14 }}>
          <option value="">Tất cả tài khoản</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Staff</option>
          <option value="HeadDepartment">Head Department</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Student">Student</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {loading ? <p>Đang tải...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Họ tên</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Vai trò</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Trạng thái</th>
                <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const isCurrentUser = account.email === currentUserEmail;
                return (
                  <tr key={account.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 12 }}>{account.email}</td>
                    <td style={{ padding: 12, fontWeight: 500 }}>{account.fullName}</td>
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
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {account.isActive ? (
                          <button 
                            onClick={() => handleDeactivate(account.id)} 
                            disabled={isCurrentUser}
                            style={{ 
                              padding: '6px 12px', 
                              background: isCurrentUser ? '#d9d9d9' : '#ff9800', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: 4, 
                              cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                              opacity: isCurrentUser ? 0.5 : 1
                            }}
                          >
                            Vô hiệu hóa
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(account.id)} style={{ padding: '6px 12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                            Kích hoạt
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(account.id)} 
                          disabled={isCurrentUser}
                          style={{ 
                            padding: '6px 12px', 
                            background: isCurrentUser ? '#d9d9d9' : '#ff4d4f', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: 4, 
                            cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                            opacity: isCurrentUser ? 0.5 : 1
                          }}
                          title={isCurrentUser ? 'Không thể xóa tài khoản của chính bạn' : ''}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                <option value="Staff">Staff</option>
                <option value="HeadDepartment">Head Department</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 6, cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
