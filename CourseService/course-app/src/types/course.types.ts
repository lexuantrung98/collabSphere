export interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  description?: string;
}

export interface ClassEntity {
  id: number;
  code: string;
  name: string;
  semester: string;
  status: string;
  maxStudents: number;
  subjectId: number;
  subject?: Subject; 
  lecturerId?: string;
  lecturerName?: string;
  lecturerEmail?: string;
}

export interface ClassResource {
  id: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface CreateClassRequest {
  code: string;
  name: string;
  semester: string;
  year?: number;
  subjectId: number;
  lecturerId?: string;
}

export interface ClassMember {
  id: number;        // ID trong bảng AspNetUsers
  classId: number;
  studentCode: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface AddStudentRequest {
  studentCode: string; // Hoặc email tùy backend bạn
}

export interface CreateSubjectRequest {
  code: string;
  name: string;
  credits: number;
  description?: string; // Dấu ? nghĩa là có thể để trống (null)
}