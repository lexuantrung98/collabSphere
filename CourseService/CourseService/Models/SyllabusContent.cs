using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CourseService.Models
{
    // Bảng lưu chi tiết từng bài học trong giáo trình
    public class SyllabusContent
    {
        [Key]
        public int Id { get; set; }

        public int Order { get; set; } // Thứ tự bài học (1, 2, 3...)

        public string Topic { get; set; } = string.Empty; // Tên chủ đề/bài học

        public string Type { get; set; } = "Theory"; // Loại: Theory (Lý thuyết) hoặc Lab (Thực hành)

        public int Duration { get; set; } // Thời lượng (tiết)

        // --- KHÓA NGOẠI LIÊN KẾT VỀ GIÁO TRÌNH ---
        public int SyllabusId { get; set; }

        [ForeignKey("SyllabusId")]
        [JsonIgnore] // Quan trọng: Ngăn vòng lặp vô tận khi API trả về dữ liệu
        public Syllabus? Syllabus { get; set; }
    }
}