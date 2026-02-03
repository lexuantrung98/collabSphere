import React from 'react';
import { type User } from '../types';

interface Props {
    API_URL: string;
    currentUser: User;
}

const NotificationTest: React.FC<Props> = ({ API_URL, currentUser }) => {
    
    // Hàm gọi API chung
    const triggerNotif = async (endpoint: string, body: any) => {
        try {
            console.log(`Đang gửi đến: /api/Notification/${endpoint}`, body);
            const res = await fetch(`${API_URL}/api/Notification/${endpoint}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(body)
            });
            
            if (res.ok) {
                alert("✅ Đã gửi yêu cầu email thành công!");
            } else {
                const err = await res.text();
                alert(`❌ Lỗi gửi email: ${err}`);
            }
        } catch (err) { 
            console.error(err);
            alert("❌ Lỗi kết nối API (Server chưa chạy hoặc sai cổng)"); 
        }
    };

    return (
        <div>
            <h1>🔔 Test Hệ thống Thông báo Email</h1>
            <div className="card">
                <p className="text-muted" style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                    <i>*Lưu ý: Các chức năng này gọi API gửi mail giả lập. Backend cần cấu hình SMTP để gửi thật.</i>
                </p>
                
                <div className="email-test-list">
                    
                    {/* 1. Thông báo phân công Trưởng nhóm */}
                    <div className="email-test-item">
                        <strong>1. Phân công Trưởng nhóm</strong>
                        <br />
                        <span style={{fontSize: '12px', color: '#666'}}>Gửi mail cho SV khi được chọn làm leader.</span>
                        <br />
                        <button className="btn mt-10" onClick={() => triggerNotif('assign-leader', {
                            leaderEmail: "sinhvien@test.com",
                            leaderName: "Nguyễn Văn Nam",
                            groupName: "Nhóm Đồ Án 1"
                        })}>✉️ Gửi Mail Phân công</button>
                    </div>

                    {/* 2. Thông báo hoàn thành Milestone */}
                    <div className="email-test-item">
                        <strong>2. Hoàn thành Giai đoạn (Milestone)</strong>
                        <br />
                        <span style={{fontSize: '12px', color: '#666'}}>Gửi cho GV và thành viên khi leader đánh dấu xong.</span>
                        <br />
                        <button className="btn mt-10" onClick={() => triggerNotif('complete-milestone', {
                            groupName: "Nhóm Đồ Án 1",
                            eventName: "Giai đoạn 1: Phân tích yêu cầu",
                            lecturerEmail: "giangvien@test.com",
                            memberEmails: ["sv1@test.com", "sv2@test.com"]
                        })}>✉️ Báo cáo Hoàn thành</button>
                    </div>

                    {/* 3. Thông báo nộp điểm/bài kiểm tra */}
                    <div className="email-test-item">
                        <strong>3. Nộp điểm kiểm tra</strong>
                        <br />
                        <span style={{fontSize: '12px', color: '#666'}}>Thông báo cho GV và nhóm khi nộp bài.</span>
                        <br />
                        <button className="btn mt-10" onClick={() => triggerNotif('submit-points', {
                            groupName: "Nhóm Đồ Án 1",
                            lecturerEmail: "giangvien@test.com",
                            memberEmails: ["sv1@test.com", "sv2@test.com"],
                            submissionTitle: "Bài kiểm tra giữa kỳ"
                        })}>✉️ Thông báo Nộp bài</button>
                    </div>

                    {/* 4. Nhận phản hồi/Đánh giá */}
                    <div className="email-test-item">
                        <strong>4. Nhận phản hồi/Đánh giá</strong>
                        <br />
                        <span style={{fontSize: '12px', color: '#666'}}>Gửi cho thành viên khi có nhận xét mới.</span>
                        <br />
                        <button className="btn mt-10" onClick={() => triggerNotif('receive-feedback', {
                            reviewerName: "Thầy Hào (GV)",
                            content: "Bài làm tốt, nhưng cần bổ sung biểu đồ UseCase.",
                            memberEmails: ["sv1@test.com", "sv2@test.com"]
                        })}>✉️ Gửi Phản hồi về nhóm</button>
                    </div>

                    {/* 5. Báo cáo lỗi hệ thống (Đã bỏ vạch đỏ) */}
                    <div className="email-test-item">
                        <strong>5. Báo cáo lỗi hệ thống</strong>
                        <br />
                        <span style={{fontSize: '12px', color: '#666'}}>Gửi email cho Admin khi user báo lỗi.</span>
                        <br />
                        {/* Nút màu đỏ vẫn giữ để nổi bật, nhưng khung bên ngoài thì bình thường */}
                        <button className="btn mt-10" style={{backgroundColor: '#e74c3c', color: 'white'}} onClick={() => triggerNotif('system-report', {
                            userEmail: currentUser.id || "unknown@user.com",
                            userName: currentUser.name,
                            content: "Hệ thống bị lỗi không load được Video Call."
                        })}>🚨 Gửi Báo cáo lỗi</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NotificationTest;