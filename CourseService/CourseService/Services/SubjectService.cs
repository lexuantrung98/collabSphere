using CourseService.Data;
using CourseService.DTOs;
using CourseService.Models;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml; // Thư viện đọc Excel

namespace CourseService.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly CourseDbContext _context;

        public SubjectService(CourseDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách môn học
        public async Task<List<Subject>> GetAllSubjectsAsync()
        {
            return await _context.Subjects.ToListAsync();
        }

        // 2. Tạo môn học mới
        public async Task<Subject> CreateSubjectAsync(CreateSubjectDto dto)
        {
            var newSubject = new Subject
            {
                Code = dto.Code,
                Name = dto.Name,
                Credits = dto.Credits, 
                Description = dto.Description,
                IsActive = true
            };

            _context.Subjects.Add(newSubject);
            await _context.SaveChangesAsync();
            return newSubject;
        }

        // 3. Import Môn học từ Excel 
        public async Task<ImportResultDto> ImportSubjectsFromExcelAsync(IFormFile file)
        {
            var result = new ImportResultDto();
            var existingCodes = await _context.Subjects.Select(s => s.Code.ToUpper()).ToListAsync();
            var existingNames = await _context.Subjects.Select(s => s.Name.ToUpper()).ToListAsync();
            var processedCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var processedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    if (worksheet.Dimension == null)
                    {
                        result.ErrorDetails.Add("File Excel rỗng hoặc không có dữ liệu.");
                        return result;
                    }

                    var rowCount = worksheet.Dimension.End.Row;
                    
                    // DEBUG: Log số dòng
                    Console.WriteLine($"[DEBUG] Total rows in Excel: {rowCount}");

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var code = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var name = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                        var creditsText = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                        var description = worksheet.Cells[row, 4].Value?.ToString()?.Trim();

                        // DEBUG: Log từng dòng
                        Console.WriteLine($"[DEBUG] Row {row}: Code='{code}', Name='{name}', Credits='{creditsText}'");

                        // Validate: Thiếu dữ liệu
                        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name) || string.IsNullOrEmpty(creditsText))
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Thiếu thông tin (Mã môn, Tên môn hoặc Số tín chỉ trống).");
                            Console.WriteLine($"[DEBUG] Row {row}: SKIPPED - Missing data");
                            continue;
                        }

                        // Validate: Mã môn đã tồn tại trong database
                        if (existingCodes.Contains(code.ToUpper()))
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Mã môn '{code}' đã tồn tại trong hệ thống.");
                            Console.WriteLine($"[DEBUG] Row {row}: SKIPPED - Code '{code}' exists in DB");
                            continue;
                        }

                        // Validate: Mã môn trùng trong file Excel
                        if (processedCodes.Contains(code))
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Mã môn '{code}' bị trùng lặp trong file Excel.");
                            Console.WriteLine($"[DEBUG] Row {row}: SKIPPED - Code '{code}' duplicate in file");
                            continue;
                        }

                        // Validate: Tên môn đã tồn tại trong database
                        if (existingNames.Contains(name.ToUpper()))
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Tên môn '{name}' đã tồn tại trong hệ thống.");
                            Console.WriteLine($"[DEBUG] Row {row}: SKIPPED - Name '{name}' exists in DB");
                            continue;
                        }

                        // Validate: Tên môn trùng trong file Excel
                        if (processedNames.Contains(name))
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Tên môn '{name}' bị trùng lặp trong file Excel.");
                            Console.WriteLine($"[DEBUG] Row {row}: SKIPPED - Name '{name}' duplicate in file");
                            continue;
                        }

                        // Validate: Số tín chỉ phải là số nguyên hợp lệ
                        if (!int.TryParse(creditsText, out int credits) || credits <= 0)
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Số tín chỉ '{creditsText}' không hợp lệ (phải là số nguyên > 0).");
                            Console.WriteLine($"[DEBUG] Row {row}: SKIPPED - Invalid credits '{creditsText}'");
                            continue;
                        }

                        // Tất cả OK → Tạo môn học
                        Console.WriteLine($"[DEBUG] Row {row}: ADDING - Code='{code}', Name='{name}', Credits={credits}");
                        
                        var subject = new Subject
                        {
                            Code = code,
                            Name = name,
                            Credits = credits,
                            Description = description,
                            IsActive = true
                        };

                        _context.Subjects.Add(subject);
                        processedCodes.Add(code);
                        processedNames.Add(name);
                        existingCodes.Add(code.ToUpper());
                        existingNames.Add(name.ToUpper());
                        result.SuccessCount++;
                        Console.WriteLine($"[DEBUG] Row {row}: SUCCESS - SuccessCount now = {result.SuccessCount}");
                    }

                    Console.WriteLine($"[DEBUG] Loop done. Total success: {result.SuccessCount}, Total errors: {result.ErrorCount}");
                    
                    if (result.SuccessCount > 0)
                    {
                        Console.WriteLine($"[DEBUG] Saving {result.SuccessCount} subjects to database...");
                        await _context.SaveChangesAsync();
                        Console.WriteLine($"[DEBUG] Save successful!");
                    }
                }
            }

            return result;
        }

        // 4. Lấy chi tiết môn học
        public async Task<Subject?> GetSubjectByIdAsync(int id)
        {
            return await _context.Subjects.FindAsync(id);
        }

        // 5. Cập nhật môn học 
        public async Task<bool> UpdateSubjectAsync(int id, CreateSubjectDto dto)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return false;

            subject.Code = dto.Code;
            subject.Name = dto.Name;
            subject.Credits = dto.Credits;
            subject.Description = dto.Description;
            
            _context.Subjects.Update(subject);
            await _context.SaveChangesAsync();
            return true;
        }

        // 6. Xóa môn học
        public async Task<bool> DeleteSubjectAsync(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return false;

            // Kiểm tra ràng buộc: Nếu môn học đã có Lớp thì không được xóa
            bool hasClasses = await _context.Classes.AnyAsync(c => c.SubjectId == id);
            if (hasClasses)
            {
                throw new InvalidOperationException("Không thể xóa môn học này vì đã có lớp học đang hoạt động.");
            }

            // Xóa Syllabus đi kèm (nếu có)
            var syllabi = await _context.Syllabi.Where(s => s.SubjectId == id).ToListAsync();
            if (syllabi.Any())
            {
                _context.Syllabi.RemoveRange(syllabi);
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}