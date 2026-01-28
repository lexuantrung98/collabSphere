// src/context/MockAuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

// 1. Thêm role HEAD
export type UserRole = 'STAFF' | 'HEAD' | 'LECTURER' | 'STUDENT';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isStaff: boolean;
  isHead: boolean;      // Mới
  isLecturer: boolean;
  isStudent: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Cập nhật dữ liệu mẫu
const MOCK_USERS: Record<UserRole, User> = {
  STAFF: {
    id: 'staff_01',
    name: 'Nguyễn Văn A (Giáo Vụ)',
    email: 'staff@school.edu',
    role: 'STAFF',
  },
  HEAD: {
    id: 'head_01',
    name: 'TS. Phạm Văn D (Trưởng Phòng)',
    email: 'head@school.edu',
    role: 'HEAD',
  },
  LECTURER: {
    id: 'lec_01',
    name: 'TS. Trần Thị B (Giảng Viên)',
    email: 'lecturer@school.edu', // Email này phải khớp với dữ liệu lớp học để test lọc
    role: 'LECTURER',
  },
  STUDENT: {
    id: 'stu_01',
    name: 'Lê Văn C (Sinh Viên)',
    email: 'student@school.edu',
    role: 'STUDENT',
  },
};

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(MOCK_USERS['STAFF']);

  const login = (role: UserRole) => setUser(MOCK_USERS[role]);
  const logout = () => setUser(null);

  const value = {
    user,
    isStaff: user?.role === 'STAFF',
    isHead: user?.role === 'HEAD',
    isLecturer: user?.role === 'LECTURER',
    isStudent: user?.role === 'STUDENT',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a MockAuthProvider');
  }
  return context;
};