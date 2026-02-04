using CommunicationService.Models;
using Microsoft.EntityFrameworkCore;

namespace CommunicationService.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ClassRoom> ClassRooms { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<UserFcmToken> UserFcmTokens { get; set; }
        public DbSet<Notification> Notifications { get; set; }



        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // DATABASE INDEXES FOR PERFORMANCE
            // ==========================================

            // ChatMessage indexes for faster queries
            modelBuilder.Entity<ChatMessage>()
                .HasIndex(m => new { m.RoomId, m.Timestamp })
                .HasDatabaseName("IX_ChatMessages_RoomId_Timestamp");

            modelBuilder.Entity<ChatMessage>()
                .HasIndex(m => m.IsDeleted)
                .HasDatabaseName("IX_ChatMessages_IsDeleted");

            modelBuilder.Entity<ChatMessage>()
                .HasIndex(m => m.IsRead)
                .HasDatabaseName("IX_ChatMessages_IsRead");

            // ClassRoom unique Id
            modelBuilder.Entity<ClassRoom>()
                .HasIndex(c => c.Id)
                .IsUnique()
                .HasDatabaseName("IX_ClassRoom_Id_Unique");

            // Meeting indexes
            modelBuilder.Entity<Meeting>()
                .HasIndex(m => m.StartTime)
                .HasDatabaseName("IX_Meetings_StartTime");

            // UserFcmToken indexes
            modelBuilder.Entity<UserFcmToken>()
                .HasIndex(t => t.UserId)
                .HasDatabaseName("IX_UserFcmTokens_UserId");

            // Notification indexes for fast queries
            modelBuilder.Entity<Notification>()
                .HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt })
                .HasDatabaseName("IX_Notifications_UserId_IsRead_CreatedAt");

            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.CreatedAt)
                .HasDatabaseName("IX_Notifications_CreatedAt");
        }


    }
}