import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, createAccount, getAccounts, deactivateAccount, reactivateAccount } from "../../api/authApi";
import type { UserProfile, CreateAccountRequest } from "../../api/authApi";

const logoImage = "logo2.jpg";

export default function AdminLayout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Staff");

  const fetchAllData = async () => {
    try {
      const profileData = await getProfile();
      setUser(profileData);

      const accountsData = await getAccounts(""); 
      setAccounts(accountsData);
    } catch (err: any) {
      console.error(err);
      const statusCode = err.response ? err.response.status : "Unknown";
      const message = err.response?.data?.message || err.message;
      setError(`Lỗi (${statusCode}): ${message}`);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleCreateAccount = async () => {
    setMsg("");
    setError("");

    if (!newEmail.includes("@") || !newEmail.includes(".com")) {
      setError("Email không hợp lệ. Phải chứa ký tự '@' và '.com'");
      return;
    }

    try {
      const data: CreateAccountRequest = {
        email: newEmail,
        password: newPassword,
        role: newRole,
      };
      await createAccount(data);
      setMsg("Tạo tài khoản thành công!");
      setNewEmail("");
      setNewPassword("");
      
      const accountsData = await getAccounts("");
      setAccounts(accountsData);
      
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Lỗi tạo tài khoản");
      } else {
        setError("Lỗi kết nối server");
      }
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn KHÓA tài khoản này không?")) return;
    try {
      await deactivateAccount(id);
      setMsg("Đã khóa tài khoản thành công");
      fetchAllData();
    } catch (err: any) {
       console.error(err);
       setError("Lỗi khi khóa tài khoản");
    }
  };

  const handleReactivate = async (id: string) => {
    if (!window.confirm("Bạn có muốn MỞ KHÓA tài khoản này không?")) return;
    try {
      await reactivateAccount(id);
      setMsg("Đã mở khóa tài khoản thành công");
      fetchAllData();
    } catch (err: any) {
       console.error(err);
       setError("Lỗi khi mở khóa tài khoản");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif" }}>
      
      <div style={{ 
        width: 280, 
        backgroundColor: "#ffffffff", 
        borderRight: "1px solid #e0e0e0", 
        display: "flex", 
        flexDirection: "column",
        position: "fixed",
        height: "100%",
        zIndex: 10
      }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 80, height: 50, marginRight: 12 }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Admin Panel</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {user && (
            <div style={{ marginBottom: 30, padding: "16px", background: "#f0f8ff", borderRadius: 8 }}>
              <p style={{ margin: "0 0 5px 0", fontSize: 12, color: "#666" }}>Đang đăng nhập:</p>
              <strong style={{ display: "block", marginBottom: 4, color: "#333", fontSize: 14 }}>{user.email}</strong>
              <span style={{ 
                background: "#1877f2", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11 
              }}>{user.role}</span>
            </div>
          )}
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu</div>
          <div style={{ 
            padding: "12px 16px", background: "#e7f3ff", color: "#1877f2", borderRadius: 8, fontWeight: "bold", cursor: "pointer" 
          }}>
            Quản lý Tài khoản
          </div>
        </div>

        <div style={{ padding: 24, borderTop: "1px solid #f0f0f0" }}>
          <button
            onClick={handleLogout}
            style={{ 
              width: "100%", padding: "12px", background: "#fff", color: "#ff4d4f", 
              border: "1px solid #ff4d4f", borderRadius: 6, cursor: "pointer", fontWeight: "bold"
            }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "30px 40px", marginLeft: 280 }}>
        <h1 style={{ fontSize: 28, marginBottom: 5, marginTop: 0, color: "#333" }}>Tổng quan</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>Quản lý toàn bộ người dùng và phân quyền trong hệ thống.</p>

        {msg && <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 20 }}>{msg}</div>}
        {error && <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: 6, marginBottom: 20 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 30 }}>
          
          <div style={{ 
            background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: "fit-content" 
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#333", borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              + Tạo Tài Khoản Mới
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                  placeholder="example@collabsphere.com"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Mật khẩu</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                  placeholder="Nhập mật khẩu..."
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Vai trò (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                >
                  <option value="Staff">Staff (Nhân viên)</option>
                  <option value="HeadDepartment">Head Department (Trưởng bộ môn)</option>
                </select>
              </div>
              <button
                onClick={handleCreateAccount}
                style={{ 
                  padding: "12px", background: "#1877f2", color: "white", border: "none", 
                  borderRadius: 6, cursor: "pointer", fontWeight: "bold", marginTop: 10 
                }}
              >
                Tạo Tài Khoản
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
               <h3 style={{ margin: 0, color: "#333" }}>Danh Sách Người Dùng</h3>
               <span style={{ background: "#eee", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: "bold" }}>
                 Total: {accounts.length}
               </span>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", color: "#666", borderBottom: "2px solid #eee" }}>Email</th>
                    <th style={{ padding: "12px 16px", color: "#666", borderBottom: "2px solid #eee" }}>Role</th>
                    <th style={{ padding: "12px 16px", color: "#666", borderBottom: "2px solid #eee" }}>Status</th>
                    <th style={{ padding: "12px 16px", color: "#666", borderBottom: "2px solid #eee" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "14px 16px", fontWeight: "500", color: "#333" }}>{acc.email}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ 
                          padding: "4px 10px", 
                          borderRadius: 20, 
                          fontSize: 12,
                          fontWeight: "bold",
                          background: acc.role === "Admin" ? "#fff1f0" : acc.role === "Staff" ? "#e6f7ff" : acc.role === "Student" ? "#f6ffed" : "#fff7e6",
                          color: acc.role === "Admin" ? "#cf1322" : acc.role === "Staff" ? "#096dd9" : acc.role === "Student" ? "#389e0d" : "#d46b08",
                          border: "1px solid",
                          borderColor: acc.role === "Admin" ? "#ffa39e" : acc.role === "Staff" ? "#91d5ff" : acc.role === "Student" ? "#b7eb8f" : "#ffd591"
                        }}>
                          {acc.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ 
                            color: acc.isActive ? "#28a745" : "#dc3545", 
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: 5
                        }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: acc.isActive ? "#28a745" : "#dc3545" }}></span>
                          {acc.isActive ? "Active" : "Locked"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {acc.email !== user?.email && (
                          <>
                            {acc.isActive ? (
                              <button 
                                onClick={() => handleDeactivate(acc.id)}
                                style={{ 
                                    padding: "6px 12px", background: "#fff", color: "#ff4d4f", 
                                    border: "1px solid #ff4d4f", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: "bold" 
                                }}
                              >
                                Khóa
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleReactivate(acc.id)}
                                style={{ 
                                    padding: "6px 12px", background: "#fff", color: "#28a745", 
                                    border: "1px solid #28a745", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: "bold" 
                                }}
                              >
                                Mở khóa
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}