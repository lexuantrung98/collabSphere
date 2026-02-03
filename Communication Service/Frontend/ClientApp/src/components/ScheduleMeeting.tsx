import React, { useState } from 'react';
import { type ChatItem } from '../types';

interface Props {
    API_URL: string;
    chatList: ChatItem[]; // Nhận danh sách lớp từ cha
}

const ScheduleMeeting: React.FC<Props> = ({ API_URL, chatList }) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [participants, setParticipants] = useState<string[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // Hàm giả lập lấy thành viên (Sau này thay bằng API thật)
    const fetchGroupMembers = async (groupId: string) => {
        setIsLoadingMembers(true);
        setTimeout(() => {
            let fakeMembers: string[] = [];
            if (groupId === 'group-01') fakeMembers = ["sv-01", "sv-02", "gv-01"];
            else if (groupId.startsWith('class')) fakeMembers = ["sv-01", "sv-02", "sv-03", "gv-01"];
            else fakeMembers = ["gv-01"];
            
            setParticipants(fakeMembers);
            setIsLoadingMembers(false);
        }, 500);
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
            alert("Vui lòng chọn nhóm tham gia!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/Meeting/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, startTime: time, participants })
            });
            const data = await res.json();
            if (res.ok) alert(`✅ Tạo thành công!\nLink: ${data.data.link}`);
            else alert("Lỗi: " + JSON.stringify(data));
        } catch (e) { alert("Lỗi kết nối"); }
    };

    return (
        <div>
            <h1>Lên lịch cuộc họp</h1>
            <div className="card w-500">
                <form onSubmit={handleSchedule}>
                    <div className="form-group">
                        <label>Chọn Nhóm/Lớp:</label>
                        <select className="input-full" value={selectedGroupId} onChange={handleGroupChange}>
                            <option value="">-- Chọn nhóm --</option>
                            {chatList.map(chat => (
                                <option key={chat.id} value={chat.id}>{chat.name} ({chat.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{background: '#f9f9f9', padding: '10px'}}>
                        <label>Thành viên ({participants.length}):</label>
                        <div className="text-small">{isLoadingMembers ? "⏳ Đang tải..." : participants.join(", ")}</div>
                    </div>
                    <div className="form-group">
                        <label>Tiêu đề:</label>
                        <input id="mTitle" className="input-full" type="text" defaultValue="Họp nhóm" />
                    </div>
                    <div className="form-group">
                        <label>Thời gian:</label>
                        <input id="mTime" className="input-full" type="datetime-local" />
                    </div>
                    <button type="submit" className="btn" disabled={isLoadingMembers || participants.length === 0}>Tạo cuộc họp</button>
                </form>
            </div>
        </div>
    );
};

export default ScheduleMeeting;