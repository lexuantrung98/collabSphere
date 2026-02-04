using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication
    public class FileController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public FileController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("upload")]
        [RequestSizeLimit(10_000_000)] // 10MB max
        // NOTE: Rate limiting attribute removed (requires .NET 7+)
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Vui lòng chọn file!");

            // Validate file size (10MB max)
            if (file.Length > 10_000_000)
                return BadRequest("File quá lớn! Giới hạn 10MB");

            // Validate file type
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt" };
            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(ext))
                return BadRequest($"Định dạng file không hợp lệ. Chỉ cho phép: {string.Join(", ", allowedExtensions)}");

            // 1. Tạo đường dẫn lưu file (thư mục wwwroot/uploads)
            string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // 2. Tạo tên file độc nhất (tránh trùng)
            string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 3. Lưu file xuống ổ cứng
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 4. Trả về đường dẫn URL để Frontend hiển thị
            // URL sẽ là: http://localhost:5015/uploads/ten_file.jpg
            string fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

            return Ok(new { url = fileUrl, fileName = file.FileName });
        }
    }
}