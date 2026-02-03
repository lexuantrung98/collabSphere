using Microsoft.EntityFrameworkCore;
using CommunicationService.Models;

namespace CommunicationService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Meeting> Meetings { get; set; }
        // 👇 THÊM 2 DÒNG NÀY
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ClassRoom> ClassRooms { get; set; }
    }
}