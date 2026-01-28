using System;

namespace CourseService.DTOs
{
    public class CreateClassDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public int SubjectId { get; set; } 
        public Guid? LecturerId { get; set; }
        
        // --- ĐÃ THÊM MỚI TRƯỜNG NÀY ---
        public int MaxStudents { get; set; } = 60; // Mặc định là 60 nếu không nhập
    }
}