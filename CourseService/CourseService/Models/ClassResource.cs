using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CourseService.Models
{
    public class ClassResource
    {
        [Key]
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty; // Tên gốc (VD: BaiTap.pdf)
        
        public string FilePath { get; set; } = string.Empty; // Đường dẫn lưu trên server
        
        public string ContentType { get; set; } = string.Empty; // Loại file (application/pdf)
        
        public long FileSize { get; set; } // Kích thước (bytes)

        // Foreign Key: Tài nguyên này của Lớp nào
        public int ClassId { get; set; }
        
        [ForeignKey("ClassId")]
        [JsonIgnore]
        public Class? Class { get; set; }

        public Guid UploadedBy { get; set; } // ID người upload (GV hoặc SV)

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}