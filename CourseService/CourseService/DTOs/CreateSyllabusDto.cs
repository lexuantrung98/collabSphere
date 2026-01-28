using System.ComponentModel.DataAnnotations;

namespace CourseService.DTOs
{
    public class CreateSyllabusDto
    {
        [Required]
        public string Name { get; set; } = string.Empty; // Tên giáo trình

        public string Description { get; set; } = string.Empty;

        public int SubjectId { get; set; }

        // Các trọng số điểm
        public int AssignmentWeight { get; set; } = 30; 
        public int ExamWeight { get; set; } = 70;       
        public double PassGrade { get; set; } = 5.0;
    }
}