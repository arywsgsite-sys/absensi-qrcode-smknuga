'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  User,
  ArrowRight,
  X,
  Volume2,
  Phone,
  Home,
  Check,
} from 'lucide-react';
import { ScanResult, AttendanceRecord } from '../../src/types';

interface ScanSuccessModalProps {
  scanResult: ScanResult | null;
  onClose: () => void;
  highContrast: boolean;
  autoCloseSeconds?: number;
}

export const ScanSuccessModal: React.FC<ScanSuccessModalProps> = ({
  scanResult,
  onClose,
  highContrast,
  autoCloseSeconds = 4,
}) => {
  const [countdown, setCountdown] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!scanResult) return;
    setCountdown(autoCloseSeconds);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [scanResult, onClose, autoCloseSeconds]);

  if (!scanResult) return null;

  const isDoubleScan = scanResult.code === 'ALREADY_SCANNED';
  const record = scanResult.record;
  const student = scanResult.student || (record ? {
    id: record.studentId,
    name: record.studentName,
    nisn: record.nisn,
    className: record.className,
    parentPhone: record.parentPhone,
    parentName: record.parentName,
    photoUrl: record.photoUrl,
  } : null);

  // Status visual mapping
  const status = record?.status || (isDoubleScan ? record?.status : 'HADIR_TEPAT_WAKTU');

  let badgeColor = 'bg-emerald-600 text-white';
  let badgeTitle = 'HADIR TEPAT WAKTU';
  let statusIcon = CheckCircle2;

  if (status === 'TERLAMBAT') {
    badgeColor = 'bg-amber-500 text-white';
    badgeTitle = `TERLAMBAT (${record?.minutesLate || 0} MENIT)`;
    statusIcon = Clock;
  } else if (status === 'PULANG') {
    badgeColor = 'bg-sky-600 text-white';
    badgeTitle = 'PULANG';
    statusIcon = Home;
  }

  const StatusIconComponent = statusIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-xl rounded-2xl shadow-2xl border-4 overflow-hidden transition-all transform scale-100 ${
          isDoubleScan
            ? highContrast
              ? 'bg-black text-yellow-300 border-red-500'
              : 'bg-white text-slate-900 border-amber-500'
            : highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-900 border-emerald-500'
        }`}
      >
        {/* Top Header Banner */}
        <div
          className={`py-3.5 px-6 flex items-center justify-between text-white font-black tracking-wide ${
            isDoubleScan
              ? 'bg-amber-600 text-white'
              : status === 'TERLAMBAT'
              ? 'bg-amber-500 text-white'
              : status === 'PULANG'
              ? 'bg-sky-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 text-base sm:text-lg">
            {isDoubleScan ? (
              <>
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <span>ANTI-DOUBLE SCAN (COOLDOWN 5 MENIT)</span>
              </>
            ) : (
              <>
                <StatusIconComponent className="w-6 h-6" />
                <span>PRESENSI GERBANG TERCATAT</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* If Double Scan Warning */}
          {isDoubleScan && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm sm:text-base">
                  Siswa ini sudah melakukan presensi sebelumnya!
                </p>
                <p className="text-xs sm:text-sm text-amber-800 mt-1">
                  Waktu scan sebelumnya: <span className="font-bold">{scanResult.lastScannedTime || record?.time}</span>.
                  Pencegahan duplikasi presensi aktif. Tunggu sisa waktu cooldown untuk memindai ulang.
                </p>
                {scanResult.cooldownRemainingSeconds && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Sisa Cooldown: {Math.floor(scanResult.cooldownRemainingSeconds / 60)}m {scanResult.cooldownRemainingSeconds % 60}d
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Profile Card (Big Visual for Outdoor Screen) */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            {/* Student Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-emerald-500/40 shadow-lg bg-slate-200 flex items-center justify-center">
                {student?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.photoUrl}
                    alt={student.name || 'Siswa'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <div
                className={`absolute -bottom-2 -right-2 p-1.5 rounded-full shadow-md text-white ${
                  isDoubleScan ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
              >
                {isDoubleScan ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5 shadow-sm">
                <span className={`px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                  {badgeTitle}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight truncate">
                {student?.name || 'Nama Siswa'}
              </h2>

              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                  <span className="text-slate-400">NISN:</span> {student?.nisn}
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                  <span>{student?.className}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record?.time || new Date().toLocaleTimeString('id-ID')} WIB</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Notification Dispatch Status */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <div className="p-1 rounded-full bg-emerald-600 text-white">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <span>Notifikasi WhatsApp Orang Tua</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <Check className="w-3 h-3" /> Terkirim ke Antrean WA
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-950 font-medium">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Wali: {student?.parentName || 'Orang Tua Siswa'}</span>
              </div>
              <span className="font-mono font-bold text-emerald-800">
                {student?.parentPhone ? `${student.parentPhone.slice(0, 4)}-${student.parentPhone.slice(4, 8)}-${student.parentPhone.slice(8)}` : '-'}
              </span>
            </div>

            {record?.whatsappMessage && (
              <div className="mt-2 text-[11px] font-sans bg-white/90 p-2.5 rounded-lg border border-emerald-200/80 text-slate-700 italic max-h-20 overflow-y-auto leading-relaxed">
                &ldquo;{record.whatsappMessage.slice(0, 160)}...&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Countdown */}
        <div
          className={`py-3 px-6 flex items-center justify-between border-t ${
            highContrast ? 'border-yellow-400/40 bg-black' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Otomatis kembali dalam {countdown} detik</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow transition-all"
          >
            <span>Scan Selanjutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
