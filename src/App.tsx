/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  ExamItem, 
  StudyMaterial, 
  EmailSettings, 
  ReminderLog, 
  SyncDataPackage 
} from './types';
import { 
  loadUser, 
  saveUser, 
  loadExams, 
  saveExams, 
  loadMaterials, 
  saveMaterials, 
  loadEmailSettings, 
  saveEmailSettings, 
  loadReminderLogs, 
  saveReminderLogs 
} from './services/storageService';
import { Navbar } from './components/Navbar';
import { ExamScheduleBar } from './components/ExamScheduleBar';
import { StudyMaterialsBar } from './components/StudyMaterialsBar';
import { DocumentReaderModal } from './components/DocumentReaderModal';
import { UserAccountModal } from './components/UserAccountModal';

export default function App() {
  // Global State with Local & Sync Persistence
  const [user, setUser] = useState<UserProfile>(loadUser);
  const [exams, setExams] = useState<ExamItem[]>(loadExams);
  const [materials, setMaterials] = useState<StudyMaterial[]>(loadMaterials);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(loadEmailSettings);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>(loadReminderLogs);

  // Active Navigation Tab (Focused purely on the 2 Core Bars)
  const [activeTab, setActiveTab] = useState<'schedule' | 'materials'>('schedule');

  // Filter State for materials
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);

  // Modals
  const [activeReadingMaterial, setActiveReadingMaterial] = useState<StudyMaterial | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Toast / Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Current Date & Time string updated every second
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lần đầu tiên truy cập web: Tự động hiển thị pop-up điền thông tin cá nhân
  useEffect(() => {
    const hasSetupProfile = localStorage.getItem('eduexam_profile_setup_done');
    if (!hasSetupProfile) {
      setIsAccountModalOpen(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to local storage on state change
  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    saveExams(exams);
  }, [exams]);

  useEffect(() => {
    saveMaterials(materials);
  }, [materials]);

  useEffect(() => {
    saveEmailSettings(emailSettings);
  }, [emailSettings]);

  useEffect(() => {
    saveReminderLogs(reminderLogs);
  }, [reminderLogs]);

  // Listen to multi-tab storage events for real-time cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eduexam_exams_v1') setExams(loadExams());
      if (e.key === 'eduexam_materials_v1') setMaterials(loadMaterials());
      if (e.key === 'eduexam_user_v1') setUser(loadUser());
      if (e.key === 'eduexam_email_settings_v1') setEmailSettings(loadEmailSettings());
      if (e.key === 'eduexam_reminder_logs_v1') setReminderLogs(loadReminderLogs());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Exam Operations
  const handleAddExam = (newExam: ExamItem) => {
    setExams((prev) => [newExam, ...prev]);

    // Tự động thêm môn tương ứng vào Tài liệu ôn tập
    const autoMaterial: StudyMaterial = {
      id: 'mat_' + Date.now().toString(36),
      title: `Đề cương & Tài liệu môn ${newExam.subject}`,
      subject: newExam.subject,
      category: newExam.category || 'Học phần chung',
      url: 'https://',
      description: newExam.notes || `Tài liệu tự động tạo cho môn ${newExam.subject} (Hình thức: ${newExam.format}, Ngày thi: ${newExam.examDate})`,
      estimatedMinutes: newExam.durationMinutes || 60,
      difficulty: 'Trung bình',
      tags: [newExam.format, newExam.category || 'Học phần chung'],
      isCompleted: false,
      progressPercent: 0,
      userNotes: '',
    };

    setMaterials((prev) => [autoMaterial, ...prev]);
    showToast(`✓ Đã thêm lịch thi & tự động thêm tài liệu môn: ${newExam.subject}`);
  };

  const handleUpdateExam = (updated: ExamItem) => {
    setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    showToast(`✓ Đã cập nhật môn thi: ${updated.subject}`);
  };

  const handleDeleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    showToast('✓ Đã xóa môn thi.');
  };

  const handleSelectSubjectForMaterials = (subjectName?: string) => {
    if (!subjectName) return;
    const baseSubject = subjectName.split('(')[0].trim();
    let mat = materials.find(
      (m) => m.subject.toLowerCase() === subjectName.toLowerCase() || m.subject.toLowerCase() === baseSubject.toLowerCase()
    );

    // Nếu tài liệu môn đã có đường link web/Google Drive -> Chuyển hướng trực tiếp sang link
    if (mat && mat.url && mat.url.trim() !== '' && mat.url.trim() !== 'https://') {
      const finalUrl = mat.url.startsWith('http') ? mat.url : `https://${mat.url}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      showToast(`🚀 Đang chuyển hướng tới link tài liệu: ${subjectName}`);
      return;
    }

    // Nếu chưa có link, mở cửa sổ để người dùng dán link tài liệu & chỉnh sửa đề cương
    if (!mat) {
      mat = {
        id: 'mat_' + Date.now().toString(36),
        title: `Đề cương & Tài liệu môn ${subjectName}`,
        subject: subjectName,
        category: 'Học phần chung',
        url: '',
        description: `Tài liệu & đề cương môn ${subjectName}`,
        estimatedMinutes: 60,
        difficulty: 'Trung bình',
        tags: [],
        isCompleted: false,
        progressPercent: 0,
        userNotes: '',
      };
      setMaterials((prev) => [mat!, ...prev]);
    }

    setActiveReadingMaterial(mat);
  };

  // Material Operations
  const handleToggleMaterialComplete = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isCompleted: !m.isCompleted,
              progressPercent: !m.isCompleted ? 100 : 0,
              lastStudiedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const handleUpdateMaterial = (updated: StudyMaterial) => {
    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    showToast('✓ Đã cập nhật thông tin tài liệu.');
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('✓ Đã xóa tài liệu.');
  };

  const handleAddMaterial = (newMat: StudyMaterial) => {
    setMaterials((prev) => [newMat, ...prev]);
    showToast(`✓ Đã thêm tài liệu mới: ${newMat.title}`);
  };

  const handleSaveMaterialNotes = (id: string, notes: string, url?: string) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              userNotes: notes,
              ...(url !== undefined ? { url } : {}),
            }
          : m
      )
    );
    showToast('✓ Đã lưu đề cương & link tài liệu môn thi thành công!');
  };

  // Multi-Device Package Restore
  const handleRestoreSyncPackage = (pkg: SyncDataPackage) => {
    if (pkg.user) setUser(pkg.user);
    if (pkg.exams) setExams(pkg.exams);
    if (pkg.materials) setMaterials(pkg.materials);
    if (pkg.emailSettings) setEmailSettings(pkg.emailSettings);
    if (pkg.reminderLogs) setReminderLogs(pkg.reminderLogs);
    showToast('🚀 Đã khôi phục và đồng bộ hóa thành công trên thiết bị này!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/40 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-white border border-emerald-400 text-emerald-800 text-xs font-bold rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200 ring-1 ring-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ExamScheduleBar
          exams={exams}
          onAddExam={handleAddExam}
          onUpdateExam={handleUpdateExam}
          onDeleteExam={handleDeleteExam}
          onSelectSubjectForMaterials={handleSelectSubjectForMaterials}
          studentName={user.name}
        />
      </main>

      {/* Document Reader Modal */}
      <DocumentReaderModal
        material={activeReadingMaterial}
        onClose={() => setActiveReadingMaterial(null)}
        onToggleComplete={handleToggleMaterialComplete}
        onSaveNotes={handleSaveMaterialNotes}
      />

      {/* Personal Profile Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
        onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem('eduexam_profile_setup_done', 'true');
          showToast('✓ Đã cập nhật thông tin cá nhân!');
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-blue-500/30 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 py-5 text-center text-xs text-blue-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-blue-100 font-medium">
            <strong className="text-white text-base sm:text-lg font-extrabold tracking-wide block sm:inline">ÔN THI HỌC PHẦN</strong>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-blue-200/90 font-medium w-full sm:w-auto">
            <span className="font-bold text-[14px] sm:text-[15px] truncate max-w-full">Sư phạm Địa lí - DDI1251</span>
            <span className="hidden sm:inline text-blue-400">•</span>
            <span className="font-['Times_New_Roman',serif] text-[13px] sm:text-[14px] text-center leading-tight font-bold bg-white/10 px-3 py-1 rounded-xl border border-white/15 shadow-2xs backdrop-blur-xs max-w-full truncate">
              {currentTimeStr}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
