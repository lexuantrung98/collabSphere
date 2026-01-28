import { useState } from 'react';
import { UserPlus, School } from 'lucide-react';
// Import các hooks gọi API add student, assign lecturer ở đây...

interface StaffClassManagerProps {
  classId: number;
}

export const StaffClassManager = ({ classId }: StaffClassManagerProps) => {
  const [studentCode, setStudentCode] = useState('');
  const [lecturerEmail, setLecturerEmail] = useState('');
  
  // Giả sử bạn đã có hooks từ useCourseData.ts
  // const addStudentMutation = useAddStudent();
  // const assignLecturerMutation = useAssignLecturer();

  const handleAddStudent = () => {
    if(!studentCode) return;
    // TODO: Integrate with API
    // addStudentMutation.mutate({ classId, studentCode });
    console.log('Adding student to class:', classId, studentCode);
    alert(`[STAFF] Đang thêm sinh viên: ${studentCode}`);
  };

  const handleAssignLecturer = () => {
    if(!lecturerEmail) return;
    // TODO: Integrate with API
    // assignLecturerMutation.mutate({ classId, email: lecturerEmail });
    console.log('Assigning lecturer to class:', classId, lecturerEmail);
    alert(`[STAFF] Đang phân công giảng viên: ${lecturerEmail}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
      {/* 1. Thêm sinh viên (Enrollment) */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <UserPlus size={18} className="text-blue-600"/> Thêm Sinh Viên (Enroll)
        </h3>
        <div className="flex gap-2">
          <input 
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            placeholder="Nhập MSSV..." 
            className="border p-2 rounded w-full text-sm outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button 
            onClick={handleAddStudent}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap hover:bg-blue-700"
          >
            Thêm
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          * Staff import Excel danh sách lớp tại đây
        </div>
      </div>

      {/* 2. Phân công giảng viên */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
          <School size={18} className="text-purple-600"/> Phân công Giảng Viên
        </h3>
        <div className="flex gap-2">
          <input 
            value={lecturerEmail}
            onChange={(e) => setLecturerEmail(e.target.value)}
            placeholder="Email giảng viên..." 
            className="border p-2 rounded w-full text-sm outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button 
            onClick={handleAssignLecturer}
            className="bg-purple-600 text-white px-3 py-2 rounded text-sm whitespace-nowrap hover:bg-purple-700"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};