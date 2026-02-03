import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import './Whiteboard.css';

interface Props {
    connection: signalR.HubConnection | null;
}

// Cấu trúc dữ liệu có thêm strokeId
interface DrawSegment {
    prevX: number;
    prevY: number;
    currX: number;
    currY: number;
    color: string;
    strokeId: string; // [MỚI] ID định danh nét vẽ
}

const Whiteboard: React.FC<Props> = ({ connection }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    
    const prevPos = useRef<{ x: number, y: number } | null>(null);
    const drawHistory = useRef<DrawSegment[]>([]);
    
    // [MỚI] Lưu ID của nét vẽ hiện tại
    const currentStrokeId = useRef<string>('');

    useEffect(() => {
        if (!connection) return;

        // 1. Nhận nét vẽ (Thêm tham số strokeId)
        connection.on("ReceiveDraw", (prevX, prevY, currX, currY, userColor, strokeId) => {
            const segment = { prevX, prevY, currX, currY, color: userColor, strokeId };
            drawHistory.current.push(segment);
            drawLine(prevX, prevY, currX, currY, userColor);
        });

        // 2. Nhận lệnh xóa bảng
        connection.on("ReceiveClear", () => {
            drawHistory.current = [];
            clearCanvas();
        });

        // [MỚI] 3. Nhận lệnh Hoàn tác "Thông minh" (Xóa theo Stroke ID)
        connection.on("ReceiveUndo", () => {
            if (drawHistory.current.length === 0) return;

            // Lấy nét vẽ cuối cùng trong lịch sử
            const lastSegment = drawHistory.current[drawHistory.current.length - 1];
            const idToRemove = lastSegment.strokeId;

            // Xóa TẤT CẢ các đoạn có cùng ID với nét cuối
            // (Nghĩa là xóa nguyên 1 đường kẻ dài thay vì 1 điểm)
            drawHistory.current = drawHistory.current.filter(seg => seg.strokeId !== idToRemove);

            // Vẽ lại bảng
            redrawCanvas();
        });

        return () => {
            connection.off("ReceiveDraw");
            connection.off("ReceiveClear");
            connection.off("ReceiveUndo");
        };
    }, [connection]);

    const drawLine = (x1: number, y1: number, x2: number, y2: number, strokeColor: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const redrawCanvas = () => {
        clearCanvas();
        drawHistory.current.forEach(seg => {
            drawLine(seg.prevX, seg.prevY, seg.currX, seg.currY, seg.color);
        });
    };

    // --- XỬ LÝ CHUỘT ---
    const startDrawing = (e: React.MouseEvent) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if(canvas) {
            const rect = canvas.getBoundingClientRect();
            prevPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            
            // [MỚI] Mỗi lần đặt bút xuống, tạo 1 ID ngẫu nhiên cho nét vẽ này
            currentStrokeId.current = Math.random().toString(36).substr(2, 9);
        }
    };

    const finishDrawing = () => {
        setIsDrawing(false);
        prevPos.current = null;
    };

    const draw = async (e: React.MouseEvent) => {
        if (!isDrawing || !prevPos.current || !connection) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        // Dữ liệu gói tin (Kèm ID nét vẽ)
        const segment: DrawSegment = { 
            prevX: prevPos.current.x, 
            prevY: prevPos.current.y, 
            currX: currentX, 
            currY: currentY, 
            color: color,
            strokeId: currentStrokeId.current // Gửi kèm ID
        };

        drawHistory.current.push(segment);
        drawLine(segment.prevX, segment.prevY, segment.currX, segment.currY, segment.color);

        try {
            // Gọi Server (Gửi kèm ID)
            await connection.invoke("SendDraw", segment.prevX, segment.prevY, segment.currX, segment.currY, segment.color, segment.strokeId);
        } catch (err) {
            console.error(err);
        }

        prevPos.current = { x: currentX, y: currentY };
    };

    const handleClear = async () => {
        if(connection) await connection.invoke("ClearBoard");
    };

    const handleUndo = async () => {
        if(connection) await connection.invoke("UndoDraw");
    };

    return (
        <div className="whiteboard-container">
            <div className="whiteboard-toolbar">
                <span className="whiteboard-label">🎨 Bảng vẽ chung:</span>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="input-color" title="Chọn màu vẽ"/>
                <button onClick={handleUndo} className="btn-undo">↩️ Hoàn tác (Nét)</button>
                <button onClick={handleClear} className="btn-clear">🗑️ Xóa bảng</button>
            </div>
            <canvas
                ref={canvasRef} width={800} height={500} className="whiteboard-canvas"
                onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} onMouseLeave={finishDrawing}
            />
        </div>
    );
};

export default Whiteboard;