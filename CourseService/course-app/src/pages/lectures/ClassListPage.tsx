// src/features/courses/pages/ClassListPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Upload, School, Eye, Edit, Trash2 } from 'lucide-react';
import { useClasses, useDeleteClass } from '../../hooks/features/useClasses';
import { useAuth } from '../../hooks/useAuth'; 

interface ClassItem {
  id: number;
  code: string;
  name?: string;
  subjectName?: string;
  subject?: { name: string };
  lecturerEmail?: string;
  lecturerName?: string;
  studentCount?: number;
  maxStudents?: number;
}

const ClassListPage = () => {
  const navigate = useNavigate();
  const { user, isStaff, isHead, isLecturer, isStudent } = useAuth(); // Lấy quyền
  const { data: classes, isLoading } = useClasses();
  const deleteMutation = useDeleteClass();
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIC LỌC DỮ LIỆU THEO QUYỀN ---
  const safeClasses = Array.isArray(classes) ? classes : [];
  
  const filteredClasses = safeClasses.filter((cls: ClassItem) => {
    // 1. Lọc theo từ khóa tìm kiếm
    const matchSearch = cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        cls.code?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    // 2. Lọc theo QUYỀN (Role)
    if (isStaff || isHead) return true; // Staff & Trưởng phòng thấy hết
    
    if (isLecturer) {
        // Giả lập: So sánh email giảng viên (Trong thực tế Backend sẽ tự lọc trả về)
        // Nếu lớp chưa gán GV, hoặc gán GV khác -> Ẩn
        return cls.lecturerEmail === user?.email; 
    }
    
    if (isStudent) {
        // Giả lập: Mặc định sinh viên thấy các lớp mình đã tham gia
        // (Tạm thời return true để bạn test, sau này check trong danh sách members)
        return true; 
    }
    
    return false;
  });

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp này?')) deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <School className="text-blue-600" /> Quản Lý Lớp Học
          </h1>
          <p className="text-sm text-gray-500">
            {isStaff ? 'Quản lý, tạo mới và phân công lớp học.' : 
             isHead ? 'Xem danh sách toàn bộ các lớp trong khoa.' :
             'Danh sách các lớp học của bạn.'}
          </p>
        </div>

        {/* CHỈ STAFF MỚI CÓ QUYỀN TÁC ĐỘNG (IMPORT, CREATE) */}
        {isStaff && (
          <div className="flex gap-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm">
              <Upload size={20} /> Import Excel
            </button>
            <button onClick={() => navigate('/classes/create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm">
              <Plus size={20} /> Mở Lớp Mới
            </button>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg border shadow-sm flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm lớp học..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* DANH SÁCH LỚP */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b uppercase text-xs text-gray-600">
            <tr>
              <th className="p-4">Mã Lớp</th>
              <th className="p-4">Môn Học</th>
              <th className="p-4">Giảng Viên</th>
              <th className="p-4 text-center">Sĩ Số</th>
              <th className="p-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Đang tải...</td></tr> : 
             filteredClasses.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">Không tìm thấy lớp nào.</td></tr> :
             filteredClasses.map((cls: ClassItem) => (
              <tr key={cls.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-blue-600">{cls.code}</td>
                <td className="p-4">{cls.subjectName || cls.subject?.name}</td>
                <td className="p-4">
                    {cls.lecturerName || <span className="italic text-gray-400">Chưa phân công</span>}
                </td>
                <td className="p-4 text-center">{cls.studentCount || 0}/{cls.maxStudents}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => navigate(`/classes/${cls.id}`)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="Xem chi tiết">
                    <Eye size={18} />
                  </button>
                  
                  {/* CHỈ STAFF MỚI ĐƯỢC SỬA/XÓA */}
                  {isStaff && (
                    <>
                      <button className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Sửa">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(cls.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ClassListPage;