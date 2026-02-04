using System.Net.Http.Headers;
using System.Text.Json;

namespace CommunicationService.Services
{
    public class ProjectServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpContextAccessor _contextAccessor;

        public ProjectServiceClient(HttpClient httpClient, IHttpContextAccessor contextAccessor, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _contextAccessor = contextAccessor;
            
            // Read from configuration for Docker compatibility
            var projectServiceUrl = configuration["ServiceUrls:ProjectService"] ?? "http://localhost:5234";
            _httpClient.BaseAddress = new Uri(projectServiceUrl);
        }

        public async Task<List<GroupDto>> GetStudentGroups(string studentCode)
        {
            try
            {
                // Forward JWT token
                var token = _contextAccessor.HttpContext?.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);
                }

                // Call ProjectService endpoint for student groups
                var response = await _httpClient.GetAsync($"/api/ProjectGroups/student/{studentCode}");
                
                Console.WriteLine($"ProjectService response status: {response.StatusCode}");
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"ProjectService error: {errorContent}");
                    return new List<GroupDto>();
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"ProjectService raw response: {responseContent}");
                
                // ProjectService returns array directly, not wrapped in ApiResponse
                var projectGroups = JsonSerializer.Deserialize<List<ProjectGroupDto>>(responseContent, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                // Map to GroupDto - extract SubjectId from ProjectTemplate for accurate subject name lookup
                var groups = projectGroups?.Select(g => new GroupDto
                {
                    Id = g.Id.ToString(),
                    Name = g.Name,  // Raw name like "Nhóm 1"
                    ClassId = g.ClassId,
                    // Use SubjectId from ProjectTemplate (more reliable than SubjectCode on group)
                    SubjectCode = g.ProjectTemplate?.SubjectId ?? g.SubjectCode
                }).ToList() ?? new List<GroupDto>();
                
                return groups;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetStudentGroups: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new List<GroupDto>();
            }
        }
    }

    // DTO matching ProjectService ProjectGroup response
    public class ProjectGroupDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "";
        public Guid? ProjectTemplateId { get; set; }
        public string ClassId { get; set; } = "";
        public string? SubjectCode { get; set; }
        public ProjectTemplateDto? ProjectTemplate { get; set; }
    }
    
    // Nested DTO for ProjectTemplate
    public class ProjectTemplateDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = "";
        public string SubjectId { get; set; } = "";
    }
}
