using CourseService.Data;
using CourseService.Services;
using Microsoft.EntityFrameworkCore;
using CourseService.Middlewares;
using System.Text.Json.Serialization; 
using CourseService.Services.Sync;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;


// 1. Cấu hình EPPlus License Context
Environment.SetEnvironmentVariable("EPPlusLicenseContext", "NonCommercial");
// -----------------------------------------------------

var builder = WebApplication.CreateBuilder(args);

// 2. Cấu hình CORS để frontend connect được
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5000") // Unified frontend
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition"); // Cho phép download files
    });
});

// 3. JWT Authentication - GIỐNG AccountService để verify tokens
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
            ClockSkew = TimeSpan.FromMinutes(5) // Cho phép sai lệch 5 phút
        };
        
        // Debug events
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                Console.WriteLine($"[JWT] === MESSAGE RECEIVED ===");
                Console.WriteLine($"[JWT] Authorization Header: {(string.IsNullOrEmpty(authHeader) ? "EMPTY" : authHeader.Substring(0, Math.Min(50, authHeader.Length)) + "...")}");
                
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    var token = authHeader.Substring(7);
                    Console.WriteLine($"[JWT] Token Length: {token.Length}");
                    Console.WriteLine($"[JWT] Token Has Dots: {token.Contains(".")}");
                    Console.WriteLine($"[JWT] Token First 20 chars: {token.Substring(0, Math.Min(20, token.Length))}");
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] === AUTHENTICATION FAILED ===");
                Console.WriteLine($"[JWT] Exception Type: {context.Exception.GetType().Name}");
                Console.WriteLine($"[JWT] Exception Message: {context.Exception.Message}");
                if (context.Exception.InnerException != null)
                {
                    Console.WriteLine($"[JWT] Inner Exception: {context.Exception.InnerException.Message}");
                }
                Console.WriteLine($"[JWT] === END FAILURE ===");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"[JWT] === TOKEN VALIDATED SUCCESSFULLY ===");
                Console.WriteLine($"[JWT] User: {context.Principal?.Identity?.Name}");
                Console.WriteLine($"[JWT] Role: {context.Principal?.FindFirst(ClaimTypes.Role)?.Value}");
                return Task.CompletedTask;
            }
        };
    });

// 4. Kết nối Database
builder.Services.AddDbContext<CourseDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add HttpClient for calling other services
builder.Services.AddHttpClient();

// 5. Đăng ký Services
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ISyllabusService, SyllabusService>();
builder.Services.AddScoped<IGroupService, GroupService>();

// Add HttpContextAccessor for JWT token access
builder.Services.AddHttpContextAccessor();

// 6. Đăng ký HTTP Client cho AccountService
var accountServiceUrl = builder.Configuration["ServiceUrls:AccountService"] ?? "http://localhost:5127";
if (!Uri.IsWellFormedUriString(accountServiceUrl, UriKind.Absolute))
{
    throw new InvalidOperationException($"Invalid AccountService URL: {accountServiceUrl}");
}
builder.Services.AddHttpClient<IAccountServiceClient, AccountServiceClient>(client =>
{
    client.BaseAddress = new Uri(accountServiceUrl);
});
builder.Services.AddHttpClient<IAccountServiceClient, AccountServiceClient>(client =>
{
    client.BaseAddress = new Uri(accountServiceUrl);
});

// 7. Fix JSON Loop
builder.Services.AddControllers().AddJsonOptions(x =>
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll"); // Kích hoạt CORS

app.UseAuthentication(); // QUAN TRỌNG: Phải đặt TRƯỚC UseAuthorization
app.UseAuthorization();

app.UseMiddleware<GlobalExceptionMiddleware>(); // Middleware bắt lỗi

app.MapControllers();

// Health check endpoint for Docker
app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "CourseService" }));

app.Run();
