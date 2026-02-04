using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using CommunicationService.Data;
using CommunicationService.Models;
using Microsoft.EntityFrameworkCore;

namespace CommunicationService.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(AppDbContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Send message to a room
        /// </summary>
        public async Task SendMessage(string roomId, string user, string content)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(content) || content.Length > 2000)
                {
                    _logger.LogWarning("Invalid message content from {User} in room {RoomId}", user, roomId);
                    throw new HubException("Invalid message content");
                }

                // Save message to database
                var message = new ChatMessage
                {
                    RoomId = roomId,
                    User = user,
                    Content = content,
                    Timestamp = DateTime.UtcNow,
                    IsDeleted = false,
                    IsRead = false
                };

                _context.ChatMessages.Add(message);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Message {MessageId} sent by {User} to room {RoomId}", 
                    message.Id, user, roomId);

                // Broadcast to all clients in the room
                await Clients.Group(roomId).SendAsync("ReceiveMessage", new
                {
                    id = message.Id,
                    user = message.User,
                    content = message.Content,
                    timestamp = message.Timestamp
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message from {User} to room {RoomId}", user, roomId);
                throw;
            }
        }

        /// <summary>
        /// Join a chat room
        /// </summary>
        public async Task JoinRoom(string roomId)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
                
                var username = Context.User?.Identity?.Name ?? "Unknown";
                _logger.LogInformation("User {Username} ({ConnectionId}) joined room {RoomId}", 
                    username, Context.ConnectionId, roomId);
                
                // Notify others in room
                await Clients.OthersInGroup(roomId).SendAsync("UserJoined", username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining room {RoomId} for connection {ConnectionId}", 
                    roomId, Context.ConnectionId);
                throw;
            }
        }

        /// <summary>
        /// Leave a chat room
        /// </summary>
        public async Task LeaveRoom(string roomId)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
                
                var username = Context.User?.Identity?.Name ?? "Unknown";
                _logger.LogInformation("User {Username} ({ConnectionId}) left room {RoomId}", 
                    username, Context.ConnectionId, roomId);
                
                // Notify others in room
                await Clients.OthersInGroup(roomId).SendAsync("UserLeft", username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving room {RoomId} for connection {ConnectionId}", 
                    roomId, Context.ConnectionId);
                throw;
            }
        }

        /// <summary>
        /// Mark messages as read
        /// </summary>
        public async Task MarkMessagesAsRead(List<int> messageIds)
        {
            try
            {
                var messages = await _context.ChatMessages
                    .Where(m => messageIds.Contains(m.Id))
                    .ToListAsync();

                foreach (var msg in messages)
                {
                    msg.IsRead = true;
                    msg.ReadAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                
                _logger.LogInformation("{Count} messages marked as read by connection {ConnectionId}", 
                    messages.Count, Context.ConnectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking messages as read for connection {ConnectionId}", 
                    Context.ConnectionId);
                throw;
            }
        }

        /// <summary>
        /// User typing indicator
        /// </summary>
        public async Task StartTyping(string roomId, string user)
        {
            await Clients.OthersInGroup(roomId).SendAsync("UserTyping", user);
            _logger.LogDebug("User {User} started typing in room {RoomId}", user, roomId);
        }

        /// <summary>
        /// User stopped typing
        /// </summary>
        public async Task StopTyping(string roomId, string user)
        {
            await Clients.OthersInGroup(roomId).SendAsync("UserStoppedTyping", user);
            _logger.LogDebug("User {User} stopped typing in room {RoomId}", user, roomId);
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.User?.Identity?.Name ?? "Anonymous";
            _logger.LogInformation("Client connected: {Username} ({ConnectionId})", 
                username, Context.ConnectionId);
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context.User?.Identity?.Name ?? "Anonymous";
            
            if (exception != null)
            {
                _logger.LogWarning(exception, 
                    "Client disconnected with error: {Username} ({ConnectionId})", 
                    username, Context.ConnectionId);
            }
            else
            {
                _logger.LogInformation("Client disconnected: {Username} ({ConnectionId})", 
                    username, Context.ConnectionId);
            }
            
            await base.OnDisconnectedAsync(exception);
        }
    }
}
