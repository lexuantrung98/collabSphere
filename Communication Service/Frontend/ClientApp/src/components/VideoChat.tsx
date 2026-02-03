import React, { useState } from 'react';
import * as signalR from '@microsoft/signalr';
import VideoRoom from '../VideoRoom';
import Whiteboard from '../Whiteboard';
import { type Message } from '../types';

interface Props {
    connection: signalR.HubConnection | null;
    currentRoom: string;
    currentUser: string; 
    currentUserName: string;
    messages: Message[];
    activeTab: string;
    API_URL: string;
}

const VideoChat: React.FC<Props> = ({ connection, currentRoom, currentUser, currentUserName, messages, activeTab, API_URL }) => {
    const [msgInput, setMsgInput] = useState('');

    const sendMessage = async () => {
        if (connection && msgInput) {
            await connection.invoke("SendMessage", currentRoom, currentUserName, msgInput);
            setMsgInput('');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/api/File/upload`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            if (connection) {
                await connection.invoke("SendMessage", currentRoom, currentUserName, `[IMAGE] ${data.url}`);
            }
        } catch (err) { alert("Lỗi upload ảnh!"); }
    };

    return (
        <div>
            <div className="room-header">
                <h1>Phòng họp trực tuyến</h1>
                <div className="room-badge">🟢 Phòng: {currentRoom}</div>
            </div>
            <div className="video-layout">
                <div className="card mb-10">
                    {connection && <VideoRoom connection={connection} currentUser={currentUser} roomId={currentRoom} isTabActive={activeTab === 'tab2'} />}
                </div>
                <div className="wb-chat-split">
                    <div className="wb-wrapper"><Whiteboard connection={connection} /></div>
                    <div className="chat-container chat-wrapper">
                        <div className="messages-list">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`message-bubble ${m.isSystem ? '' : (m.user === currentUserName ? 'msg-me' : 'msg-other')}`}>
                                    {!m.isSystem && <strong>{m.user}: </strong>}
                                    {m.content.startsWith('[IMAGE]') ? (
                                        <img src={m.content.replace('[IMAGE] ', '')} alt="sent" style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.open(m.content.replace('[IMAGE] ', ''), '_blank')} />
                                    ) : (<span>{m.content}</span>)}
                                </div>
                            ))}
                        </div>
                        <div className="chat-input-area" style={{ alignItems: 'center' }}>
                            <input type="file" id="imgUpload" style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
                            <label htmlFor="imgUpload" style={{ cursor: 'pointer', fontSize: '24px', marginRight: '10px' }}>🖼️</label>
                            <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Nhập tin nhắn..." />
                            <button className="btn" onClick={sendMessage}>Gửi</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoChat;