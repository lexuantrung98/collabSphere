import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, createAccount, importAccounts, getAccounts } from "../../api/authApi";
import type { UserProfile, CreateAccountRequest } from "../../api/authApi";

const logoImage = "logo2.jpg";

interface ImportResult {
  successCount: number;
  errorCount: number;
  errorDetails: string[];
}

export default function StaffLayout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("Student");
  
  const [file, setFile] = useState<File | null>(null);

  const [accountList, setAccountList] = useState<UserProfile[]>([]);
  const [listRole, setListRole] = useState("Student");
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin user.");
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingList(true);
      try {
        const data = await getAccounts(listRole);
        setAccountList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchAccounts();
  }, [listRole]); 

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleCreateAccount = async () => {
    setMsg("");
    setError("");
    setImportResult(null);

    if (!newEmail.includes("@") || !newEmail.includes(".com")) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      const data: CreateAccountRequest = {
        email: newEmail,
        password: newPassword,
        role: newRole,
      };
      await createAccount(data);
      setMsg(`Tạo ${newRole} thành công!`);
      setNewEmail("");
      setNewPassword("");
      
      const updatedList = await getAccounts(listRole);
      setAccountList(updatedList);
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Lỗi kết nối";
      setError(message);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Vui lòng chọn file Excel");
      return;
    }
    setMsg("Đang xử lý...");
    setError("");
    setImportResult(null);

    try {
      const res = await importAccounts(file);
      setImportResult(res); 
      setMsg(""); 
      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      const updatedList = await getAccounts(listRole);
      setAccountList(updatedList);
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Lỗi import server";
      setError(message);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", display: "flex", backgroundColor: "#f5f7fa", fontFamily: "Helvetica, Arial, sans-serif", overflow: "hidden" }}>
      
      <div style={{ 
        width: 280, 
        backgroundColor: "#ffffff", 
        borderRight: "1px solid #e0e0e0", 
        display: "flex", 
        flexDirection: "column",
        height: "100%",
        zIndex: 10
      }}>
        <div style={{ padding: 24, display: "flex", alignItems: "center", borderBottom: "1px solid #f0f0f0" }}>
          <img src={logoImage} alt="Logo" style={{ width: 80, height: 50, marginRight: 12 }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: "#1877f2" }}>CollabSphere</h2>
            <span style={{ fontSize: 12, color: "#888" }}>Staff Panel</span>
          </div>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          {user && (
            <div style={{ marginBottom: 30, padding: "16px", background: "#f0f8ff", borderRadius: 8 }}>
              <p style={{ margin: "0 0 5px 0", fontSize: 12, color: "#666" }}>Đang đăng nhập:</p>
              <strong style={{ display: "block", marginBottom: 4, color: "#333", fontSize: 14 }}>{user.email}</strong>
              <span style={{ 
                background: "#096dd9", color: "white", padding: "2px 8px", borderRadius: 10, fontSize: 11 
              }}>{user.role}</span>
            </div>
          )}
          
          <div style={{ color: "#888", fontSize: 12, textTransform: "uppercase", marginBottom: 10, fontWeight: "bold" }}>Menu</div>
          <div style={{ 
            padding: "12px 16px", background: "#e7f3ff", color: "#1877f2", borderRadius: 8, fontWeight: "bold", cursor: "pointer", marginBottom: 8
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

      <div style={{ flex: 1, padding: "30px 40px", overflowY: "auto", height: "100%" }}>
        <h1 style={{ fontSize: 28, marginBottom: 5, marginTop: 0, color: "#333" }}>Tổng quan</h1>
        <p style={{ color: "#666", marginBottom: 30 }}>Khu vực quản lý danh sách sinh viên, giảng viên.</p>

        {msg && <div style={{ padding: "12px", background: "#d4edda", color: "#155724", borderRadius: 6, marginBottom: 20 }}>{msg}</div>}
        {error && <div style={{ padding: "12px", background: "#f8d7da", color: "#721c24", borderRadius: 6, marginBottom: 20 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 40 }}>
          
          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#28a745", borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              + Tạo 1 Tài Khoản
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Email</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                  placeholder="email@example.com" />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Mật khẩu</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}
                  placeholder="Mật khẩu..." />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: "500" }}>Vai trò</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" }}>
                  <option value="Student">Student (Sinh viên)</option>
                  <option value="Lecturer">Lecturer (Giảng viên)</option>
                </select>
              </div>
              <button onClick={handleCreateAccount}
                style={{ padding: "12px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", marginTop: 10 }}>
                Tạo Ngay
              </button>
            </div>
          </div>

          <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, color: "#17a2b8", borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              + Import File Excel
            </h3>
            <p style={{ fontSize: 13, color: "#555", background: "#f8f9fa", padding: 10, borderRadius: 4 }}>
              <strong>Yêu cầu File Excel:</strong> Cột A: Email | Cột B: Password | Cột C: Role
            </p>
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <input id="file-upload" type="file" accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} style={{ width: "100%" }} />
            </div>
            <button onClick={handleImport}
              style={{ width: "100%", padding: "12px", background: "#17a2b8", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>
              Upload File & Import
            </button>
            
            {importResult && (
              <div style={{ marginTop: 15 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 5 }}>Kết quả:</div>
                <div style={{ fontSize: 13, color: "green" }}>Thành công: {importResult.successCount}</div>
                <div style={{ fontSize: 13, color: "red" }}>Thất bại: {importResult.errorCount}</div>
                {importResult.errorDetails.length > 0 && (
                  <ul style={{ marginTop: 5, paddingLeft: 20, fontSize: 12, color: "red" }}>
                    {importResult.errorDetails.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
                    {importResult.errorDetails.length > 3 && <li>...</li>}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 15 }}>
              <h3 style={{ margin: 0, color: "#333" }}>Danh sách tài khoản hệ thống</h3>
              <select 
                value={listRole}
                onChange={(e) => setListRole(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", outline: "none", fontSize: 14, fontWeight: "bold", color: "#333" }}
              >
                <option value="Student">Student (Sinh viên)</option>
                <option value="Lecturer">Lecturer (Giảng viên)</option>
                <option value="Staff">Staff (Nhân viên)</option>
              </select>
            </div>

            {loadingList ? (
              <div style={{ padding: 20, textAlign: "center", color: "#666" }}>Đang tải dữ liệu...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", textAlign: "left", color: "#555" }}>
                    <th style={{ padding: "12px 16px", borderBottom: "2px solid #eee" }}>#</th>
                    <th style={{ padding: "12px 16px", borderBottom: "2px solid #eee" }}>Email</th>
                    <th style={{ padding: "12px 16px", borderBottom: "2px solid #eee" }}>Vai trò</th>
                    <th style={{ padding: "12px 16px", borderBottom: "2px solid #eee" }}>Ngày tạo</th>
                    <th style={{ padding: "12px 16px", borderBottom: "2px solid #eee" }}>Trạng thái</th>
                    <th style={{ padding: "12px 16px", borderBottom: "2px solid #eee", textAlign: "right" }}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {accountList.length === 0 ? (
                     <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "#999" }}>Không tìm thấy tài khoản nào.</td></tr>
                  ) : (
                    accountList.map((acc, index) => (
                      <tr key={acc.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "12px 16px", color: "#888" }}>{index + 1}</td>
                        <td style={{ padding: "12px 16px", fontWeight: "500", color: "#333" }}>{acc.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ 
                            background: acc.role === "Lecturer" ? "#e6f7ff" : "#f6ffed",
                            color: acc.role === "Lecturer" ? "#1890ff" : "#52c41a",
                            padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: "bold"
                          }}>
                            {acc.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#666" }}>
                          {new Date(acc.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: acc.isActive ? "green" : "red", fontWeight: "bold", fontSize: 12 }}>
                            {acc.isActive ? "● Active" : "● Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                           <button style={{ padding: "5px 10px", border: "1px solid #ddd", background: "white", borderRadius: 4, cursor: "pointer" }}>
                             Xem
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
        </div>

      </div>
    </div>
  );
}