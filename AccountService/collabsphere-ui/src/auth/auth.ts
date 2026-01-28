export const getToken = () => {
  return localStorage.getItem("accessToken");
};

export const getRole = () => {
  return localStorage.getItem("role");
};

export const isAuthenticated = () => {
  return !!getToken();
};
