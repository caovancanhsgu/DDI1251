import { ExamItem, StudyMaterial, UserProfile, EmailSettings, ReminderLog, SyncDataPackage } from '../types';
import { initialUser, initialExams, initialMaterials, initialEmailSettings, initialReminderLogs } from '../data/initialData';

const STORAGE_KEYS = {
  USER: 'eduexam_user_v1',
  EXAMS: 'eduexam_exams_v1',
  MATERIALS: 'eduexam_materials_v1',
  EMAIL_SETTINGS: 'eduexam_email_settings_v1',
  REMINDER_LOGS: 'eduexam_reminder_logs_v1',
  DEVICE_ID: 'eduexam_device_id',
};

// Simple secure hash helper using browser crypto API
export async function hashPinOrPassword(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input + '_eduexam_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

export function loadUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return initialUser;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user profile:', e);
    return initialUser;
  }
}

export function saveUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
}

export function loadExams(): ExamItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!raw) return initialExams;
    const parsed = JSON.parse(raw);
    const filtered = parsed.filter((e: ExamItem) => 
      e.id !== 'exam_math_01' && 
      e.id !== 'exam_eng_02' && 
      e.id !== 'exam_cs_03' && 
      e.id !== 'exam_phy_04' &&
      e.id !== 'exam_chem_05' &&
      e.id !== 'exam_pol_06' &&
      e.id !== 'exam_law_07' &&
      e.id !== 'exam_db_08' &&
      e.id !== 'exam_net_09' &&
      e.id !== 'exam_ai_10' &&
      e.id !== 'exam_lit_08'
    );
    if (filtered.length !== parsed.length) {
      saveExams(filtered);
      return filtered;
    }
    return filtered;
  } catch (e) {
    console.error('Error loading exams:', e);
    return initialExams;
  }
}

export function saveExams(exams: ExamItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  } catch (e) {
    console.error('Error saving exams:', e);
  }
}

export function loadMaterials(): StudyMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) return initialMaterials;
    const parsed = JSON.parse(raw);
    const filtered = parsed.filter((m: StudyMaterial) => 
      m.id !== 'mat_math_01' &&
      m.id !== 'mat_math_02' &&
      m.id !== 'mat_eng_01' &&
      m.id !== 'mat_eng_02' &&
      m.id !== 'mat_cs_01' &&
      m.id !== 'mat_phy_01' &&
      m.id !== 'mat_lit_01'
    );
    if (filtered.length !== parsed.length) {
      saveMaterials(filtered);
      return filtered;
    }
    return filtered;
  } catch (e) {
    console.error('Error loading materials:', e);
    return initialMaterials;
  }
}

export function saveMaterials(materials: StudyMaterial[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  } catch (e) {
    console.error('Error saving materials:', e);
  }
}

export function loadEmailSettings(): EmailSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMAIL_SETTINGS);
    if (!raw) return initialEmailSettings;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading email settings:', e);
    return initialEmailSettings;
  }
}

export function saveEmailSettings(settings: EmailSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving email settings:', e);
  }
}

export function loadReminderLogs(): ReminderLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDER_LOGS);
    if (!raw) return initialReminderLogs;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading reminder logs:', e);
    return initialReminderLogs;
  }
}

export function saveReminderLogs(logs: ReminderLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDER_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving reminder logs:', e);
  }
}

/**
 * Creates an exportable sync package for multi-device sync
 */
export function exportSyncPackage(
  user: UserProfile,
  exams: ExamItem[],
  materials: StudyMaterial[],
  emailSettings: EmailSettings,
  reminderLogs: ReminderLog[]
): SyncDataPackage {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    user,
    exams,
    materials,
    emailSettings,
    reminderLogs,
  };
}

/**
 * Generate a compressed base64 Sync Vault Key for cross-device copy & paste
 */
export function generateSyncToken(pkg: SyncDataPackage): string {
  try {
    const jsonStr = JSON.stringify(pkg);
    // Encode unicode safely in base64
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return 'EDUSYNC_' + btoa(binary);
  } catch (err) {
    console.error('Failed to generate sync token:', err);
    return '';
  }
}

/**
 * Parse and restore from a Sync Vault Key
 */
export function parseSyncToken(token: string): SyncDataPackage | null {
  try {
    const cleaned = token.trim();
    if (!cleaned.startsWith('EDUSYNC_')) {
      throw new Error('Mã đồng bộ không hợp lệ (cần bắt đầu bằng EDUSYNC_).');
    }
    const base64Str = cleaned.replace('EDUSYNC_', '');
    const binary = atob(base64Str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr) as SyncDataPackage;
    if (!data.user || !data.exams || !data.materials) {
      throw new Error('Gói dữ liệu đồng bộ bị thiếu trường bắt buộc.');
    }
    return data;
  } catch (err) {
    console.error('Error parsing sync token:', err);
    return null;
  }
}
