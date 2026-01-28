const BASE_URL = "http://localhost:5234/api";

const PROJECT_API_URL = `${BASE_URL}/ProjectTemplates`;
const GROUP_API_URL = `${BASE_URL}/ProjectGroups`;
const SUBMISSION_API_URL = `${BASE_URL}/ProjectSubmissions`;
const TASK_API_URL = `${BASE_URL}/ProjectTasks`;

export interface MilestoneDto {
  title: string;
  description: string;
  orderIndex: number;
  deadline?: string;
  questions: string[];
}

export interface Milestone {
  id: string;
  name: string;
  title?: string;
  description: string;
  durationDays?: number;
  deadline?: string;
  orderIndex: number;
}

export interface CreateProjectRequest {
  subjectId: string;
  name: string;
  description: string;
  deadline?: string;
  milestones: MilestoneDto[];
}

export interface ProjectTemplate {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  deadline?: string;
  status: number;
  createdBy: string;
  createdAt: string;
  assignedClassIds?: string;
  milestones: Milestone[];
}

export interface GroupMember {
  id: string;
  studentId: string;
  fullName: string;
  role: string;
}

export interface ProjectGroup {
  id: string;
  projectTemplateId: string;
  name: string;
  classId: string;
  members: GroupMember[];
  projectTemplate?: ProjectTemplate;
}

export interface ProjectData {
  id: string;
  subjectId: string;
  title: string;
  name?: string;
  description: string;
  objectives?: string;
  milestones: Milestone[];
}

export interface Submission {
  id: string;
  projectGroupId: string;
  projectMilestoneId?: string;
  milestoneId?: string;
  content: string;
  description?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface SubTask {
  id: string;
  content: string;
  isDone: boolean;
}

export interface TaskComment {
  id: string;
  content: string;
  createdByUserId: string;
  email?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: number;
  priority: number;
  deadline?: string;
  assignedTo?: string;
  assignedToUserId?: string;
  subTasks?: SubTask[];
  comments?: TaskComment[];
}

export interface Reflection {
  id: string;
  userId: string;
  userCode?: string;
  content: string;
  submittedAt: string;
}

export interface PeerEvaluation {
  evaluateeId: string;
  score: number;
  comment: string;
}
export const getMyGroup = async (studentId: string) => {
  try {
    const response = await fetch(`${GROUP_API_URL}/student/${studentId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) { return null; }
};

export const getGroupsByProject = async (projectId: string) => {
  const response = await fetch(`${GROUP_API_URL}/by-project/${projectId}`);
  return await response.json();
};

export const createGroup = async (projectId: string, name: string, classId: string) => {
  const response = await fetch(GROUP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectTemplateId: projectId, name, classId }),
  });
  return await response.json();
};

export const addMemberToGroup = async (groupId: string, studentId: string, fullName: string) => {
  const response = await fetch(`${GROUP_API_URL}/add-member`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, studentId, fullName }),
  });
  return await response.json();
};

export const removeMember = async (memberId: string) => {
    await fetch(`${GROUP_API_URL}/members/${memberId}`, { method: "DELETE" });
};
export const getStudentProject = async (): Promise<ProjectData | null> => {
  const studentId = "HE150001";
  const group = await getMyGroup(studentId);
  
  if (group && group.projectTemplate) {
      return {
          id: group.projectTemplate.id,
          subjectId: group.projectTemplate.subjectId,
          title: group.projectTemplate.name,
          name: group.projectTemplate.name,
          description: group.projectTemplate.description,
          objectives: group.projectTemplate.description,
          milestones: group.projectTemplate.milestones.map((m:any) => ({
              id: m.id,
              name: m.title || m.name || m.Title,
              title: m.title || m.name || m.Title,
              description: m.description,
              durationDays: 7,
              deadline: m.deadline,
              orderIndex: 0
          }))
      };
  }
  return null;
};

export const getStudentTeam = async () => {
  const studentId = "HE150001";
  const group = await getMyGroup(studentId);
  if(group) {
      return {
          team: group,
          members: group.members?.map((m:any) => ({
              userId: m.studentId,
              studentCode: m.studentId,
              fullName: m.fullName,
              role: m.role === "Leader" ? 1 : 0
          }))
      };
  }
  return null;
};
export const getMyProjects = async () => { const p = await getStudentProject(); return p ? [p] : []; };
export const getMyTeam = getStudentTeam;
export const getTasksByGroup = async (groupId: string) => {
  const response = await fetch(`${TASK_API_URL}/group/${groupId}`);
  return await response.json();
};
export const getTasks = getTasksByGroup;

export const createTask = async (dataOrGroupId: any, title?: string) => {
  let payload;
 
  if (typeof dataOrGroupId === 'string' && title) {
     payload = { groupId: dataOrGroupId, title: title };
  } else {
     payload = dataOrGroupId;
  }

  const response = await fetch(TASK_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await response.json();
};

export const updateTaskStatus = async (taskId: string, newStatus: number) => {
  await fetch(`${TASK_API_URL}/${taskId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStatus),
  });
};

export const deleteTask = async (taskId: string) => {
  await fetch(`${TASK_API_URL}/${taskId}`, { method: "DELETE" });
};

export const addTaskComment = async (taskId: string, content: string, userId: string) => {
  const response = await fetch(`${TASK_API_URL}/${taskId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, userId }),
  });
  return await response.json();
};

export const addSubTask = async (taskId: string, content: string) => {
    const response = await fetch(`${TASK_API_URL}/${taskId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }), 
    });
    return await response.json();
};

export const toggleSubTask = async (subId: string) => {
    await fetch(`${TASK_API_URL}/subtasks/${subId}/toggle`, { method: "PUT" });
};
export const getTaskComments = async (taskId: string) => { return []; };
export const deleteTaskComment = async (commentId: string) => { };

export const createProject = async (data: CreateProjectRequest) => {
  const response = await fetch(PROJECT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getAllProjects = async (): Promise<ProjectTemplate[]> => {
  const response = await fetch(PROJECT_API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return await response.json();
};

export const updateProjectStatus = async (id: string, status: number) => {
  await fetch(`${PROJECT_API_URL}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(status),
  });
};

export const assignClassToProject = async (id: string, classId: string) => {
  await fetch(`${PROJECT_API_URL}/${id}/assign`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(classId), 
  });
};

export const getSubmissionsByProject = async (projectId: string) => {
  const response = await fetch(`${SUBMISSION_API_URL}/project/${projectId}`);
  return await response.json();
};

export const getSubmissions = async (projectId: string, teamId: string) => {
  const response = await fetch(`${SUBMISSION_API_URL}/project/${projectId}/team/${teamId}`);
  const data = await response.json();
  return data.map((s: any) => ({ ...s, milestoneId: s.projectMilestoneId }));
};

export const submitWork = async (data: { 
    projectId: string; milestoneId: string; teamId: string; 
    content: string; description: string; file?: File 
}) => {
    const formData = new FormData();
    formData.append("ProjectId", data.projectId);
    formData.append("MilestoneId", data.milestoneId);
    formData.append("TeamId", data.teamId);
    formData.append("Description", data.description);
    
    if (data.file) {
        formData.append("File", data.file);
    } else {
        formData.append("Content", data.content);
    }

    const response = await fetch(`${SUBMISSION_API_URL}/submit-work`, {
        method: "POST",
        body: formData,
    });
    
    if (!response.ok) throw new Error("Lỗi nộp bài");
    return await response.json();
};

export const gradeSubmission = async (id: string, grade: number, feedback: string) => {
  const response = await fetch(`${SUBMISSION_API_URL}/${id}/grade`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grade, feedback }),
  });
  return await response.json();
};
export const mockStudentSubmit = async (groupId: string, milestoneId: string, content: string) => {
    return submitWork({ projectId: "", milestoneId, teamId: groupId, content, description: "" });
};
export const getReflections = async (milestoneId: string): Promise<Reflection[]> => { return []; };
export const postReflection = async (milestoneId: string, content: string): Promise<Reflection> => {
    return { id: Date.now().toString(), userId: "HE150001", userCode: "HE150001", content, submittedAt: new Date().toISOString() };
};
export const getMyEvaluations = async (projectId: string) => { return []; };
export const submitEvaluation = async (data: any) => { return true; };