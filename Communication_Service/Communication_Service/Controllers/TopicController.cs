using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Messaging;
using System.ComponentModel.DataAnnotations;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TopicController : ControllerBase
    {
        private readonly ILogger<TopicController> _logger;

        public TopicController(ILogger<TopicController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Subscribe FCM token to a topic
        /// </summary>
        [HttpPost("subscribe")]
        public async Task<IActionResult> SubscribeToTopic([FromBody] TopicSubscriptionRequest request)
        {
            try
            {
                var response = await FirebaseMessaging.DefaultInstance.SubscribeToTopicAsync(
                    new List<string> { request.Token },
                    request.Topic
                );

                if (response.SuccessCount > 0)
                {
                    _logger.LogInformation("✅ Subscribed token to topic {Topic}", request.Topic);
                    return Ok(new
                    {
                        success = true,
                        topic = request.Topic,
                        message = "Successfully subscribed to topic"
                    });
                }
                else
                {
                    _logger.LogWarning("⚠️ Failed to subscribe to topic {Topic}: {Error}",
                        request.Topic, response.Errors?.FirstOrDefault()?.Reason);
                    return BadRequest(new
                    {
                        success = false,
                        error = response.Errors?.FirstOrDefault()?.Reason ?? "Unknown error"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error subscribing to topic {Topic}", request.Topic);
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Unsubscribe FCM token from a topic
        /// </summary>
        [HttpPost("unsubscribe")]
        public async Task<IActionResult> UnsubscribeFromTopic([FromBody] TopicSubscriptionRequest request)
        {
            try
            {
                var response = await FirebaseMessaging.DefaultInstance.UnsubscribeFromTopicAsync(
                    new List<string> { request.Token },
                    request.Topic
                );

                if (response.SuccessCount > 0)
                {
                    _logger.LogInformation("✅ Unsubscribed token from topic {Topic}", request.Topic);
                    return Ok(new
                    {
                        success = true,
                        topic = request.Topic,
                        message = "Successfully unsubscribed from topic"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = response.Errors?.FirstOrDefault()?.Reason ?? "Unknown error"
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error unsubscribing from topic {Topic}", request.Topic);
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
    }

    public class TopicSubscriptionRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string Topic { get; set; } = string.Empty;
    }
}
