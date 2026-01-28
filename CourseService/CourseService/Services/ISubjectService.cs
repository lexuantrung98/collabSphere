using CourseService.Models;
using CourseService.DTOs;

namespace CourseService.Services
{
    public interface ISubjectService
    {
        // Nhóm hàm quản lý Môn học
        Task<List<Subject>> GetAllSubjectsAsync();
        Task<Subject> CreateSubjectAsync(CreateSubjectDto dto);
        Task<ImportResultDto> ImportSubjectsFromExcelAsync(IFormFile file);
        Task<Subject?> GetSubjectByIdAsync(int id);
        
        // Lưu ý: Đổi kiểu trả về thành bool cho khớp với Service
        Task<bool> UpdateSubjectAsync(int id, CreateSubjectDto dto); 
        Task<bool> DeleteSubjectAsync(int id);

       
    }
}