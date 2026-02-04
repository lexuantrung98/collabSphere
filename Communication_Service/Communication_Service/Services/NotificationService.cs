using CommunicationService.Data;
using CommunicationService.Models;

namespace CommunicationService.Services
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(string userId, string type, string title, string message, string? relatedId = null, string? actionUrl = null, string? icon = null);
        Task CreateNotificationsForUsersAsync(List<string> userIds, string type, string title, string message, string? relatedId = null, string? actionUrl = null, string? icon = null);
    }

    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(AppDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task CreateNotificationAsync(string userId, string type, string title, string message, string? relatedId = null, string? actionUrl = null, string? icon = null)
        {
            try
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = type,
                    Title = title,
                    Message = message,
                    RelatedId = relatedId,
                    ActionUrl = actionUrl,
                    Icon = icon,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Created notification for user {UserId}: {Title}", userId, title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to create notification for user {UserId}", userId);
            }
        }

        public async Task CreateNotificationsForUsersAsync(List<string> userIds, string type, string title, string message, string? relatedId = null, string? actionUrl = null, string? icon = null)
        {
            try
            {
                var notifications = userIds.Select(userId => new Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = type,
                    Title = title,
                    Message = message,
                    RelatedId = relatedId,
                    ActionUrl = actionUrl,
                    Icon = icon,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.Notifications.AddRange(notifications);
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Created {Count} notifications: {Title}", notifications.Count, title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to create bulk notifications");
            }
        }
    }
}
