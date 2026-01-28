interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: string;
}

export default function PlaceholderPage({ title, description, icon = '🚧' }: PlaceholderPageProps) {
  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, margin: 0, color: '#333' }}>{title}</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>{description}</p>
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: 60, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>{icon}</div>
        <h2 style={{ fontSize: 24, color: '#333', marginBottom: 10 }}>Trang đang phát triển</h2>
        <p style={{ color: '#999', fontSize: 16 }}>
          Chức năng này sẽ được hoàn thiện trong các phiên bản tiếp theo
        </p>
        <div style={{
          marginTop: 30,
          padding: 20,
          background: '#f0f9ff',
          borderRadius: 8,
          border: '1px solid #e0f2fe'
        }}>
          <p style={{ color: '#0369a1', fontSize: 14, margin: 0 }}>
            💡 <strong>Gợi ý:</strong> Bạn có thể quay lại menu để truy cập các chức năng khác
          </p>
        </div>
      </div>
    </div>
  );
}
