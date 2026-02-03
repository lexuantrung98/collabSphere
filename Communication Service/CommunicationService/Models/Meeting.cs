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
    }
}