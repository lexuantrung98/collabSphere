using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CourseService.Models
{
    public class Class
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Code { get; set; } = string.Empty; // Mã lớp (VD: SE104.O21)

        public string Name { get; set; } = string.Empty; // Tên lớp

        public string Semester { get; set; } = string.Empty; // Học kỳ (VD: HK1_2024)
        public int Year { get; set; } = DateTime.UtcNow.Year;

        public string Status { get; set; } = "Active"; // Trạng thái: Active, Finished

        // Lưu ID giảng viên 
        public string? LecturerId { get; set; } 
        public string? LecturerName { get; set; }
        public string? LecturerEmail { get; set; }

        public int MaxStudents { get; set; } = 50;

        // Khóa ngoại trỏ về Subject
        public int SubjectId { get; set; }

        [ForeignKey("SubjectId")]
        [JsonIgnore]
        public Subject? Subject { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}