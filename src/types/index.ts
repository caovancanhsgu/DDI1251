export interface ExamItem {
  id: string;
  subject: string;
  code?: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm
  durationMinutes: number;
  room: string;
  seatNumber?: string;
  format: 'Trắc nghiệm' | 'Tự luận' | 'Vấn đáp' | 'Thực hành' | 'Đồ án / Khóa luận';
  category?: 'Học phần chung' | 'Học phần chuyên ngành';
  weightPercent?: number; // e.g. 50%
  targetScore: number; // e.g. 8.5
  notes?: string;
  status: 'upcoming' | 'urgent' | 'completed';
  emailReminderEnabled: boolean;
  reminderDaysBefore: number[]; // e.g. [7, 3, 1]
  relatedMaterialIds?: string[];
}

export type MaterialCategory = 
  | 'Tất cả'
  | 'Học phần chung'
  | 'Học phần chuyên ngành';

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  category: MaterialCategory;
  url: string; // External web link or drive/notion
  description: string;
  estimatedMinutes: number;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  tags: string[];
  isCompleted: boolean;
  progressPercent: number; // 0 - 100
  lastStudiedAt?: string;
  userNotes?: string;
  contentSummary?: {
    overview: string;
    keyPoints: string[];
    importantFormulas?: string[];
    practiceQuestions?: {
      q: string;
      a: string;
    }[];
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  passwordHash?: string;
  hasPin: boolean;
  institution?: string; // SGU, Đại học, THPT...
  targetExamName: string; // Kỳ thi Tốt nghiệp THPT, Thi Học Kỳ II, v.v.
  studyStreakDays: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  todayStudiedMinutes: number;
  createdAt: string;
}

export interface EmailSettings {
  recipientEmail: string;
  autoSendEnabled: boolean;
  reminderTimes: number[]; // Days before exam: 7, 3, 1, 0 (sáng ngày thi)
  customMessage?: string;
}

export interface ReminderLog {
  id: string;
  examId: string;
  examSubject: string;
  recipientEmail: string;
  sentAt: string;
  type: 'manual' | 'scheduled' | 'test';
  status: 'sent' | 'pending';
  previewSubject: string;
}

export interface SyncDataPackage {
  version: string;
  timestamp: string;
  user: UserProfile;
  exams: ExamItem[];
  materials: StudyMaterial[];
  reminderLogs: ReminderLog[];
  emailSettings: EmailSettings;
}
