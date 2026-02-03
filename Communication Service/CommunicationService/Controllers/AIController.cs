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
        // ⚠️ DÁN API KEY CỦA BẠN VÀO ĐÂY
        private const string API_KEY = "AIzaSyDpAPBP3DjpA9F1SvafcK9gQXa26fKK3z0";

        // ✅ SỬ DỤNG MODEL GEMINI 2.5 FLASH (Lấy từ danh sách bạn vừa gửi)
        private const string GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

        private readonly HttpClient _httpClient;

        public AIController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
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
                var response = await _httpClient.PostAsync(GEMINI_URL + API_KEY, content);

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