import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../../api/courseApi';
import { toast } from 'react-toastify';
// Gom hết các types vào 1 dòng import này thôi
import { 
  type AddStudentRequest 
} from '../../types/course.types';


export const useClasses = () => useQuery({
  queryKey: ['classes'],
  queryFn: async () => {
    const res = await courseApi.getClasses();
    // Logic lấy data
    if (Array.isArray(res)) return res;
    if (res.data && Array.isArray(res.data)) return res.data;
    const content = (res as { content?: unknown[] }).content;
    if (content && Array.isArray(content)) return content;
    
    return [];
  }
});

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; name?: string; subjectId: number; semester: string; year?: number; lecturerEmail?: string }) => courseApi.createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Tạo lớp học thành công!');
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi tạo lớp')
  });
};

// Hook Import Lớp từ Excel
export const useImportClasses = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseApi.importClasses,
    onSuccess: (res) => {
      toast.success(res.message);
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi import')
  });
};

// Hook Cập nhật lớp học
export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    // Giả sử API update là PUT /classes/{id}
    mutationFn: ({ id, data }: { id: number; data: Partial<{ code: string; subjectId: number; semester: string; year: number; lecturerEmail: string }> }) => courseApi.updateClass(id, data), 
    onSuccess: () => {
      toast.success('Cập nhật lớp học thành công!');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi cập nhật lớp')
  });
};

// Hook Xóa lớp học
export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({
    // Giả sử API delete là DELETE /classes/{id}
    mutationFn: (id: number) => courseApi.deleteClass(id),
    onSuccess: () => {
      toast.success('Đã xóa lớp học');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi xóa lớp (Lớp đã có sinh viên?)')
  });
};

// Lấy chi tiết 1 lớp (dựa vào ID)
export const useClassDetail = (id: number) => useQuery({
  queryKey: ['class', id],
  queryFn: () => courseApi.getClassById(id),
  enabled: !!id,
  select: (response: { data?: unknown } | unknown) => {
    if (typeof response === 'object' && response !== null && 'data' in response) {
      return (response as { data: unknown }).data;
    }
    return response;
  }
});

// Lấy danh sách sinh viên
export const useClassStudents = (classId: number) => useQuery({
  queryKey: ['students', classId],
  queryFn: () => courseApi.getClassStudents(classId),
  enabled: !!classId,
  select: (response: { data?: unknown } | unknown) => {
    if (typeof response === 'object' && response !== null && 'data' in response) {
      return (response as { data: unknown }).data;
    }
    return response;
  }
});

// Thêm sinh viên
export const useAddStudent = (classId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddStudentRequest) => courseApi.addStudentToClass(classId, data.studentCode),
    onSuccess: () => {
      toast.success('Đã thêm sinh viên vào lớp');
      qc.invalidateQueries({ queryKey: ['students', classId] });
      // Cập nhật lại sĩ số lớp nếu cần
      qc.invalidateQueries({ queryKey: ['class', classId] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Không tìm thấy sinh viên này')
  });
};

// Xóa sinh viên
export const useRemoveStudent = (classId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) => courseApi.removeStudentFromClass(classId, memberId),
    onSuccess: () => {
      toast.success('Đã xóa sinh viên khỏi lớp');
      qc.invalidateQueries({ queryKey: ['students', classId] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi xóa sinh viên')
  });
};

// Import Sinh viên Excel
export const useImportClassMembers = (classId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => courseApi.importClassMembers(classId, file),
    onSuccess: (res: { message?: string }) => {
      toast.success(res.message || 'Import thành công!');
      qc.invalidateQueries({ queryKey: ['students', classId] });
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi import'),
  });
};

export const useAssignLecturer = (classId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => courseApi.assignLecturer(classId, email),
    onSuccess: () => {
      toast.success('Đã cập nhật giảng viên!');
      qc.invalidateQueries({ queryKey: ['class', classId] }); // Load lại thông tin lớp
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message || 'Lỗi phân công'),
  });
};



