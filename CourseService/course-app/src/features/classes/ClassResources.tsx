import { useRef } from 'react';
import { Download, Trash2, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import { 
  useClassResources, 
  useUploadResource, 
  useDeleteResource, 
  handleDownloadFile 
} from '../../hooks/features/useSubjects';

// Hàm helper format dung lượng file (VD: 2000000 bytes -> 2 MB)
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface Resource {
  id: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export const ClassResources = ({ classId }: { classId: number }) => {
  // 1. Auth & Hooks
  const { isLecturer, isStaff } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Data & Mutations
  const { data: resources, isLoading } = useClassResources(classId);
  const uploadMutation = useUploadResource(classId);
  const deleteMutation = useDeleteResource(classId);

  // 3. Xử lý Upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Gọi API upload
      uploadMutation.mutate(file);
      // Reset input để chọn lại file cùng tên vẫn được
      event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 4. Quyền quản lý
  const canManage = isLecturer || isStaff;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
          <FileText className="text-orange-500" /> Tài Nguyên Lớp Học
        </h3>
        
        {/* Nút Upload */}
        {canManage && (
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect} 
            />
            <button 
              onClick={triggerFileInput}
              disabled={uploadMutation.isPending}
              className="bg-orange-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-orange-600 transition disabled:opacity-50"
            >
              {uploadMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <UploadCloud size={18} />} 
              Upload Tài Liệu
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Đang tải dữ liệu...</div>
        ) : resources?.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded bg-gray-50 text-gray-500 italic">
             Chưa có tài liệu nào được tải lên.
          </div>
        ) : (
          resources?.map((file: Resource) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate" title={file.fileName}>
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {/* NÚT DOWNLOAD */}
                <button 
                  onClick={() => handleDownloadFile(file.id, file.fileName)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded transition" 
                  title="Tải xuống"
                >
                  <Download size={18} />
                </button>

                {/* NÚT XÓA (Có xác nhận) */}
                {canManage && (
                  <button 
                    onClick={() => {
                       if(confirm('Bạn có chắc muốn xóa file này?')) deleteMutation.mutate(file.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" 
                    title="Xóa file"
                  >
                    {deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <Trash2 size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};