namespace CourseService.DTOs
{
    public class SyllabusDto
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
        public string? UploadedBy { get; set; }
    }
}
