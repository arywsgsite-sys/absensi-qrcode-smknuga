export type Gender = 'L' | 'P';

export type AttendanceStatus =
  | 'HADIR_TEPAT_WAKTU'
  | 'TERLAMBAT'
  | 'PULANG'
  | 'IZIN'
  | 'SAKIT'
  | 'ALPA';

export type WhatsAppStatus = 'TERKIRIM' | 'ANTREAN' | 'GAGAL';

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: Gender;
  classGrade: string; // e.g. 'X', 'XI', 'XII'
  major: string; // e.g. 'Teknik Komputer & Jaringan', 'Teknik Kendaraan Ringan Otomotif', 'Akuntansi', 'MPLB', 'TBSM'
  className: string; // e.g. 'X TKJ 1', 'XI TKR 2', 'XII AKL 1'
  parentName: string;
  parentPhone: string;
  qrToken: string;
  photoUrl: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  nisn: string;
  studentName: string;
  className: string;
  photoUrl: string;
  parentPhone: string;
  parentName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status: AttendanceStatus;
  minutesLate: number;
  notes?: string;
  whatsappStatus: WhatsAppStatus;
  whatsappSentAt?: string;
  whatsappMessage?: string;
  scanMode: 'MASUK' | 'PULANG' | 'MANUAL';
  gateLocation?: string;
}

export interface WhatsAppTemplateConfig {
  onTime: string;
  late: string;
  checkOut: string;
  permit: string;
  sick: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolNPSN: string;
  schoolAddress: string;
  schoolPhone: string;
  principalName: string;
  gateOpenTime: string; // e.g. '06:15'
  checkInLimitTime: string; // e.g. '07:00' (on-time cutoff)
  lateMaxTime: string; // e.g. '07:30' (max late)
  checkOutStartTime: string; // e.g. '14:30'
  checkOutEndTime: string; // e.g. '17:00'
  cooldownMinutes: number; // default 5 minutes anti-double scan
  activeDays: string[];
  soundEnabled: boolean;
  highContrastMode: boolean;
  whatsappProvider: 'fonnte' | 'wablas' | 'custom_webhook' | 'mock';
  whatsappApiEndpoint: string;
  whatsappApiKeyMasked?: string;
  whatsappSenderNumber: string;
  autoSendWhatsApp: boolean;
  templates: WhatsAppTemplateConfig;
}

export interface ScanResult {
  success: boolean;
  message: string;
  code: 'SUCCESS' | 'ALREADY_SCANNED' | 'INVALID_TOKEN' | 'OUTSIDE_HOURS' | 'STUDENT_NOT_FOUND';
  record?: AttendanceRecord;
  student?: Student;
  cooldownRemainingSeconds?: number;
  lastScannedTime?: string;
}

export interface DashboardSummary {
  totalStudents: number;
  presentOnTime: number;
  presentLate: number;
  checkedOut: number;
  permitOrSick: number;
  absent: number;
  attendanceRate: number;
  whatsappQueueCount: number;
  whatsappSentCount: number;
}
