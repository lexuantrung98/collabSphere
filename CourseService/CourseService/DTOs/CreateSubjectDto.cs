namespace CourseService.DTOs
{
    public class CreateSubjectDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string? Description { get; set; }
    }
}