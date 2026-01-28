const TOKEN_KEY = "token";
const ROLE_KEY = "role";

export function saveAuth(data: { accessToken: string; role: string }) {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(ROLE_KEY, data.role);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

/**
 * Kiểm tra xem token có hết hạn không
 * @returns true nếu token hết hạn hoặc không hợp lệ
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;

  try {
    // Decode JWT payload
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(atob(parts[1]));
    
    // Kiểm tra exp claim
    if (!payload.exp) return true;

    // So sánh với thời gian hiện tại (exp tính bằng giây, Date.now() tính bằng mili giây)
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Thêm buffer 30 giây để tránh race condition
    return expiryTime - currentTime < 30000;
  } catch (error) {
    console.error('[Auth] Error checking token expiry:', error);
    return true;
  }
}

/**
 * Redirect về trang login và xóa token
 */
export function redirectToLogin() {
  clearAuth();
  const loginUrl = import.meta.env.VITE_ACCOUNT_SERVICE_URL || "http://localhost:5173";
  window.location.replace(`${loginUrl}/login`);
}