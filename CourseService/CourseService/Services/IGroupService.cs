using CourseService.DTOs;
using CourseService.Models;

namespace CourseService.Services
{
    public interface IGroupService
    {
        Task<List<GroupDto>> GetGroupsByClassAsync(int classId);
        Task<List<GroupDto>> GetGroupsByStudentAsync(string studentCode);
        Task<Group?> GetGroupByIdAsync(int id);
        Task<Group> CreateGroupAsync(CreateGroupDto dto);
        Task<bool> UpdateGroupAsync(int id, CreateGroupDto dto);
        Task<bool> DeleteGroupAsync(int id);
        
        // Members management
        Task<List<GroupMemberDto>> GetGroupMembersAsync(int groupId);
        Task<GroupMember> AddMemberToGroupAsync(int groupId, AddGroupMemberDto dto);
        Task<bool> RemoveMemberFromGroupAsync(int groupId, int memberId);
        
        // Student join group
        Task<GroupMember> JoinGroupAsync(int groupId, string studentCode);
    }
}
