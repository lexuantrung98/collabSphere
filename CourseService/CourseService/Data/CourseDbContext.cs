using Microsoft.EntityFrameworkCore;
using CourseService.Models;

namespace CourseService.Data
{
    public class CourseDbContext : DbContext
    {
        public CourseDbContext(DbContextOptions<CourseDbContext> options) : base(options) { }

        // Khai báo các bảng
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Syllabus> Syllabi { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<ClassMember> ClassMembers { get; set; }
        public DbSet<ClassResource> ClassResources { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
    }
}