import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Guards
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequiteRole';

// Layouts
import StaffLayout from './layouts/StaffLayout';
import LecturerLayout from './layouts/LecturerLayout';
import StudentLayout from './layouts/StudentLayout';

// Staff Pages
import SubjectsPage from './pages/staff/SubjectsPage';
import SyllabusPage from './pages/staff/SyllabusPage';
import ClassesPage from './pages/staff/ClassesPage';
import EnrollmentPage from './pages/staff/EnrollmentPage';

// Lecturer Pages
import LecturerClassesPage from './pages/lecturer/LecturerClassesPage';
import ResourcesPage from './pages/lecturer/ResourcesPage';

// Student Pages
import StudentClassesPage from './pages/student/StudentClassesPage';
import StudentResourcesPage from './pages/student/StudentResourcesPage';

function Unauthorized() {
  return (
    <div style={{ 
      padding: 50, 
      textAlign: "center",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7fa"
    }}>
      <div style={{ 
        background: "#fff", 
        padding: 50, 
        borderRadius: 16, 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
      }}>
        <h1 style={{ color: "#ff4d4f", fontSize: 48, margin: "0 0 20px 0" }}>403</h1>
        <h2 style={{ color: "#333", margin: "0 0 10px 0" }}>Không có quyền truy cập</h2>
        <p style={{ color: "#666", margin: "0 0 30px 0" }}>Bạn không có quyền truy cập trang này.</p>
        <a 
          href="http://localhost:5173/login" 
          style={{ 
            display: "inline-block",
            padding: "12px 24px",
            background: "#18b8f2", 
            color: "#fff", 
            textDecoration: "none",
            borderRadius: 8,
            fontWeight: "bold"
          }}
        >
          Quay lại đăng nhập
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        <Route path="/" element={<Navigate to="/staff/subjects" replace />} />
        
        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          
          {/* Staff Routes */}
          <Route element={<RequireRole allowedRoles={["Staff", "Admin"]} />}>
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<Navigate to="/staff/subjects" replace />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="syllabus" element={<SyllabusPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="enrollment" element={<EnrollmentPage />} />
            </Route>
          </Route>
          
          {/* Lecturer Routes */}
          <Route element={<RequireRole allowedRoles={["Lecturer", "HeadDepartment"]} />}>
            <Route path="/lecturer" element={<LecturerLayout />}>
              <Route index element={<Navigate to="/lecturer/classes" replace />} />
              <Route path="classes" element={<LecturerClassesPage />} />
              <Route path="resources" element={<ResourcesPage />} />
            </Route>
          </Route>
          
          {/* Student Routes */}
          <Route element={<RequireRole allowedRoles={["Student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="/student/classes" replace />} />
              <Route path="classes" element={<StudentClassesPage />} />
              <Route path="resources" element={<StudentResourcesPage />} />
            </Route>
          </Route>
          
        </Route>
        
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;