import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminLayout from "../pages/admin/AdminLayout";
import StaffLayout from "../pages/staff/StaffLayout";
import StudentDashboard from "../pages/student/StudentDashboard";
import Workspace from "../pages/student/Workspace";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<RequireRole allowedRoles={["Admin"]} />}>
            <Route path="/admin/*" element={<AdminLayout />} />
          </Route>

          <Route element={<RequireRole allowedRoles={["Staff"]} />}>
            <Route path="/staff/*" element={<StaffLayout />} />
          </Route>

          <Route element={<RequireRole allowedRoles={["Student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/workspace" element={<Workspace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}