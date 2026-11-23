'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  UserX,
  Home,
  Send,
  Search,
  Filter,
  Download,
  PlusCircle,
  RefreshCw,
  Eye,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Calendar,
} from 'lucide-react';
import { apiService } from '../../src/services/apiService';
import { exportAttendanceToCsv } from '../../src/utils/csv';
import { AttendanceRecord, DashboardSummary, AttendanceStatus, Student } from '../../src/types';
import { CLASSES } from '../../src/data/seedData';

interface DashboardProps {
  highContrast: boolean;
  onRefreshNeeded?: () => void;
}

export const AttendanceDashboard: React.FC<DashboardProps> = ({ highContrast }) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Manual Attendance Modal State
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualStudentList, setManualStudentList] = useState<Student[]>([]);
  const [manualStudentId, setManualStudentId] = useState<string>('');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('IZIN');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualSubmitting, setManualSubmitting] = useState<boolean>(false);

  // WhatsApp Message Preview Modal State
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const summaryData = await apiService.getDashboardSummary(selectedDate);
      setSummary(summaryData);

      const logsData = await apiService.getAttendanceLogs({
        date: selectedDate,
        search: searchQuery,
        className: selectedClass,
        status: selectedStatus,
      });
      setLogs(logsData);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, searchQuery, selectedClass, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load students for manual modal dropdown
  const handleOpenManualModal = async () => {
    try {
      const res = await apiService.getStudents({ limit: 100 });
      setManualStudentList(res.students);
      if (res.students.length > 0) {
        setManualStudentId(res.students[0].id);
      }
      setShowManualModal(true);
    } catch (e) {
      console.error('Failed to load students for manual modal', e);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentId) return;

    setManualSubmitting(true);
    try {
      await apiService.manualAttendance(manualStudentId, manualStatus, manualNotes);
      setShowManualModal(false);
      setManualNotes('');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Gagal mencatat presensi manual: ' + msg);
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleResendWa = async (recordId: string) => {
    try {
      await apiService.resendWhatsApp(recordId);
      await loadData();
    } catch (e) {
      alert('Gagal mengirim ulang WhatsApp');
    }
  };

  const handleExportCsv = () => {
    exportAttendanceToCsv(logs, `Presensi_SMK_Muga_3_${selectedDate}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>DASHBOARD MONITORING PRESENSI</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              REAL-TIME
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pemantauan kehadiran 1.500 siswa SMK Muhammadiyah 3 Weleri & status notifikasi WA
          </p>
        </div>

        {/* Date Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-bold text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={handleOpenManualModal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Input Presensi Manual</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors shadow-sm"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards (5 metrics for 1.500 students) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Siswa
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary ? summary.totalStudents.toLocaleString('id-ID') : '1.500'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">siswa</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">SMK Muga 3 Weleri</p>
        </div>

        {/* Hadir Tepat Waktu */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Tepat Waktu
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {summary ? summary.presentOnTime : 0}
            </span>
            <span className="text-xs font-bold text-emerald-600">
              ({summary && summary.totalStudents > 0 ? Math.round((summary.presentOnTime / summary.totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Sebelum jam 07:00 WIB</p>
        </div>

        {/* Terlambat */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Terlambat
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {summary ? summary.presentLate : 0}
            </span>
            <span className="text-xs font-bold text-amber-600">
              ({summary && summary.totalStudents > 0 ? Math.round((summary.presentLate / summary.totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">Lewat batas toleransi</p>
        </div>

        {/* Belum Hadir / Alpa */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Belum Hadir
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              {summary ? summary.absent : 0}
            </span>
            <span className="text-xs text-rose-500 font-semibold">siswa</span>
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">Termasuk izin & sakit</p>
        </div>

        {/* Sudah Pulang */}
        <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Sudah Pulang
            </span>
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-sky-600">
              {summary ? summary.checkedOut : 0}
            </span>
            <span className="text-xs text-sky-500 font-semibold">siswa</span>
          </div>
          <p className="text-[11px] text-sky-600/80 mt-1">Scan gerbang sore</p>
        </div>
      </div>

      {/* WhatsApp Dispatch Progress Tracker */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/40">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base">
                Status Antrean WhatsApp Gateway Orang Tua
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                AUTO-DISPATCH
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              Pesan notifikasi langsung dikirim ke nomor WhatsApp wali begitu kartu QR siswa terpindai.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Terkirim: <strong>{summary?.whatsappSentCount || 0}</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Antrean: <strong>{summary?.whatsappQueueCount || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama siswa atau NISN..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <div className="w-full md:w-56 flex-shrink-0">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">Semua Kelas ({CLASSES.length} Kelas)</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-52 flex-shrink-0">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">Semua Status Presensi</option>
              <option value="HADIR_TEPAT_WAKTU">Hadir Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="PULANG">Pulang</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-800">
              Log Kehadiran Siswa Hari Ini ({logs.length} data tercatat)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Terakhir disinkronkan: {new Date().toLocaleTimeString('id-ID')} WIB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-3 py-3">NISN & Kelas</th>
                <th className="px-3 py-3">Waktu Scan</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Notifikasi WA</th>
                <th className="px-3 py-3">Keterangan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada catatan presensi yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                logs.map((row) => {
                  let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  let statusLabel = 'Tepat Waktu';
                  if (row.status === 'TERLAMBAT') {
                    statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                    statusLabel = `Terlambat ${row.minutesLate}m`;
                  } else if (row.status === 'PULANG') {
                    statusBadge = 'bg-sky-100 text-sky-800 border-sky-300';
                    statusLabel = 'Pulang';
                  } else if (row.status === 'IZIN') {
                    statusBadge = 'bg-purple-100 text-purple-800 border-purple-300';
                    statusLabel = 'Izin';
                  } else if (row.status === 'SAKIT') {
                    statusBadge = 'bg-pink-100 text-pink-800 border-pink-300';
                    statusLabel = 'Sakit';
                  }

                  let waBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  let waLabel = 'Terkirim';
                  if (row.whatsappStatus === 'ANTREAN') {
                    waBadge = 'bg-amber-100 text-amber-800 border-amber-300';
                    waLabel = 'Antrean';
                  } else if (row.whatsappStatus === 'GAGAL') {
                    waBadge = 'bg-red-100 text-red-800 border-red-300';
                    waLabel = 'Gagal';
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row.photoUrl}
                            alt={row.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {row.studentName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Wali: {row.parentName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NISN & Class */}
                      <td className="px-3 py-3">
                        <span className="font-mono font-bold text-slate-800 block">
                          {row.nisn}
                        </span>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {row.className}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-3 py-3 font-mono font-semibold text-slate-700">
                        {row.time} WIB
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusBadge}`}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* WhatsApp status */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${waBadge}`}
                          >
                            {waLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {row.parentPhone ? `${row.parentPhone.slice(0, 4)}...${row.parentPhone.slice(-3)}` : '-'}
                          </span>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-3 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {row.notes || '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {row.whatsappMessage && (
                            <button
                              type="button"
                              onClick={() => setPreviewMessage(row.whatsappMessage || '')}
                              className="p-1 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Lihat Pesan WA"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleResendWa(row.id)}
                            className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Kirim Ulang Notifikasi WA"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="py-3.5 px-5 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Input Presensi Manual (Izin / Sakit)
              </span>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Siswa:
                </label>
                <select
                  value={manualStudentId}
                  onChange={(e) => setManualStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {manualStudentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.className}) - NISN: {s.nisn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Presensi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['IZIN', 'SAKIT', 'HADIR_TEPAT_WAKTU'] as AttendanceStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setManualStatus(st)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        manualStatus === st
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'HADIR_TEPAT_WAKTU' ? 'Hadir' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Alasan:
                </label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Contoh: Mengikuti lomba LKS SMK / Surat Dokter terlampir..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <Send className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Notifikasi WhatsApp otomatis akan segera dikirimkan ke nomor HP orang tua siswa yang dipilih.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Kirim WA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Message Preview Modal */}
      {previewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="py-3 px-4 bg-emerald-700 text-white font-bold flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Teks Notifikasi WhatsApp Terkirim
              </span>
              <button
                type="button"
                onClick={() => setPreviewMessage(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-emerald-50/50">
              <div className="p-3.5 bg-white rounded-xl shadow border border-emerald-200 text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800">
                {previewMessage}
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setPreviewMessage(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
