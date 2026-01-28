import { useRef, useState, useEffect } from 'react';
import { useSubjects, useImportSubjects, useDeleteSubject, useCreateSubject, useUpdateSubject } from '../../hooks/features/useSubjects';
import { BookOpen, Loader2, FileSpreadsheet, Search, Plus, Trash2, Edit, X, Save, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type CreateSubjectRequest, type Subject } from '../../types/course.types';
import { useNavigate } from 'react-router-dom';



// --- COMPONENT MODAL NHẬP LIỆU ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Subject | null; // Nếu có data thì là Edit, không thì là Create
}

const SubjectModal = ({ isOpen, onClose, initialData }: ModalProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<CreateSubjectRequest>();
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();

  // Load dữ liệu cũ vào form khi mở modal Edit
  useEffect(() => {
    if (initialData) {
      setValue('code', initialData.code);
      setValue('name', initialData.name);
      setValue('credits', initialData.credits);
      setValue('description', initialData.description);
    } else {
      reset({ code: '', name: '', credits: 0, description: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  const onSubmit = (data: CreateSubjectRequest) => {
    const payload = { ...data, credits: Number(data.credits) };
    
    if (initialData) {
      // Logic Update
      updateMutation.mutate({ id: initialData.id, data: payload }, { onSuccess: onClose });
    } else {
      // Logic Create
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  if (!isOpen) return null;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{initialData ? 'Cập Nhật Môn Học' : 'Thêm Môn Học Mới'}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Mã Môn</label>
              <input {...register("code", { required: true })} className="w-full border p-2 rounded" placeholder="IT001" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tên Môn Học</label>
              <input {...register("name", { required: true })} className="w-full border p-2 rounded" placeholder="Nhập tên môn..." />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Số Tín Chỉ</label>
              <input type="number" {...register("credits", { required: true, min: 1 })} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô Tả</label>
            <textarea {...register("description")} className="w-full border p-2 rounded h-24" placeholder="Mô tả môn học..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4"/>} Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- TRANG CHÍNH ---
const SubjectPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useSubjects();
  const importMutation = useImportSubjects();
  const deleteMutation = useDeleteSubject();
  
  const [searchTerm, setSearchTerm] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const subjects = data?.data || [];
  const filteredSubjects = subjects.filter((s: Subject) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa môn học này? Hành động này không thể hoàn tác!')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/> Đang tải...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-blue-600"/> Quản Lý Môn Học</h1>
          <p className="text-gray-500 text-sm">{filteredSubjects.length} môn học trong hệ thống</p>
        </div>
        <div className="flex gap-2">
           <input type="file" ref={fileRef} className="hidden" accept=".xlsx" onChange={(e) => e.target.files?.[0] && importMutation.mutate(e.target.files[0])} />
           <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
             {importMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <FileSpreadsheet className="w-4 h-4"/>} Import Excel
           </button>
           <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
             <Plus className="w-4 h-4"/> Thêm Mới
           </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded border shadow-sm max-w-md relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm môn học..." 
          className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b uppercase text-xs text-gray-600">
            <tr>
              <th className="p-4">Mã Môn</th>
              <th className="p-4">Tên Môn</th>
              <th className="p-4 text-center">Tín Chỉ</th>
              <th className="p-4">Mô Tả</th>
              <th className="p-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
          {filteredSubjects.map((sub: Subject) => (
            <tr key={sub.id} className="hover:bg-gray-50">
              <td className="p-4 font-bold text-blue-600">{sub.code}</td>
              <td className="p-4 font-medium">{sub.name}</td>
              <td className="p-4 text-center">{sub.credits}</td>
              <td className="p-4 text-gray-500 truncate max-w-xs">{sub.description}</td>
              
              {/* CỘT HÀNH ĐỘNG ĐÃ SỬA LẠI ĐẦY ĐỦ */}
              <td className="p-4 text-right space-x-2">
                {/* 1. Nút Xem chi tiết */}
                <button 
                  onClick={() => navigate(`/subjects/${sub.id}`)} 
                  className="text-green-600 hover:bg-green-50 p-2 rounded"
                  title="Xem chi tiết"
                >
                  <Eye size={16}/> 
                </button>

                {/* 2. Nút Sửa */}
                <button 
                  onClick={() => handleOpenEdit(sub)} 
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                  title="Sửa"
                >
                  <Edit size={16}/>
                </button>

                {/* 3. Nút Xóa */}
                <button 
                  onClick={() => handleDelete(sub.id)} 
                  className="text-red-500 hover:bg-red-50 p-2 rounded"
                  title="Xóa"
                >
                  <Trash2 size={16}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        {filteredSubjects.length === 0 && <div className="p-8 text-center text-gray-400">Không tìm thấy dữ liệu</div>}
      </div>

      {/* Modal */}
      <SubjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingSubject} 
      />
    </div>
  );
};

export default SubjectPage;