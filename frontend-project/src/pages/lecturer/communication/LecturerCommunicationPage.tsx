import { useState, useEffect, useCallback } from 'react';
import { 
  getChatList, 
  getChatHistory, 
  askAI, 
  createMeeting, 
  getMeetings, 
  deleteMeeting,
  createChatConnection,
  joinChatRoom,
  leaveChatRoom,
  sendMessageViaSignalR,
  disconnectChat,
  type ChatItem, 
  type ChatMessage, 
  type Meeting 
} from '../../../api/communicationApi';
import { courseApi } from '../../../api/courseApi';
import '../../../styles/communication.css';

export default function LecturerCommunicationPage() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState('general-room');
  const [msgInput, setMsgInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // AI Chat
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string[]>([]);
  
  // Meeting
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser.code || currentUser.id || 'lecturer-01';
  const userName = currentUser.fullName || 'Giảng viên';

  // Load chat list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = currentUser.email || '';
        const data = await getChatList(userId, 'Lecturer', userEmail);
        setChatList(data);
      } catch (e) {
        console.error('Error fetching chat list:', e);
        setChatList([
          { id: 'general-room', name: 'Sảnh Chung', type: 'Public' },
          { id: 'room-lecturers', name: 'Phòng Giảng Viên', type: 'RoleChat' },
        ]);
      }
    };
    fetchData();
  }, [userId, currentUser.email]);

  // Define loadChatHistory before useEffect
  const loadChatHistory = async (roomId: string) => {
    try {
      const response = await getChatHistory(roomId, 1, 50);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  const switchRoom = useCallback(async (roomId: string) => {
    if (currentRoom) {
      await leaveChatRoom(currentRoom);
    }
    await joinChatRoom(roomId);
    setCurrentRoom(roomId);
    // Save to localStorage to persist across page refresh
    localStorage.setItem('lastChatRoom_lecturer', roomId);
    await loadChatHistory(roomId);
  }, [currentRoom]);

  // Setup SignalR ChatHub connection
  useEffect(() => {
    let mounted = true;
    
    const setupConnection = async () => {
      createChatConnection(
        (user, content, timestamp) => {
          setMessages(prev => [...prev, { user, content, timestamp }]);
        },
        (user) => {
          // Only show join message if user is not "Unknown"
          if (user && user !== "Unknown") {
            setMessages(prev => [...prev, { 
              user: 'System', 
              content: `${user} joined the room`, 
              isSystem: true 
            }]);
          }
        },
        (user) => {
          // Only show leave message if user is not "Unknown"
          if (user && user !== "Unknown") {
            setMessages(prev => [...prev, { 
              user: 'System', 
              content: `${user} left the room`, 
              isSystem: true 
            }]);
          }
        }
      );
      
      if (mounted) {
        setIsConnected(true);
      }

      // Join last room or default room
      setTimeout(async () => {
        if (mounted) {
          // Get last room from localStorage, default to general-room
          const lastRoom = localStorage.getItem('lastChatRoom_lecturer') || 'general-room';
          await joinChatRoom(lastRoom);
          setCurrentRoom(lastRoom);
          loadChatHistory(lastRoom);
        }
      }, 1000);
    };

    setupConnection();

    return () => {
      mounted = false;
      disconnectChat();
      setIsConnected(false);
    };
  }, []);

  const sendMessage = async () => {
    if (msgInput && isConnected) {
      try {
        await sendMessageViaSignalR(currentRoom, userName, msgInput);
        setMsgInput('');
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  // AI Chat handler
  const handleAskAI = async () => {
    if (!aiInput) return;
    const question = aiInput;
    setAiResponse(prev => [...prev, `Bạn: ${question}`]);
    setAiInput('');
    
    try {
      const answer = await askAI(question);
      setAiResponse(prev => [...prev, `🤖 AI: ${answer}`]);
    } catch {
      setAiResponse(prev => [...prev, '🤖 AI: Lỗi kết nối!']);
    }
  };

  // Meeting handlers
  const fetchGroupMembers = async (roomId: string) => {
    setIsLoadingMembers(true);
    try {
      if (roomId.startsWith('CLASS_')) {
        // Extract classId from "CLASS_9"
        const classId = parseInt(roomId.replace('CLASS_', ''));
        const response = await courseApi.getClassMembers(classId);
        
        // Extract student codes from ClassMembers
        const studentCodes = response.data.map((member: { studentCode: string }) => member.studentCode);
        setParticipants(studentCodes);
      } else if (roomId.startsWith('GROUP_')) {
        // For groups: currently not implemented
        setParticipants([]);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setParticipants([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupId = e.target.value;
    setSelectedGroupId(newGroupId);
    if (newGroupId) fetchGroupMembers(newGroupId);
    else setParticipants([]);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = (document.getElementById('mTitle') as HTMLInputElement).value;
    const time = (document.getElementById('mTime') as HTMLInputElement).value;

    if (participants.length === 0) {
      alert('Vui lòng chọn nhóm tham gia!');
      return;
    }

    try {
      // Get class/group info from selectedGroupId
      const selectedChat = chatList.find(chat => chat.id === selectedGroupId);
      
      await createMeeting(
        title, 
        time, 
        participants,
        selectedChat?.id,  // classId (e.g., "CLASS_9")
        selectedChat?.name, // className (e.g., "CN23B - Lập Trình Java")
        selectedChat?.name  // subjectName (same as className for now)
      );
      alert('Tạo cuộc họp thành công!');
      // Reload meetings list
      const data = await getMeetings();
      setMeetings(data);
      // Reset form
      setSelectedGroupId('');
      setParticipants([]);
    } catch {
      alert('Lỗi kết nối');
    }
  };

  // Load meetings on mount
  useEffect(() => {
    const loadMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (e) {
        console.error('Error loading meetings:', e);
      }
    };
    loadMeetings();
  }, []);

  // Delete meeting handler
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Bạn có chắc muốn xóa cuộc họp này?')) return;
    
    try {
      await deleteMeeting(meetingId);
      // Reload meetings list
      const data = await getMeetings();
      setMeetings(data);
    } catch (e) {
      console.error('Error deleting meeting:', e);
      alert('Lỗi xóa cuộc họp');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>Giao tiếp & Cộng tác</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Chat, họp trực tuyến và hỗ trợ AI</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { id: 'chat', label: '💬 Trò chuyện', icon: '💬' },
          { id: 'meeting', label: '📅 Lên lịch họp', icon: '📅' },
          { id: 'ai', label: '🤖 Trợ lý AI', icon: '🤖' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              background: activeTab === tab.id ? '#667eea' : '#f0f0f0',
              color: activeTab === tab.id ? 'white' : '#333',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          {/* Room List */}
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: 16 }}>Phòng Chat</h3>
            
            {/* Phòng Chat Giảng Viên */}
            {chatList.filter(chat => chat.type === 'RoleChat').length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#667eea', marginBottom: 10, marginTop: 15 }}>
                  👥 Phòng Chat Giảng Viên
                </div>
                {chatList
                  .filter(chat => chat.type === 'RoleChat')
                  .map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => switchRoom(chat.id)}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        background: currentRoom === chat.id ? '#e6f7ff' : '#f5f5f5',
                        borderRadius: 8,
                        cursor: 'pointer',
                        borderLeft: currentRoom === chat.id ? '3px solid #667eea' : 'none',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{chat.name}</div>
                    </div>
                  ))}
              </>
            )}
            
            {/* Lớp Học */}
            {chatList.filter(chat => chat.type === 'Class').length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#52c41a', marginBottom: 10, marginTop: 15 }}>
                  📚 Lớp Học
                </div>
                {chatList
                  .filter(chat => chat.type === 'Class')
                  .map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => switchRoom(chat.id)}
                      style={{
                        padding: 12,
                        marginBottom: 8,
                        background: currentRoom === chat.id ? '#f6ffed' : '#f5f5f5',
                        borderRadius: 8,
                        cursor: 'pointer',
                        borderLeft: currentRoom === chat.id ? '3px solid #52c41a' : 'none',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{chat.name}</div>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Chat Area */}
          <div className="comm-chat-container">
            <div style={{ padding: 15, borderBottom: '1px solid #eee', background: '#fafafa' }}>
              <strong>🟢 Phòng: {currentRoom}</strong>
            </div>
            <div className="comm-messages-list">
              {messages.map((m, idx) => (
                <div key={idx} className={`comm-message-bubble ${m.isSystem ? '' : (m.user === userName ? 'comm-msg-me' : 'comm-msg-other')}`}>
                  {!m.isSystem && <strong>{m.user}: </strong>}
                  <span>{m.content}</span>
                </div>
              ))}
            </div>
            <div className="comm-chat-input-area">
              <input 
                value={msgInput} 
                onChange={e => setMsgInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendMessage()} 
                placeholder="Nhập tin nhắn..." 
              />
              <button className="comm-btn" onClick={sendMessage}>Gửi</button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Tab */}
      {activeTab === 'meeting' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Form tao cuoc hop */}
          <div className="comm-card">
            <h2 style={{ marginTop: 0 }}>📅 Tạo cuộc họp mới</h2>
            <form onSubmit={handleSchedule}>
              <div className="comm-form-group">
                <label>Chọn Nhóm/Lớp:</label>
                <select className="comm-input-full" value={selectedGroupId} onChange={handleGroupChange}>
                  <option value="">-- Chọn nhóm --</option>
                  {chatList.map(chat => (
                    <option key={chat.id} value={chat.id}>{chat.name} ({chat.type})</option>
                  ))}
                </select>
              </div>
              <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                <label>Thành viên ({participants.length}):</label>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {isLoadingMembers ? 'Đang tải...' : participants.join(', ') || 'Chưa có'}
                </div>
              </div>
              <div className="comm-form-group">
                <label>Tiêu đề:</label>
                <input id="mTitle" className="comm-input-full" type="text" defaultValue="Họp nhóm" />
              </div>
              <div className="comm-form-group">
                <label>Thời gian:</label>
                <input id="mTime" className="comm-input-full" type="datetime-local" />
              </div>
              <button type="submit" className="comm-btn" disabled={isLoadingMembers || participants.length === 0}>
                Tạo cuộc họp
              </button>
            </form>
          </div>
          
          {/* Danh sach cuoc hop */}
          <div className="comm-card">
            <h2 style={{ marginTop: 0 }}>📋 Danh sách cuộc họp</h2>
            {meetings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📅</div>
                <p>Chưa có cuộc họp nào</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {meetings.map(meeting => (
                  <div key={meeting.id} style={{
                    padding: 16,
                    background: '#f9f9f9',
                    borderRadius: 12,
                    border: '1px solid #eee'
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>{meeting.title}</div>
                    {(meeting.className || meeting.subjectName) && (
                      <div style={{ fontSize: 14, color: '#1890ff', marginBottom: 6, fontWeight: 500 }}>
                        📘 {meeting.className || meeting.subjectName}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                      🕒 {new Date(meeting.startTime).toLocaleString('vi-VN')}
                    </div>
                    <a 
                      href={meeting.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: '#667eea',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600
                      }}
                    >
                      Tham gia họp
                    </a>
                    <button
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      style={{
                        marginLeft: 8,
                        padding: '8px 16px',
                        background: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <div className="comm-card">
          <h2 style={{ marginTop: 0 }}>🤖 Trợ lý AI</h2>
          <p style={{ color: '#666' }}>Hỏi AI về tiến độ dự án, đề xuất cải thiện, hoặc bất kỳ câu hỏi nào!</p>
          <div className="ai-chat-box">
            {aiResponse.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🤖</div>
                <p>Hãy hỏi tôi bất cứ điều gì...</p>
              </div>
            )}
            {aiResponse.map((txt, i) => (
              <div key={i} className={`ai-msg ${txt.startsWith('🤖') ? 'ai-msg-bot' : 'ai-msg-user'}`}>
                {txt}
              </div>
            ))}
          </div>
          <div className="ai-input-group">
            <input 
              style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd' }}
              value={aiInput} 
              onChange={e => setAiInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleAskAI()} 
              placeholder="Hỏi AI..." 
            />
            <button className="comm-btn" onClick={handleAskAI}>Hỏi</button>
          </div>
        </div>
      )}
    </div>
  );
}
