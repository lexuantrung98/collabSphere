using CourseService.DTOs;
using CourseService.Models;
using Microsoft.AspNetCore.Http; // Cần thiết cho IFormFile
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace CourseService.Services
{
    public interface IClassService
    {
        // --- LỚP HỌC ---
        Task<List<ClassDto>> GetAllClassesAsync(); // Sửa return type thành ClassDto cho chuẩn
        Task<List<ClassDto>> GetClassesByLecturerAsync(string lecturerEmail); // NEW: Filter by lecturer
        Task<List<ClassDto>> GetClassesByStudentAsync(string studentCode); // NEW: Filter by student code
        Task<Class> CreateClassAsync(CreateClassDto dto);
        Task<ClassDto> UpdateClassAsync(int id, CreateClassDto dto);
        Task DeleteClassAsync(int id);
        
        Task<ImportResultDto> ImportClassesFromExcelAsync(IFormFile file);
        Task<Class?> GetClassByIdAsync(int id);

        // --- TÀI LIỆU ---
        Task<List<ClassResource>> GetClassResourcesAsync(int classId);
        Task UploadResourceAsync(int classId, IFormFile file, Guid uploaderId);
        Task<bool> DeleteResourceAsync(int resourceId);
        Task<(Stream?, string, string)> DownloadResourceAsync(int resourceId);

        // --- SINH VIÊN ---
        Task<List<ClassMember>> GetClassMembersAsync(int classId);
        Task<bool> AddStudentToClassAsync(int classId, string studentCode); 
        Task<bool> RemoveStudentFromClassAsync(int classId, int memberId);
    
        Task<int> ImportMembersFromExcelAsync(int classId, IFormFile file);
        Task<bool> AssignLecturerAsync(int classId, string lecturerEmail);
    }
}