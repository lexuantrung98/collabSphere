using CommunicationService.Data;
using CommunicationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        // API: Lấy tin nhắn cũ của một phòng
        // Đường dẫn sẽ là: GET api/Chat/history/general-room
        [HttpGet("history/{roomId}")]
        public async Task<IActionResult> GetHistory(string roomId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.RoomId == roomId)
                .OrderBy(m => m.Timestamp) // Sắp xếp tin nhắn từ cũ đến mới
                .ToListAsync();

            return Ok(messages);
        }
    }
}