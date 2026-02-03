using System.Collections.Generic;
using System.Linq;

namespace CommunicationService.Services
{
    // Định nghĩa các đối tượng giả
    public class UserDto { public string Id { get; set; } public string Name { get; set; } public string Role { get; set; } public string Email { get; set; } }
    public class ClassDto { public string Id { get; set; } public string Name { get; set; } public string LecturerId { get; set; } }
    public class GroupDto { public string Id { get; set; } public string Name { get; set; } public string ClassId { get; set; } }

    public class MockDataService
    {
        // 1. DỮ LIỆU NGƯỜI DÙNG (Giả lập AccountService)
        public static List<UserDto> Users = new List<UserDto>
        {
            new UserDto { Id = "gv-01", Name = "Thầy Hào", Role = "Lecturer", Email = "hao@uni.edu" },
            new UserDto { Id = "sv-01", Name = "Sinh viên Nam", Role = "Student", Email = "nam@st.edu" },
            new UserDto { Id = "sv-02", Name = "Sinh viên Nữ", Role = "Student", Email = "nu@st.edu" }
        };

        // 2. DỮ LIỆU LỚP HỌC (Giả lập CourseService)
        public static List<ClassDto> Classes = new List<ClassDto>
        {
            new ClassDto { Id = "class-net", Name = "Lớp .NET Core", LecturerId = "gv-01" },
            new ClassDto { Id = "class-java", Name = "Lớp Java", LecturerId = "gv-02" }
        };

        // 3. DỮ LIỆU NHÓM (Giả lập ProjectService)
        public static List<GroupDto> Groups = new List<GroupDto>
        {
            new GroupDto { Id = "group-1", Name = "Nhóm Xây Dựng", ClassId = "class-net" }
        };

        // Hàm hỗ trợ lấy dữ liệu
        public UserDto GetUser(string id) => Users.FirstOrDefault(u => u.Id == id);

        public List<GroupDto> GetGroupsForStudent(string studentId)
        {
            if (studentId == "sv-01") return Groups;
            return new List<GroupDto>();
        }
    }
}