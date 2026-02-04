using CommunicationService.Data;
using CommunicationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Net;
using System.Net.Mail;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace CommunicationService.Controllers
{
    // Class nhận dữ liệu từ Frontend
    public class CreateMeetingRequest
    {
        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartTime { get; set; }
        
        [Required]
        [MinLength(1, ErrorMessage = "At least one participant required")]
        public List<string> Participants { get; set; } = new();
        
        // Class and subject information (optional)
        public string? ClassId { get; set; }
        public string? ClassName { get; set; }
        public string? SubjectName { get; set; }
        
        // Group information (optional)
        public string? GroupId { get; set; }
        public string? GroupName { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Require authentication
    public class MeetingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly Services.IFirebaseService _firebaseService;
        private readonly Services.INotificationService _notificationService;

        // 👇 CẤU HÌNH EMAIL
        private const string SMTP_EMAIL = "phihaokc2005@gmail.com";
        private const string SMTP_PASSWORD = "tmby kray etxc lfgt";

        public MeetingController(AppDbContext context, Services.IFirebaseService firebaseService, Services.INotificationService notificationService)
        {
            _context = context;
            _firebaseService = firebaseService;
            _notificationService = notificationService;
        }

        // Lay danh sach cuoc hop (filter by role)
        [HttpGet]
        [Authorize(Roles = "Lecturer,Student")]
        public async Task<IActionResult> GetMeetings()
        {
            var userId = User.Identity?.Name;
            var userRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            
            var allMeetings = await _context.Meetings
                .OrderByDescending(m => m.StartTime)
                .ToListAsync();
            
            IEnumerable<Meeting> filteredMeetings;
            
            if (userRole == "Lecturer")
            {
                // Giảng viên CHỈ thấy họp lớp (không có GroupId)
                filteredMeetings = allMeetings
                    .Where(m => string.IsNullOrEmpty(m.GroupId));
            }
            else if (userRole == "Student")
            {
                // Sinh viên thấy: họp lớp mình theo học + họp nhóm mình tham gia
                filteredMeetings = allMeetings
                    .Where(m => m.ParticipantsJson.Contains(userId ?? ""));
            }
            else
            {
                // Unknown role - return empty
                filteredMeetings = new List<Meeting>();
            }
            
            var result = filteredMeetings
                .Select(m => new 
                {
                    m.Id,
                    m.Title,
                    m.StartTime,
                    Participants = m.ParticipantsJson,
                    Link = $"http://localhost:5000/meeting/{m.Id}",
                    ClassName = m.ClassName,
                    SubjectName = m.SubjectName,
                    GroupName = m.GroupName
                })
                .ToList();
            
            return Ok(result);
        }

        // Lay cuoc hop theo user (participant)
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetMeetingsByUser(string userId)
        {
            var meetings = await _context.Meetings
                .OrderByDescending(m => m.StartTime)
                .ToListAsync();
            
            // Filter meetings where user is participant
            var userMeetings = meetings
                .Where(m => m.ParticipantsJson.Contains(userId))
                .Select(m => new 
                {
                    m.Id,
                    m.Title,
                    m.StartTime,
                    Participants = m.ParticipantsJson,
                    Link = $"http://localhost:5000/meeting/{m.Id}",
                    ClassName = m.ClassName,
                    SubjectName = m.SubjectName,
                    GroupName = m.GroupName
                })
                .ToList();
            
            return Ok(userMeetings);
        }

        // Xoa cuoc hop
        [HttpDelete("{id}")]
        [Authorize(Roles = "Lecturer,Student")]
        public async Task<IActionResult> DeleteMeeting(Guid id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null)
            {
                return NotFound(new { Message = "Khong tim thay cuoc hop" });
            }
            
            var userId = User.Identity?.Name;
            var userRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            
            // Validate permission
            if (userRole == "Lecturer")
            {
                // Giảng viên có thể xóa họp lớp (không có GroupId)
                if (!string.IsNullOrEmpty(meeting.GroupId))
                {
                    return Forbid("Giảng viên không thể xóa họp nhóm dự án");
                }
            }
            else if (userRole == "Student")
            {
                // Sinh viên chỉ được xóa họp nhóm mà mình là nhóm trưởng
                // Note: Cần verify với ProjectService, tạm thời check qua ParticipantsJson
                if (string.IsNullOrEmpty(meeting.GroupId))
                {
                    return Forbid("Sinh viên không thể xóa họp lớp");
                }
                
                // TODO: Call ProjectService to verify user is group leader
                // For now, allow if user is in participants (will be improved later)
                if (!meeting.ParticipantsJson.Contains(userId ?? ""))
                {
                    return Forbid("Bạn không có quyền xóa cuộc họp này");
                }
            }
            else
            {
                return Forbid();
            }
            
            _context.Meetings.Remove(meeting);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Xoa cuoc hop thanh cong" });
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateMeeting([FromBody] CreateMeetingRequest req)
        {
            try
            {
                // ==========================================
                // BƯỚC 1: LƯU VÀO DATABASE
                // ==========================================

                var meetingId = Guid.NewGuid();

                var newMeeting = new Meeting
                {
                    Id = meetingId,
                    Title = req.Title,
                    // ✅ Fix lỗi PostgreSQL: Chuyển thời gian về UTC chuẩn quốc tế
                    StartTime = req.StartTime.ToUniversalTime(),
                    // ✅ Chuyển List thành chuỗi JSON để lưu vào cột text
                    ParticipantsJson = JsonSerializer.Serialize(req.Participants),
                    // Lưu thông tin lớp và môn học
                    ClassId = req.ClassId,
                    ClassName = req.ClassName,
                    SubjectName = req.SubjectName,
                    // Lưu thông tin nhóm
                    GroupId = req.GroupId,
                    GroupName = req.GroupName
                };

                _context.Meetings.Add(newMeeting);
                await _context.SaveChangesAsync(); // Lưu xuống DB

                // ==========================================
                // BƯỚC 2: GỬI EMAIL (Trong khối try-catch riêng)
                // ==========================================
                try
                {
                    // 1. Lấy danh sách email từ ID (Hàm giả lập map ID -> Email)
                    List<string> emailList = MapIdsToEmails(req.Participants);

                    // 2. Soạn nội dung mail
                    string subject = $"📅 Mời họp: {req.Title}";
                    string body = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 5px;'>
                            <h2 style='color: #0078d4;'>Thông báo cuộc họp mới</h2>
                            <p>Xin chào, bạn được mời tham gia cuộc họp:</p>
                            <ul>
                                <li><b>Chủ đề:</b> {req.Title}</li>
                                <li><b>Thời gian:</b> {req.StartTime.ToString("HH:mm dd/MM/yyyy")}</li>
                            </ul>
                            <p>Vui lòng tham gia đúng giờ tại đường dẫn sau:</p>
                            <a href='http://localhost:5173' style='background-color: #0078d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Tham gia ngay</a>
                            <br/><br/>
                            <hr/>
                            <small>Đây là email tự động từ hệ thống Communication Service.</small>
                        </div>
                    ";

                    // 3. Gửi đi
                    SendEmailMultiple(emailList, subject, body);
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine("⚠️ Gửi mail thất bại: " + emailEx.Message);
                }

                // ==========================================
                // BƯỚC 2.5: GỬI PUSH NOTIFICATIONS
                // ==========================================
                try
                {
                    var notificationTitle =  $"📅 Cuộc họp mới: {req.Title}";
                    var notificationBody = $"Thời gian: {req.StartTime:HH:mm dd/MM/yyyy}";
                    
                    var data = new Dictionary<string, string>
                    {
                        { "meetingId", meetingId.ToString() },
                        { "type", "meeting" }
                    };
                    
                    // Send to topic based on class or group
                    var topic = string.IsNullOrEmpty(req.GroupId) 
                        ? $"class_{req.ClassId}" 
                        : $"group_{req.GroupId}";
                    
                    await _firebaseService.SendToTopicAsync(topic, notificationTitle, notificationBody, data);
                    Console.WriteLine($"✅ Firebase notification sent to: {topic}");
                }
                catch (Exception fcmEx)
                {
                    Console.WriteLine($"⚠️ Firebase failed: {fcmEx.Message}");
                }

                // ==========================================
                // BƯỚC 2.6: LƯU NOTIFICATION VÀO DATABASE
                // ==========================================
                Console.WriteLine($"🔔 CREATING NOTIFICATIONS for {req.Participants.Count} participants");
                try
                {
                    var actionUrl = $"/meetings/{meetingId}";
                    var icon = "📅";

                    // Create notifications for all participants (students)
                    Console.WriteLine($"🔔 Calling CreateNotificationsForUsersAsync for participants...");
                    await _notificationService.CreateNotificationsForUsersAsync(
                        req.Participants,
                        "meeting",
                        $"Cuộc họp mới: {req.Title}",
                        $"Thời gian: {req.StartTime:HH:mm dd/MM/yyyy}. {(string.IsNullOrEmpty(req.GroupName) ? req.ClassName : req.GroupName)}",
                        meetingId.ToString(),
                        actionUrl,
                        icon
                    );
                    Console.WriteLine($"✅ Participant notifications created successfully!");
                    
                    // ALSO create notification for the meeting creator (Lecturer)
                    var creatorEmail = User.FindFirstValue(ClaimTypes.Email);
                    if (!string.IsNullOrEmpty(creatorEmail))
                    {
                        Console.WriteLine($"🔔 Creating notification for creator: {creatorEmail}");
                        await _notificationService.CreateNotificationAsync(
                            creatorEmail,
                            "meeting",
                            $"Bạn đã tạo cuộc họp: {req.Title}",
                            $"Thời gian: {req.StartTime:HH:mm dd/MM/yyyy}. {(string.IsNullOrEmpty(req.GroupName) ? req.ClassName : req.GroupName)}",
                            meetingId.ToString(),
                            actionUrl,
                            icon
                        );
                        Console.WriteLine($"✅ Creator notification created!");
                    }
                }
                catch (Exception notifEx)
                {
                    Console.WriteLine($"⚠️ Failed to save notifications to DB: {notifEx.Message}");
                    Console.WriteLine($"⚠️ Stack trace: {notifEx.StackTrace}");
                }


                // ==========================================
                // BƯỚC 3: TRẢ VỀ KẾT QUẢ CHO FRONTEND
                // ==========================================
                var responseData = new
                {
                    Id = meetingId,
                    Title = req.Title,
                    Link = $"http://localhost:5173",
                    Participants = req.Participants
                };

                return Ok(new { Message = "Tạo cuộc họp thành công!", Data = responseData });
            }
            catch (Exception ex)
            {
                // Lỗi nghiêm trọng (như không kết nối được DB) thì báo lỗi 500
                Console.WriteLine("❌ LỖI SERVER: " + ex.Message);
                return StatusCode(500, new { Message = "Lỗi Server: " + ex.Message });
            }
        }

        // --- CÁC HÀM PHỤ TRỢ (HELPER FUNCTIONS) ---

        // Hàm giả lập: Đổi ID (sv-01) sang Email thật
        private List<string> MapIdsToEmails(List<string> ids)
        {
            var emails = new List<string>();
            foreach (var id in ids)
            {
                // ⚠️ Để test: Gửi tất cả về email chính của bạn
                // Sau này bạn có thể sửa logic: if (id == "sv-01") add "sinhvien@gmail.com"...
                emails.Add("phihaokc2005@gmail.com");
            }
            return emails;
        }

        // Hàm gửi mail hàng loạt
        private void SendEmailMultiple(List<string> emails, string subject, string body)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(SMTP_EMAIL, SMTP_PASSWORD),
                EnableSsl = true,
            };

            foreach (var email in emails)
            {
                var msg = new MailMessage
                {
                    From = new MailAddress(SMTP_EMAIL),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true // Cho phép gửi HTML đẹp
                };
                msg.To.Add(email);
                smtpClient.Send(msg);
                Console.WriteLine($"--> Đã gửi mail mời họp tới: {email}");
            }
        }
    }
}