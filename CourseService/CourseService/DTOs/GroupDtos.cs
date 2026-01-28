namespace CourseService.DTOs
{
    public class CreateGroupDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ClassId { get; set; }
        public int MaxMembers { get; set; } = 5; // So luong thanh vien toi da
    }

    public class GroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ClassId { get; set; }
        public string? ClassName { get; set; }
        public int MemberCount { get; set; }
        public int MaxMembers { get; set; } = 5;
        public DateTime CreatedAt { get; set; }
        
        // Members list for project group sync
        public List<GroupMemberDto>? Members { get; set; }
    }

    public class AddGroupMemberDto
    {
        public Guid UserId { get; set; }
        public string? Role { get; set; } = "Member";
    }

    public class GroupMemberDto
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public string? StudentCode { get; set; }
        public string? StudentName { get; set; }
        public string? StudentEmail { get; set; }
        public string? Role { get; set; }
        public DateTime JoinedAt { get; set; }
    }

    // DTO for student self-join
    public class JoinGroupDto
    {
        public string StudentCode { get; set; } = string.Empty;
    }
}
