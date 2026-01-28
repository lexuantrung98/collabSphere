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
