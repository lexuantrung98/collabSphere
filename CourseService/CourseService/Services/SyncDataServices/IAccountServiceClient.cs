using CourseService.DTOs;

namespace CourseService.Services.Sync
{
    public interface IAccountServiceClient
    {
        // Tìm SV theo mã
        Task<UserInfoDto?> GetStudentByCodeAsync(string studentCode);

        // Tìm Giảng viên (hoặc User bất kỳ) theo Email hoặc ID
        Task<UserInfoDto?> GetUserByEmailAsync(string email);

        // Lấy danh sách giảng viên
        Task<List<UserInfoDto>> GetLecturersAsync();
    }
}