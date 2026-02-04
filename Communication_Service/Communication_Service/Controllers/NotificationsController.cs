using CommunicationService.Data;
using CommunicationService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(AppDbContext context, ILogger<NotificationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get all notifications for current user
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] bool? unreadOnly = null, [FromQuery] int limit = 50)
        {
            // Extract userId: Try Code first (Students with SV000XXX), fallback to Email (Lecturers)
            var userId = User.FindFirstValue("Code") ?? User.FindFirstValue(ClaimTypes.Email);
            
            // If no userId (anonymous or token issue), return empty list
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new List<Notification>());
            }

            var query = _context.Notifications.Where(n => n.UserId == userId);

            if (unreadOnly == true)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(notifications);
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("count/unread")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = User.FindFirstValue("Code") ?? User.FindFirstValue(ClaimTypes.Email);
            
            // If no userId, return 0
            if (string.IsNullOrEmpty(userId))
            {
                return Ok(new { count = 0 });
            }

            var count = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();

            return Ok(new { count });
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = User.FindFirstValue("Code") ?? User.FindFirstValue(ClaimTypes.Email);
            
            // TEMP: For testing, allow mark as read without userId check
            Notification? notification;
            if (string.IsNullOrEmpty(userId))
            {
                notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id);
            }
            else
            {
                notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            }

            if (notification == null)
            {
                return NotFound();
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(notification);
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue("Code") ?? User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var unreadNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { updated = unreadNotifications.Count });
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var userId = User.FindFirstValue("Code") ?? User.FindFirstValue(ClaimTypes.Email);
            
            // TEMP: For testing, allow delete without userId check
            Notification? notification;
            if (string.IsNullOrEmpty(userId))
            {
                notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id);
            }
            else
            {
                notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            }

            if (notification == null)
            {
                return NotFound();
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Delete all read notifications
        /// </summary>
        [HttpDelete("read")]
        public async Task<IActionResult> DeleteAllRead()
        {
            var userId = User.FindFirstValue("Code") ?? User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var readNotifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead)
                .ToListAsync();

            _context.Notifications.RemoveRange(readNotifications);
            await _context.SaveChangesAsync();

            return Ok(new { deleted = readNotifications.Count });
        }
    }
}
