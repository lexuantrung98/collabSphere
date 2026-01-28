using System;

namespace CourseService.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        // Có thể thêm các trường khác nếu cần (PhoneNumber, Avatar...)
    }
}