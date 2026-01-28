import axios from "axios";
const API_URL = "http://localhost:5234/api"; 

export const submitProject = async (
  groupId: string,
  url: string,
  desc: string,
  file: File | null
) => {
  const formData = new FormData();
  formData.append("GroupId", groupId);
  formData.append("SubmissionUrl", url);
  formData.append("Description", desc);
  if (file) {
    formData.append("File", file);
  }

  const response = await axios.post(`${API_URL}/Submissions/submit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const gradeSubmission = async (
  submissionId: string,
  score: number,
  feedback: string
) => {
  const response = await axios.put(`${API_URL}/Submissions/grade`, {
    submissionId,
    score,
    feedback,
  });
  return response.data;
};

export const downloadFile = async (submissionId: string, fileName: string) => {
  const response = await axios.get(`${API_URL}/Submissions/${submissionId}/download`, {
    responseType: "blob", 
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName || "downloaded_file");
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};