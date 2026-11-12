import { ExamItem, ReminderLog } from '../types';

/**
 * Calculates remaining days from now until examDate
 */
export function getDaysRemaining(examDate: string, examTime: string = '00:00'): number {
  const target = new Date(`${examDate}T${examTime}:00`);
  const simulatedToday = new Date('2026-11-12T00:00:00');
  const actualNow = new Date();
  const now = actualNow.getTime() > simulatedToday.getTime() ? actualNow : simulatedToday;
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checks if the specific exam date & time (+ duration) has passed
 */
export function checkIsExamPassed(examDate: string, examTime: string = '08:00', durationMinutes: number = 90): boolean {
  if (!examDate) return false;
  
  const parts = (examTime || '08:00').split(':');
  const hours = parseInt(parts[0] || '8', 10);
  const minutes = parseInt(parts[1] || '0', 10);

  const examStart = new Date(examDate);
  examStart.setHours(isNaN(hours) ? 8 : hours, isNaN(minutes) ? 0 : minutes, 0, 0);

  const examEnd = new Date(examStart.getTime() + (durationMinutes || 90) * 60 * 1000);

  const simulatedToday = new Date('2026-11-12T00:00:00');
  const actualNow = new Date();
  const now = actualNow.getTime() > simulatedToday.getTime() ? actualNow : simulatedToday;

  return now.getTime() >= examEnd.getTime();
}

/**
 * Format date in Vietnamese format
 */
export function formatVNDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Generates email subject for an exam
 */
export function generateEmailSubject(exam: ExamItem): string {
  const daysLeft = getDaysRemaining(exam.examDate, exam.examTime);
  let urgency = `còn ${daysLeft} ngày`;
  if (daysLeft === 0) urgency = 'HÔM NAY';
  else if (daysLeft === 1) urgency = 'NGÀY MAI';
  else if (daysLeft < 0) urgency = 'Đã diễn ra';

  return `[EduExam] Nhắc nhở lịch thi: ${exam.subject} (${urgency}) - Phòng ${exam.room}`;
}

/**
 * Generates beautifully formatted plain text email content for mailto
 */
export function generateEmailBody(
  exam: ExamItem,
  studentName: string,
  customNote?: string
): string {
  const daysLeft = getDaysRemaining(exam.examDate, exam.examTime);

  return `Kính gửi bạn ${studentName || 'Học viên'},

Hệ thống EduExam xin gửi thông báo nhắc nhở lịch thi sắp tới của bạn:

=========================================
THÔNG TIN CHI TIẾT BÀI THI:
- Môn thi: ${exam.subject}
- Mã môn: ${exam.code || 'N/A'}
- Thời gian thi: ${exam.examTime} - ${formatVNDate(exam.examDate)}
- Thời lượng làm bài: ${exam.durationMinutes} phút
- Đếm ngược: ${daysLeft > 0 ? `Còn ${daysLeft} ngày` : daysLeft === 0 ? 'HÔM NAY' : 'Đã thi'}
- Phòng thi: ${exam.room}
- Số báo danh / Vị trí: ${exam.seatNumber || 'Xem trên thẻ dự thi'}
- Hình thức thi: ${exam.format}
- Mục tiêu điểm số: ${exam.targetScore}/10
=========================================

LƯU Ý QUAN TRỌNG KHI VÀO PHÒNG THI:
1. Mang theo Căn cước công dân (CCCD) và Thẻ học viên/sinh viên.
2. Chuẩn bị bút viết, bút chì 2B, tẩy và máy tính cầm tay đúng quy chế.
3. Có mặt tại phòng thi trước giờ bắt đầu ít nhất 20-30 phút.
4. Tắt chuông và gửi điện thoại ngoài phòng thi theo quy định.

Ghi chú ôn tập riêng:
${exam.notes || 'Giữ tinh thần bình tĩnh, tự tin và đọc kỹ đề thi trước khi làm bài.'}

${customNote ? `\nLời nhắn từ EduExam:\n${customNote}\n` : ''}
---
EduExam - Nền tảng Ôn thi & Lịch thi Thông minh
Được tạo tự động từ hệ thống quản lý tiến độ ôn thi cá nhân.`;
}

/**
 * Generates an HTML preview for in-app viewing
 */
export function generateHtmlEmailTemplate(
  exam: ExamItem,
  studentName: string,
  recipientEmail: string,
  customNote?: string
): string {
  const daysLeft = getDaysRemaining(exam.examDate, exam.examTime);
  const urgencyColor = daysLeft <= 2 ? '#ef4444' : daysLeft <= 5 ? '#f59e0b' : '#3b82f6';

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; color: #1e293b;">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 24px; color: #ffffff;">
      <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; margin-bottom: 4px;">EduExam Thông Báo Lịch Thi</div>
      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">Nhắc nhở: Lịch thi ${exam.subject}</h2>
      <div style="display: inline-block; background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600;">
        ${daysLeft > 0 ? `⏳ Còn ${daysLeft} ngày nữa` : daysLeft === 0 ? '⚡ HÔM NAY THI' : 'Đã qua'}
      </div>
    </div>
    
    <div style="padding: 24px;">
      <p style="margin-top: 0; font-size: 15px; color: #334155;">
        Chào <strong>${studentName}</strong>, bạn có lịch thi sắp tới gửi đến email <code>${recipientEmail}</code>. Hãy kiểm tra các thông tin dưới đây:
      </p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 140px;">📅 Ngày thi:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formatVNDate(exam.examDate)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">⏰ Giờ bắt đầu:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${exam.examTime} (${exam.durationMinutes} phút)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">📍 Địa điểm / Phòng:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #2563eb;">${exam.room}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">🎯 Hình thức thi:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${exam.format} ${exam.seatNumber ? `| ${exam.seatNumber}` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">⭐ Mục tiêu:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #16a34a;">${exam.targetScore}/10 điểm</td>
          </tr>
        </table>
      </div>

      ${exam.notes ? `
      <div style="border-left: 4px solid #3b82f6; background: #eff6ff; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; font-size: 14px; color: #1e40af;">
        <strong>Ghi chú dặn dò:</strong> ${exam.notes}
      </div>` : ''}

      ${customNote ? `
      <p style="font-size: 14px; color: #475569; font-style: italic;">
        "${customNote}"
      </p>` : ''}

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
        EduExam • Nền tảng Ôn thi & Lịch thi Thông minh • Đồng bộ tiến độ đa thiết bị
      </div>
    </div>
  </div>
  `;
}

/**
 * Triggers mailto link in browser
 */
export function openMailClient(
  exam: ExamItem,
  studentName: string,
  recipientEmail: string,
  customNote?: string
): void {
  const subject = generateEmailSubject(exam);
  const body = generateEmailBody(exam, studentName, customNote);
  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

/**
 * Exports an exam as an iCalendar (.ics) file so users can import into Google Calendar or Apple Calendar.
 * Once in their calendar, it automatically triggers email and mobile phone notifications!
 */
export function downloadIcsCalendarFile(exam: ExamItem, studentName: string): void {
  const [hours, minutes] = exam.examTime.split(':').map(Number);
  const examStart = new Date(`${exam.examDate}T${exam.examTime}:00`);
  const examEnd = new Date(examStart.getTime() + (exam.durationMinutes || 90) * 60 * 1000);

  const formatIcsTime = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EduExam//Lich Thi Thong Minh//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:eduexam_${exam.id}_${Date.now()}@eduexam.app`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(examStart)}`,
    `DTEND:${formatIcsTime(examEnd)}`,
    `SUMMARY:LỊCH THI: ${exam.subject} (${exam.format})`,
    `LOCATION:${exam.room}`,
    `DESCRIPTION:Môn thi: ${exam.subject}\\nPhòng thi: ${exam.room}\\nSBD: ${exam.seatNumber || 'N/A'}\\nHọc viên: ${studentName}\\nGhi chú: ${exam.notes || 'Chuẩn bị CCCD và dụng cụ học tập'}`,
    // Notification 1 day before
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Nhắc nhở ngày mai thi môn ${exam.subject} lúc ${exam.examTime}`,
    'END:VALARM',
    // Notification 2 hours before
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Chuẩn bị xuất phát đến phòng thi ${exam.room} - môn ${exam.subject}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LichThi_${exam.subject.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Creates a reminder log record
 */
export function createReminderLogRecord(
  exam: ExamItem,
  recipientEmail: string,
  type: 'manual' | 'scheduled' | 'test' = 'manual'
): ReminderLog {
  return {
    id: 'log_' + Date.now().toString(36),
    examId: exam.id,
    examSubject: exam.subject,
    recipientEmail,
    sentAt: new Date().toISOString(),
    type,
    status: 'sent',
    previewSubject: generateEmailSubject(exam),
  };
}
