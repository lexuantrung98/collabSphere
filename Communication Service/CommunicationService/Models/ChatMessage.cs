using System;

namespace CommunicationService.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string RoomId { get; set; }
        public string User { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}