using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using CommunicationService.Data;   // 👈 Thêm
using CommunicationService.Models; // 👈 Thêm

namespace CommunicationService.Hubs
{
    // Class phụ để lưu thông tin người dùng
    public class UserConnection
    {
        public string UserId { get; set; }
        public string ConnectionId { get; set; }
    }

    public class MeetingHub : Hub
    {
        // 👇 1. Khai báo DbContext để kết nối CSDL
        private readonly AppDbContext _context;

        // Dictionary lưu: RoomId -> Danh sách User (RAM)
        private static readonly ConcurrentDictionary<string, List<UserConnection>> Rooms = new();

        // 👇 2. Constructor: Nhận DbContext từ hệ thống (Dependency Injection)
        public MeetingHub(AppDbContext context)
        {
            _context = context;
        }

        // HÀM JOIN (Giữ nguyên logic diệt Ghost của bạn)
        public async Task JoinMeeting(string roomId, string userId)
        {
            // 1. Rời khỏi các phòng cũ (nếu có)
            await LeavePreviousRooms(Context.ConnectionId);

            // 2. Tạo phòng nếu chưa có
            if (!Rooms.ContainsKey(roomId))
            {
                Rooms.TryAdd(roomId, new List<UserConnection>());
            }

            var roomUsers = Rooms[roomId];

            lock (roomUsers)
            {
                // 3. 🔥 DIỆT GHOST: Kiểm tra xem UserID này đã có trong phòng chưa?
                var oldUser = roomUsers.FirstOrDefault(u => u.UserId == userId);
                if (oldUser != null)
                {
                    roomUsers.Remove(oldUser);
                    Clients.Group(roomId).SendAsync("UserLeft", oldUser.ConnectionId);
                }

                // 4. Thêm kết nối mới vào
                roomUsers.Add(new UserConnection { UserId = userId, ConnectionId = Context.ConnectionId });
            }

            // 5. Thêm vào nhóm SignalR
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            // 6. Gửi danh sách ConnectionId của những người khác cho mình
            var listIds = roomUsers.Select(u => u.ConnectionId).ToList();
            await Clients.Caller.SendAsync("AllUsers", listIds);

            // 7. Báo chat
            await Clients.Group(roomId).SendAsync("ReceiveMessage", "Hệ thống", $"User {userId} đã vào phòng.");
        }

        // 👇 HÀM GỬI TIN NHẮN (ĐÃ CẬP NHẬT LƯU DB)
        public async Task SendMessage(string roomId, string user, string message)
        {
            try
            {
                // 1. Lưu tin nhắn vào Database
                var chatMsg = new ChatMessage
                {
                    RoomId = roomId,
                    User = user,
                    Content = message,
                    Timestamp = DateTime.UtcNow
                };

                _context.ChatMessages.Add(chatMsg);
                await _context.SaveChangesAsync(); // Cam kết lưu xuống SQL
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi lưu tin nhắn: " + ex.Message);
            }

            // 2. Gửi cho mọi người (Real-time)
            await Clients.Group(roomId).SendAsync("ReceiveMessage", user, message);
        }

        // --- CÁC HÀM WEBRTC & WHITEBOARD GIỮ NGUYÊN ---
        public async Task SendSignal(string userToSignal, string signalData)
        {
            await Clients.Client(userToSignal).SendAsync("UserJoinedSignal", Context.ConnectionId, signalData);
        }

        public async Task ReturnSignal(string userToSignal, string signalData)
        {
            await Clients.Client(userToSignal).SendAsync("ReceivingReturnedSignal", Context.ConnectionId, signalData);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await LeavePreviousRooms(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        private async Task LeavePreviousRooms(string connectionId)
        {
            foreach (var room in Rooms)
            {
                var user = room.Value.FirstOrDefault(u => u.ConnectionId == connectionId);
                if (user != null)
                {
                    lock (room.Value)
                    {
                        room.Value.Remove(user);
                    }
                    await Clients.Group(room.Key).SendAsync("UserLeft", connectionId);
                }
            }
        }

        public async Task SendDraw(int prevX, int prevY, int currentX, int currentY, string color, string strokeId)
        {
            await Clients.Others.SendAsync("ReceiveDraw", prevX, prevY, currentX, currentY, color, strokeId);
        }
        public async Task ClearBoard() { await Clients.All.SendAsync("ReceiveClear"); }
        public async Task UndoDraw() { await Clients.All.SendAsync("ReceiveUndo"); }
    }
}