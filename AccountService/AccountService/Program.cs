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

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AccountDbContext>(options =>
options.UseNpgsql(connectionString));

builder.Services.AddScoped<IAuthService, AuthService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
options.TokenValidationParameters = new TokenValidationParameters
{
ValidateIssuer = true,
ValidateAudience = true,
ValidateLifetime = true,
ValidateIssuerSigningKey = true,
ValidIssuer = jwtSection["Issuer"],
ValidAudience = jwtSection["Audience"],
IssuerSigningKey = new SymmetricSecurityKey(jwtKey)
};
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"[http://0.0.0.0:{port}](http://0.0.0.0:{port})");

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
var context = scope.ServiceProvider.GetRequiredService<AccountDbContext>();
try
{
context.Database.Migrate();
await SeedData.InitializeAsync(context);
}
catch (Exception ex)
{
Console.WriteLine("DB init failed: " + ex.Message);
}
}

if (app.Environment.IsDevelopment())
{
app.UseSwagger();
app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "AccountService" }));

app.Run();
