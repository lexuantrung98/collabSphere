using CourseService.DTOs;
using CourseService.Models;
using Microsoft.AspNetCore.Http;


namespace CourseService.Services
{
    public interface ISyllabusService
    {
        Task<Syllabus> CreateSyllabusAsync(CreateSyllabusDto dto);
        Task<Syllabus> UploadSyllabusFileAsync(int subjectId, IFormFile file, string? uploadedBy);
        Task<List<Syllabus>> GetSyllabusesBySubjectAsync(int subjectId);
        Task<List<SyllabusDto>> GetSyllabusesDtoBySubjectAsync(int subjectId);
        Task<string?> GetSyllabusFilePathAsync(int id);
        Task<bool> DeleteSyllabusAsync(int id);
        Task<int> ImportSyllabusFromExcelAsync(IFormFile file);
    }
}