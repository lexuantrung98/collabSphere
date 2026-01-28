using System.ComponentModel.DataAnnotations;

namespace CourseService.DTOs
{
    public class AddStudentDto
    {
        [Required(ErrorMessage = "Vui lòng nhập mã sinh viên")]
        [RegularExpression("^[A-Za-z0-9]+$", ErrorMessage = "Mã sinh viên chỉ được chứa chữ và số")]
        public string StudentCode { get; set; } = string.Empty;
    }
}