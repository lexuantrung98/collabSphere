using CommunicationService.Data;
using CommunicationService.Hubs;
using CommunicationService.Models;
using Microsoft.EntityFrameworkCore;

// 👇 [QUAN TRỌNG] Dòng này fix lỗi "Cannot write DateTime with Kind=Unspecified"
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CẤU HÌNH DỊCH VỤ (SERVICES)
// ==========================================

// Cấu hình Database (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// HttpClient (Cho AI hoặc API ngoài)
builder.Services.AddHttpClient();

// SignalR (Chat/Meeting)
builder.Services.AddSignalR();

// Cấu hình CORS (Cho phép Frontend React truy cập)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins("http://localhost:5173") // Cổng Frontend
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// ==========================================
// 2. TẠO DỮ LIỆU MẪU (SEEDING)
// ==========================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Tạo DB nếu chưa có
        context.Database.Migrate();

        // Kiểm tra: Nếu bảng ClassRooms chưa có gì thì thêm mới
        if (!context.ClassRooms.Any())
        {
            context.ClassRooms.AddRange(
                new ClassRoom { Id = "general-room", Name = "Sảnh Chung", Type = "Public" },
                new ClassRoom { Id = "CLASS_01", Name = "Lập Trình Web (Thứ 2)", Type = "Class" },
                new ClassRoom { Id = "CLASS_02", Name = "Công Nghệ Phần Mềm", Type = "Class" },
                new ClassRoom { Id = "GROUP_01", Name = "Nhóm Đồ Án 1", Type = "Group" }
            );
            context.SaveChanges();
            Console.WriteLine("--> Đã tạo dữ liệu mẫu thành công!");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("--> Lỗi tạo dữ liệu: " + ex.Message);
    }
}

// ==========================================
// 3. CẤU HÌNH PIPELINE
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseStaticFiles();
app.UseAuthorization();

app.MapControllers();
app.MapHub<MeetingHub>("/meetingHub");

app.Run();