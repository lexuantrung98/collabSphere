import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Trash2, Loader2, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { courseApi } from '../../api/courseApi';
import { useAuth } from '../../hooks/useAuth';
import { type CreateSyllabusDto, type Syllabus } from '../../types/syllabus.types';
import { SyllabusManager } from '../../features/syllabus/SyllabusManager';
import {  
  useSyllabuses, 
  useCreateSyllabus, 
  useDeleteSyllabus 
} from '../../hooks/features/useSyllabus';
import { useSubjectDetail } from '../../hooks/features/useSubjects';



const SubjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const subjectId = id ? Number(id) : 0;
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  // State để lưu giáo trình đang được chọn xem chi tiết
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);

  // Hooks dữ liệu
  const { data: subject, isLoading: loadingSubject } = useSubjectDetail(subjectId);
  const { data: syllabuses, isLoading: loadingSyllabus } = useSyllabuses(subjectId);
  const createMutation = useCreateSyllabus(subjectId);
  const deleteMutation = useDeleteSyllabus(subjectId);

  // Tự động chọn giáo trình mới nhất để hiển thị khi load xong
  useEffect(() => {
    if (syllabuses && Array.isArray(syllabuses) && syllabuses.length > 0 && !selectedSyllabus) {
        setSelectedSyllabus(syllabuses[0]);
    }
  }, [syllabuses, selectedSyllabus]);

  // --- LOGIC IMPORT ---
  const importMutation = useMutation({
    mutationFn: (file: File) => courseApi.importSyllabus(file),
    onSuccess: () => {
      toast.success('Import thành công!');
      queryClient.invalidateQueries({ queryKey: ['syllabuses', subjectId] });
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi Import')
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      importMutation.mutate(e.target.files[0]);
      e.target.value = ''; 
    }
  };

  // --- LOGIC FORM ---
  const { register, handleSubmit, reset, watch } = useForm<CreateSyllabusDto>({
    defaultValues: { assignmentWeight: 30, examWeight: 70, passGrade: 5.0, subjectId }
  });
  const totalWeight = Number(watch('assignmentWeight') || 0) + Number(watch('examWeight') || 0);

  const onSubmit = (data: CreateSyllabusDto) => {
    if (totalWeight !== 100) { alert(`Tổng trọng số phải 100%`); return; }
    createMutation.mutate({ ...data, subjectId }, { onSuccess: () => { setShowForm(false); reset(); } });
  };

  // --- RENDER ---
  if (loadingSubject) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin"/> Đang tải...</div>;
  interface SubjectData { code: string; name: string; credits?: number; }
  const subjectData = subject as SubjectData | undefined; 
  if (!subjectData) return <div className="p-8 text-red-500">Môn học không tồn tại</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/subjects')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {subjectData.name} 
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{subjectData.code}</span>
          </h1>
        </div>
      </div>
      <hr />

      {/* DANH SÁCH GIÁO TRÌNH */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <BookOpen size={20} /> Danh sách Giáo trình
          </h2>
          <div className="flex gap-2">
            {isStaff && (
              <>
                <input type="file" hidden ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileChange} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  {importMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <FileSpreadsheet size={18} />} 
                  Import Excel
                </button>
              </>
            )}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              <Plus size={18} /> {showForm ? 'Đóng' : 'Thêm Giáo trình'}
            </button>
          </div>
        </div>

        {/* Form thêm mới */}
        {showForm && (
          <div className="bg-gray-50 border border-blue-200 rounded-lg p-6 mb-6 animate-fade-in">
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input {...register('name', {required:true})} placeholder="Tên giáo trình" className="border p-2 rounded w-full"/>
                  <input {...register('description')} placeholder="Mô tả" className="border p-2 rounded w-full"/>
                </div>
                <div className="grid grid-cols-3 gap-4 bg-white p-3 rounded border">
                   <div><label className="text-xs text-gray-500">Quá trình (%)</label><input type="number" {...register('assignmentWeight',{valueAsNumber:true})} className="border p-2 rounded w-full"/></div>
                   <div><label className="text-xs text-gray-500">Cuối kỳ (%)</label><input type="number" {...register('examWeight',{valueAsNumber:true})} className="border p-2 rounded w-full"/></div>
                   <div><label className="text-xs text-gray-500">Điểm đạt</label><input type="number" step="0.1" {...register('passGrade',{valueAsNumber:true})} className="border p-2 rounded w-full"/></div>
                </div>
                <button type="submit" disabled={totalWeight!==100} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Lưu</button>
             </form>
          </div>
        )}

        {/* Render Danh sách Card */}
        {loadingSyllabus ? <div className="text-center py-4">Đang tải...</div> : (
          <div className="grid grid-cols-1 gap-4">
            {(syllabuses as Syllabus[])?.map((syl) => (
              <div 
                key={syl.id} 
                onClick={() => setSelectedSyllabus(syl)} // Bấm vào để xem chi tiết
                className={`border rounded-lg p-4 flex justify-between items-center cursor-pointer transition hover:shadow-md ${
                    selectedSyllabus?.id === syl.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white'
                }`}
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{syl.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm mt-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium border border-orange-200">
                        QT: {syl.assignmentWeight}%
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium border border-purple-200">
                        CK: {syl.examWeight}%
                    </span>
                    {/* --- HIỂN THỊ ĐIỂM QUA MÔN --- */}
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium border border-green-200 flex items-center gap-1">
                        <CheckCircle size={12}/> Qua môn: ≥ {syl.passGrade}
                    </span>
                  </div>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Xóa?')) deleteMutation.mutate(syl.id); }} 
                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full"
                >
                    <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CHI TIẾT NỘI DUNG (PREVIEW) */}
      {Array.isArray(syllabuses) && syllabuses.length > 0 && (
         <section className="animate-fade-in pt-6 border-t">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="text-blue-600" /> Chi tiết Nội dung Bài học (Preview)
            </h2>
            {/* Truyền giáo trình đang chọn xuống Component con */}
            <SyllabusManager syllabus={selectedSyllabus} />
         </section>
      )}
    </div>
  );
};

export default SubjectDetailPage;