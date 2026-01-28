using CourseService.Data;
using CourseService.DTOs;
using CourseService.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CourseService.Services
{
    public class GroupService : IGroupService
    {
        private readonly CourseDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _accountServiceUrl;

        public GroupService(CourseDbContext context, HttpClient httpClient, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClient;
            _accountServiceUrl = configuration["ServiceUrls:AccountService"] ?? "http://localhost:5127";
        }

        public async Task<List<GroupDto>> GetGroupsByClassAsync(int classId)
        {
            var groups = await _context.Groups
                .Where(g => g.ClassId == classId)
                .Include(g => g.Members)
                .Include(g => g.Class)
                .OrderBy(g => g.Name)
                .ToListAsync();

            return groups.Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description,
                ClassId = g.ClassId,
                ClassName = g.Class?.Name,
                MemberCount = g.Members.Count,
                MaxMembers = g.MaxMembers,
                CreatedAt = g.CreatedAt,
                // Include members for project group sync
                Members = g.Members.Select(m => new GroupMemberDto
                {
                    Id = m.Id,
                    UserId = m.StudentId,
                    StudentCode = m.StudentCode,
                    StudentName = m.StudentName,
                    StudentEmail = m.StudentEmail,
                    Role = m.Role,
                    JoinedAt = m.JoinedAt
                }).ToList()
            }).ToList();
        }

        public async Task<List<GroupDto>> GetGroupsByStudentAsync(string studentCode)
        {
            // Query groups where student is member
            var groups = await _context.GroupMembers
                .Where(gm => gm.StudentCode == studentCode)
                .Select(gm => gm.Group)
                .Include(g => g!.Members)
                .Include(g => g!.Class)
                .Distinct()
                .OrderBy(g => g!.Name)
                .ToListAsync();

            return groups.Where(g => g != null).Select(g => new GroupDto
            {
                Id = g!.Id,
                Name = g.Name,
                Description = g.Description,
                ClassId = g.ClassId,
                ClassName = g.Class?.Name,
                MemberCount = g.Members?.Count ?? 0,
                MaxMembers = g.MaxMembers,
                CreatedAt = g.CreatedAt
            }).ToList();
        }

        public async Task<List<GroupDto>> GetGroupsByStudentEmailAsync(string studentEmail)
        {
            // Lấy tất cả các group mà sinh viên này là thành viên
            var groupIds = await _context.GroupMembers
                .Where(gm => gm.StudentEmail == studentEmail)
                .Select(gm => gm.GroupId)
                .ToListAsync();

            var groups = await _context.Groups
                .Where(g => groupIds.Contains(g.Id))
                .Include(g => g.Members)
                .Include(g => g.Class!)
                    .ThenInclude(c => c.Subject)
                .ToListAsync();

            return groups.Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                Description = g.Description, // Added for consistency
                ClassId = g.ClassId,
                ClassName = g.Class?.Code ?? "N/A",
                MemberCount = g.Members?.Count ?? 0,
                MaxMembers = g.MaxMembers, // Added for consistency
                CreatedAt = g.CreatedAt // Added for consistency
            }).ToList();
        }

        public async Task<Group?> GetGroupByIdAsync(int id)
        {
            return await _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Class)
                .FirstOrDefaultAsync(g => g.Id == id);
        }

        public async Task<Group> CreateGroupAsync(CreateGroupDto dto)
        {
            var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
            if (!classExists)
                throw new Exception("Lớp học không tồn tại");

            var group = new Group
            {
                Name = dto.Name,
                Description = dto.Description,
                ClassId = dto.ClassId,
                MaxMembers = dto.MaxMembers > 0 ? dto.MaxMembers : 5,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return group;
        }

        public async Task<bool> UpdateGroupAsync(int id, CreateGroupDto dto)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null) return false;

            group.Name = dto.Name;
            group.Description = dto.Description;
            group.MaxMembers = dto.MaxMembers > 0 ? dto.MaxMembers : group.MaxMembers;
            group.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteGroupAsync(int id)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Class)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null) return false;

            if (group.Members.Any())
            {
                throw new Exception("Không thể xóa nhóm vì vẫn còn thành viên. Vui lòng xóa hết thành viên trước.");
            }

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<GroupMemberDto>> GetGroupMembersAsync(int groupId)
        {
            var members = await _context.GroupMembers
                .Where(m => m.GroupId == groupId)
                .OrderBy(m => m.StudentName)
                .ToListAsync();

            return members.Select(m => new GroupMemberDto
            {
                Id = m.Id,
                UserId = m.StudentId,
                StudentCode = m.StudentCode,
                StudentName = m.StudentName,
                StudentEmail = m.StudentEmail,
                Role = m.Role,
                JoinedAt = m.JoinedAt
            }).ToList();
        }

        public async Task<GroupMember> AddMemberToGroupAsync(int groupId, AddGroupMemberDto dto)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null)
                throw new Exception("Nhóm không tồn tại");

            var existingMember = await _context.GroupMembers
                .AnyAsync(m => m.GroupId == groupId && m.StudentId == dto.UserId);
            if (existingMember)
                throw new Exception("Sinh viên đã là thành viên của nhóm này");

            var member = new GroupMember
            {
                GroupId = groupId,
                StudentId = dto.UserId,
                Role = dto.Role ?? "Member",
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task<bool> RemoveMemberFromGroupAsync(int groupId, int memberId)
        {
            var member = await _context.GroupMembers
                .FirstOrDefaultAsync(m => m.GroupId == groupId && m.Id == memberId);
            if (member == null) return false;

            _context.GroupMembers.Remove(member);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<GroupMember> JoinGroupAsync(int groupId, string studentCode)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null)
                throw new Exception("Nhóm không tồn tại");

            var existingMember = await _context.GroupMembers
                .AnyAsync(m => m.GroupId == groupId && m.StudentCode == studentCode);
            if (existingMember)
                throw new Exception("Bạn đã là thành viên của nhóm này");

            var currentCount = await _context.GroupMembers.CountAsync(m => m.GroupId == groupId);
            if (currentCount >= group.MaxMembers)
                throw new Exception("Nhóm đã đủ số lượng thành viên");

            var member = new GroupMember
            {
                GroupId = groupId,
                StudentCode = studentCode,
                Role = "Member",
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(member);
            await _context.SaveChangesAsync();
            return member;
        }
    }
}
