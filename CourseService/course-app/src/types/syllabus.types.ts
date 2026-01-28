// Định nghĩa kiểu dữ liệu cho Giáo trình
export interface Syllabus {
  id: number;
  name: string;
  description: string;
  assignmentWeight: number; // Trọng số quá trình
  examWeight: number;       // Trọng số thi
  passGrade: number;        // Điểm đạt
  isActive: boolean;
  subjectId: number;
  createdAt: string;
}

// DTO để tạo mới hoặc cập nhật
export interface CreateSyllabusDto {
  name: string;
  description: string;
  assignmentWeight: number;
  examWeight: number;
  passGrade: number;
  subjectId: number;
}