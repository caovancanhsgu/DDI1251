import React, { useState } from 'react';
import { 
  X, 
  User, 
  Check, 
  Sparkles,
  School,
  Mail,
  Target
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

const AVATARS = ['🎓', '🚀', '📚', '💡', '⚡', '🌟', '🧠', '🏆', '🎯', '👨‍🎓'];

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [institution, setInstitution] = useState(user.institution || '');
  const [targetExamName, setTargetExamName] = useState(user.targetExamName || '');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user.dailyGoalMinutes || 120);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '🎓');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      email,
      institution,
      targetExamName,
      dailyGoalMinutes: Number(dailyGoalMinutes),
      avatar: selectedAvatar,
    });
    setIsProfileSaved(true);
    setTimeout(() => {
      setIsProfileSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Header */}
        <div className="p-5 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 bg-slate-200/60 rounded-2xl">{selectedAvatar || '🎓'}</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>Thông Tin Cá Nhân</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Quản lý hồ sơ học viên và mục tiêu học phần của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Personal Profile Form Only */}
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chọn biểu tượng đại diện (Avatar)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`text-xl p-2 rounded-xl transition-all cursor-pointer ${
                      selectedAvatar === av
                        ? 'bg-blue-600 scale-110 shadow-md shadow-blue-500/30 ring-2 ring-blue-300'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học viên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cao Văn Cảnh"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email tài khoản <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trường / Cơ sở đào tạo
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Ví dụ: Đại học Sài Gòn (SGU)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Học kỳ / Đợt thi mục tiêu
                </label>
                <input
                  type="text"
                  value={targetExamName}
                  onChange={(e) => setTargetExamName(e.target.value)}
                  placeholder="Ví dụ: Học kì 2 - Năm học 2026-2027"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Thông tin được lưu tự động trên trình duyệt
              </span>
              <div className="flex items-center space-x-3">
                {isProfileSaved && (
                  <span className="text-xs text-emerald-600 font-bold animate-pulse">
                    ✓ Đã lưu thành công!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
