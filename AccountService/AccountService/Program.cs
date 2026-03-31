using AccountService.Data;
using AccountService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
options.AddPolicy("AllowAll",
policy =>
{
policy.AllowAnyOrigin()
.AllowAnyMethod()
.AllowAnyHeader();
});
});

// 🔥 LẤY DB TỪ ENV (KHÔNG CRASH)
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

if (!string.IsNullOrEmpty(connectionString))
{
builder.Services.AddDbContext<AccountDbContext>(options =>
options.UseNpgsql(connectionString));
}
else
{
Console.WriteLine("⚠️ No database configured - running without DB");
}

builder.Services.AddScoped<IAuthService, AuthService>();

// 🔥 JWT SAFE
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKeyString = jwtSection["Key"] ?? "DEFAULT_SECRET_KEY_123456789";
var jwtKey = Encoding.UTF8.GetBytes(jwtKeyString);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
options.TokenValidationParameters = new TokenValidationParameters
{
ValidateIssuer = false,
ValidateAudience = false,
ValidateLifetime = true,
ValidateIssuerSigningKey = true,
IssuerSigningKey = new SymmetricSecurityKey(jwtKey)
};
});

// 🔥 PORT CHO RENDER
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"[http://0.0.0.0:{port}](http://0.0.0.0:{port})");

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 🔥 TEST SERVER
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();
