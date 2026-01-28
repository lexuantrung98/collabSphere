// src/features/courses/pages/ClassDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, FolderOpen, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useClasses } from '../../hooks/features/useClasses';
// Import các component con đã tạo ở bài trước
import { StaffClassManager } from '../../pages/staff/StaffClassManager';
import { ClassResources } from '../../features/classes/ClassResources';

interface ClassData {
  id: number;
  name: string;
  code: string;
  subjectName?: string;
  semester?: string;
}

const ClassDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStaff, isLecturer, isStudent, isHead } = useAuth();
  
  const { data: classes } = useClasses();
  const classData = Array.isArray(classes) ? classes.find((c: ClassData) => c.id === Number(id)) : null;

  if (!classData) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/classes')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {classData.name} ({classData.code})
                <span className={`text-xs px-2 py-1 rounded text-white ${
                    isStaff ? 'bg-blue-500' : isHead ? 'bg-red-500' : isLecturer ? 'bg-purple-500' : 'bg-green-500'
                }`}>
                {isHead ? 'TRƯỞNG PHÒNG VIEW' : user?.role}
                </span>
            </h1>
            <p className="text-gray-500">{classData.subjectName} - {classData.semester}</p>
            </div>
        </div>
      </div>
      <hr />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- CỘT TRÁI: NỘI DUNG CHÍNH --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. KHU VỰC CỦA STAFF (Phân công) */}
            {isStaff && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 mb-2">Dành cho Nhân viên</h3>
                    <StaffClassManager classId={Number(id)} />
                </div>
            )}

            {/* 2. KHU VỰC TÀI NGUYÊN (Ai cũng xem được, quyền sửa xóa do Component con xử lý) */}
            <ClassResources classId={Number(id)} />

            {/* 3. QUẢN LÝ NHÓM (Dành cho Giảng Viên & Sinh Viên) */}
            {(isLecturer || isStudent) && (
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Users className="text-purple-600" /> 
                            {isLecturer ? 'Quản Lý Các Nhóm' : 'Nhóm Của Tôi'}
                        </h3>
                        {isLecturer && (
                            <button className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 font-medium">
                                + Tạo Nhóm Mới
                            </button>
                        )}
                    </div>
                    
                    {/* Placeholder giao diện nhóm */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(g => (
                            <div key={g} className="border p-4 rounded bg-gray-50 hover:bg-white hover:shadow transition cursor-pointer">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-700">Nhóm 0{g}</h4>
                                    {isLecturer && <Settings size={16} className="text-gray-400 hover:text-purple-600"/>}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Đề tài: Xây dựng Website Bán Hàng</p>
                                <div className="mt-3 flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-red-200 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">+2</div>
                                </div>
                                {isStudent && <button className="mt-3 text-xs w-full bg-white border border-gray-300 py-1 rounded">Vào không gian làm việc</button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* --- CỘT PHẢI: THÔNG TIN PHỤ --- */}
        <div className="space-y-6">
            {/* THÔNG TIN DỰ ÁN (Giảng viên) */}
            {isLecturer && (
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                        <FolderOpen size={18} className="text-orange-500"/> Dự Án Lớp Học
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                        Quản lý đề tài và phân công dự án cho các nhóm.
                    </p>
                    <button className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded text-sm hover:bg-orange-100">
                        Quản lý Dự Án
                    </button>
                </div>
            )}

            {/* DANH SÁCH SINH VIÊN (Chế độ xem gọn) */}
            <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                    <Users size={18} className="text-gray-500"/> Danh Sách Lớp
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                   {/* Render list sinh viên giả lập hoặc từ API */}
                   <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">SV</div>
                        <div>
                            <p className="text-sm font-medium">Nguyễn Văn A</p>
                            <p className="text-xs text-gray-400">20110xxx</p>
                        </div>
                   </div>
                   <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs">SV</div>
                        <div>
                            <p className="text-sm font-medium">Lê Thị B</p>
                            <p className="text-xs text-gray-400">20110xxx</p>
                        </div>
                   </div>
                </div>
                {isStaff && (
                    <button className="w-full mt-3 text-sm text-blue-600 hover:underline">
                        Quản lý chi tiết
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailPage;