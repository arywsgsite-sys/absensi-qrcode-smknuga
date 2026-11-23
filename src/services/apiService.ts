/**
 * API Service for Sistem Presensi Siswa SMK Muhammadiyah 3 Weleri
 * 
 * Separated data layer designed for seamless connection to a REST API Backend.
 * Uses robust local storage / in-memory fallback with 1,500 students simulation
 * so the app can be tested immediately in preview.
 */

import {
  Student,
  AttendanceRecord,
  SchoolSettings,
  ScanResult,
  DashboardSummary,
  AttendanceStatus,
} from '../types';
import {
  DEFAULT_SETTINGS,
  INITIAL_STUDENTS_SAMPLE,
  generateFull1500Students,
  generateInitialAttendanceLogs,
} from '../data/seedData';

const STORAGE_KEYS = {
  STUDENTS: 'm3w_presensi_students_v1',
  SETTINGS: 'm3w_presensi_settings_v1',
  ATTENDANCE: 'm3w_presensi_attendance_v1',
  LAST_SCANS: 'm3w_presensi_cooldown_v1',
};

// Configurable backend base URL (optional, can be passed via environment or settings)
const BACKEND_BASE_URL = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : '';

// In-memory fallback if localStorage is disabled or running on server
let memoryStudents: Student[] | null = null;
let memorySettings: SchoolSettings | null = null;
let memoryAttendance: AttendanceRecord[] | null = null;

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return fallback;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

// Initialize state
function initStorage() {
  if (typeof window === 'undefined') return;

  try {
    // 1. Settings
    const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!storedSettings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      memorySettings = DEFAULT_SETTINGS;
    } else {
      memorySettings = safeJsonParse(storedSettings, DEFAULT_SETTINGS);
    }

    // 2. Students: Generate full 1,500 students by default for the SMK Muhammadiyah 3 Weleri scale
    const storedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!storedStudents) {
      const fullList = generateFull1500Students();
      try {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(fullList));
      } catch (err) {
        console.warn('LocalStorage quota reached for initial students, holding in memory:', err);
      }
      memoryStudents = fullList;
    } else {
      const parsed = safeJsonParse<Student[] | null>(storedStudents, null);
      memoryStudents = parsed && parsed.length > 0 ? parsed : generateFull1500Students();
    }

    // 3. Attendance Logs
    const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!storedAttendance && memoryStudents && memorySettings) {
      const initialLogs = generateInitialAttendanceLogs(memoryStudents, memorySettings);
      try {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initialLogs));
      } catch (err) {
        console.warn('LocalStorage quota reached for attendance, holding in memory:', err);
      }
      memoryAttendance = initialLogs;
    } else if (storedAttendance) {
      const parsed = safeJsonParse<AttendanceRecord[] | null>(storedAttendance, null);
      memoryAttendance = parsed || [];
    }
  } catch (e) {
    console.warn('LocalStorage error, using memory fallback:', e);
    if (!memorySettings) memorySettings = DEFAULT_SETTINGS;
    if (!memoryStudents) memoryStudents = generateFull1500Students();
    if (!memoryAttendance) memoryAttendance = generateInitialAttendanceLogs(memoryStudents, memorySettings);
  }
}

function getStoredStudents(): Student[] {
  if (typeof window === 'undefined') return INITIAL_STUDENTS_SAMPLE;
  if (!memoryStudents) initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const parsed = safeJsonParse<Student[] | null>(raw, null);
    if (parsed && parsed.length > 0) return parsed;
  } catch (e) {
    // Ignore
  }
  return memoryStudents || generateFull1500Students();
}

function saveStoredStudents(students: Student[]) {
  memoryStudents = students;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

function getStoredAttendance(): AttendanceRecord[] {
  if (typeof window === 'undefined') return [];
  if (!memoryAttendance) initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const parsed = safeJsonParse<AttendanceRecord[] | null>(raw, null);
    if (parsed) return parsed;
  } catch (e) {
    // Ignore
  }
  return memoryAttendance || [];
}

function saveStoredAttendance(records: AttendanceRecord[]) {
  memoryAttendance = records;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

export function getStoredSettingsSync(): SchoolSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  if (!memorySettings) initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = safeJsonParse<SchoolSettings | null>(raw, null);
    if (parsed) return parsed;
  } catch (e) {
    // Ignore
  }
  return memorySettings || DEFAULT_SETTINGS;
}

function saveStoredSettings(settings: SchoolSettings) {
  memorySettings = settings;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }
}

// Format template with dynamic variables
export function formatWhatsAppMessage(
  template: string,
  data: {
    studentName: string;
    nisn: string;
    className: string;
    time: string;
    status: string;
    notes?: string;
    schoolName: string;
  }
): string {
  return template
    .replace(/{nama_siswa}/g, data.studentName)
    .replace(/{nisn}/g, data.nisn)
    .replace(/{kelas}/g, data.className)
    .replace(/{waktu}/g, data.time)
    .replace(/{status}/g, data.status)
    .replace(/{keterangan}/g, data.notes || '-')
    .replace(/{nama_sekolah}/g, data.schoolName);
}

// -------------------------------------------------------------
// Core API Service Functions
// -------------------------------------------------------------

export const apiService = {
  /**
   * Submit QR scan from school gate camera
   * Enforces 5-minute Anti-Double Scan cooldown and evaluates time rules
   */
  async submitScan(
    qrToken: string,
    options?: {
      forceMode?: 'MASUK' | 'PULANG';
      customTime?: string; // For testing simulation
    }
  ): Promise<ScanResult> {
    // Try real backend first if configured
    if (BACKEND_BASE_URL) {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/attendance/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrToken, ...options }),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to local service:', err);
      }
    }

    // Local Implementation & Fallback
    const cleanToken = (qrToken || '').trim();
    if (!cleanToken) {
      return {
        success: false,
        message: 'Token QR tidak valid atau kosong.',
        code: 'INVALID_TOKEN',
      };
    }

    const students = getStoredStudents();
    const student = students.find(
      (s) => s.qrToken.toLowerCase() === cleanToken.toLowerCase() || s.nisn === cleanToken
    );

    if (!student) {
      return {
        success: false,
        message: `Siswa dengan token/NISN "${cleanToken}" tidak ditemukan di database.`,
        code: 'STUDENT_NOT_FOUND',
      };
    }

    const settings = getStoredSettingsSync();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentSeconds = now.getSeconds().toString().padStart(2, '0');
    const currentTimeStr = options?.customTime || `${currentHours}:${currentMinutes}:${currentSeconds}`;

    const attendanceLogs = getStoredAttendance();

    // 1. Check Anti-Double Scan Cooldown (5 Minutes UI Prevention)
    const cooldownMs = (settings.cooldownMinutes || 5) * 60 * 1000;
    const recentScansForStudent = attendanceLogs.filter(
      (r) => r.studentId === student.id && r.date === today
    );

    // Sort newest first
    recentScansForStudent.sort((a, b) => (b.time > a.time ? 1 : -1));

    if (recentScansForStudent.length > 0) {
      const lastRecord = recentScansForStudent[0];
      const [lastH, lastM, lastS] = (lastRecord.time || '00:00:00').split(':').map(Number);
      const lastScanDate = new Date(now);
      lastScanDate.setHours(lastH || 0, lastM || 0, lastS || 0, 0);

      const elapsedMs = now.getTime() - lastScanDate.getTime();
      if (elapsedMs >= 0 && elapsedMs < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsedMs) / 1000);
        const minutesLeft = Math.floor(remainingSec / 60);
        const secondsLeft = remainingSec % 60;
        return {
          success: false,
          code: 'ALREADY_SCANNED',
          message: `Siswa "${student.name}" sudah melakukan scan pada ${lastRecord.time}. Anti-Double Scan aktif: Tunggu ${minutesLeft} menit ${secondsLeft} detik lagi.`,
          student,
          record: lastRecord,
          cooldownRemainingSeconds: remainingSec,
          lastScannedTime: lastRecord.time,
        };
      }
    }

    // 2. Determine Attendance Status based on Gate Operational Hours
    // Format "HH:mm"
    const [limitH, limitM] = settings.checkInLimitTime.split(':').map(Number);
    const [outH, outM] = settings.checkOutStartTime.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const limitMinutes = limitH * 60 + limitM;
    const checkoutMinutes = outH * 60 + outM;

    let scanMode: 'MASUK' | 'PULANG' = options?.forceMode || (nowMinutes >= checkoutMinutes ? 'PULANG' : 'MASUK');
    let status: AttendanceStatus = 'HADIR_TEPAT_WAKTU';
    let minutesLate = 0;
    let notes = '';

    if (scanMode === 'PULANG') {
      status = 'PULANG';
      notes = 'Presensi Kepulangan Siswa';
    } else {
      if (nowMinutes <= limitMinutes) {
        status = 'HADIR_TEPAT_WAKTU';
        notes = 'Hadir sebelum batas jam masuk';
      } else {
        status = 'TERLAMBAT';
        minutesLate = nowMinutes - limitMinutes;
        notes = `Terlambat ${minutesLate} menit`;
      }
    }

    // 3. Generate WhatsApp Message
    let template = settings.templates.onTime;
    let statusLabel = 'HADIR TEPAT WAKTU';
    if (status === 'TERLAMBAT') {
      template = settings.templates.late;
      statusLabel = `TERLAMBAT (${minutesLate} menit)`;
    } else if (status === 'PULANG') {
      template = settings.templates.checkOut;
      statusLabel = 'PULANG';
    }

    const waMessage = formatWhatsAppMessage(template, {
      studentName: student.name,
      nisn: student.nisn,
      className: student.className,
      time: currentTimeStr,
      status: statusLabel,
      notes,
      schoolName: settings.schoolName,
    });

    // 4. Create New Attendance Record
    const newRecord: AttendanceRecord = {
      id: `att-${today}-${student.nisn}-${Date.now()}`,
      studentId: student.id,
      nisn: student.nisn,
      studentName: student.name,
      className: student.className,
      photoUrl: student.photoUrl,
      parentPhone: student.parentPhone,
      parentName: student.parentName,
      date: today,
      time: currentTimeStr,
      checkInTime: scanMode === 'MASUK' ? currentTimeStr : (recentScansForStudent[0]?.checkInTime || null),
      checkOutTime: scanMode === 'PULANG' ? currentTimeStr : null,
      status,
      minutesLate,
      notes,
      whatsappStatus: settings.autoSendWhatsApp ? 'TERKIRIM' : 'ANTREAN',
      whatsappSentAt: settings.autoSendWhatsApp ? `${today} ${currentTimeStr}` : undefined,
      whatsappMessage: waMessage,
      scanMode,
      gateLocation: 'Gerbang Utama SMK Muhammadiyah 3 Weleri',
    };

    // Save to storage
    attendanceLogs.unshift(newRecord);
    saveStoredAttendance(attendanceLogs);

    return {
      success: true,
      message: `Presensi ${student.name} berhasil dicatat (${statusLabel}).`,
      code: 'SUCCESS',
      record: newRecord,
      student,
    };
  },

  /**
   * Get students with pagination, search, and class filtering (1,500 scale)
   */
  async getStudents(params?: {
    search?: string;
    className?: string;
    page?: number;
    limit?: number;
  }): Promise<{ students: Student[]; total: number; page: number; totalPages: number }> {
    if (BACKEND_BASE_URL) {
      try {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.className) query.set('className', params.className);
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));

        const res = await fetch(`${BACKEND_BASE_URL}/students?${query.toString()}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, using local students:', err);
      }
    }

    let list = getStoredStudents();
    const search = (params?.search || '').toLowerCase().trim();
    const className = params?.className || '';

    if (search) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.nisn.includes(search) ||
          s.parentPhone.includes(search) ||
          s.parentName.toLowerCase().includes(search) ||
          s.className.toLowerCase().includes(search)
      );
    }

    if (className && className !== 'ALL') {
      list = list.filter((s) => s.className === className);
    }

    const total = list.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 15);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Get recent 10 scans for the kiosk gate screen
   */
  async getRecentScans(limit = 10): Promise<AttendanceRecord[]> {
    const logs = getStoredAttendance();
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.date === today);
    return todayLogs.slice(0, limit);
  },

  /**
   * Get attendance logs with filtering
   */
  async getAttendanceLogs(params?: {
    date?: string;
    search?: string;
    className?: string;
    status?: string;
  }): Promise<AttendanceRecord[]> {
    if (BACKEND_BASE_URL) {
      try {
        const query = new URLSearchParams();
        if (params?.date) query.set('date', params.date);
        if (params?.search) query.set('search', params.search);
        if (params?.className) query.set('className', params.className);
        if (params?.status) query.set('status', params.status);

        const res = await fetch(`${BACKEND_BASE_URL}/attendance?${query.toString()}`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Backend unavailable, using local logs:', err);
      }
    }

    let logs = getStoredAttendance();
    const targetDate = params?.date || new Date().toISOString().split('T')[0];

    logs = logs.filter((l) => l.date === targetDate);

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.studentName.toLowerCase().includes(q) ||
          l.nisn.includes(q) ||
          l.className.toLowerCase().includes(q)
      );
    }

    if (params?.className && params.className !== 'ALL') {
      logs = logs.filter((l) => l.className === params.className);
    }

    if (params?.status && params.status !== 'ALL') {
      logs = logs.filter((l) => l.status === params.status);
    }

    return logs;
  },

  /**
   * Manual Attendance input (Izin, Sakit, Alpa, Hadir Manual)
   */
  async manualAttendance(
    studentId: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<AttendanceRecord> {
    const students = getStoredStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('Siswa tidak ditemukan');
    }

    const settings = getStoredSettingsSync();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let template = settings.templates.onTime;
    if (status === 'IZIN') template = settings.templates.permit;
    else if (status === 'SAKIT') template = settings.templates.sick;
    else if (status === 'TERLAMBAT') template = settings.templates.late;

    const waMsg = formatWhatsAppMessage(template, {
      studentName: student.name,
      nisn: student.nisn,
      className: student.className,
      time: timeStr,
      status,
      notes,
      schoolName: settings.schoolName,
    });

    const newRecord: AttendanceRecord = {
      id: `att-manual-${today}-${student.nisn}-${Date.now()}`,
      studentId: student.id,
      nisn: student.nisn,
      studentName: student.name,
      className: student.className,
      photoUrl: student.photoUrl,
      parentPhone: student.parentPhone,
      parentName: student.parentName,
      date: today,
      time: timeStr,
      checkInTime: status === 'HADIR_TEPAT_WAKTU' || status === 'TERLAMBAT' ? timeStr : null,
      status,
      minutesLate: status === 'TERLAMBAT' ? 15 : 0,
      notes: notes || `Input Manual (${status})`,
      whatsappStatus: 'TERKIRIM',
      whatsappSentAt: `${today} ${timeStr}`,
      whatsappMessage: waMsg,
      scanMode: 'MANUAL',
      gateLocation: 'Piket Guru / Tata Usaha',
    };

    const logs = getStoredAttendance();
    logs.unshift(newRecord);
    saveStoredAttendance(logs);

    return newRecord;
  },

  /**
   * Add or update student
   */
  async saveStudent(studentData: Partial<Student> & { name: string; nisn: string; className: string }): Promise<Student> {
    const students = getStoredStudents();
    let existingIndex = students.findIndex((s) => s.id === studentData.id || s.nisn === studentData.nisn);

    if (existingIndex >= 0) {
      const updated: Student = {
        ...students[existingIndex],
        ...studentData,
        qrToken: studentData.qrToken || `M3W-${studentData.nisn}`,
      };
      students[existingIndex] = updated;
      saveStoredStudents(students);
      return updated;
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nisn: studentData.nisn,
        name: studentData.name,
        gender: studentData.gender || 'L',
        classGrade: studentData.classGrade || studentData.className.split(' ')[0] || 'X',
        major: studentData.major || 'Teknik Komputer & Jaringan',
        className: studentData.className,
        parentName: studentData.parentName || `Orang Tua ${studentData.name}`,
        parentPhone: studentData.parentPhone || '081234567890',
        qrToken: studentData.qrToken || `M3W-${studentData.nisn}`,
        photoUrl: studentData.photoUrl || (studentData.gender === 'P'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces&q=80'),
        isActive: studentData.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      students.unshift(newStudent);
      saveStoredStudents(students);
      return newStudent;
    }
  },

  /**
   * Delete student
   */
  async deleteStudent(studentId: string): Promise<boolean> {
    const students = getStoredStudents();
    const filtered = students.filter((s) => s.id !== studentId);
    saveStoredStudents(filtered);
    return true;
  },

  /**
   * Import students in bulk from parsed CSV
   */
  async importStudents(incoming: Partial<Student>[]): Promise<{ count: number; imported: Student[] }> {
    const students = getStoredStudents();
    const importedList: Student[] = [];

    incoming.forEach((item) => {
      if (!item.nisn || !item.name) return;
      const idx = students.findIndex((s) => s.nisn === item.nisn);
      const studentObj: Student = {
        id: idx >= 0 ? students[idx].id : `std-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nisn: item.nisn,
        name: item.name,
        gender: item.gender || 'L',
        className: item.className || 'X TKJ 1',
        classGrade: item.className?.split(' ')[0] || 'X',
        major: item.major || 'Teknik Komputer & Jaringan',
        parentName: item.parentName || `Orang Tua ${item.name}`,
        parentPhone: item.parentPhone || '081234567890',
        qrToken: item.qrToken || `M3W-${item.nisn}`,
        photoUrl: item.photoUrl || (item.gender === 'P'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces&q=80'),
        isActive: true,
      };

      if (idx >= 0) {
        students[idx] = { ...students[idx], ...studentObj };
      } else {
        students.push(studentObj);
      }
      importedList.push(studentObj);
    });

    saveStoredStudents(students);
    return { count: importedList.length, imported: importedList };
  },

  /**
   * Get Settings
   */
  async getSettings(): Promise<SchoolSettings> {
    if (BACKEND_BASE_URL) {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/settings`);
        if (res.ok) return await res.json();
      } catch (e) {
        // Fallback
      }
    }
    return getStoredSettingsSync();
  },

  /**
   * Update Settings
   */
  async updateSettings(newSettings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    const current = getStoredSettingsSync();
    const updated = { ...current, ...newSettings };
    saveStoredSettings(updated);

    if (BACKEND_BASE_URL) {
      try {
        await fetch(`${BACKEND_BASE_URL}/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      } catch (e) {
        // Fallback
      }
    }
    return updated;
  },

  /**
   * Get real-time summary for dashboard cards
   */
  async getDashboardSummary(date?: string): Promise<DashboardSummary> {
    const students = getStoredStudents();
    const logs = getStoredAttendance();
    const targetDate = date || new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter((l) => l.date === targetDate);

    const totalStudents = students.length;
    let presentOnTime = 0;
    let presentLate = 0;
    let checkedOut = 0;
    let permitOrSick = 0;
    let waSent = 0;
    let waQueue = 0;

    // To prevent duplicate count for same student across different logs today
    const studentStatusMap = new Map<string, AttendanceStatus>();

    todayLogs.forEach((l) => {
      studentStatusMap.set(l.studentId, l.status);
      if (l.status === 'PULANG') {
        checkedOut++;
      }
      if (l.whatsappStatus === 'TERKIRIM') waSent++;
      else if (l.whatsappStatus === 'ANTREAN') waQueue++;
    });

    studentStatusMap.forEach((status) => {
      if (status === 'HADIR_TEPAT_WAKTU') presentOnTime++;
      else if (status === 'TERLAMBAT') presentLate++;
      else if (status === 'IZIN' || status === 'SAKIT') permitOrSick++;
    });

    const attendedTotal = presentOnTime + presentLate + permitOrSick;
    const absent = Math.max(0, totalStudents - attendedTotal);
    const attendanceRate = totalStudents > 0 ? Math.round((attendedTotal / totalStudents) * 100) : 0;

    return {
      totalStudents,
      presentOnTime,
      presentLate,
      checkedOut,
      permitOrSick,
      absent,
      attendanceRate,
      whatsappQueueCount: waQueue,
      whatsappSentCount: waSent,
    };
  },

  /**
   * Simulate resending WhatsApp notification
   */
  async resendWhatsApp(recordId: string): Promise<AttendanceRecord> {
    const logs = getStoredAttendance();
    const record = logs.find((r) => r.id === recordId);
    if (!record) throw new Error('Log presensi tidak ditemukan');

    record.whatsappStatus = 'TERKIRIM';
    record.whatsappSentAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    saveStoredAttendance(logs);
    return record;
  },

  /**
   * Reset data to initial 1,500 students cohort
   */
  async resetCohort1500(): Promise<number> {
    const fullList = generateFull1500Students();
    saveStoredStudents(fullList);
    const settings = getStoredSettingsSync();
    const initialLogs = generateInitialAttendanceLogs(fullList, settings);
    saveStoredAttendance(initialLogs);
    return fullList.length;
  },
};
