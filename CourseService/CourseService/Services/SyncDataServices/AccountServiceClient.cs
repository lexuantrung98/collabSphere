using System.Text.Json;
using CourseService.DTOs;
using Microsoft.AspNetCore.Http;

namespace CourseService.Services.Sync
{
    public class AccountServiceClient : IAccountServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AccountServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
        {
            _httpClient = httpClient;
            _httpContextAccessor = httpContextAccessor;
        }

        private void AddAuthorizationHeader()
        {
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
                _httpClient.DefaultRequestHeaders.Add("Authorization", token);
            }
        }

        public async Task<UserInfoDto?> GetStudentByCodeAsync(string studentCode)
        {
            AddAuthorizationHeader();
            
            // Gọi API: /api/users/code/{studentCode}
            // (HttpClient sẽ tự nối với BaseAddress https://localhost:7001)
            var response = await _httpClient.GetAsync($"/api/users/code/{studentCode}");

            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            
            return JsonSerializer.Deserialize<UserInfoDto>(content, options);
        }

        public async Task<UserInfoDto?> GetUserByEmailAsync(string email)
        {
            AddAuthorizationHeader();
            
            // Gọi endpoint mới: /api/users/email/{email}
            var response = await _httpClient.GetAsync($"/api/users/email/{email}");

            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            
            return JsonSerializer.Deserialize<UserInfoDto>(content, options);
        }

        public async Task<List<UserInfoDto>> GetLecturersAsync()
        {
            AddAuthorizationHeader();
            
            // Call AccountService to get users with role Lecturer or HeadDepartment
            var response = await _httpClient.GetAsync("/api/auth/accounts?role=Lecturer");
            
            if (!response.IsSuccessStatusCode) return new List<UserInfoDto>();
            
            var content = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            
            return JsonSerializer.Deserialize<List<UserInfoDto>>(content, options) ?? new List<UserInfoDto>();
        }
    }
}