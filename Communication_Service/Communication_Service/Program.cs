using CommunicationService.Data;
using CommunicationService.Hubs;
using CommunicationService.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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

// HttpClient for CourseService and ProjectService
builder.Services.AddHttpClient<CommunicationService.Services.CourseServiceClient>();
builder.Services.AddHttpClient<CommunicationService.Services.ProjectServiceClient>();

// HttpContextAccessor cho JWT token forwarding
builder.Services.AddHttpContextAccessor();

// SignalR (Chat/Meeting)
builder.Services.AddSignalR();

// Memory Cache cho performance
builder.Services.AddMemoryCache();

// Firebase Service for Push Notifications
builder.Services.AddSingleton<CommunicationService.Services.IFirebaseService, CommunicationService.Services.FirebaseService>();

// Notification Service for creating notifications
builder.Services.AddScoped<CommunicationService.Services.INotificationService, CommunicationService.Services.NotificationService>();



// NOTE: Rate limiting requires .NET 7+ with specific NuGet packages
// Skipped for compatibility with current .NET version

// ==========================================
// 2. JWT AUTHENTICATION (Giống AccountService)
// ==========================================
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ClockSkew = TimeSpan.FromMinutes(5)
        };
        
        // CRITICAL: Allow JWT from query string for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) &&
                    (path.StartsWithSegments("/chatHub") || path.StartsWithSegments("/meetingHub")))
                {
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            }
        };
    });

// ==========================================
// 3. CẤU HÌNH CORS (Unified Frontend port 5000)
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .WithOrigins("http://localhost:5000") // Unified frontend
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// ==========================================
// 4. TẠO DỮ LIỆU MẪU (SEEDING)
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
// 5. CẤU HÌNH PIPELINE
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseStaticFiles();

// NOTE: Rate limiting middleware skipped (requires .NET 7+)

app.UseAuthentication(); // QUAN TRỌNG: Phải đặt TRƯỚC UseAuthorization
app.UseAuthorization();

app.MapControllers();
app.MapHub<MeetingHub>("/meetingHub");
app.MapHub<ChatHub>("/chatHub"); // Real-time chat hub

// Health check endpoint for Docker
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "CommunicationService" }));

app.Run();
