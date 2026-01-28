using CourseService.Data;
using CourseService.DTOs;
using CourseService.Models; 
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml; // Cần thiết cho Import Excel
using CourseService.Services.Sync;    
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace CourseService.Services
{
    public class ClassService : IClassService
    {
        private readonly CourseDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IAccountServiceClient _accountClient;

        public ClassService(
            CourseDbContext context,
            IWebHostEnvironment env,
            IAccountServiceClient accountClient)
        {
            _context = context;
            _env = env;
            _accountClient = accountClient;
        }

        // ==========================================
        // PHẦN 1: QUẢN LÝ LỚP HỌC (CRUD)
        // ==========================================

        public async Task<List<ClassDto>> GetAllClassesAsync()
        {
            var classes = await _context.Classes
                .Include(c => c.Subject)
                // .Include(c => c.Lecturer) // Bỏ comment nếu model Class đã có quan hệ Lecturer
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            // Populate StudentCount for each class
            var classIds = classes.Select(c => c.Id).ToList();
            var memberCounts = await _context.ClassMembers
                .Where(m => classIds.Contains(m.ClassId))
                .GroupBy(m => m.ClassId)
                .Select(g => new { ClassId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ClassId, x => x.Count);

            return classes.Select(c => new ClassDto 
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Semester = c.Semester,
                Year = c.Year,
                MaxStudents = c.MaxStudents,
                SubjectId = c.SubjectId,
                SubjectName = c.Subject != null ? c.Subject.Name : "Chưa có tên môn",
                SubjectCode = c.Subject != null ? c.Subject.Code : "",
                LecturerId = c.LecturerId,
                LecturerName = c.LecturerName, 
                LecturerEmail = c.LecturerEmail,
                StudentCount = memberCounts.GetValueOrDefault(c.Id, 0)
            }).ToList();
        }

        // NEW: Filter classes by lecturer email (optimize for Lecturer pages)
        public async Task<List<ClassDto>> GetClassesByLecturerAsync(string lecturerEmail)
        {
            var classes = await _context.Classes
                .Include(c => c.Subject)
                .Where(c => c.LecturerEmail == lecturerEmail)
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            // Populate StudentCount
            var classIds = classes.Select(c => c.Id).ToList();
            var memberCounts = await _context.ClassMembers
                .Where(m => classIds.Contains(m.ClassId))
                .GroupBy(m => m.ClassId)
                .Select(g => new { ClassId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ClassId, x => x.Count);

            return classes.Select(c => new ClassDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Semester = c.Semester,
                Year = c.Year,
                MaxStudents = c.MaxStudents,
                SubjectId = c.SubjectId,
                SubjectName = c.Subject != null ? c.Subject.Name : "Chưa có tên môn",
                SubjectCode = c.Subject != null ? c.Subject.Code : "",
                LecturerId = c.LecturerId,
                LecturerName = c.LecturerName,
                LecturerEmail = c.LecturerEmail,
                StudentCount = memberCounts.GetValueOrDefault(c.Id, 0)
            }).ToList();
        }

        // NEW: Filter classes by student code (optimize for Student pages)
        public async Task<List<ClassDto>> GetClassesByStudentAsync(string studentCode)
        {
            // Get all class IDs where student is a member (by StudentCode)
            var classIds = await _context.ClassMembers
                .Where(m => m.StudentCode == studentCode)
                .Select(m => m.ClassId)
                .ToListAsync();

            // Get full class details for those IDs
            var classes = await _context.Classes
                .Include(c => c.Subject)
                .Where(c => classIds.Contains(c.Id))
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            // Populate StudentCount
            var classIdsList = classes.Select(c => c.Id).ToList();
            var memberCounts = await _context.ClassMembers
                .Where(m => classIdsList.Contains(m.ClassId))
                .GroupBy(m => m.ClassId)
                .Select(g => new { ClassId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.ClassId, x => x.Count);

            return classes.Select(c => new ClassDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Semester = c.Semester,
                Year = c.Year,
                MaxStudents = c.MaxStudents,
                SubjectId = c.SubjectId,
                SubjectName = c.Subject != null ? c.Subject.Name : "Chưa có tên môn",
                SubjectCode = c.Subject != null ? c.Subject.Code : "",
                LecturerId = c.LecturerId,
                LecturerName = c.LecturerName,
                LecturerEmail = c.LecturerEmail,
                StudentCount = memberCounts.GetValueOrDefault(c.Id, 0)
            }).ToList();
        }

        public async Task<Class?> GetClassByIdAsync(int id)
        {
            return await _context.Classes
                .Include(c => c.Subject)
                // .Include(c => c.Lecturer)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Class> CreateClassAsync(CreateClassDto dto)
        {
            var subject = await _context.Subjects.FindAsync(dto.SubjectId);
            if (subject == null) throw new Exception("Môn học không tồn tại");

            var newClass = new Class
            {
                Code = dto.Code,
                Name = dto.Name,
                Semester = dto.Semester,
                SubjectId = dto.SubjectId,
                MaxStudents = dto.MaxStudents > 0 ? dto.MaxStudents : 60,
                Status = "Active"
            };
            _context.Classes.Add(newClass);
            await _context.SaveChangesAsync();
            return newClass;
        }

        public async Task<ClassDto> UpdateClassAsync(int id, CreateClassDto request) 
        {
            var classEntity = await _context.Classes.FindAsync(id);
            if (classEntity == null) throw new Exception("Không tìm thấy lớp học");

            classEntity.Code = request.Code;
            classEntity.Name = request.Name;
            classEntity.Semester = request.Semester;
            classEntity.SubjectId = request.SubjectId;
            classEntity.MaxStudents = request.MaxStudents;

            await _context.SaveChangesAsync();
            
            return new ClassDto 
            { 
                Id = classEntity.Id, 
                Code = classEntity.Code, 
                Name = classEntity.Name,
                Semester = classEntity.Semester,
                SubjectId = classEntity.SubjectId,
                MaxStudents = classEntity.MaxStudents,
                SubjectName = classEntity.Subject?.Name ?? "", // Load lại nếu cần thiết
                LecturerName = classEntity.LecturerName
            };
        }

        public async Task DeleteClassAsync(int id)
        {
            var classEntity = await _context.Classes.FindAsync(id);
            if (classEntity == null) throw new Exception("Không tìm thấy lớp học");

            var hasStudents = await _context.ClassMembers.AnyAsync(m => m.ClassId == id);
            if (hasStudents) throw new Exception("Lớp đang có sinh viên, không thể xóa!");

            _context.Classes.Remove(classEntity);
            await _context.SaveChangesAsync();
        }

        public async Task<ImportResultDto> ImportClassesFromExcelAsync(IFormFile file)
        {
            var result = new ImportResultDto();
            if (file == null || file.Length == 0)
            {
                result.ErrorDetails.Add("File rỗng hoặc không tồn tại.");
                return result;
            }
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using (var package = new ExcelPackage(stream))
                {
                    if (package.Workbook.Worksheets.Count == 0)
                    {
                        result.ErrorDetails.Add("File Excel không có Sheet nào.");
                        return result;
                    }
                    var worksheet = package.Workbook.Worksheets[0];
                    if (worksheet.Dimension == null)
                    {
                        result.ErrorDetails.Add("Sheet 1 không có dữ liệu.");
                        return result;
                    }
                    var rowCount = worksheet.Dimension.End.Row;
                    
                    // Track processed combinations to prevent duplicates in same file
                    var processedCombinations = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    
                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            // A: Mã lớp, B: Mã môn, C: Học kỳ, D: Email GV (optional), E: Năm
                            var classCode = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                            var subjectCode = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                            var semester = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                            var lecturerEmail = worksheet.Cells[row, 4].Value?.ToString()?.Trim(); // Optional
                            var yearStr = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                            
                            // Skip empty rows
                            if (string.IsNullOrEmpty(classCode) && string.IsNullOrEmpty(subjectCode)) continue;
                            
                            // Validation
                            if (string.IsNullOrEmpty(classCode) || string.IsNullOrEmpty(subjectCode))
                            {
                                result.ErrorCount++;
                                result.ErrorDetails.Add($"Dòng {row}: Thiếu thông tin (Mã lớp hoặc Mã môn trống).");
                                continue;
                            }
                            
                            // Find subject by CODE
                            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Code == subjectCode);
                            if (subject == null)
                            {
                                result.ErrorCount++;
                                result.ErrorDetails.Add($"Dòng {row}: Môn học '{subjectCode}' không tồn tại trong hệ thống.");
                                continue;
                            }
                            
                            // Check duplicate: SAME class code + SAME subject (in database)
                            var isDuplicateInDb = await _context.Classes.AnyAsync(c => 
                                c.Code == classCode && c.SubjectId == subject.Id);
                            if (isDuplicateInDb)
                            {
                                result.ErrorCount++;
                                result.ErrorDetails.Add($"Dòng {row}: Lớp '{classCode}' đã học môn '{subjectCode}' rồi.");
                                continue;
                            }
                            
                            // Check duplicate in current file
                            var combinationKey = $"{classCode}_{subject.Id}";
                            if (processedCombinations.Contains(combinationKey))
                            {
                                result.ErrorCount++;
                                result.ErrorDetails.Add($"Dòng {row}: Lớp '{classCode}' + môn '{subjectCode}' bị trùng lặp trong file Excel.");
                                continue;
                            }
                            
                            // Parse year (default to current year if empty)
                            int year = DateTime.Now.Year;
                            if (!string.IsNullOrEmpty(yearStr) && (!int.TryParse(yearStr, out year) || year < 2000 || year > 2100))
                            {
                                result.ErrorCount++;
                                result.ErrorDetails.Add($"Dòng {row}: Năm '{yearStr}' không hợp lệ (phải là số từ 2000-2100).");
                                continue;
                            }
                            
                            // Create new class
                            var newClass = new Class 
                            { 
                                Code = classCode, 
                                Name = classCode, // Use code as name by default
                                SubjectId = subject.Id, 
                                Semester = semester ?? "HK1", 
                                Year = year,
                                MaxStudents = 60, 
                                Status = "Active" 
                            };
                            
                            // If lecturer email provided, try to assign
                            if (!string.IsNullOrEmpty(lecturerEmail))
                            {
                                try 
                                {
                                    var lecturerInfo = await _accountClient.GetUserByEmailAsync(lecturerEmail);
                                    if (lecturerInfo != null)
                                    {
                                        newClass.LecturerId = lecturerInfo.Id;
                                        newClass.LecturerName = lecturerInfo.FullName;
                                        newClass.LecturerEmail = lecturerInfo.Email;
                                    }
                                }
                                catch 
                                {
                                    // Ignore lecturer assignment errors, class can be created without lecturer
                                }
                            }
                            
                            _context.Classes.Add(newClass);
                            processedCombinations.Add(combinationKey);
                            result.SuccessCount++;
                        }
                        catch (Exception ex)
                        {
                            result.ErrorCount++;
                            result.ErrorDetails.Add($"Dòng {row}: Lỗi hệ thống ({ex.Message}).");
                        }
                    }
                    if (result.SuccessCount > 0) await _context.SaveChangesAsync();
                }
            }
            return result;
        }

        // ==========================================
        // PHẦN 2: QUẢN LÝ TÀI LIỆU (RESOURCES)
        // ==========================================

        public async Task<List<ClassResource>> GetClassResourcesAsync(int classId)
        {
            return await _context.ClassResources.Where(r => r.ClassId == classId).ToListAsync();
        }

        public async Task UploadResourceAsync(int classId, IFormFile file, Guid uploaderId)
        {
            var classExists = await _context.Classes.AnyAsync(c => c.Id == classId);
            if (!classExists) throw new Exception("Lớp không tồn tại");

            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var resource = new ClassResource
            {
                ClassId = classId,
                FileName = file.FileName,
                FilePath = uniqueFileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow,
                UploadedBy = uploaderId
            };

            _context.ClassResources.Add(resource);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteResourceAsync(int resourceId)
        {
            var res = await _context.ClassResources.FindAsync(resourceId);
            if (res == null) return false;

            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads");
            string filePath = Path.Combine(uploadsFolder, res.FilePath);
            
            if (File.Exists(filePath)) File.Delete(filePath);

            _context.ClassResources.Remove(res);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(Stream?, string, string)> DownloadResourceAsync(int resourceId)
        {
            var res = await _context.ClassResources.FindAsync(resourceId);
            if (res == null) return (null, "", "");

            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads");
            string filePath = Path.Combine(uploadsFolder, res.FilePath);

            if (!File.Exists(filePath)) return (null, "", "");

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;
            return (memory, res.FileName, res.ContentType);
        }

        // ==========================================
        // PHẦN 3: QUẢN LÝ SINH VIÊN (MEMBERS)
        // ==========================================

        public async Task<List<ClassMember>> GetClassMembersAsync(int classId)
        {
            return await _context.ClassMembers.Where(m => m.ClassId == classId).ToListAsync();
        }

        public async Task<bool> AddStudentToClassAsync(int classId, string studentCode)
        {
            // 1. Lấy thông tin lớp học này để biết SubjectId
            var currentClass = await _context.Classes
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.Id == classId);
            
            if (currentClass == null)
            {
                throw new Exception("Lớp học không tồn tại");
            }

            // 2. Kiểm tra đã có trong lớp này chưa
            bool existsInClass = await _context.ClassMembers.AnyAsync(m => m.ClassId == classId && m.StudentCode == studentCode);
            if (existsInClass) throw new Exception("Sinh viên này đã có trong lớp");

            // 3. KIỂM TRA SINH VIÊN ĐÃ HỌC MÔN NÀY Ở LỚP KHÁC CHƯA
            var isDuplicateSubject = await _context.ClassMembers
                .Where(m => m.StudentCode == studentCode)
                .Join(_context.Classes,
                    member => member.ClassId,
                    cls => cls.Id,
                    (member, cls) => cls)
                .AnyAsync(cls => cls.SubjectId == currentClass.SubjectId);

            if (isDuplicateSubject)
            {
                var subjectName = currentClass.Subject?.Name ?? "môn học này";
                throw new Exception($"Sinh viên '{studentCode}' đã đăng ký {subjectName} ở lớp khác. Không được học trùng môn.");
            }

            // 4. GỌI SANG ACCOUNT SERVICE ĐỂ LẤY THÔNG TIN THẬT
            // Lưu ý: Nếu AccountService chưa chạy, đoạn này có thể gây lỗi. 
            // Nếu muốn test nhanh có thể comment đoạn này và dùng data giả.
            var studentInfo = await _accountClient.GetStudentByCodeAsync(studentCode);

            if (studentInfo == null) 
            {
                throw new Exception($"Không tìm thấy sinh viên với mã {studentCode} trong hệ thống. Vui lòng kiểm tra mã sinh viên hoặc tạo tài khoản trước.");
            }

            // 5. Lưu thông tin vào Database
            var member = new ClassMember
            {
                ClassId = classId,
                StudentCode = studentCode,
                FullName = studentInfo.FullName, 
                Email = studentInfo.Email,       
                JoinedAt = DateTime.UtcNow
            };

            _context.ClassMembers.Add(member);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveStudentFromClassAsync(int classId, int memberId)
        {
            var mem = await _context.ClassMembers.FindAsync(memberId);
            if (mem == null || mem.ClassId != classId) return false;

            _context.ClassMembers.Remove(mem);
            await _context.SaveChangesAsync();
            return true;
        }
    
        public async Task<int> ImportMembersFromExcelAsync(int classId, IFormFile file)
        {
            int count = 0;
            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var studentCode = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        if (string.IsNullOrEmpty(studentCode)) continue;

                        try 
                        {
                            await AddStudentToClassAsync(classId, studentCode);
                            count++;
                        }
                        catch 
                        {
                            continue;
                        }
                    }
                }
            }
            return count;
        }

        // ==========================================
        // PHẦN 4: GIẢNG VIÊN
        // ==========================================

        public async Task<bool> AssignLecturerAsync(int classId, string lecturerEmail)
        {
            var classEntity = await _context.Classes.FindAsync(classId);
            if (classEntity == null) throw new Exception("Lớp không tồn tại");

            var lecturerInfo = await _accountClient.GetUserByEmailAsync(lecturerEmail);
            
            if (lecturerInfo == null) throw new Exception("Không tìm thấy giảng viên với email này");

            classEntity.LecturerId = lecturerInfo.Id;
            classEntity.LecturerName = lecturerInfo.FullName;
            classEntity.LecturerEmail = lecturerInfo.Email;

            _context.Classes.Update(classEntity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}