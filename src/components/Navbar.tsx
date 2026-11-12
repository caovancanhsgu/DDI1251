import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'schedule' | 'materials';
  setActiveTab: (tab: 'schedule' | 'materials') => void;
  user: UserProfile;
  onOpenAccount: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAccount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('schedule')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              <BookOpen className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  ÔN THI HỌC PHẦN
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[15px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200/80 shadow-2xs">
                  DDI1251
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Học kì 2 - Năm học 2026-2027
              </p>
            </div>
          </div>

          {/* Title Header Tag */}
          <div className="hidden sm:flex items-center space-x-2 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 text-[20px]">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-[15px] font-bold text-blue-800">Hệ thống Quản lí lịch thi & Đề cương môn học</span>
          </div>

          {/* Right Action Tools: User Account */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAccount}
              className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all shadow-xs group cursor-pointer"
              title="Thông tin cá nhân học viên"
            >
              <span className="text-lg">{user.avatar || '🎓'}</span>
              <div className="text-left hidden md:block">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                  Thông tin cá nhân
                </span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
