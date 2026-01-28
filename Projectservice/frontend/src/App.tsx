import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LecturerLayout from './pages/layouts/LecturerLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentKanban from './pages/student/StudentKanban';
import StudentMilestones from './pages/student/StudentMilestones';
import Workspace from './pages/student/Workspace';
import SubmitProject from './pages/SubmitProject';
import CreateProject from './pages/lecturer/CreateProject';
import GradeProject from './pages/lecturer/GradeProject';
import GroupManagement from './pages/lecturer/GroupManagement';
import LecturerProgress from './pages/lecturer/LecturerProgress';
import ProjectList from './pages/lecturer/ProjectList';
import DeptHeadDashboard from './pages/depthead/DeptHeadDashboard';
import ProjectApproval from './pages/depthead/ProjectApproval';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/student/dashboard" replace />} />

        <Route path="/student">
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="kanban" element={<StudentKanban />} />
          <Route path="milestones" element={<StudentMilestones />} />
          <Route path="workspace/:projectId" element={<Workspace />} />
          <Route path="submit" element={<SubmitProject />} />
        </Route>

        <Route path="/lecturer" element={<LecturerLayout />}>
          <Route index element={<ProjectList />} />
          <Route path="dashboard" element={<ProjectList />} />
          <Route path="create" element={<CreateProject />} />
          <Route path="grade" element={<GradeProject />} />            
          <Route path="grade/:projectId" element={<GradeProject />} /> 
          
          <Route path="groups" element={<GroupManagement />} />
          <Route path="progress" element={<LecturerProgress />} />
        </Route>

        <Route path="/depthead">
           <Route path="dashboard" element={<DeptHeadDashboard />} />
           <Route path="approval" element={<ProjectApproval />} />
        </Route>
        
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;