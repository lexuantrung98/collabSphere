using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CourseService.Models
{
    public class Group
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Số lượng thành viên tối đa
        public int MaxMembers { get; set; } = 5;

        // Foreign Key to Class
        [Required]
        public int ClassId { get; set; }

        [ForeignKey("ClassId")]
        public Class? Class { get; set; }

        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<GroupMember> Members { get; set; } = new List<GroupMember>();
    }
}
