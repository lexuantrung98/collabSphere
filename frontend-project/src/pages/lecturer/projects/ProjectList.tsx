import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllProjects,
  assignClassToProject,
  getGroupsByProject,
  getGroupsByClass,
  getSubmissionsByProject,
  deleteProjectGroup,
  type ProjectTemplate,
} from "../../../api/projectApi";
import * as projectApi from "../../../api/projectApi";
import courseApi from "../../../api/courseApi";
import { getToken } from "../../../utils/authStorage";
import {
  Search,
  Plus,
  Folder,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  ChevronRight,
  X,
  Users,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { toast } from "react-toastify";

interface ClassInfo {
  id: number;
  name: string;
  code: string;
  subjectName?: string;
  subjectCode?: string;
}

interface GroupInfo {
  id: string; // GUID from ProjectService
  name: string;
  memberCount?: number;
  maxMembers?: number;
  classId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members?: any[];
}

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<
    (ProjectTemplate & {
      progress: number;
      groupCount: number;
      classNames?: string[];
    })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  // Classes & Groups for modal
  const [myClasses, setMyClasses] = useState<ClassInfo[]>([]);
  const [selectedModalClassId, setSelectedModalClassId] = useState<
    number | null
  >(null);
  const [availableGroups, setAvailableGroups] = useState<GroupInfo[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectTemplate | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processLog, setProcessLog] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assignedGroups, setAssignedGroups] = useState<any[]>([]); // Groups already assigned to project
  const [loadingAssignedGroups, setLoadingAssignedGroups] = useState(false);

  // Load lecturer's classes
  useEffect(() => {
    const loadMyClasses = async () => {
      try {
        const token = getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const email = payload.email || payload.sub || "";
          const response = await courseApi.getClassesByLecturer(email);
          const classList = response.data?.data || response.data || [];
          setMyClasses(classList);
        }
      } catch (error) {
        console.error("Error loading classes:", error);
      }
    };
    loadMyClasses();
  }, []);

  const loadGroupsForClass = async (classId: number) => {
    setLoadingGroups(true);
    try {
      // Get selected class code
      const selectedClass = myClasses.find(c => c.id === classId);
      const selectedClassCode = selectedClass?.code;
      
      if (!selectedClassCode) {
        console.warn('⚠️ No class code found for classId:', classId);
        setAvailableGroups([]);
        return;
      }
      
      // Call ProjectService to get groups by class CODE
      const response = await getGroupsByClass(selectedClassCode);
      const groups = Array.isArray(response) ? response : (response?.data || []);
      
      // Convert ProjectGroup[] to GroupInfo[] format
      // IMPORTANT: Keep original GUID from ProjectService for assign-project API
      const groupsInfo: GroupInfo[] = groups.map((g: { id: string; name: string; classId: string; members?: unknown[]; maxMembers?: number }) => ({
        id: g.id, // Keep GUID string! Will be used for assign-project
        name: g.name,
        classId: g.classId,
        memberCount: g.members?.length || 0,
        maxMembers: g.maxMembers,
        members: g.members
      }));
      
      // Filter out groups already assigned to THIS project
      const filteredGroups = groupsInfo.filter((g: GroupInfo) => 
        !assignedGroups.some(ag => 
          ag.name === g.name && ag.classId === selectedClassCode
        )
      );
      
      setAvailableGroups(filteredGroups);
    } catch (error) {
      console.error("❌ Error loading groups:", error);
      setAvailableGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();

      const enhancedData = await Promise.all(
        data.map(async (p) => {
          let progress = 0;
          let groupCount = 0;
          try {
            const [groups, submissions] = await Promise.all([
              getGroupsByProject(p.id).catch(() => []),
              getSubmissionsByProject(p.id).catch(() => []),
            ]);

            groupCount = Array.isArray(groups) ? groups.length : 0;
            const milestones = p.milestones || [];

            if (groupCount > 0 && milestones.length > 0) {
              const totalExpected = groupCount * milestones.length;
              const totalSubmitted = Array.isArray(submissions)
                ? submissions.length
                : 0;
              progress = Math.min(
                100,
                Math.round((totalSubmitted / totalExpected) * 100),
              );
            }
          } catch {
            console.log("Could not calculate progress for project " + p.id);
          }
          return { ...p, progress, groupCount };
        }),
      );

      // Sort by createdAt descending
      enhancedData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setProjects(enhancedData);
    } catch {
      toast.error("Lỗi tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const getStatusConfig = (status: number) => {
    switch (status) {
      case 0:
        return {
          bg: "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)",
          text: "#d46b08",
          label: "Chờ duyệt",
          icon: Clock,
        };
      case 1:
        return {
          bg: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)",
          text: "#389e0d",
          label: "Đang chạy",
          icon: CheckCircle,
        };
      default:
        return {
          bg: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)",
          text: "#cf1322",
          label: "Từ chối",
          icon: AlertCircle,
        };
    }
  };

  const handleAddGroup = async () => {
    if (processing) return; // Prevent double-click
    
    if (!selectedModalClassId || !selectedProject)
      return toast.error("Vui lòng chọn lớp!");
    if (!selectedGroupId) return toast.error("Vui lòng chọn nhóm!");

    const selectedClass = myClasses.find((c) => c.id === selectedModalClassId);
    if (!selectedClass) return toast.error("Không tìm thấy lớp!");

    const selectedGroup = availableGroups.find((g) => g.id === selectedGroupId);
    if (!selectedGroup) return toast.error("Không tìm thấy nhóm!");

    setProcessing(true);
    setProcessLog(["🚀 Bắt đầu thêm nhóm vào dự án..."]);

    try {
      setProcessLog((prev) => [
        ...prev,
        `📌 Gán lớp ${selectedClass.code} vào dự án...`,
      ]);
      await assignClassToProject(selectedProject.id, selectedClass.code);

      // NEW LOGIC: Assign existing group to project (don't create new group)
      setProcessLog(prev => [...prev, `👥 Gán nhóm "${selectedGroup.name}" vào dự án...`]);
      
      // Call new assign-project endpoint
      await projectApi.assignGroupToProject(selectedGroup.id, selectedProject.id);

      setProcessLog((prev) => [...prev, "✅ Thêm nhóm thành công!"]);

      setTimeout(() => {
        setIsModalOpen(false);
        setProcessing(false);
        setProcessLog([]);
        setSelectedModalClassId(null);
        setSelectedGroupId(null);
        toast.success("Đã thêm nhóm thành công!");
        loadProjects();
      }, 1500);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Không thể thêm nhóm.";
      setProcessLog((prev) => [...prev, `❌ Lỗi: ${errorMsg}`]);
      toast.error(errorMsg);
      setProcessing(false);
    }
  };

  const openGroupModal = async (
    e: React.MouseEvent,
    project: ProjectTemplate,
  ) => {
    e.stopPropagation();
    setSelectedProject(project);
    setSelectedModalClassId(null);
    setSelectedGroupId(null);
    setAvailableGroups([]);
    setAssignedGroups([]);
    setIsModalOpen(true);

    // Load groups already assigned to this project
    setLoadingAssignedGroups(true);
    try {
      const groups = await getGroupsByProject(project.id);
      setAssignedGroups(Array.isArray(groups) ? groups : []);
    } catch (error) {
      console.error("Error loading assigned groups:", error);
      setAssignedGroups([]);
    } finally {
      setLoadingAssignedGroups(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subjectId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === null || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: projects.length,
    pending: projects.filter((p) => p.status === 0).length,
    active: projects.filter((p) => p.status === 1).length,
    rejected: projects.filter((p) => p.status === 2).length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("vi-VN");

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              color: "#1f1f1f",
            }}
          >
            Quản lý Dự án
          </h1>
          <p style={{ margin: "5px 0 0 0", color: "#8c8c8c" }}>
            Theo dõi và quản lý các đề tài của bạn
          </p>
        </div>
        <button
          onClick={() => navigate("/lecturer/projects/create")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <Plus size={18} /> Tạo Đề Tài Mới
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          onClick={() => setStatusFilter(null)}
          style={{
            background:
              statusFilter === null
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#fff",
            padding: 20,
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background:
                  statusFilter === null ? "rgba(255,255,255,0.2)" : "#e6f7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Folder
                size={24}
                color={statusFilter === null ? "#fff" : "#1890ff"}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: statusFilter === null ? "#fff" : "#333",
                }}
              >
                {stats.total}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color:
                    statusFilter === null ? "rgba(255,255,255,0.8)" : "#888",
                }}
              >
                Tổng dự án
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(0)}
          style={{
            background:
              statusFilter === 0
                ? "linear-gradient(135deg, #faad14 0%, #d48806 100%)"
                : "#fff",
            padding: 20,
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background:
                  statusFilter === 0 ? "rgba(255,255,255,0.2)" : "#fffbe6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock
                size={24}
                color={statusFilter === 0 ? "#fff" : "#faad14"}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: statusFilter === 0 ? "#fff" : "#333",
                }}
              >
                {stats.pending}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: statusFilter === 0 ? "rgba(255,255,255,0.8)" : "#888",
                }}
              >
                Chờ duyệt
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(1)}
          style={{
            background:
              statusFilter === 1
                ? "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)"
                : "#fff",
            padding: 20,
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background:
                  statusFilter === 1 ? "rgba(255,255,255,0.2)" : "#f6ffed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp
                size={24}
                color={statusFilter === 1 ? "#fff" : "#52c41a"}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: statusFilter === 1 ? "#fff" : "#333",
                }}
              >
                {stats.active}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: statusFilter === 1 ? "rgba(255,255,255,0.8)" : "#888",
                }}
              >
                Đang chạy
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter(2)}
          style={{
            background:
              statusFilter === 2
                ? "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)"
                : "#fff",
            padding: 20,
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background:
                  statusFilter === 2 ? "rgba(255,255,255,0.2)" : "#fff2f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertCircle
                size={24}
                color={statusFilter === 2 ? "#fff" : "#ff4d4f"}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: statusFilter === 2 ? "#fff" : "#333",
                }}
              >
                {stats.rejected}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: statusFilter === 2 ? "rgba(255,255,255,0.8)" : "#888",
                }}
              >
                Từ chối
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Search & Filters */}
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f5f5f5",
              borderRadius: 10,
              padding: "10px 16px",
              width: 350,
            }}
          >
            <Search size={18} color="#999" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              style={{
                border: "none",
                background: "transparent",
                marginLeft: 10,
                outline: "none",
                width: "100%",
                fontSize: 14,
              }}
            />
          </div>
          {statusFilter !== null && (
            <button
              onClick={() => setStatusFilter(null)}
              style={{
                padding: "8px 16px",
                background: "#f0f0f0",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Project List */}
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#999" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            />
            Đang tải dữ liệu...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#999" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p>Không tìm thấy dự án nào</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 0 }}>
            {filteredProjects.map((p) => {
              const status = getStatusConfig(p.status);
              const StatusIcon = status.icon;

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/lecturer/projects/grade/${p.id}`)}
                  style={{
                    padding: 24,
                    borderBottom: "1px solid #f5f5f5",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafbff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  {/* Left: Project Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          background: status.bg,
                          color: status.text,
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                      <span style={{ fontSize: 12, color: "#999" }}>
                        {p.subjectId}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#333",
                      }}
                    >
                      {p.name}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 20,
                        fontSize: 13,
                        color: "#888",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Calendar size={14} /> {formatDate(p.createdAt)}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Users size={14} /> {p.groupCount} nhóm
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <BarChart3 size={14} /> {p.milestones?.length || 0}{" "}
                        milestones
                      </span>
                    </div>
                  </div>

                  {/* Middle: Progress */}
                  <div style={{ width: 180, marginRight: 24 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 6,
                        color: "#666",
                      }}
                    >
                      <span>Tiến độ</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: p.progress === 100 ? "#52c41a" : "#667eea",
                        }}
                      >
                        {p.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        background: "#f0f0f0",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${p.progress}%`,
                          height: "100%",
                          background:
                            p.progress === 100
                              ? "linear-gradient(90deg, #52c41a 0%, #389e0d 100%)"
                              : "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: 10,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      onClick={(e) => {
                        // Chỉ cho phép phân nhóm khi dự án đã duyệt
                        if (p.status !== 1) {
                          e.stopPropagation();
                          toast.warning(
                            p.status === 0 
                              ? "Dự án đang chờ duyệt. Vui lòng đợi trưởng phòng phê duyệt!" 
                              : "Dự án đã bị từ chối. Không thể phân nhóm!"
                          );
                          return;
                        }
                        openGroupModal(e, p);
                      }}
                      disabled={p.status !== 1}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 16px",
                        borderRadius: 8,
                        border: p.status === 1 ? "1px solid #e8e8e8" : "1px solid #d9d9d9",
                        background: p.status === 1 ? "white" : "#f5f5f5",
                        color: p.status === 1 ? "#555" : "#999",
                        cursor: p.status === 1 ? "pointer" : "not-allowed",
                        fontWeight: 500,
                        transition: "all 0.2s",
                        fontSize: 13,
                        opacity: p.status === 1 ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (p.status === 1) {
                          e.currentTarget.style.borderColor = "#667eea";
                          e.currentTarget.style.color = "#667eea";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (p.status === 1) {
                          e.currentTarget.style.borderColor = "#e8e8e8";
                          e.currentTarget.style.color = "#555";
                        }
                      }}
                      title={
                        p.status === 0 
                          ? "⏳ Dự án đang chờ duyệt" 
                          : p.status === 2 
                          ? "❌ Dự án đã bị từ chối" 
                          : "Phân nhóm cho dự án"
                      }
                    >
                      <Settings size={16} /> Phân Nhóm
                    </button>
                    <ChevronRight size={20} color="#ccc" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group Modal */}
      {isModalOpen && selectedProject && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 16,
              width: 500,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 20, color: "#333" }}>
                  Cấu hình nhóm
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#888" }}>
                  {selectedProject.name}
                </p>
              </div>
              {!processing && (
                <X
                  style={{ cursor: "pointer", color: "#999" }}
                  onClick={() => setIsModalOpen(false)}
                />
              )}
            </div>

            {!processing ? (
              <>
                <div
                  style={{
                    background: "#f9fafb",
                    padding: 20,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#333",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    CHỌN LỚP
                  </label>
                  <select
                    value={selectedModalClassId || ""}
                    onChange={(e) => {
                      const classId = Number(e.target.value);
                      setSelectedModalClassId(classId);
                      setSelectedGroupId(null);
                      if (classId) {
                        loadGroupsForClass(classId);
                      } else {
                        setAvailableGroups([]);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: 12,
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 600,
                      marginBottom: 12,
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn lớp --</option>
                    {(() => {
                      // Chỉ hiển thị lớp đã được trưởng phòng phân công VÀ cùng môn học với dự án
                      const assignedClassCodes = selectedProject.assignedClassIds?.split(',').map(c => c.trim()) || [];
                      
                      const filteredClasses = myClasses.filter(cls => {
                        // Phải được phân công
                        if (!assignedClassCodes.includes(cls.code)) {
                          return false;
                        }
                        
                        // Phải cùng môn học với dự án
                        // Nếu project có subjectId, chỉ hiển thị lớp có subjectCode khớp
                        if (selectedProject.subjectId && cls.subjectCode) {
                          return cls.subjectCode === selectedProject.subjectId;
                        }
                        
                        // Fallback: nếu thiếu thông tin, vẫn cho hiển thị
                        return true;
                      });
                      
                      if (filteredClasses.length === 0) {
                        return (
                          <option value="" disabled>
                            Chưa có lớp nào được phân công cho môn này
                          </option>
                        );
                      }
                      
                      return filteredClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.code} - {cls.subjectName || cls.name}
                        </option>
                      ));
                    })()}
                  </select>

                  {selectedModalClassId && availableGroups.length > 0 && (
                    <>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#333",
                          display: "block",
                          marginBottom: 8,
                          marginTop: 12,
                        }}
                      >
                        CHỌN NHÓM
                      </label>
                      <select
                        value={selectedGroupId || ""}
                        onChange={(e) => {
                          setSelectedGroupId(e.target.value || null); // GUID string
                        }}
                        style={{
                          width: "100%",
                          padding: 12,
                          border: "1px solid #e8e8e8",
                          borderRadius: 8,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                        disabled={loadingGroups}
                      >
                        <option value="">
                          {loadingGroups
                            ? "Đang tải nhóm..."
                            : "-- Chọn nhóm --"}
                        </option>
                        {availableGroups.map((g) => (
                          <option key={g.id} value={g.id}>
                            👥 {g.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}

                  <button
                    onClick={handleAddGroup}
                    disabled={!selectedModalClassId || !selectedGroupId}
                    style={{
                      width: "100%",
                      marginTop: 16,
                      padding: "12px 20px",
                      background:
                        selectedModalClassId && selectedGroupId
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#d1d5db",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor:
                        selectedModalClassId && selectedGroupId
                          ? "pointer"
                          : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Settings size={16} /> Thêm nhóm vào dự án
                  </button>
                </div>

                {/* Groups already assigned to this project */}
                <div
                  style={{
                    background: "#f0f9ff",
                    padding: 20,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#333",
                      display: "block",
                      marginBottom: 12,
                    }}
                  >
                    📋 NHÓM ĐÃ ĐƯỢC PHÂN VÀO DỰ ÁN ({assignedGroups.length})
                  </label>

                  {loadingAssignedGroups ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#888",
                      }}
                    >
                      Đang tải...
                    </div>
                  ) : assignedGroups.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#888",
                        background: "white",
                        borderRadius: 8,
                      }}
                    >
                      Chưa có nhóm nào được phân vào dự án này
                    </div>
                  ) : (
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {(() => {
                        // Group assignedGroups by classId
                        type GroupInfoWithClass = typeof assignedGroups[0];
                        const groupsByClass = assignedGroups.reduce((acc, group) => {
                          const classId = group.classId || "N/A";
                          if (!acc[classId]) {
                            acc[classId] = [];
                          }
                          acc[classId].push(group);
                          return acc;
                        }, {} as Record<string, GroupInfoWithClass[]>);

                        return Object.entries(groupsByClass).map(([classId, groups]) => {
                          const typedGroups = groups as GroupInfoWithClass[];
                          return (
                          <div
                            key={classId}
                            style={{
                              background: "white",
                              padding: 12,
                              borderRadius: 8,
                              marginBottom: 12,
                              border: "1px solid #e0f2fe",
                            }}
                          >
                            {/* Class Header */}
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#1890ff",
                                fontSize: 14,
                                marginBottom: 8,
                                paddingBottom: 8,
                                borderBottom: "2px solid #e0f2fe",
                              }}
                            >
                              📚 Lớp: {classId} ({typedGroups.length} nhóm)
                            </div>

                            {/* Groups in this class */}
                            {typedGroups.map((group, index) => (
                              <div
                                key={group.id || index}
                                style={{
                                  background: "#f9fafb",
                                  padding: 10,
                                  borderRadius: 6,
                                  marginBottom: 8,
                                  border: "1px solid #e8e8e8",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 600, color: "#333", fontSize: 13 }}>
                                      👥 {group.name}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: "#888",
                                        marginTop: 4,
                                      }}
                                    >
                                      {group.members?.length || 0} thành viên
                                    </div>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm(`Bạn có chắc muốn xóa nhóm "${group.name}" khỏi dự án này?`)) {
                                        return;
                                      }
                                      try {
                                        await deleteProjectGroup(group.id);
                                        toast.success("Đã xóa nhóm khỏi dự án!");
                                        // Reload assigned groups
                                        const groups = await getGroupsByProject(selectedProject!.id);
                                        setAssignedGroups(Array.isArray(groups) ? groups : []);
                                      } catch (error) {
                                        console.error("Error deleting group:", error);
                                        toast.error("Lỗi khi xóa nhóm!");
                                      }
                                    }}
                                    style={{
                                      padding: "6px 12px",
                                      background: "#fee",
                                      color: "#c00",
                                      border: "1px solid #fcc",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      fontSize: 11,
                                      fontWeight: 600,
                                    }}
                                  >
                                    🗑️ Xóa
                                  </button>
                                </div>
                                {group.members && group.members.length > 0 && (
                                  <div
                                    style={{
                                      marginTop: 8,
                                      paddingTop: 8,
                                      borderTop: "1px dashed #e8e8e8",
                                    }}
                                  >
                                    <div style={{ fontSize: 10, color: "#666" }}>
                                      {group.members
                                        .slice(0, 3)
                                        .map(
                                          (
                                            m: {
                                              fullName?: string;
                                              studentId?: string;
                                            },
                                            i: number,
                                          ) => (
                                            <span key={i}>
                                              {m.fullName || m.studentId || "Unknown"}
                                              {i <
                                                Math.min(group.members.length, 3) -
                                                  1 && ", "}
                                            </span>
                                          ),
                                        )}
                                      {group.members.length > 3 &&
                                        ` +${group.members.length - 3} người khác`}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #667eea",
                    borderRadius: "50%",
                    margin: "0 auto 20px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <h4 style={{ margin: "0 0 15px 0", color: "#667eea" }}>
                  Đang xử lý...
                </h4>
                <div
                  style={{
                    height: 120,
                    overflowY: "auto",
                    background: "#f5f5f5",
                    padding: 12,
                    borderRadius: 8,
                    textAlign: "left",
                    fontSize: 13,
                    color: "#555",
                  }}
                >
                  {processLog.map((log, idx) => (
                    <div key={idx} style={{ marginBottom: 6 }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
