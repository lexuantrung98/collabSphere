using System.Net.Http.Headers;
using System.Text.Json;

namespace CommunicationService.Services
{
    public class CourseServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _contextAccessor;

        public CourseServiceClient(HttpClient httpClient, IHttpContextAccessor contextAccessor, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _contextAccessor = contextAccessor;
            
            // Read from configuration for Docker compatibility
            var courseServiceUrl = configuration["ServiceUrls:CourseService"] ?? "http://localhost:5021";
            _httpClient.BaseAddress = new Uri(courseServiceUrl);
        }

        public async Task<List<ClassDto>> GetStudentClasses(string studentCode)
        {
            try
            {
                // Forward JWT token from current request
                var token = _contextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
                }

                var response = await _httpClient.GetAsync($"/api/classes/student/{studentCode}");
                
                Console.WriteLine($"CourseService response status: {response.StatusCode}");
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"CourseService error: {errorContent}");
                    return new List<ClassDto>();
                }

                // CourseService returns ApiResponse<List<ClassDto>> wrapper
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"CourseService raw response: {responseContent}");
                
                var wrapper = JsonSerializer.Deserialize<ApiResponseWrapper<List<CourseServiceClassDto>>>(responseContent, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                // Map to ClassDto, using SubjectName as display name
                var classes = wrapper?.Data?.Select(c => new ClassDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Name = !string.IsNullOrEmpty(c.SubjectName) ? $"{c.Code} - {c.SubjectName}" : c.Code,
                    SubjectId = c.SubjectId,
                    SubjectCode = c.SubjectCode,  // Map SubjectCode to match ProjectTemplate.SubjectId
                    SubjectName = c.SubjectName,
                    LecturerId = ""
                }).ToList() ?? new List<ClassDto>();
                
                return classes;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetStudentClasses: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new List<ClassDto>();
            }
        }
    }

    // Wrapper class to match CourseService ApiResponse<T> structure
    public class ApiResponseWrapper<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }
    
    // Full DTO matching CourseService response
    public class CourseServiceClassDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = "";
        public string SubjectCode { get; set; } = "";
    }
}
