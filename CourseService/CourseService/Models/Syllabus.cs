using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace CourseService.Models
{
    public class Syllabus
    {
        [Key]
       public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; // Tên giáo trình (VD: Giáo trình Java 2024)

        public string Description { get; set; } = string.Empty; // Mô tả ngắn

        public string? FilePath { get; set; } // Đường dẫn file giáo trình đã upload

        public string? UploadedBy { get; set; } // Email người upload giáo trình

        // --- CẤU TRÚC ĐIỂM SỐ (Quan trọng cho môn học) ---
        [Range(0, 100)]
        public int AssignmentWeight { get; set; } = 30; // Trọng số bài tập/đồ án (VD: 30%)

        [Range(0, 100)]
        public int ExamWeight { get; set; } = 70; // Trọng số thi cuối kỳ (VD: 70%)

        public double PassGrade { get; set; } = 5.0; // Điểm qua môn (VD: 5.0)

        public bool IsActive { get; set; } = true; // Giáo trình này có đang dùng không?

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // --- LIÊN KẾT VỚI MÔN HỌC ---
        public int SubjectId { get; set; }

        [ForeignKey("SubjectId")]
        [JsonIgnore]
        public Subject? Subject { get; set; }
        
        public List<SyllabusContent> Contents { get; set; } = new List<SyllabusContent>();
    }
}