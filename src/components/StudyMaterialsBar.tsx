import React, { useState } from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye
} from 'lucide-react';
import { StudyMaterial, MaterialCategory } from '../types';

interface StudyMaterialsBarProps {
  materials: StudyMaterial[];
  selectedSubjectFilter: string | null;
  onClearSubjectFilter: () => void;
  onSelectSubjectFilter: (subject: string) => void;
  onOpenDocumentReader: (material: StudyMaterial) => void;
  onToggleMaterialComplete: (id: string) => void;
  onUpdateMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onAddMaterial: (material: StudyMaterial) => void;
}

const CATEGORIES: MaterialCategory[] = [
  'Tất cả',
  'Học phần chung',
  'Học phần chuyên ngành',
];

export const StudyMaterialsBar: React.FC<StudyMaterialsBarProps> = ({
  materials,
  selectedSubjectFilter,
  onClearSubjectFilter,
  onSelectSubjectFilter,
  onOpenDocumentReader,
  onToggleMaterialComplete,
  onUpdateMaterial,
  onDeleteMaterial,
  onAddMaterial,
}) => {
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('Tất cả');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<StudyMaterial>>({
    title: '',
    subject: 'Toán học',
    category: 'Học phần chung',
    url: '',
    description: '',
    estimatedMinutes: 60,
    difficulty: 'Trung bình',
    tags: [],
    progressPercent: 0,
    isCompleted: false,
  });
  const [tagInput, setTagInput] = useState('');

  // Extract distinct subjects
  const availableSubjects = Array.from(new Set(materials.map(m => m.subject))).filter(Boolean);

  const handleNavigateToUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({
      subject: selectedSubjectFilter || availableSubjects[0] || 'Toán học',
      category: 'Học phần chung',
      url: 'https://',
      description: '',
      isCompleted: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (mat: StudyMaterial, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMaterial(mat);
    setFormData({ ...mat });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    if (editingMaterial) {
      onUpdateMaterial({
        ...editingMaterial,
        ...(formData as StudyMaterial),
        title: editingMaterial.title || formData.subject || 'Tài liệu học phần',
      });
    } else {
      const newMat: StudyMaterial = {
        id: 'mat_' + Date.now().toString(36),
        title: formData.subject || 'Tài liệu học phần',
        subject: formData.subject || 'Tổng hợp',
        category: formData.category || 'Học phần chung',
        url: formData.url!,
        description: formData.description || '',
        estimatedMinutes: 60,
        difficulty: 'Trung bình',
        tags: [],
        isCompleted: false,
        progressPercent: 0,
      };
      onAddMaterial(newMat);
    }
    setIsModalOpen(false);
  };

  // Filtered materials
  const filteredMaterials = materials.filter(item => {
    const matchesSubject = !selectedSubjectFilter || item.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
    const matchesCategory = activeCategory === 'Tất cả' || item.category === activeCategory;
    const matchesDifficulty = filterDifficulty === 'all' || item.difficulty === filterDifficulty;

    return matchesSubject && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Control & Filter Sub-Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-4 rounded-2xl border border-blue-600/40 shadow-md shadow-blue-500/15 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => {
            const isSelected = cat === 'Tất cả' ? (activeCategory === 'Tất cả' && !selectedSubjectFilter) : activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat === 'Tất cả') {
                    onClearSubjectFilter();
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-800 font-extrabold shadow-sm scale-102'
                    : 'bg-white/20 text-white hover:bg-white/30 font-semibold backdrop-blur-xs'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Add Material Button */}
        <button
          onClick={openAddModal}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-4.5 py-2 bg-white hover:bg-blue-50 text-indigo-700 text-sm font-extrabold rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-indigo-700 stroke-[2.5]" />
          <span>Thêm Tài Liệu</span>
        </button>
      </div>

      {/* Active Subject Filter Banner */}
      {selectedSubjectFilter && (
        <div className="bg-indigo-50 border border-indigo-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-indigo-900 font-medium shadow-2xs">
          <span>Đang lọc tài liệu môn: <strong className="font-bold text-indigo-700">{selectedSubjectFilter}</strong></span>
          <button
            onClick={() => {
              onClearSubjectFilter();
              setActiveCategory('Tất cả');
            }}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
          >
            Hiển thị tất cả các môn
          </button>
        </div>
      )}

      {/* Main List of Study Material Bars (Thanh Tài Liệu Ôn Thi) */}
      <div className="space-y-3">
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-12 bg-white/70 border border-dashed border-slate-300 rounded-2xl p-8">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Không tìm thấy tài liệu phù hợp</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy thử chọn danh mục khác hoặc nhấn "Thêm Tài Liệu" để đính kèm link tài liệu của bạn.
            </p>
          </div>
        ) : (
          filteredMaterials.map((mat) => {
            return (
              <div
                key={mat.id}
                onClick={() => onOpenDocumentReader(mat)}
                className={`group rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  mat.isCompleted
                    ? 'bg-slate-50/70 border-emerald-300 hover:border-emerald-400 shadow-2xs'
                    : 'bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-md shadow-xs'
                }`}
              >
                {/* Info */}
                <div className="flex items-start space-x-3.5">
                  {/* Title & Metadata */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                        {mat.subject}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                        {mat.category}
                      </span>
                    </div>

                    <h4 className={`text-base font-bold transition-colors ${
                      mat.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      {mat.title || mat.subject}
                    </h4>

                    {mat.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                        {mat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div 
                  className="flex items-center space-x-2 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Button 1: In-App Reader */}
                  <button
                    onClick={() => onOpenDocumentReader(mat)}
                    title="Mở đề cương ôn thi ngay"
                    className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Đề cương ôn thi</span>
                  </button>

                  {/* Button 2: Direct Website Navigation */}
                  <button
                    onClick={(e) => handleNavigateToUrl(e, mat.url)}
                    title={`Mở nội dung ôn tập: ${mat.url}`}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <span>Nội dung ôn tập</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={(e) => openEditModal(mat, e)}
                    title="Chỉnh sửa tài liệu"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMaterial(mat.id);
                    }}
                    title="Xóa tài liệu này"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add / Edit Study Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>{editingMaterial ? 'Chỉnh Sửa Tài Liệu Ôn Thi' : 'Thêm Tài Liệu Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Toán học, Tiếng Anh, Tin học..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Loại tài liệu</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  >
                    <option value="Học phần chung">Học phần chung</option>
                    <option value="Học phần chuyên ngành">Học phần chuyên ngành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn (URL trang web tài liệu / Google Drive / Notion / PDF) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://drive.google.com/... hoặc https://vietjack.com/..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả tóm tắt nội dung</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tóm tắt những ý chính, dạng bài tập nổi bật..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  {editingMaterial ? 'Lưu Thay Đổi' : 'Thêm Tài Liệu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
