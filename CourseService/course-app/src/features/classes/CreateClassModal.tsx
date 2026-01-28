
import { useForm } from 'react-hook-form';
import { X, Save, Loader2 } from 'lucide-react';

import { useCreateClass } from '../../hooks/features/useClasses';
import { type CreateClassRequest, type Subject } from '../../types/course.types';
import { useSubjects } from '../../hooks/features/useSubjects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClassModal = ({ isOpen, onClose }: Props) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateClassRequest>();
  
  // 1. Lấy danh sách môn học để đổ vào Dropdown
  const { data: subjectData } = useSubjects();
  const subjects = Array.isArray(subjectData) ? subjectData : (subjectData?.data || []);

  // 2. Hook tạo lớp
  const createMutation = useCreateClass();

  const onSubmit = (data: CreateClassRequest) => {
    // Convert string sang number và thêm year mặc định
    const currentYear = new Date().getFullYear();
    const payload = { 
      ...data, 
      subjectId: Number(data.subjectId),
      year: data.year || currentYear
    };
    
    createMutation.mutate(payload, {
      onSuccess: () => {
        reset(); // Xóa form
        onClose(); // Đóng modal
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">Thêm Lớp Học Mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã Lớp</label>
              <input 
                {...register("code", { required: "Vui lòng nhập mã lớp" })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: SE104.O21"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Học Kỳ</label>
              <input 
                {...register("semester", { required: "Nhập học kỳ" })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: HK1_2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Lớp</label>
            <input 
              {...register("name", { required: "Vui lòng nhập tên lớp" })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="VD: Nhập môn Công nghệ phần mềm - Nhóm 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Môn Học</label>
            <select 
              {...register("subjectId", { required: "Phải chọn môn học" })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((sub: Subject) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} ({sub.credits} TC)
                </option>
              ))}
            </select>
            {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId.message}</p>}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>}
              Lưu Lớp Học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;