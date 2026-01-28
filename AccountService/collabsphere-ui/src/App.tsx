import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import StaffLayout from './pages/staff/StaffLayout'
import CreateProject from './pages/lecturer/CreateProject'
import Workspace from './pages/student/Workspace'
import DeptHeadDashboard from './pages/depthead/DeptHeadDashboard'

function NotFound() {
  return (
    <div style={{ padding: 20, color: "red", textAlign: "center" }}>
      <h2>404 - Not Found</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/staff" element={<StaffLayout />} />
        <Route path="/lecturer/create-project" element={<CreateProject />} />
        <Route path="/dept-head" element={<DeptHeadDashboard />} />
        <Route path="/student/workspace" element={<Workspace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App