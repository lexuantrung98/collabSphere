import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { toast } from 'react-toastify';
import { type CreateSyllabusDto } from '../../types/syllabus.types';



// Lấy danh sách Syllabus 
export const useSyllabuses = (subjectId: number) => useQuery({
  queryKey: ['syllabuses', subjectId],
  queryFn: async () => {
    const res = await courseApi.getBySubject(subjectId);
    
    // LOGIC SỬA LỖI QUAN TRỌNG:
    if (Array.isArray(res)) return res;
    return (res as { data?: unknown[] }).data || []; 
  },
  enabled: !!subjectId, // Chỉ chạy khi có ID môn học
});

//  Tạo Syllabus
export const useCreateSyllabus = (subjectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSyllabusDto) => courseApi.createSyllabus(data),
    onSuccess: () => {
      toast.success('Thêm giáo trình thành công!');
      // Load lại danh sách ngay lập tức để UI cập nhật
      qc.invalidateQueries({ queryKey: ['syllabuses', subjectId] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi tạo giáo trình')
  });
};

// Xóa Syllabus
export const useDeleteSyllabus = (subjectId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => courseApi.deleteSyllabus(id),
    onSuccess: () => {
      toast.success('Đã xóa giáo trình');
      qc.invalidateQueries({ queryKey: ['syllabuses', subjectId] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi xóa giáo trình')
  });
};
