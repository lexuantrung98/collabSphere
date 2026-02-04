using CommunicationService.Data;
using CommunicationService.Models;
using CommunicationService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication for all endpoints
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly CourseServiceClient _courseService;
        private readonly ProjectServiceClient _projectService;

        public ChatController(
            AppDbContext context, 
            IMemoryCache cache,
            CourseServiceClient courseService,
            ProjectServiceClient projectService)
        {
            _context = context;
            _cache = cache;
            _courseService = courseService;
            _projectService = projectService;
        }

        /// <summary>
        /// Get chat history with pagination and caching
        /// </summary>
        [HttpGet("history/{roomId}")]
        [Authorize(Roles = "Lecturer,Student")]
        public async Task<IActionResult> GetHistory(
            string roomId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 50)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 50;
                
                // Cache key includes roomId and page for granular caching
                var cacheKey = $"chat_history_{roomId}_page{page}_size{pageSize}";
                
                // Try to get from cache first
                if (_cache.TryGetValue(cacheKey, out object cachedResult))
                {
                    return Ok(cachedResult);
                }
                
                var skip = (page - 1) * pageSize;
                
                // Filter out soft-deleted messages
                var query = _context.ChatMessages
                    .Where(m => m.RoomId == roomId && !m.IsDeleted);
                    
                var total = await query.CountAsync();
                
                var messages = await query
                    .OrderByDescending(m => m.Timestamp)
                    .Skip(skip)
                    .Take(pageSize)
                    .Select(m => new {
                        m.Id,
                        m.RoomId,
                        m.User,
                        m.Content,
                        m.Timestamp,
                        m.IsRead
                    })
                    .ToListAsync();

                var result = new
                {
                    data = messages,
                    page,
                    pageSize,
                    total,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                };

                // Cache for 5 minutes
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(5))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(2));
                
                _cache.Set(cacheKey, result, cacheOptions);

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"ERROR in GetHistory: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Mark messages as read
        /// </summary>
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAsRead([FromBody] MarkReadRequest request)
        {
            if (request == null || request.MessageIds == null || request.MessageIds.Count == 0)
                return BadRequest("Invalid request");
            
            var messages = await _context.ChatMessages
                .Where(m => request.MessageIds.Contains(m.Id))
                .ToListAsync();

            foreach (var msg in messages)
            {
                msg.IsRead = true;
                msg.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Messages marked as read", count = messages.Count });
        }

        /// <summary>
        /// Soft delete a message
        /// </summary>
        [HttpDelete("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int messageId)
        {
            var message = await _context.ChatMessages
                .FirstOrDefaultAsync(m => m.Id == messageId && !m.IsDeleted);

            if (message == null)
                return NotFound("Message not found");

            // Soft delete
            message.IsDeleted = true;
            message.DeletedAt = DateTime.UtcNow;
            message.DeletedBy = User.FindFirst("sub")?.Value ?? User.Identity?.Name;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Message deleted successfully" });
        }

        /// <summary>
        /// Get available chat rooms for a student
        /// </summary>
        [HttpGet("rooms/student/{studentCode}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetStudentRooms(string studentCode)
        {
            try
            {
                var rooms = new List<RoomDto>();
                var classNameMap = new Dictionary<string, string>(); // SubjectCode -> SubjectName

                // Get student's classes from CourseService
                try
                {
                    var classes = await _courseService.GetStudentClasses(studentCode);
                    foreach (var c in classes)
                    {
                        rooms.Add(new RoomDto
                        {
                            Id = $"CLASS_{c.Id}",
                            Name = c.Name,
                            Type = "Class"
                        });
                        
                        // Build classNameMap with SubjectCode as key
                        // ProjectTemplate.SubjectId is actually SubjectCode string (e.g., "LT2")
                        if (!string.IsNullOrEmpty(c.SubjectName) && !string.IsNullOrEmpty(c.SubjectCode))
                        {
                            // Primary key: SubjectCode (string like "LT2", matches ProjectTemplate.SubjectId)
                            classNameMap[c.SubjectCode] = c.SubjectName; // "LT2" -> "Lập Trình Java"
                            
                            // Also add ClassId as fallback
                            classNameMap[c.Id.ToString()] = c.SubjectName; // "9" -> "Lập Trình Java"
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"WARNING: CourseService unavailable: {ex.Message}");
                }

                // Get student's groups from ProjectService
                try
                {
                    var groups = await _projectService.GetStudentGroups(studentCode);
                    
                    // Debug log
                    Console.WriteLine($"DEBUG: classNameMap keys: {string.Join(", ", classNameMap.Keys)}");
                    Console.WriteLine($"DEBUG: classNameMap values: {string.Join(", ", classNameMap.Values)}");
                    foreach (var g in groups)
                    {
                        Console.WriteLine($"DEBUG: Group '{g.Name}' has ClassId='{g.ClassId}', SubjectId='{g.SubjectCode}'");
                    }
                    
                    rooms.AddRange(groups.Select(g => new RoomDto
                    {
                        Id = $"GROUP_{g.Id}",
                        Name = FormatGroupName(g.Name, g.ClassId, g.SubjectCode, classNameMap),
                        Type = "Group"
                    }));
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"WARNING: GroupsService unavailable: {ex.Message}");
                }

                return Ok(rooms);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR GetStudentRooms: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
        
        // Format group name: "Nhóm 1 - CN23B Lập Trình Java"
        private static string FormatGroupName(string groupName, string classId, string? subjectCode, Dictionary<string, string> classNameMap)
        {
            // Try to get subject name using SubjectCode first (most accurate)
            if (!string.IsNullOrEmpty(subjectCode) && classNameMap.TryGetValue(subjectCode, out var subjectNameByCode))
            {
                return $"{groupName} - {classId} {subjectNameByCode}";
            }
            
            // Fallback: try using ClassId
            if (!string.IsNullOrEmpty(classId) && classNameMap.TryGetValue(classId, out var subjectNameById))
            {
                return $"{groupName} - {classId} {subjectNameById}";
            }
            
            // Final fallback: just use classId
            return !string.IsNullOrEmpty(classId) ? $"{groupName} - {classId}" : groupName;
        }
    }

    public class MarkReadRequest
    {
        public List<int> MessageIds { get; set; } = new();
    }

    public class RoomDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}