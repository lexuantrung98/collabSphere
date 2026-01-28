using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CourseService.Models
{
    public class ClassMember
    {
        [Key]
        public int Id { get; set; } // ID tự tăng của bảng

        public int ClassId { get; set; }
        
        [ForeignKey("ClassId")]
        public Class? Class { get; set; }
        
        // Link to AccountService User ID
        public Guid? StudentId { get; set; }

        public string StudentCode { get; set; } = string.Empty; // Mã số SV (VD: SV001)
        public string FullName { get; set; } = string.Empty;    // Tên SV
        public string Email { get; set; } = string.Empty;       // Email
        
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow; // Ngày tham gia
    }
}