import axios from "axios";

const projectClient = axios.create({
  baseURL: "http://localhost:5006/api",
  headers: {
    "Content-Type": "application/json",
  },
});

projectClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Milestone {
  id: string;
  name: string;
  description: string;
  criteria: string;
  durationDays: number;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  objectives: string;
  subjectId: string;
  milestones: Milestone[];
}

export interface SubTask {
  id: string;
  taskId: string;
  content: string;
  isDone: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: number;
  priority: number;
  teamId: string;
  assignedToUserId?: string;
  assignedTo?: string;
  deadline?: string;
  tags?: string;
  subTasks?: SubTask[];
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: number;
  teamId: string;
  assignedTo?: string;
  deadline?: string;
  tags?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  objectives: string;
  subjectId: string;
  status: number;
  ownerId: string;
  milestones: Milestone[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  email?: string;
}

export interface Submission {
  id: string;
  projectId: string;
  milestoneId: string;
  teamId: string;
  submittedBy: string;
  content: string;
  description: string;
  submittedAt: string;
  status: number;
  grade?: number;
  feedback?: string;
}

export interface SubmitRequest {
  projectId: string;
  milestoneId: string;
  teamId: string;
  content: string;
  description: string;
  file?: File;
}

export interface EvaluationRequest {
  projectId: string;
  teamId: string;
  evaluateeId: string;
  score: number;
  comment: string;
}

export interface PeerEvaluation {
  id: string;
  evaluatorId: string;
  evaluateeId: string;
  score: number;
  comment: string;
}
export interface Reflection {
  id: string;
  content: string;
  submittedAt: string;
  userId: string;
  userEmail?: string;
  userCode?: string;
}
export const getReflections = async (milestoneId: string) => {
  const res = await projectClient.get(`/reflection/${milestoneId}`);
  return res.data;
};

export const postReflection = async (milestoneId: string, content: string) => {
  const res = await projectClient.post("/reflection", { milestoneId, content });
  return res.data;
};

export const createProject = async (data: CreateProjectRequest) => {
  const res = await projectClient.post("/project", data);
  return res.data;
};

export const getMyProjects = async () => {
  const res = await projectClient.get("/project/my-projects");
  return res.data;
};

export const getTasks = async (teamId: string) => {
  const res = await projectClient.get(`/project/tasks/${teamId}`);
  return res.data;
};

export const createTask = async (data: CreateTaskRequest) => {
  const res = await projectClient.post("/project/tasks", data);
  return res.data;
};

export const updateTaskStatus = async (taskId: string, status: number) => {
  const res = await projectClient.put(`/project/tasks/${taskId}/status`, status, {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
};

export const deleteTask = async (taskId: string) => {
  const res = await projectClient.delete(`/project/tasks/${taskId}`);
  return res.data;
};

export const getPendingProjects = async () => {
  const res = await projectClient.get("/project/pending");
  return res.data;
};

export const getApprovedProjects = async () => {
  const res = await projectClient.get("/project/approved");
  return res.data;
};

export const approveProject = async (id: string) => {
  const res = await projectClient.put(`/project/${id}/approve`);
  return res.data;
};

export const rejectProject = async (id: string) => {
  const res = await projectClient.put(`/project/${id}/reject`);
  return res.data;
};

export const assignProjectToClass = async (id: string, classId: string) => {
  const res = await projectClient.post(`/project/${id}/assign`, JSON.stringify(classId), {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
};

export const getStudentProject = async () => {
  const res = await projectClient.get("/project/student/my-project");
  return res.data;
};

export const getStudentTeam = async () => {
  const res = await projectClient.get("/project/student/my-team");
  return res.data;
};

export const getMyTeam = async () => {
  const res = await projectClient.get("/project/student/my-team");
  return res.data;
};

export const getTaskComments = async (taskId: string) => {
  const res = await projectClient.get(`/taskcomment/${taskId}`);
  return res.data;
};

export const addTaskComment = async (taskId: string, content: string) => {
  const res = await projectClient.post("/taskcomment", { taskId, content });
  return res.data;
};

export const deleteTaskComment = async (commentId: string) => {
  const res = await projectClient.delete(`/taskcomment/${commentId}`);
  return res.data;
};

export const getSubmissions = async (projectId: string, teamId: string) => {
  const res = await projectClient.get(`/submission/project/${projectId}/team/${teamId}`);
  return res.data;
};

export const submitWork = async (data: SubmitRequest) => {
  const formData = new FormData();
  formData.append("ProjectId", data.projectId);
  formData.append("MilestoneId", data.milestoneId);
  formData.append("TeamId", data.teamId);
  formData.append("Content", data.content);
  formData.append("Description", data.description);
  
  if (data.file) {
    formData.append("File", data.file);
  }

  const res = await projectClient.post("/submission", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const submitEvaluation = async (data: EvaluationRequest) => {
  const res = await projectClient.post("/peerevaluation", data);
  return res.data;
};

export const getMyEvaluations = async (projectId: string) => {
  const res = await projectClient.get(`/peerevaluation/my-evaluations/${projectId}`);
  return res.data;
};

export const addSubTask = async (taskId: string, content: string) => {
  const res = await projectClient.post(`/project/tasks/${taskId}/subtasks`, JSON.stringify(content), {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
};

export const toggleSubTask = async (subTaskId: string) => {
  const res = await projectClient.put(`/project/subtasks/${subTaskId}/toggle`);
  return res.data;
};