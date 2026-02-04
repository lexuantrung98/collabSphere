using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace CommunicationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatListController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ChatListController(
            IHttpClientFactory httpClientFactory, 
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public class ClassDto
        {
            public int Id { get; set; }
            public string Code { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string SubjectName { get; set; } = string.Empty;
        }

        public class ChatRoom
        {
            public string Id { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
        }

        // Helper: Tao HttpClient voi JWT token
        private HttpClient CreateAuthenticatedClient()
        {
            var client = _httpClientFactory.CreateClient();
            
            // Forward JWT token tu request hien tai
            var token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Add("Authorization", token);
            }
            
            return client;
        }

        // Lay danh sach phong chat theo user
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetChatList(
            string userId, 
            [FromQuery] string? role = null, 
            [FromQuery] string? email = null,
            [FromQuery] string? studentId = null)
        {
            var chatRooms = new List<ChatRoom>();
            var courseServiceUrl = _configuration["ServiceUrls:CourseService"] ?? "http://localhost:5021";
            var httpClient = CreateAuthenticatedClient();
            
            // ========== GIAO VIEN ==========
            if (!string.IsNullOrEmpty(role) && role.Equals("Lecturer", StringComparison.OrdinalIgnoreCase))
            {
                // 1. Phong chat chung giao vien
                chatRooms.Add(new ChatRoom 
                { 
                    Id = "room-lecturers", 
                    Name = "Phong Giao Vien", 
                    Type = "RoleChat" 
                });

                // 2. Lay danh sach lop duoc phan cong
                if (!string.IsNullOrEmpty(email))
                {
                    try
                    {
                        Console.WriteLine($"[ChatList] Fetching classes for lecturer: {email}");
                        var response = await httpClient.GetAsync($"{courseServiceUrl}/api/classes/lecturer/{email}");
                        
                        Console.WriteLine($"[ChatList] CourseService response: {response.StatusCode}");
                        
                        if (response.IsSuccessStatusCode)
                        {
                            var json = await response.Content.ReadAsStringAsync();
                            Console.WriteLine($"[ChatList] Response JSON: {json.Substring(0, Math.Min(200, json.Length))}...");
                            
                            using var doc = JsonDocument.Parse(json);
                            
                            if (doc.RootElement.TryGetProperty("data", out var dataElement))
                            {
                                var classes = JsonSerializer.Deserialize<List<ClassDto>>(
                                    dataElement.GetRawText(),
                                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                                );

                                Console.WriteLine($"[ChatList] Found {classes?.Count ?? 0} classes for lecturer");

                                if (classes != null)
                                {
                                    foreach (var cls in classes)
                                    {
                                        Console.WriteLine($"[ChatList] Class: Code={cls.Code}, SubjectName='{cls.SubjectName}'");
                                        
                                        // Format: "Mã lớp - Tên môn học" (e.g., "CN23B - Lập Trình Java")
                                        var displayName = !string.IsNullOrEmpty(cls.SubjectName)
                                            ? $"{cls.Code} - {cls.SubjectName}"
                                            : cls.Code;
                                        
                                        Console.WriteLine($"[ChatList] Display name: '{displayName}'");
                                        
                                        chatRooms.Add(new ChatRoom
                                        {
                                            Id = $"CLASS_{cls.Id}",
                                            Name = displayName,
                                            Type = "Class"
                                        });
                                    }
                                }
                            }
                        }
                        else
                        {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            Console.WriteLine($"[ChatList] Error response: {errorContent}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[ChatList] Error fetching lecturer classes: {ex.Message}");
                    }
                }
            }
            // ========== SINH VIEN ==========
            else if (!string.IsNullOrEmpty(role) && role.Equals("Student", StringComparison.OrdinalIgnoreCase))
            {
                // Lay danh sach lop sinh vien dang hoc
                if (!string.IsNullOrEmpty(studentId))
                {
                    try
                    {
                        Console.WriteLine($"[ChatList] Fetching classes for student: {studentId}");
                        var response = await httpClient.GetAsync($"{courseServiceUrl}/api/classes/student/{studentId}");
                        
                        if (response.IsSuccessStatusCode)
                        {
                            var json = await response.Content.ReadAsStringAsync();
                            using var doc = JsonDocument.Parse(json);
                            
                            if (doc.RootElement.TryGetProperty("data", out var dataElement))
                            {
                                var classes = JsonSerializer.Deserialize<List<ClassDto>>(
                                    dataElement.GetRawText(),
                                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                                );

                                if (classes != null)
                                {
                                    foreach (var cls in classes)
                                    {
                                        chatRooms.Add(new ChatRoom
                                        {
                                            Id = $"CLASS_{cls.Id}",
                                            Name = cls.Code,
                                            Type = "Class"
                                        });
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[ChatList] Error fetching student classes: {ex.Message}");
                    }
                }
            }

            return Ok(chatRooms);
        }
    }
}