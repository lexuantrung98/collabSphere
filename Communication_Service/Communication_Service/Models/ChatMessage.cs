using System;
using System.ComponentModel.DataAnnotations;

namespace CommunicationService.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        
        [Required(ErrorMessage = "RoomId is required")]
        [MaxLength(100, ErrorMessage = "RoomId cannot exceed 100 characters")]
        public string RoomId { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "User is required")]
        [MaxLength(200, ErrorMessage = "User name cannot exceed 200 characters")]
        public string User { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Content is required")]
        [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
        public string Content { get; set; } = string.Empty;
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Soft Delete fields
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
        
        // Read Status fields
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
    }
}