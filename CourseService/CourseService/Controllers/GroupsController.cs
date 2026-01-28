using CourseService.DTOs;
using CourseService.Services;
using CourseService.Wrappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourseService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupsController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        // ==================== GROUPS CRUD ====================

        /// <summary>
        /// Lấy danh sách nhóm theo lớp học
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetGroupsByClass([FromQuery] int classId)
        {
            if (classId <= 0)
                return BadRequest(new ApiResponse<string>(false, "ClassId không hợp lệ"));

            var groups = await _groupService.GetGroupsByClassAsync(classId);
            return Ok(new ApiResponse<List<GroupDto>>(groups, "Lấy danh sách nhóm thành công"));
        }

        /// <summary>
        /// Lấy danh sách nhóm của sinh viên
        /// </summary>
        [HttpGet("student/{studentCode}")]
        public async Task<IActionResult> GetGroupsByStudent(string studentCode)
        {
            var groups = await _groupService.GetGroupsByStudentAsync(studentCode);
            return Ok(new ApiResponse<List<GroupDto>>(groups, "Lấy danh sách nhóm của sinh viên thành công"));
        }

        /// <summary>
        /// Lấy chi tiết nhóm
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroupById(int id)
        {
            var group = await _groupService.GetGroupByIdAsync(id);
            if (group == null)
                return NotFound(new ApiResponse<string>(false, "Không tìm thấy nhóm"));

            return Ok(new ApiResponse<object>(group, "Lấy thông tin nhóm thành công"));
        }

        /// <summary>
        /// Tạo nhóm mới (Lecturer only)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupDto dto)
        {
            try
            {
                var group = await _groupService.CreateGroupAsync(dto);
                return Ok(new ApiResponse<object>(group, "Tạo nhóm thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
        }

        /// <summary>
        /// Cập nhật nhóm (Lecturer only)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroup(int id, [FromBody] CreateGroupDto dto)
        {
            try
            {
                var result = await _groupService.UpdateGroupAsync(id, dto);
                if (!result)
                    return NotFound(new ApiResponse<string>(false, "Không tìm thấy nhóm"));

                return Ok(new ApiResponse<bool>(true, "Cập nhật nhóm thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
        }

        /// <summary>
        /// Xóa nhóm (Lecturer only)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(int id)
        {
            var result = await _groupService.DeleteGroupAsync(id);
            if (!result)
                return NotFound(new ApiResponse<string>(false, "Không tìm thấy nhóm"));

            return Ok(new ApiResponse<bool>(true, "Xóa nhóm thành công"));
        }

        // ==================== MEMBERS MANAGEMENT ====================

        /// <summary>
        /// Lấy danh sách thành viên trong nhóm
        /// </summary>
        [HttpGet("{id}/members")]
        public async Task<IActionResult> GetGroupMembers(int id)
        {
            var members = await _groupService.GetGroupMembersAsync(id);
            return Ok(new ApiResponse<List<GroupMemberDto>>(members, "Lấy danh sách thành viên thành công"));
        }

        /// <summary>
        /// Thêm thành viên vào nhóm (Lecturer only)
        /// </summary>
        [HttpPost("{id}/members")]
        public async Task<IActionResult> AddMember(int id, [FromBody] AddGroupMemberDto dto)
        {
            try
            {
                var member = await _groupService.AddMemberToGroupAsync(id, dto);
                return Ok(new ApiResponse<object>(member, "Thêm thành viên thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
        }

        /// <summary>
        /// Xóa thành viên khỏi nhóm (Lecturer only)
        /// </summary>
        [HttpDelete("{id}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(int id, int memberId)
        {
            var result = await _groupService.RemoveMemberFromGroupAsync(id, memberId);
            if (!result)
                return NotFound(new ApiResponse<string>(false, "Không tìm thấy thành viên trong nhóm"));

            return Ok(new ApiResponse<bool>(true, "Xóa thành viên khỏi nhóm thành công"));
        }

        /// <summary>
        /// Sinh viên tự tham gia nhóm
        /// </summary>
        [HttpPost("{id}/join")]
        public async Task<IActionResult> JoinGroup(int id, [FromBody] JoinGroupDto dto)
        {
            try
            {
                var member = await _groupService.JoinGroupAsync(id, dto.StudentCode);
                return Ok(new ApiResponse<object>(member, "Tham gia nhóm thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<string>(false, ex.Message));
            }
        }
    }
}
