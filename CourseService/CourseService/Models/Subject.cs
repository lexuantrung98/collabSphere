using System.ComponentModel.DataAnnotations;

namespace CourseService.Models
{
    public class Subject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Code { get; set; } = string.Empty; // Mã môn (ví dụ: SE104)

        [Required]
        public string Name { get; set; } = string.Empty; // Tên môn

        public int Credits { get; set; } // Số tín chỉ

        public string? Description { get; set; } // Mô tả

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}