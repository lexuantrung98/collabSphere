import { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Plus, Trash2, X, MessageSquare, Send, User, Calendar, CheckSquare, Clock } from "lucide-react";
import axios from "axios";
import { 
  getTasks, createTask, updateTaskStatus, deleteTask,
  getTaskComments, addTaskComment, deleteTaskComment, getStudentTeam, 
  addSubTask, toggleSubTask
} from "../../api/projectApi";
import type { Task, CreateTaskRequest, TaskComment } from "../../api/projectApi";

interface Props {
  teamId: string;
}

const STATUS_LABELS = ["Todo", "In Progress", "Review", "Done"];
const STATUS_COLORS = ["#d9d9d9", "#1890ff", "#faad14", "#52c41a"];

export default function StudentKanban({ teamId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(1);
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newSubTaskContent, setNewSubTaskContent] = useState("");

  const initData = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoading(true);
      
      const teamData = await getStudentTeam();
      const members = teamData.members || [];
      
      const ACCOUNT_SERVICE_URL = "http://localhost:5127"; 
      const membersWithInfo = await Promise.all(members.map(async (mem: any) => {
          try {
              const res = await axios.get(`${ACCOUNT_SERVICE_URL}/api/auth/get-user/${mem.userId}`);
              return { ...mem, email: res.data.email, roleName: res.data.role };
          } catch (error) { return mem; }
      }));
      setTeamMembers(membersWithInfo);

      const tasksData = await getTasks(teamId);
      setTasks(tasksData);

      const uid = localStorage.getItem("userId");
      if (uid) setCurrentUserId(uid);

    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [teamId]);

  useEffect(() => { initData(); }, [initData]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    
    const newStatus = parseInt(destination.droppableId);
    setTasks(prev => prev.map(t => t.id === draggableId ? { ...t, status: newStatus } : t));
    
    try { await updateTaskStatus(draggableId, newStatus); } 
    catch (err) { initData(); } 
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return alert("Nhập tiêu đề!");
    try {
      const payload: CreateTaskRequest = {
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        teamId: teamId,
        assignedTo: newTaskAssignee || undefined,
        deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : undefined,
        tags: "General" 
      };
      
      await createTask(payload);
      setShowModal(false);
      resetForm();
      initData();
    } catch (err) { alert("Lỗi tạo task"); }
  };

  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (window.confirm("Bạn chắc chắn muốn xóa task này?")) {
      try {
        await deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
        if (selectedTask?.id === taskId) setSelectedTask(null);
      } catch (err) { alert("Lỗi xóa task"); }
    }
  };

  const resetForm = () => {
      setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskAssignee(""); 
      setNewTaskDeadline("");
  };

  const handleTaskClick = async (task: Task) => {
    setSelectedTask(task);
    try {
      const cmtData = await getTaskComments(task.id);
      setComments(cmtData);
    } catch (error) { setComments([]); }
  };

  const handleAddSubTask = async () => {
      if(!selectedTask || !newSubTaskContent.trim()) return;
      try {
          const newSub = await addSubTask(selectedTask.id, newSubTaskContent);
          const updatedTask = { 
              ...selectedTask, 
              subTasks: [...(selectedTask.subTasks || []), newSub] 
          };
          setSelectedTask(updatedTask);
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          setNewSubTaskContent("");
      } catch (error) { alert("Lỗi thêm subtask"); }
  };

  const handleToggleSubTask = async (subId: string) => {
      if(!selectedTask) return;
      try {
          await toggleSubTask(subId);
          const updatedSubTasks = selectedTask.subTasks?.map(s => 
              s.id === subId ? { ...s, isDone: !s.isDone } : s
          );
          const updatedTask = { ...selectedTask, subTasks: updatedSubTasks };
          setSelectedTask(updatedTask);
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      } catch (error) { alert("Lỗi cập nhật subtask"); }
  };

  const handleSendComment = async () => {
    if (!selectedTask || !newComment.trim()) return;
    try {
      const added = await addTaskComment(selectedTask.id, newComment);
      const me = teamMembers.find(m => m.userId === currentUserId);
      if(me) added.email = me.email;
      
      setComments([...comments, added]);
      setNewComment("");
    } catch (error) { alert("Lỗi gửi bình luận"); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await deleteTaskComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) { alert("Không thể xóa bình luận này"); }
  };

  const getMemberName = (userId?: string) => {
    if (!userId) return "Unassigned";
    const mem = teamMembers.find(m => m.userId === userId);
    return mem ? (mem.email?.split('@')[0] || "User") : "Unknown";
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 20 }}>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: 8 }}
        >
          <Plus size={18} /> Thêm Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: 20, flex: 1, overflowX: "auto", paddingBottom: 10 }}>
          {[0, 1, 2, 3].map(statusIdx => (
              <div key={statusIdx} style={{ flex: 1, minWidth: 280, background: "#f0f2f5", borderRadius: 12, padding: 15, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "10px 15px", background: "white", borderRadius: 8, marginBottom: 15, fontWeight: "bold", borderLeft: `5px solid ${STATUS_COLORS[statusIdx]}`, display: "flex", justifyContent: "space-between" }}>
                  {STATUS_LABELS[statusIdx]}
                  <span style={{ background: "#eee", padding: "0 10px", borderRadius: 12, fontSize: 12 }}>
                    {tasks.filter(t => Number(t.status) === statusIdx).length}
                  </span>
                </div>
                <Droppable droppableId={statusIdx.toString()}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, minHeight: 100 }}>
                      {tasks.filter(t => Number(t.status) === statusIdx).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => handleTaskClick(task)} style={{ background: "white", padding: 15, borderRadius: 10, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", ...provided.draggableProps.style }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                <div style={{ fontWeight: "bold", fontSize: 15, color: "#333" }}>{task.title}</div>
                                <button onClick={(e) => handleDeleteTask(e, task.id)} style={{ border: "none", background: "transparent", color: "#ff4d4f", cursor: "pointer", padding: 4 }} title="Xóa task"><Trash2 size={16} /></button>
                              </div>
                              
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                                  {task.deadline && (
                                      <div style={{ fontSize: 11, color: new Date(task.deadline) < new Date() ? "red" : "#666", display: "flex", alignItems: "center", gap: 3 }}>
                                          <Clock size={12}/> {new Date(task.deadline).toLocaleDateString()}
                                      </div>
                                  )}
                                  {task.subTasks && task.subTasks.length > 0 && (
                                      <div style={{ fontSize: 11, color: "#666", display: "flex", alignItems: "center", gap: 3 }}>
                                          <CheckSquare size={12}/> {task.subTasks.filter(s => s.isDone).length}/{task.subTasks.length}
                                      </div>
                                  )}
                              </div>

                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> {getMemberName(task.assignedToUserId)}</div>
                                <div style={{ padding: "2px 8px", borderRadius: 4, background: task.priority === 3 ? "#fff1f0" : "#f0f5ff", color: task.priority === 3 ? "red" : "#2f54eb", fontWeight: "bold" }}>{task.priority === 3 ? "High" : "Normal"}</div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
          ))}
        </div>
      </DragDropContext>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 25, borderRadius: 12, width: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0 }}>Tạo công việc mới</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: "bold" }}>Tiêu đề</label>
                    <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6 }} />
                </div>
                <div>
                    <label style={{ fontSize: 12, fontWeight: "bold" }}>Mức độ</label>
                    <select value={newTaskPriority} onChange={e => setNewTaskPriority(Number(e.target.value))} style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6 }}>
                        <option value={1}>Thấp</option>
                        <option value={2}>Trung bình</option>
                        <option value={3}>Cao</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 12, fontWeight: "bold" }}>Mô tả</label>
                <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} style={{ width: "100%", height: 80, padding: 8, border: "1px solid #ddd", borderRadius: 6 }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
                <div>
                    <label style={{ fontSize: 12, fontWeight: "bold" }}>Gán cho</label>
                    <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)} style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6 }}>
                        <option value="">-- Chọn thành viên --</option>
                        {teamMembers.map(m => <option key={m.userId} value={m.userId}>{m.email?.split('@')[0]}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: "bold" }}>Hạn chót (Deadline)</label>
                <input type="date" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} style={{ width: "100%", padding: 8, border: "1px solid #ddd", borderRadius: 6 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "8px 20px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>Hủy</button>
                <button onClick={handleCreateTask} style={{ padding: "8px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>Tạo Task</button>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div style={{ background: "white", width: 900, height: "85vh", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
             
             <div style={{ padding: "20px 30px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: STATUS_COLORS[selectedTask.status] }}></div>
                    <h2 style={{ margin: 0, fontSize: 18 }}>{selectedTask.title}</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666" }}><X size={24}/></button>
             </div>

             <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <div style={{ flex: 2, padding: 30, overflowY: "auto", borderRight: "1px solid #eee" }}>
                    
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: "bold", fontSize: 13, color: "#666", display: "block", marginBottom: 5 }}>MÔ TẢ</label>
                        <div style={{ background: "#f9f9f9", padding: 15, borderRadius: 8 }}>{selectedTask.description || "Không có mô tả"}</div>
                    </div>

                    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                        <div>
                            <label style={{ fontWeight: "bold", fontSize: 13, color: "#666", display: "block", marginBottom: 5 }}>DEADLINE</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#333", fontSize: 14 }}>
                                <Calendar size={16} /> {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : "Không có"}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ fontWeight: "bold", fontSize: 13, color: "#666", display: "block", marginBottom: 5 }}>CHECKLIST (SUBTASKS)</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                            {selectedTask.subTasks?.map(sub => (
                                <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }} onClick={() => handleToggleSubTask(sub.id)}>
                                    <div style={{ cursor: "pointer" }}>
                                        {sub.isDone ? <CheckSquare size={18} color="#28a745" /> : <div style={{ width: 16, height: 16, border: "2px solid #ccc", borderRadius: 4 }}></div>}
                                    </div>
                                    <span style={{ textDecoration: sub.isDone ? "line-through" : "none", color: sub.isDone ? "#888" : "#333" }}>{sub.content}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ display: "flex", gap: 10 }}>
                            <input 
                                value={newSubTaskContent} 
                                onChange={e => setNewSubTaskContent(e.target.value)}
                                placeholder="Thêm việc nhỏ..."
                                style={{ flex: 1, padding: "6px 10px", borderRadius: 4, border: "1px solid #ddd" }}
                                onKeyPress={e => e.key === 'Enter' && handleAddSubTask()}
                            />
                            <button onClick={handleAddSubTask} style={{ padding: "6px 12px", background: "#f0f0f0", border: "none", borderRadius: 4, cursor: "pointer" }}><Plus size={16}/></button>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, background: "#fafafa", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: 20, borderBottom: "1px solid #eee", fontWeight: "bold" }}>Hoạt động</div>
                    <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
                        {comments.map(c => (
                            <div key={c.id} style={{ marginBottom: 15 }}>
                                <div style={{ fontWeight: "bold", fontSize: 13 }}>{c.email ? c.email.split('@')[0] : "User"}</div>
                                <div style={{ background: "white", padding: 8, borderRadius: 8, border: "1px solid #eee", fontSize: 14, marginTop: 4 }}>{c.content}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: 20, borderTop: "1px solid #eee", display: "flex", gap: 10 }}>
                        <input style={{ flex: 1, padding: 8, borderRadius: 20, border: "1px solid #ddd" }} value={newComment} onChange={e => setNewComment(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendComment()} placeholder="Viết bình luận..." />
                        <button onClick={handleSendComment} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#1890ff" }}><Send size={18}/></button>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}