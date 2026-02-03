import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import './App.css';
import type { User, ChatItem, Message } from './types'; 

// Import các Component con
import ClassList from './components/ClassList';
import VideoChat from './components/VideoChat';
import ScheduleMeeting from './components/ScheduleMeeting';
import AIChat from './components/AIChat';
import NotificationTest from './components/NotificationTest';

const API_URL = "http://localhost:5015";

const MOCK_USERS: User[] = [
  { id: 'gv-01', name: 'Thầy Hào (GV)', role: 'Lecturer' },
  { id: 'sv-01', name: 'Nguyễn Văn Nam (SV)', role: 'Student' },
  { id: 'sv-02', name: 'Trần Thị Nữ (SV)', role: 'Student' },
];

function App() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('tab1');
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [currentRoom, setCurrentRoom] = useState("general-room");

  // 1. Lấy danh sách lớp
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/ChatList/${currentUser.id}`);
            if (res.ok) setChatList(await res.json());
        } catch (e) { console.error(e); }
    };
    fetchData();
  }, [currentUser]);

  // 2. Kết nối SignalR
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_URL}/meetingHub`)
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start().then(() => {
          console.log('SignalR Connected!');
          joinMeeting("general-room");
          connection.on('ReceiveMessage', (user, content) => setMessages(prev => [...prev, { user, content }]));
          connection.on('UserJoined', (id) => setMessages(prev => [...prev, { user: 'System', content: `User ${id} joined`, isSystem: true }]));
      }).catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]);

  const joinMeeting = async (roomId: string) => {
    if (connection) {
      await connection.invoke("JoinMeeting", roomId, currentUser.id);
      setCurrentRoom(roomId);
      if(roomId !== "general-room") setActiveTab('tab2'); // Tự động chuyển qua Video Call

      try { // Load tin nhắn cũ
          const res = await fetch(`${API_URL}/api/Chat/history/${roomId}`);
          if (res.ok) {
              const oldMsgs = await res.json();
              setMessages(oldMsgs.map((m: any) => ({ user: m.user, content: m.content })));
          }
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>CommService</h2>
        <div className="user-info">
          <small>Đang đăng nhập:</small>
          <select value={currentUser.id} onChange={(e) => setCurrentUser(MOCK_USERS.find(u => u.id === e.target.value) || MOCK_USERS[0])}>
            {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <button className={`nav-btn ${activeTab === 'tab1' ? 'active' : ''}`} onClick={() => setActiveTab('tab1')}>📋 Danh sách Lớp</button>
        <button className={`nav-btn ${activeTab === 'tab2' ? 'active' : ''}`} onClick={() => setActiveTab('tab2')}>🎥 Video Call</button>
        <button className={`nav-btn ${activeTab === 'tab3' ? 'active' : ''}`} onClick={() => setActiveTab('tab3')}>📅 Lên lịch</button>
        <button className={`nav-btn ${activeTab === 'tab4' ? 'active' : ''}`} onClick={() => setActiveTab('tab4')}>🤖 Chat AI</button>
        <button className={`nav-btn ${activeTab === 'tab5' ? 'active' : ''}`} onClick={() => setActiveTab('tab5')}>🔔 Email</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'tab1' && <ClassList chatList={chatList} onJoin={joinMeeting} />}
        
        {/* VideoChat luôn mount (ẩn/hiện) để không mất kết nối Camera */}
        <div style={{ display: activeTab === 'tab2' ? 'block' : 'none' }}>
            <VideoChat 
                connection={connection} currentRoom={currentRoom} currentUser={currentUser.id} currentUserName={currentUser.name}
                messages={messages} activeTab={activeTab} API_URL={API_URL}
            />
        </div>

        {/* QUAN TRỌNG: Truyền chatList xuống ScheduleMeeting */}
        {activeTab === 'tab3' && <ScheduleMeeting API_URL={API_URL} chatList={chatList} />}
        
        {activeTab === 'tab4' && <AIChat API_URL={API_URL} />}
        {activeTab === 'tab5' && <NotificationTest API_URL={API_URL} currentUser={currentUser} />}
      </div>
    </div>
  );
}

export default App;