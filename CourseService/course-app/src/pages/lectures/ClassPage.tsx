import { useState, useRef } from 'react';
import { useClasses, useImportClasses } from '../../hooks/features/useClasses';
import { GraduationCap, Plus, Search, Calendar, Book, Users, FileSpreadsheet, Loader2 } from 'lucide-react';
import CreateClassModal from '../../features/classes/CreateClassModal';
import { Link } from 'react-router-dom';

interface ClassItem {
  id: number;
  code: string;
  name: string;
  status?: string;
  subject?: { name: string };
  semester?: string;
  maxStudents?: number;
}

const ClassPage = () => {
  const { data, isLoading, isError } = useClasses();
  const importMutation = useImportClasses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm
  const fileRef = useRef<HTMLInputElement>(null);

  const classes: ClassItem[] = data?.data || [];

  // Logic lọc dữ liệu client-side
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) importMutation.mutate(e.target.files[0]);
    e.target.value = '';
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/> Đang tải...</div>;
  if (isError) return <div className="p-10 text-center text-red-500">Lỗi kết nối server!</div>;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <GraduationCap className="text-blue-600" /> Quản Lý Lớp Học
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tổng số: {filteredClasses.length} lớp học</p>
        </div>

        <div className="flex gap-2">
          {/* Nút Import */}
          <input type="file" className="hidden" ref={fileRef} accept=".xlsx" onChange={handleImport} />
          <button 
            onClick={() => fileRef.current?.click()}
            disabled={importMutation.isPending}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
          >
             {importMutation.isPending ? <Loader2 className="animate-spin w-4 h-4"/> : <FileSpreadsheet className="w-4 h-4" />}
             Import Excel
          </button>

          {/* Nút Tạo Mới */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Tạo Lớp Mới
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc mã lớp..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CLASS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">
                  {cls.code}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${cls.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {cls.status || 'Đang mở'}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2 min-h-[3.5rem]">
                {cls.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <span className="truncate">{cls.subject?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <span>Học kỳ: {cls.semester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <span>{cls.maxStudents} Sinh viên</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link 
                  to={`/classes/${cls.id}`} 
                  className="block w-full text-center py-2 bg-blue-50 text-blue-600 font-medium rounded hover:bg-blue-100 transition-colors"
                >
                  Truy cập lớp học →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-gray-400">
            Không tìm thấy lớp học nào khớp với từ khóa "{searchTerm}"
          </div>
        )}
      </div>

      <CreateClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ClassPage;