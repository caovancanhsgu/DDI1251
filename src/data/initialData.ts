import { ExamItem, StudyMaterial, UserProfile, EmailSettings, ReminderLog } from '../types';

export const initialUser: UserProfile = {
  id: 'usr_sgu_2026',
  name: '',
  email: '',
  avatar: '🎓',
  hasPin: false,
  passwordHash: '',
  institution: '',
  targetExamName: '',
  studyStreakDays: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  dailyGoalMinutes: 120,
  todayStudiedMinutes: 0,
  createdAt: new Date().toISOString(),
};

export const initialEmailSettings: EmailSettings = {
  recipientEmail: 'caovancanh.sgu@gmail.com',
  autoSendEnabled: true,
  reminderTimes: [7, 3, 1, 0],
  customMessage: 'Hãy chuẩn bị kỹ CCCD, máy tính cầm tay, bút viết và giữ tâm lý bình tĩnh, tự tin nhé!',
};

// Calculate dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date('2026-11-12T00:00:00');
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const initialExams: ExamItem[] = [];

export const initialMaterials: StudyMaterial[] = [];

export const initialReminderLogs: ReminderLog[] = [
  {
    id: 'log_01',
    examId: 'exam_math_01',
    examSubject: 'Toán học (Giải tích & Hình học Không gian)',
    recipientEmail: 'caovancanh.sgu@gmail.com',
    sentAt: '2026-11-09T08:00:00.000Z',
    type: 'scheduled',
    status: 'sent',
    previewSubject: '[EduExam] Nhắc nhở: Lịch thi Toán học còn 6 ngày nữa (Phòng A.204)',
  },
  {
    id: 'log_02',
    examId: 'exam_eng_02',
    examSubject: 'Tiếng Anh (Reading, Writing & Grammar B2)',
    recipientEmail: 'caovancanh.sgu@gmail.com',
    sentAt: '2026-11-10T08:00:00.000Z',
    type: 'scheduled',
    status: 'sent',
    previewSubject: '[EduExam] Nhắc nhở: Lịch thi Tiếng Anh còn 9 ngày nữa (Phòng B.102)',
  },
];
