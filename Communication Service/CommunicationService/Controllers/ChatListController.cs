using CommunicationService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CommunicationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatListController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatListController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetClasses(string id)
        {
            // Lấy danh sách lớp thật từ Database
            var classes = await _context.ClassRooms.ToListAsync();
            return Ok(classes);
        }
    }
}