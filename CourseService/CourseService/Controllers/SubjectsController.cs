using CourseService.DTOs;
using CourseService.Services;
using Microsoft.AspNetCore.Mvc;
using CourseService.Wrappers; 
using CourseService.Models;
using Microsoft.AspNetCore.Authorization;   

namespace CourseService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu authentication cho tất cả endpoints
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectsController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        // 1. Lấy danh sách
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _subjectService.GetAllSubjectsAsync();
            return Ok(new ApiResponse<List<Subject>>(data, "Lấy danh sách môn học thành công"));
        }

        // 2. Tạo mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSubjectDto dto)
        {
            try 
            {
                var newSubject = await _subjectService.CreateSubjectAsync(dto);
                var response = new ApiResponse<Subject>(newSubject, "Tạo môn học thành công");
                return CreatedAtAction(nameof(GetAll), new { id = newSubject.Id }, response);
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
        }

        // 3. Import Excel
        [HttpPost("import")]
        public async Task<IActionResult> ImportExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ApiResponse<string>(false, "Vui lòng upload file Excel hợp lệ."));

            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new ApiResponse<string>(false, "Chỉ hỗ trợ file Excel định dạng .xlsx"));

            try 
            {
                var result = await _subjectService.ImportSubjectsFromExcelAsync(file);
                return Ok(new ApiResponse<ImportResultDto>(result, $"Import hoàn tất: {result.SuccessCount} thành công, {result.ErrorCount} lỗi."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>(false, $"Lỗi xử lý file: {ex.Message}"));
            }
        }

        // 4. Lấy chi tiết
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var subject = await _subjectService.GetSubjectByIdAsync(id);
            if (subject == null) 
                return NotFound(new ApiResponse<string>(false, "Không tìm thấy môn học"));

            return Ok(new ApiResponse<Subject>(subject, "Lấy thông tin thành công"));
        }

        // 5. Cập nhật (ĐÃ SỬA LẠI ĐOẠN NÀY)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateSubjectDto dto)
        {
            try
            {
                // Sửa: Nhận kết quả bool (true/false) thay vì object Subject
                var isSuccess = await _subjectService.UpdateSubjectAsync(id, dto);
                
                if (isSuccess)
                {
                    return Ok(new ApiResponse<bool>(true, "Cập nhật môn học thành công"));
                }
                else
                {
                    return NotFound(new ApiResponse<string>(false, "Không tìm thấy môn học để cập nhật"));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
        }

        // 6. Xóa
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _subjectService.DeleteSubjectAsync(id);
                if (result)
                    return Ok(new ApiResponse<string>(true, "Xóa môn học thành công"));
                else
                    return BadRequest(new ApiResponse<string>(false, "Không tìm thấy môn học"));
            }
            catch (InvalidOperationException ex) 
            {
                 // Bắt lỗi logic (vd: môn đã có lớp học)
                 return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>(false, ex.Message));
            }
        }
    }
}