import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { login, forgotPassword, resetPassword } from "../api/authApi";
import type {
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../api/authApi";

const logoImage = "logo1.png";
const backgroundImage =
  "https://plus.unsplash.com/premium_vector-1720817289929-95cdb727f013?q=80&w=1121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleLogin = async (e: FormEvent | KeyboardEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      const data: LoginRequest = { email, password };
      const res = await login(data);

      localStorage.setItem("token", res.accessToken);
      localStorage.setItem("role", res.role);

      // Redirect dựa trên role
      // CourseService chạy tại port 5174
      const courseServiceUrl = "http://localhost:5175";

      // Truyền token qua URL để CourseService có thể lấy (do khác origin)
      const authParams = `?token=${encodeURIComponent(res.accessToken)}&role=${encodeURIComponent(res.role)}`;

      let navigatePath = "";
      if (res.role === "Admin") {
        navigatePath = "/admin"; // Admin ở lại AccountService
      } else if (res.role === "Staff") {
        navigatePath = `${courseServiceUrl}/staff/subjects${authParams}`; // Staff sang CourseService
      } else if (res.role === "HeadDepartment" || res.role === "Lecturer") {
        navigatePath = `${courseServiceUrl}/lecturer/classes${authParams}`;
      } else {
        navigatePath = `${courseServiceUrl}/student/classes${authParams}`;
      }

      window.location.href = navigatePath;
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: unknown } };
      if (axiosError.response && axiosError.response.data) {
        setError("Tài khoản hoặc mật khẩu không đúng!");
      } else {
        setError("Lỗi kết nối server");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setForgotError("");
    setForgotMsg("");
    try {
      const data: ForgotPasswordRequest = { email: forgotEmail };
      const res = await forgotPassword(data);
      setForgotMsg(`Mã xác nhận: ${res.code}`);
      setForgotStep(2);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setForgotError(axiosError.response?.data?.message || "Lỗi gửi mã");
    }
  };

  const handleResetPass = async () => {
    setForgotError("");
    setForgotMsg("");
    try {
      const data: ResetPasswordRequest = {
        email: forgotEmail,
        resetCode: resetCode,
        newPassword: newPass,
      };
      await resetPassword(data);
      alert("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      setShowForgot(false);
      setForgotStep(1);
      setForgotEmail("");
      setResetCode("");
      setNewPass("");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setForgotError(
        axiosError.response?.data?.message || "Lỗi đặt lại mật khẩu",
      );
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(85, 77, 77, 0.5)",
          zIndex: 0,
        }}
      ></div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          maxWidth: 1000,
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          zIndex: 1,
          position: "relative",
        }}
      >
        <div
          style={{
            flex: "1 1 400px",
            paddingRight: 32,
            marginBottom: 40,
            textAlign: "left",
          }}
        >
          <img
            src={logoImage}
            alt="CollabSphere Logo"
            style={{ height: 220, marginBottom: 10, display: "block" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <h2
            style={{
              fontSize: 28,
              fontWeight: "bold",
              lineHeight: "1.4",
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Hệ thống quản lý đào tạo và kết nối sinh viên trực tuyến.
          </h2>
        </div>
        <div
          style={{
            flex: "0 0 400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "40px 30px",
              borderRadius: 12,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#333",
                textAlign: "center",
                fontSize: 24,
              }}
            >
              Đăng Nhập
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin(e);
                  }
                }}
                style={{
                  padding: "10px 5px",
                  fontSize: 16,
                  border: "none",
                  borderBottom: "2px solid #ccc",
                  backgroundColor: "transparent",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderBottom = "2px solid #18b8f2")
                }
                onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin(e);
                  }
                }}
                style={{
                  padding: "10px 5px",
                  fontSize: 16,
                  border: "none",
                  borderBottom: "2px solid #ccc",
                  backgroundColor: "transparent",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderBottom = "2px solid #18b8f2")
                }
                onBlur={(e) => (e.target.style.borderBottom = "2px solid #ccc")}
              />

              {error && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: 13,
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={(e) => handleLogin(e)}
                disabled={loading}
                style={{
                  backgroundColor: "#18b8f2",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  padding: "12px",
                  border: "none",
                  borderRadius: 30,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 10,
                  boxShadow: "0 4px 6px rgba(24, 184, 242, 0.3)",
                }}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </div>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgot(true);
                }}
                style={{ color: "#666", fontSize: 14, textDecoration: "none" }}
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>
        </div>
      </div>

      {showForgot && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 12,
              width: 400,
              position: "relative",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={() => {
                setShowForgot(false);
                setForgotStep(1);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 15,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#999",
              }}
            >
              &times;
            </button>
            <h3 style={{ textAlign: "center", marginTop: 0, color: "#333" }}>
              Quên Mật Khẩu
            </h3>

            {forgotStep === 1 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 15 }}
              >
                <p style={{ fontSize: 14, color: "#666", textAlign: "center" }}>
                  Nhập email để nhận mã xác nhận.
                </p>
                <input
                  type="text"
                  placeholder="Email của bạn"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 15,
                  }}
                />
                <button
                  onClick={handleSendCode}
                  style={{
                    padding: "12px",
                    background: "#18b8f2",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Gửi Mã
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 15 }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: "green",
                    fontWeight: "bold",
                    textAlign: "center",
                    background: "#f6ffed",
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  {forgotMsg}
                </p>
                <input
                  type="text"
                  placeholder="Nhập mã xác nhận"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 15,
                  }}
                />
                <input
                  type="text"
                  placeholder="Mật khẩu mới"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 15,
                  }}
                />
                <button
                  onClick={handleResetPass}
                  style={{
                    padding: "12px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Đổi Mật Khẩu
                </button>
              </div>
            )}

            {forgotError && (
              <p
                style={{
                  color: "#dc3545",
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 15,
                  fontWeight: "bold",
                }}
              >
                {forgotError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
