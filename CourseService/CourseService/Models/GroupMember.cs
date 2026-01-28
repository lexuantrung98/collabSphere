using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CourseService.Models
{
    public class GroupMember
    {
        [Key]
        public int Id { get; set; }

        // Foreign Key to Group
        [Required]
        public int GroupId { get; set; }

        [ForeignKey("GroupId")]
        public Group? Group { get; set; }

        // User ID from AccountService (Guid) - đổi tên để thống nhất với ClassMember
        [Required]
        public Guid StudentId { get; set; }

        // Cache thông tin user để không phải gọi AccountService mỗi lần
        [Required]
        public string StudentCode { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;

        // Role in group (optional)
        public string? Role { get; set; } // e.g., "Leader", "Member"

        // Metadata
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
