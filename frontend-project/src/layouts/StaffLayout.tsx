import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { clearAuth, getToken } from '../utils/authStorage';
import { useState } from 'react';

export default function StaffLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user full name from token (initialize once)
  const getUserFullName = () => {
    const token = getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.fullName || payload.name || '';
      } catch {
        console.error('Failed to parse token');
        return '';
      }
    }
    return '';
  };
  
  const [userFullName] = useState(getUserFullName);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5', margin: 0, padding: 0 }}>
      {/* Sidebar - Fixed */}
      <div style={{
        width: 280,
        background: '#ffffff',
        color: '#262626',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        overflowY: 'auto',
        boxShadow: '2px 0 12px rgba(0,0,0,0.08)',
        zIndex: 100,
        borderRight: '1px solid #f0f0f0'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, color: '#262626', fontSize: 20, fontWeight: 700 }}>CollabSphere</h2>
          <p style={{ margin: '5px 0 0 0', color: '#8c8c8c', fontSize: 12 }}>Unified Management</p>
        </div>

        {/* User Info */}
        <div style={{
          padding: '16px 20px',
          background: '#f5f7fa',
          margin: '16px 12px',
          borderRadius: 8,
          border: '1px solid #e8e8e8'
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#667eea' }}>👨‍💼 Nhân viên</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{userFullName || 'Nhân viên'}</div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          {/* Account Management */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 11,
              textTransform: 'uppercase',
              color: '#8c8c8c',
              padding: '8px 12px',
              margin: '12px 0 8px 0',
              letterSpacing: 1,
              fontWeight: 700
            }}>
              👤 QUẢN LÝ TÀI KHOẢN
            </h3>
            <Link to="/staff/accounts" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 16px',
                background: isActive('accounts') ? 'rgba(103, 126, 234, 0.15)' : 'transparent',
                color: isActive('accounts') ? '#667eea' : '#595959',
                borderRadius: 8,
                fontWeight: isActive('accounts') ? 600 : 'normal',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
                fontSize: 14,
                borderLeft: isActive('accounts') ? '3px solid #667eea' : '3px solid transparent'
              }}>
                👥 Quản lý Tài khoản
              </div>
            </Link>
          </div>

          {/* Course Management */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 11,
              textTransform: 'uppercase',
              color: '#8c8c8c',
              padding: '8px 12px',
              margin: '12px 0 8px 0',
              letterSpacing: 1,
              fontWeight: 700
            }}>
              📚 QUẢN LÝ KHÓA HỌC
            </h3>
            
            <Link to="/staff/subjects" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 16px',
                background: isActive('subjects') ? 'rgba(103, 126, 234, 0.15)' : 'transparent',
                color: isActive('subjects') ? '#667eea' : '#595959',
                borderRadius: 8,
                fontWeight: isActive('subjects') ? 600 : 'normal',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
                fontSize: 14,
                borderLeft: isActive('subjects') ? '3px solid #667eea' : '3px solid transparent'
              }}>
                📖 Quản lý Môn học
              </div>
            </Link>

            <Link to="/staff/syllabus" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 16px',
                background: isActive('syllabus') ? 'rgba(103, 126, 234, 0.15)' : 'transparent',
                color: isActive('syllabus') ? '#667eea' : '#595959',
                borderRadius: 8,
                fontWeight: isActive('syllabus') ? 600 : 'normal',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
                fontSize: 14,
                borderLeft: isActive('syllabus') ? '3px solid #667eea' : '3px solid transparent'
              }}>
                📋 Quản lý Giáo trình
              </div>
            </Link>

            <Link to="/staff/classes" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 16px',
                background: isActive('classes') ? 'rgba(103, 126, 234, 0.15)' : 'transparent',
                color: isActive('classes') ? '#667eea' : '#595959',
                borderRadius: 8,
                fontWeight: isActive('classes') ? 600 : 'normal',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
                fontSize: 14,
                borderLeft: isActive('classes') ? '3px solid #667eea' : '3px solid transparent'
              }}>
                🏫 Quản lý Lớp học
              </div>
            </Link>

            <Link to="/staff/enrollment" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 16px',
                background: isActive('enrollment') ? 'rgba(103, 126, 234, 0.15)' : 'transparent',
                color: isActive('enrollment') ? '#667eea' : '#595959',
                borderRadius: 8,
                fontWeight: isActive('enrollment') ? 600 : 'normal',
                cursor: 'pointer',
                marginBottom: 4,
                transition: 'all 0.2s',
                fontSize: 14,
                borderLeft: isActive('enrollment') ? '3px solid #667eea' : '3px solid transparent'
              }}>
                ✍️ Quản lý Đăng ký
              </div>
            </Link>
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#ff4d4f',
              border: '1px solid #ff4d4f',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff4d4f';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#ff4d4f';
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content - Centered with Max-Width (Balanced) */}
      <div style={{ 
        marginLeft: 280,
        flex: 1,
        minHeight: '100vh',
        background: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '32px 40px',
        boxSizing: 'border-box'
      }}>
        {/* Centered Container with Max-Width */}
        <div style={{
          width: '100%',
          maxWidth: 1300,
          margin: '0 auto'
        }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
