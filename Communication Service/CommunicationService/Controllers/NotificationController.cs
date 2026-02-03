using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

namespace CommunicationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        // 👇 CẤU HÌNH EMAIL (Nhớ thay bằng Email và App Password thật của bạn)
        private const string SMTP_EMAIL = "phihaokc2005@gmail.com";
        private const string SMTP_PASSWORD = "tmby kray etxc lfgt";

        // Hàm chung: Gửi email cho 1 người
        private void SendEmailSingle(string toEmail, string subject, string body)
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential(SMTP_EMAIL, SMTP_PASSWORD),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(SMTP_EMAIL),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(toEmail);

                smtpClient.Send(mailMessage);
                Console.WriteLine($"--> Đã gửi email đến: {toEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"--> Lỗi gửi email ({toEmail}): {ex.Message}");
            }
        }

        // Hàm chung: Gửi email cho NHIỀU người (Giảng viên + Thành viên)
        private void SendEmailMultiple(List<string> emails, string subject, string body)
        {
            foreach (var email in emails)
            {
                if (!string.IsNullOrEmpty(email))
                {
                    SendEmailSingle(email, subject, body);
                }
            }
        }

        // ==================================================================================
        // ĐÚNG 5 API TƯƠNG ỨNG VỚI 5 YÊU CẦU CỦA BẠN
        // ==================================================================================

        // 1. Thông báo cho TRƯỞNG NHÓM khi được phân công vào nhóm
        [HttpPost("assign-leader")]
        public IActionResult NotifyAssignLeader([FromBody] AssignLeaderRequest req)
        {
            string subject = $"📌 Bạn được phân công làm Trưởng nhóm: {req.GroupName}";
            string body = $"<p>Chào {req.LeaderName},</p><p>Bạn đã được chỉ định làm trưởng nhóm cho dự án <b>{req.GroupName}</b>.</p>";

            SendEmailSingle(req.LeaderEmail, subject, body);
            return Ok(new { message = "Đã gửi mail cho Trưởng nhóm" });
        }

        // 2. Thông báo cho GIẢNG VIÊN & THÀNH VIÊN khi Trưởng nhóm hoàn thành mốc quan trọng (Milestone)
        [HttpPost("complete-milestone")]
        public IActionResult NotifyMilestone([FromBody] GroupEventRequest req)
        {
            string subject = $"✅ Mốc quan trọng hoàn thành: {req.EventName}";
            string body = $"<p>Nhóm <b>{req.GroupName}</b> đã hoàn thành giai đoạn: <b>{req.EventName}</b>.</p>";

            // Gộp email giảng viên và các thành viên lại để gửi 1 lượt
            var allEmails = new List<string>(req.MemberEmails);
            if (!string.IsNullOrEmpty(req.LecturerEmail)) allEmails.Add(req.LecturerEmail);

            SendEmailMultiple(allEmails, subject, body);
            return Ok(new { message = "Đã gửi mail cho GV và Thành viên" });
        }

        // 3. Thông báo cho GIẢNG VIÊN & THÀNH VIÊN khi nhóm nộp điểm kiểm tra (Nộp bài)
        [HttpPost("submit-points")]
        public IActionResult NotifySubmission([FromBody] GroupEventRequest req)
        {
            string subject = $"📝 Nhóm {req.GroupName} đã nộp điểm kiểm tra";
            string body = $"<p>Nhóm <b>{req.GroupName}</b> vừa thực hiện nộp các điểm kiểm tra/bài tập.</p>";

            var allEmails = new List<string>(req.MemberEmails);
            if (!string.IsNullOrEmpty(req.LecturerEmail)) allEmails.Add(req.LecturerEmail);

            SendEmailMultiple(allEmails, subject, body);
            return Ok(new { message = "Đã gửi mail nộp bài cho GV và Thành viên" });
        }

        // 4. Thông báo cho CÁC THÀNH VIÊN khi nhận được đánh giá/phản hồi
        [HttpPost("receive-feedback")]
        public IActionResult NotifyFeedback([FromBody] FeedbackRequest req)
        {
            string subject = "💬 Nhóm nhận được phản hồi mới";
            string body = $"<p>Nhóm bạn vừa nhận được đánh giá từ <b>{req.ReviewerName}</b>:</p><blockquote>{req.Content}</blockquote>";

            SendEmailMultiple(req.MemberEmails, subject, body);
            return Ok(new { message = "Đã gửi mail phản hồi cho các thành viên" });
        }

        // 5. Thông báo cho QUẢN TRỊ VIÊN khi nhận được báo cáo hệ thống
        [HttpPost("system-report")]
        public IActionResult NotifySystemReport([FromBody] ReportRequest req)
        {
            // Email cố định của Admin (hoặc lấy từ DB)
            string adminEmail = "admin_hethong@gmail.com";

            string subject = "🚨 Báo cáo lỗi hệ thống mới";
            string body = $"<p>Người dùng <b>{req.UserEmail}</b> đã báo cáo:</p><p>{req.Content}</p>";

            SendEmailSingle(adminEmail, subject, body);
            return Ok(new { message = "Đã gửi báo cáo cho Admin" });
        }
    }

    // --- CÁC MODEL DỮ LIỆU ĐẦU VÀO (DTO) ---
    public class AssignLeaderRequest
    {
        public string LeaderEmail { get; set; }
        public string LeaderName { get; set; }
        public string GroupName { get; set; }
    }

    public class GroupEventRequest
    {
        public string GroupName { get; set; }
        public string EventName { get; set; } // Tên Milestone hoặc Tên bài tập
        public string LecturerEmail { get; set; }
        public List<string> MemberEmails { get; set; } = new List<string>();
    }

    public class FeedbackRequest
    {
        public string ReviewerName { get; set; } // Tên GV hoặc Đồng nghiệp đánh giá
        public string Content { get; set; }
        public List<string> MemberEmails { get; set; } = new List<string>();
    }

    public class ReportRequest
    {
        public string UserEmail { get; set; }
        public string Content { get; set; }
    }
}