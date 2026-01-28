/**
 * SyllabusManager Component
 * Hiển thị chi tiết nội dung giáo trình (danh sách bài học)
 */
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import { type Syllabus } from '../../types/syllabus.types';

// Interface cho content item trong syllabus
interface SyllabusContent {
  order?: number;
  topic: string;
  type?: string;
  duration?: number;
}

// Props interface
interface SyllabusManagerProps {
  syllabus: Syllabus | null;
}

export const SyllabusManager = ({ syllabus }: SyllabusManagerProps) => {
  // Hiển thị placeholder nếu chưa chọn giáo trình
  if (!syllabus) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-400 animate-fade-in">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p>Vui lòng chọn một giáo trình ở danh sách trên để xem chi tiết.</p>
      </div>
    );
  }

  // Lấy danh sách contents từ syllabus (nếu có)
  const contents = (syllabus as unknown as { contents?: SyllabusContent[] }).contents || [];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
        <div className="flex items-center gap-2 text-blue-800 font-medium">
          <BookOpen size={20} />
          <span>
            Đang xem nội dung: <span className="font-bold uppercase">{syllabus.name}</span>
          </span>
        </div>
        <div className="text-sm text-blue-600">{contents.length} bài học</div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 border-b font-semibold text-gray-700 uppercase text-xs">
            <tr>
              <th className="p-3 w-16 text-center">STT</th>
              <th className="p-3">Nội dung bài học</th>
              <th className="p-3 w-32 text-center">Loại</th>
              <th className="p-3 w-32 text-center">Thời lượng</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400 italic">
                  Giáo trình này chưa có nội dung bài học.
                </td>
              </tr>
            ) : (
              contents.map((item: SyllabusContent, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="p-3 text-center text-gray-500 font-mono">
                    {item.order || index + 1}
                  </td>
                  <td className="p-3 font-medium text-gray-800">{item.topic}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold border ${
                        item.type?.toLowerCase().includes('thực hành') || item.type === 'Lab'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-600">
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                      <Clock size={12} /> {item.duration} tiết
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};