import { type ReactNode } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { BookOpen, LayoutDashboard, GraduationCap, FolderKanban, Menu } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-xl font-bold text-gray-800">CollabSphere</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/subjects" icon={<BookOpen size={20} />} label="Môn Học" />
          <NavItem to="/classes" icon={<GraduationCap size={20} />} label="Lớp Học" />
          <NavItem to="/projects" icon={<FolderKanban size={20} />} label="Dự Án" />
        </nav>

        <div className="p-4 border-t text-xs text-gray-500 text-center">
          © 2024 Course Service
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10">
          <button className="md:hidden p-2 text-gray-600">
            <Menu />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-medium text-gray-700">Giảng viên Demo</span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              GV
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Nơi nội dung trang con (SubjectPage) sẽ hiển thị */}
        </main>
      </div>
    </div>
  );
};

// Component con để link active đổi màu đẹp
const NavItem = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-600 font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default MainLayout;