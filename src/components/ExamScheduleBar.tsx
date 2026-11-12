import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Sparkles,
  ExternalLink,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { ExamItem } from '../types';
import { getDaysRemaining, downloadIcsCalendarFile, checkIsExamPassed } from '../services/emailService';

interface ExamScheduleBarProps {
  exams: ExamItem[];
  onAddExam: (exam: ExamItem) => void;
  onUpdateExam: (exam: ExamItem) => void;
  onDeleteExam: (id: string) => void;
  onSelectSubjectForMaterials: (subjectName: string) => void;
  studentName: string;
}

export const ExamScheduleBar: React.FC<ExamScheduleBarProps> = ({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onSelectSubjectForMaterials,
  studentName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [deletingExam, setDeletingExam] = useState<ExamItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ExamItem>>({
    subject: '',
    code: '',
    examDate: new Date().toISOString().split('T')[0],
    examTime: '08:00',
    durationMinutes: 90,
    room: '',
    seatNumber: '',
    format: 'Trắc nghiệm',
    category: 'Học phần chung',
    targetScore: 8.5,
    weightPercent: 40,
    notes: '',
    emailReminderEnabled: false,
    reminderDaysBefore: [],
  });

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({
      subject: '',
      code: '',
      examDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      examTime: '08:00',
      durationMinutes: 90,
      room: 'Phòng A.101',
      seatNumber: 'SBD: 260145',
      format: 'Trắc nghiệm',
      category: 'Học phần chung',
      targetScore: 8.5,
      weightPercent: 40,
      notes: 'Chuẩn bị đầy đủ dụng cụ học tập và giấy tờ tùy thân.',
      emailReminderEnabled: false,
      reminderDaysBefore: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exam: ExamItem) => {
    setEditingExam(exam);
    setFormData({ ...exam });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.examDate) return;

    const daysLeft = getDaysRemaining(formData.examDate!, formData.examTime || '08:00');
    const autoStatus: 'upcoming' | 'urgent' | 'completed' = 
      daysLeft < 0 ? 'completed' : daysLeft <= 4 ? 'urgent' : 'upcoming';

    if (editingExam) {
      onUpdateExam({
        ...editingExam,
        ...(formData as ExamItem),
        status: autoStatus,
      });
    } else {
      const newExam: ExamItem = {
        id: 'exam_' + Date.now().toString(36),
        subject: formData.subject!,
        code: formData.code || 'EXAM',
        examDate: formData.examDate!,
        examTime: formData.examTime || '08:00',
        durationMinutes: Number(formData.durationMinutes) || 90,
        room: formData.room || 'Phòng thi chính',
        seatNumber: formData.seatNumber || '',
        format: formData.format || 'Trắc nghiệm',
        category: formData.category || 'Học phần chung',
        targetScore: Number(formData.targetScore) || 8.0,
        weightPercent: Number(formData.weightPercent) || 30,
        notes: formData.notes || '',
        status: autoStatus,
        emailReminderEnabled: false,
        reminderDaysBefore: [],
      };
      onAddExam(newExam);
    }
    setIsModalOpen(false);
  };

  // Filtered & Sorted exams (closest exam first, completed/passed exams automatically placed at bottom)
  const filteredExams = exams
    .filter(item => {
      const matchesSearch = 
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.room.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const isAPassed = a.status === 'completed' || getDaysRemaining(a.examDate, a.examTime) < 0 || checkIsExamPassed(a.examDate, a.examTime, a.durationMinutes);
      const isBPassed = b.status === 'completed' || getDaysRemaining(b.examDate, b.examTime) < 0 || checkIsExamPassed(b.examDate, b.examTime, b.durationMinutes);
      
      if (isAPassed !== isBPassed) {
        return isAPassed ? 1 : -1;
      }
      
      const dateA = new Date(`${a.examDate}T${a.examTime || '00:00'}`).getTime();
      const dateB = new Date(`${b.examDate}T${b.examTime || '00:00'}`).getTime();
      return dateA - dateB;
    });

  // Summary stats (only upcoming exams)
  const upcomingCount = exams.filter(e => {
    const daysLeft = getDaysRemaining(e.examDate, e.examTime);
    const passed = checkIsExamPassed(e.examDate, e.examTime, e.durationMinutes);
    return daysLeft >= 0 && !passed && e.status !== 'completed';
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Combined on Same Horizontal Row */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-4 sm:p-5 rounded-2xl border border-blue-600/40 shadow-md shadow-blue-500/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-white">
        {/* Left: TỔNG SỐ MÔN SẮP THI */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-white/20 text-white rounded-xl shrink-0 backdrop-blur-xs ring-1 ring-white/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider block">
              Tổng số môn sắp thi
            </span>
            <div className="mt-0.5 flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-white">{upcomingCount}</span>
              <span className="text-xs font-medium text-blue-100/90">môn học phần cần chuẩn bị</span>
            </div>
          </div>
        </div>

        {/* Right: Search Box & Add Exam Button */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72 md:w-80">
            <Search className="w-4 h-4 text-blue-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo môn thi..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/15 border border-white/30 rounded-xl text-sm text-white placeholder-blue-200/80 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all font-medium"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-700 rounded-xl text-sm font-extrabold shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <span>+ Thêm lịch thi</span>
          </button>
        </div>
      </div>

      {/* Main List of Exam Bars (Thanh Lịch Thi) */}
      <div className="space-y-3">
        {filteredExams.length === 0 ? (
          <div className="text-center py-12 bg-white/70 border border-dashed border-slate-300 rounded-2xl p-8">
            <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Không tìm thấy lịch thi phù hợp</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách.
            </p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const daysLeft = getDaysRemaining(exam.examDate, exam.examTime);
            const isPassedTime = checkIsExamPassed(exam.examDate, exam.examTime, exam.durationMinutes);
            const isCompleted = exam.status === 'completed' || daysLeft < 0 || isPassedTime;
            const isUrgent = !isCompleted && daysLeft >= 0 && daysLeft <= 4;
            const examDateObj = new Date(exam.examDate);

            return (
              <div
                key={exam.id}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isCompleted
                    ? 'bg-slate-100/65 border-slate-200/90 opacity-60 grayscale-[30%] hover:opacity-90 hover:grayscale-0 shadow-none'
                    : isUrgent
                    ? 'bg-gradient-to-r from-amber-50/50 via-white to-white border-amber-300 hover:border-amber-400 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Horizontal Bar Content (Thanh Lịch Thi) */}
                <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
                  {/* Left Column: Date & Subject Info */}
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className={`w-14 h-14 sm:w-18 sm:h-18 rounded-xl flex flex-col items-center justify-center font-bold border shrink-0 ${
                      isCompleted
                        ? 'bg-slate-200/70 border-slate-300/80 text-slate-400'
                        : isUrgent
                        ? 'bg-amber-100/70 border-amber-300 text-amber-800'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold opacity-90">
                        {examDateObj.toLocaleDateString('vi-VN', { month: 'short' })}
                      </span>
                      <span className="text-xl sm:text-3xl font-extrabold leading-none">
                        {examDateObj.getDate()}
                      </span>
                      <span className="text-[9px] sm:text-[10px] opacity-75">
                        {examDateObj.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Subject info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className={`text-sm sm:text-lg font-bold transition-colors leading-tight ${
                          isCompleted
                            ? 'text-slate-500 line-through decoration-slate-400'
                            : 'text-slate-900 group-hover:text-blue-600'
                        }`}>
                          {exam.subject}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md border shrink-0 ${
                          isCompleted ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}>
                          {exam.category || 'Học phần chung'}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md border shrink-0 ${
                          isCompleted ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}>
                          {exam.format}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-xs text-slate-500 mt-1">
                        {/* Exam Time Box */}
                        <div className={`flex items-center space-x-1.5 font-semibold px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs shrink-0 max-w-full ${
                          isCompleted ? 'bg-slate-200/50 text-slate-500 border-slate-300/70' : 'bg-slate-100/90 text-slate-700 border-slate-200'
                        }`}>
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-slate-400' : 'text-blue-600'}`} />
                          <span className="truncate">{exam.examTime} ({exam.durationMinutes} phút)</span>
                        </div>

                        {/* Exam Room Box */}
                        <div className={`flex items-center space-x-1.5 font-semibold px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] sm:text-xs shrink-0 max-w-full ${
                          isCompleted ? 'bg-slate-200/50 text-slate-500 border-slate-300/70' : 'bg-indigo-50/90 text-indigo-800 border-indigo-200/80'
                        }`}>
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-slate-400' : 'text-indigo-600'}`} />
                          <span className="truncate">Phòng: {exam.room || 'Chưa xếp'}</span>
                        </div>

                        {/* Countdown / Status Badge Box */}
                        {isCompleted ? (
                          <span className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 bg-slate-200/80 text-slate-600 border border-slate-300/80 rounded-lg text-[11px] sm:text-xs font-bold shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Đã thi xong (Đã qua giờ thi)</span>
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] sm:text-xs font-extrabold animate-pulse shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                            <span>HÔM NAY THI!</span>
                          </span>
                        ) : daysLeft === 1 ? (
                          <span className="px-2 sm:px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[11px] sm:text-xs font-extrabold shrink-0">
                            NGÀY MAI THI
                          </span>
                        ) : (
                          <span className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold border shrink-0 ${
                            isUrgent 
                              ? 'bg-amber-50 text-amber-800 border-amber-300' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            ⏳ Còn {daysLeft} ngày
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0 justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">

                    {/* Direct Navigation Button */}
                    <button
                      onClick={() => onSelectSubjectForMaterials(exam.subject)}
                      title="Chuyển hướng trực tiếp tới trang web / Google Drive tài liệu ôn tập môn này"
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[15px] font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <span className="text-[15px]">Tài liệu ôn tập</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditModal(exam)}
                      title="Chỉnh sửa thông tin"
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeletingExam(exam)}
                      title="Xóa lịch thi này"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add / Edit Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>{editingExam ? 'Chỉnh Sửa Lịch Thi' : 'Thêm Môn Thi Mới'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên môn thi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ví dụ: Toán học (Giải tích & Hình Oxyz)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại học phần</label>
                  <select
                    value={formData.category || 'Học phần chung'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Học phần chung">Học phần chung</option>
                    <option value="Học phần chuyên ngành">Học phần chuyên ngành</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hình thức thi</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Trắc nghiệm">Trắc nghiệm</option>
                    <option value="Tự luận">Tự luận</option>
                    <option value="Vấn đáp">Vấn đáp</option>
                    <option value="Thực hành">Thực hành</option>
                    <option value="Đồ án / Khóa luận">Đồ án / Khóa luận</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày thi <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={formData.examTime}
                    onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng thi / Giảng đường</label>
                <input
                  type="text"
                  value={formData.room || ''}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Phòng A.204"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {editingExam ? 'Lưu Thay Đổi' : 'Thêm Lịch Thi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {deletingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="p-2.5 bg-rose-100 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Lịch Thi</h3>
                <span className="text-xs text-slate-500 font-medium">Hành động này không thể hoàn tác</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed my-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              Bạn có chắc chắn muốn xóa môn thi <strong className="text-slate-900 font-extrabold">{deletingExam.subject}</strong> không?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingExam(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExam(deletingExam.id);
                  setDeletingExam(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Chắc Chắn Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
