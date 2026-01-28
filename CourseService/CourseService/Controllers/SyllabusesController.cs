using CourseService.DTOs;
using CourseService.Services;
using Microsoft.AspNetCore.Mvc;

namespace CourseService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SyllabusesController : ControllerBase
    {
        private readonly ISyllabusService _syllabusService;

        public SyllabusesController(ISyllabusService syllabusService)
        {
            _syllabusService = syllabusService;
        }

        // 1. Tạo giáo trình mới
        [HttpPost]
        public async Task<IActionResult> CreateSyllabus([FromBody] CreateSyllabusDto dto)
        {
            try
            {
                var result = await _syllabusService.CreateSyllabusAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 2. Lấy danh sách giáo trình theo môn học (trả về DTO)
        [HttpGet]
        public async Task<IActionResult> GetBySubject([FromQuery] int subjectId)
        {
            var list = await _syllabusService.GetSyllabusesDtoBySubjectAsync(subjectId);
            return Ok(list);
        }

        // 1b. Upload giáo trình (file)
        [HttpPost("upload")]
        public async Task<IActionResult> UploadSyllabus([FromForm] int subjectId, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ" });

            // Validate file type
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".ppt", ".pptx" };
            var fileExt = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExt))
                return BadRequest(new { message = $"Chỉ hỗ trợ file: {string.Join(", ", allowedExtensions)}" });

            try
            {
                // Lấy email người upload từ JWT claims
                var emailClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.Email);
                var uploadedBy = emailClaim?.Value;
                
                var result = await _syllabusService.UploadSyllabusFileAsync(subjectId, file, uploadedBy);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 2b. Download giáo trình
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadSyllabus(int id)
        {
            try
            {
                var filePath = await _syllabusService.GetSyllabusFilePathAsync(id);
                if (filePath == null)
                    return NotFound(new { message = "Không tìm thấy file giáo trình" });

                var fileName = Path.GetFileName(filePath);
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(fileBytes, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // 3. Xóa giáo trình
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSyllabus(int id)
        {
            var result = await _syllabusService.DeleteSyllabusAsync(id);
            if (result) return Ok(new { message = "Xóa giáo trình thành công" });
            return NotFound(new { message = "Không tìm thấy giáo trình" });
        }

        // 4. Import Excel (Mới)
        [HttpPost("import")]
        public async Task<IActionResult> ImportSyllabus(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File không hợp lệ" });

            // Kiểm tra đuôi file
            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Chỉ hỗ trợ file Excel (.xlsx)" });

            try
            {
                int count = await _syllabusService.ImportSyllabusFromExcelAsync(file);
                return Ok(new { message = $"Đã import thành công {count} giáo trình." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}