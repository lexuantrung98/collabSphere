using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CommunicationService.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// User ID who should receive this notification
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Notification type: meeting, milestone, grade, feedback, etc.
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Notification title
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Notification message body
        /// </summary>
        [Required]
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Related entity ID (e.g., meetingId, groupId, milestoneId)
        /// </summary>
        [MaxLength(100)]
        public string? RelatedId { get; set; }

        /// <summary>
        /// Link to navigate when notification is clicked
        /// </summary>
        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        /// <summary>
        /// Whether the notification has been read
        /// </summary>
        public bool IsRead { get; set; } = false;

        /// <summary>
        /// When the notification was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the notification was read (if read)
        /// </summary>
        public DateTime? ReadAt { get; set; }

        /// <summary>
        /// Icon or emoji for the notification (optional)
        /// </summary>
        [MaxLength(50)]
        public string? Icon { get; set; }
    }
}
