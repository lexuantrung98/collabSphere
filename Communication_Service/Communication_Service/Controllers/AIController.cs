using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace CommunicationService.Controllers
{
    public class AiRequest
    {
        public string Question { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private const string GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=";

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _apiKey;

        public AIController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
            _apiKey = _configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini API Key not configured");
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] AiRequest request)
        {
            Console.WriteLine($"[AI] Đang hỏi Gemini 2.5: {request.Question}");

            if (string.IsNullOrEmpty(request.Question))
            {
                return BadRequest(new { answer = "Bạn chưa nhập câu hỏi!" });
            }

            try
            {
                // Cấu trúc JSON gửi đi
                var payload = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = request.Question } } }
                    }
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // Gọi Google API
                var response = await _httpClient.PostAsync(GEMINI_URL + _apiKey, content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[AI ERROR] {errorMsg}");
                    return StatusCode((int)response.StatusCode, new { answer = "Lỗi kết nối Google: " + response.ReasonPhrase });
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(jsonResponse);

                // Lấy câu trả lời
                if (doc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var text = candidates[0]
                       .GetProperty("content")
                       .GetProperty("parts")[0]
                       .GetProperty("text")
                       .GetString();

                    return Ok(new { answer = text });
                }

                return Ok(new { answer = "AI không trả lời được câu này." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EXCEPTION] {ex.Message}");
                return StatusCode(500, new { answer = "Lỗi Server: " + ex.Message });
            }
        }
    }
}