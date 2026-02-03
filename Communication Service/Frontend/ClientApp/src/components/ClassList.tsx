import React from 'react';
import { type ChatItem } from '../types';

interface Props {
    chatList: ChatItem[];
    onJoin: (id: string) => void;
}

const ClassList: React.FC<Props> = ({ chatList, onJoin }) => {
    return (
        <div>
            <h1>Danh sách Lớp & Nhóm Chat</h1>
            {chatList.length === 0 ? <p>Không có dữ liệu.</p> : (
                <div className="grid-container">
                    {chatList.map((item) => (
                        <div key={item.id} className="class-card">
                            <h3>{item.name}</h3>
                            <p className="text-muted">{item.type}</p>
                            <button className="btn" onClick={() => onJoin(item.id)}>Vào phòng họp</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ClassList;