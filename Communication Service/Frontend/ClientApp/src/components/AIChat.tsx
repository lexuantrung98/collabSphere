import React, { useState } from 'react';

interface Props {
    API_URL: string;
}

const AIChat: React.FC<Props> = ({ API_URL }) => {
    const [aiInput, setAiInput] = useState('');
    const [aiResponse, setAiResponse] = useState<string[]>([]);

    const handleAskAI = async () => {
        if (!aiInput) return;
        const question = aiInput;
        
        // 1. Hiện câu hỏi ngay & Xóa ô nhập
        setAiResponse(prev => [...prev, `Bạn: ${question}`]);
        setAiInput('');

        try {
            const res = await fetch(`${API_URL}/api/AI/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question })
            });
            const data = await res.json();
            setAiResponse(prev => [...prev, `🤖 AI: ${res.ok ? data.answer : "Lỗi"}`]);
        } catch (err) { setAiResponse(prev => [...prev, `🤖 AI: Lỗi kết nối!`]); }
    };

    return (
        <div>
            <h1>Trợ lý AI</h1>
            <div className="card">
                <div className="ai-chat-box">
                    {aiResponse.map((txt, i) => (
                        <div key={i} className={`ai-msg ${txt.startsWith('🤖') ? 'ai-msg-bot' : 'ai-msg-user'}`}>{txt}</div>
                    ))}
                </div>
                <div className="ai-input-group">
                    <input style={{ flex: 1, padding: '10px' }} value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAI()} placeholder="Hỏi AI..." />
                    <button className="btn" onClick={handleAskAI}>Hỏi</button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;