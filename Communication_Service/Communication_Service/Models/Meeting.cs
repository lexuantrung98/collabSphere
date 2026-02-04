using System;
using System.ComponentModel.DataAnnotations;

namespace CommunicationService.Models // Chú ý dòng này: Đây là địa chỉ của file
{
    public class Meeting
    {
        [Key]
        public Guid Id { get; set; }

        public string Title { get; set; }

        public DateTime StartTime { get; set; }

        // Cột này để lưu danh sách người tham gia dạng chữ
        public string ParticipantsJson { get; set; }
        
        // Thông tin lớp và môn học
        public string? ClassId { get; set; }
        public string? ClassName { get; set; }
        public string? SubjectName { get; set; }
        
        // Thông tin nhóm
        public string? GroupId { get; set; }
        public string? GroupName { get; set; }
    }
}