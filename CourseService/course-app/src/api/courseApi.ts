import axiosClient from './axiosClient';
import { type CreateSyllabusDto } from '../types/syllabus.types';

// ============== SUBJECT APIs ==============
export const getSubjects = async () => {
  const response = await axiosClient.get('/subjects');
  return response.data || response;
};

export const createSubject = async (data: { code: string; name: string; credits: number }) => {
  const response = await axiosClient.post('/subjects', data);
  return response.data || response;
};

export const updateSubject = async (id: number, data: { code: string; name: string; credits: number }) => {
  const response = await axiosClient.put(`/subjects/${id}`, data);
  return response.data || response;
};

export const deleteSubject = async (id: number) => {
  const response = await axiosClient.delete(`/subjects/${id}`);
  return response.data || response;
};

export const getSubjectById = async (id: number) => {
  const response = await axiosClient.get(`/subjects/${id}`);
  return response.data || response;
};

export const importSubjects = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/subjects/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data || response;
};

// ============== SYLLABUS APIs ==============
export const getSyllabusBySubject = async (subjectId: number) => {
  const response = await axiosClient.get(`/syllabuses?subjectId=${subjectId}`);
  return response.data || response;
};

export const getBySubject = getSyllabusBySubject; // Alias

export const createSyllabus = async (data: CreateSyllabusDto) => {
  const response = await axiosClient.post('/syllabuses', data);
  return response.data || response;
};

export const uploadSyllabus = async (subjectId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('subjectId', subjectId.toString());
  const response = await axiosClient.post('/syllabuses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data || response;
};

export const deleteSyllabus = async (id: number) => {
  const response = await axiosClient.delete(`/syllabuses/${id}`);
  return response.data || response;
};

// ============== CLASS APIs ==============
export const getClasses = async () => {
  const response = await axiosClient.get('/classes');
  return response.data || response;
};

export const getClassById = async (id: number) => {
  const response = await axiosClient.get(`/classes/${id}`);
  return response.data || response;
};

export const getClassStudents = async (classId: number) => {
  const response = await axiosClient.get(`/classes/${classId}/members`);
  return response.data || response;
};

export const createClass = async (data: {
  code: string;
  name?: string;
  subjectId: number;
  semester: string;
  year?: number;
  lecturerEmail?: string;
}) => {
  const response = await axiosClient.post('/classes', data);
  return response.data || response;
};

export const updateClass = async (id: number, data: {
  code?: string;
  subjectId?: number;
  semester?: string;
  year?: number;
  lecturerEmail?: string;
}) => {
  const response = await axiosClient.put(`/classes/${id}`, data);
  return response.data || response;
};

export const deleteClass = async (id: number) => {
  const response = await axiosClient.delete(`/classes/${id}`);
  return response.data || response;
};

export const importClasses = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/classes/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data || response;
};

export const assignLecturer = async (classId: number, email: string) => {
  return await axiosClient.post(`/classes/${classId}/assign-lecturer`, { email });
};

// Get lecturers list for auto complete
export const getLecturers = async () => {
  return await axiosClient.get('/classes/lecturers');
};

// ============== CLASS MEMBERS APIs ==============
export const getClassMembers = async (classId: number) => {
  const response = await axiosClient.get(`/classes/${classId}/members`);
  return response.data || response;
};

export const addStudentToClass = async (classId: number, studentCode: string) => {
  const response = await axiosClient.post(`/classes/${classId}/members`, { studentCode });
  return response.data || response;
};

export const removeStudentFromClass = async (classId: number, memberId: number) => {
  const response = await axiosClient.delete(`/classes/${classId}/members/${memberId}`);
  return response.data || response;
};

export const importClassMembers = async (classId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post(`/classes/${classId}/members/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data || response;
};

// ============== CLASS RESOURCES APIs ==============
export const getClassResources = async (classId: number) => {
  const response = await axiosClient.get(`/classes/${classId}/resources`);
  return response.data || response;
};

export const uploadResource = async (classId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post(`/classes/${classId}/resources`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data || response;
};

export const deleteResource = async (resourceId: number) => {
  const response = await axiosClient.delete(`/classes/resources/${resourceId}`);
  return response.data || response;
};

export const downloadResource = async (resourceId: number) => {
  const response = await axiosClient.get(`/classes/resources/${resourceId}/download`, {
    responseType: 'blob'
  });
  return response;
};

// ============== IMPORT SYLLABUS ==============
export const importSyllabus = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post('/syllabuses/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data || response;
};

// ============== COURSE API OBJECT (for legacy imports) ==============
export const courseApi = {
  // Subjects
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  importSubjects,
  getSubjectById,
  // Syllabus
  getSyllabusBySubject,
  getBySubject,
  createSyllabus,
  uploadSyllabus,
  deleteSyllabus,
  importSyllabus,
  // Classes
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  importClasses,
  assignLecturer,
  getClassById,
  getClassStudents,
  // Members
  getClassMembers,
  addStudentToClass,
  removeStudentFromClass,
  importClassMembers,
  // Resources
  getClassResources,
  uploadResource,
  deleteResource,
  downloadResource
};

