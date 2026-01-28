namespace CourseService.DTOs
{
    public class UserInfoDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? StudentCode { get; set; }
        public string? Code { get; set; }  // Account code
        public string? Role { get; set; }  // User role
        public string? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }
}