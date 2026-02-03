using CommunicationService.Data;
using CommunicationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json; // Dùng thư viện chuẩn của .NET (nhẹ hơn Newtonsoft)
using System.Net;
using System.Net.Mail;

namespace CommunicationService.Controllers
{
    // Class nhận dữ liệu từ Frontend
    public class CreateMeetingRequest
    {
        public string Title { get; set; }
        public DateTime StartTime { get; set; }
        public List<string> Participants { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly AppDbContext _context;

        // 👇 CẤU HÌNH EMAIL (Dùng App Password của bạn)
        private const string SMTP_EMAIL = "phihaokc2005@gmail.com";
        private const string SMTP_PASSWORD = "tmby kray etxc lfgt";

        public MeetingController(AppDbContext context)
        {
            _context = context;
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
                    ParticipantsJson = JsonSerializer.Serialize(req.Participants)
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
                    // Nếu gửi mail lỗi, chỉ log ra Console chứ KHÔNG làm lỗi API
                    // Frontend vẫn sẽ nhận được thông báo "Thành công"
                    Console.WriteLine("⚠️ Lưu DB thành công nhưng Gửi mail thất bại: " + emailEx.Message);
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