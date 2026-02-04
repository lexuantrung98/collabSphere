using CommunicationService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FirebaseTestController : ControllerBase
    {
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<FirebaseTestController> _logger;

        public FirebaseTestController(IFirebaseService firebaseService, ILogger<FirebaseTestController> logger)
        {
            _firebaseService = firebaseService;
            _logger = logger;
        }

        /// <summary>
        /// Test Firebase connectivity
        /// </summary>
        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new { 
                status = "Firebase service initialized",
                timestamp = DateTime.UtcNow 
            });
        }

        /// <summary>
        /// Test sending notification to a topic
        /// </summary>
        [HttpPost("test-topic")]
        [AllowAnonymous]
        public async Task<IActionResult> TestTopicNotification([FromBody] TestTopicRequest request)
        {
            try
            {
                var result = await _firebaseService.SendToTopicAsync(
                    request.Topic,
                    request.Title ?? "Test Notification",
                    request.Body ?? "This is a test message from CollabSphere",
                    new Dictionary<string, string>
                    {
                        { "test", "true" },
                        { "timestamp", DateTime.UtcNow.ToString("o") }
                    }
                );

                _logger.LogInformation("Test notification sent to topic {Topic}: {Result}", request.Topic, result);

                return Ok(new
                {
                    success = true,
                    topic = request.Topic,
                    messageId = result,
                    message = "Notification sent successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send test notification to topic {Topic}", request.Topic);
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// Test sending notification to a specific token
        /// </summary>
        [HttpPost("test-token")]
        [AllowAnonymous]
        public async Task<IActionResult> TestTokenNotification([FromBody] TestTokenRequest request)
        {
            try
            {
                var result = await _firebaseService.SendNotificationAsync(
                    request.Token,
                    request.Title ?? "Test Notification",
                    request.Body ?? "This is a test message",
                    new Dictionary<string, string>
                    {
                        { "test", "true" }
                    }
                );

                return Ok(new
                {
                    success = true,
                    messageId = result,
                    message = "Notification sent successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send test notification");
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
    }

    public class TestTopicRequest
    {
        public string Topic { get; set; } = "test";
        public string? Title { get; set; }
        public string? Body { get; set; }
    }

    public class TestTokenRequest
    {
        public string Token { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Body { get; set; }
    }
}
