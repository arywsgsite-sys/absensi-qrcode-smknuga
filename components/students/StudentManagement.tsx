'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Printer,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  AlertCircle,
  Check,
} from 'lucide-react';
import { apiService } from '../../src/services/apiService';
import { Student, Gender } from '../../src/types';
import { CLASSES, MAJORS } from '../../src/data/seedData';
import { parseStudentCsv, downloadStudentCsvTemplate } from '../../src/utils/csv';
import { StudentCardModal } from './StudentCardModal';

interface StudentManagementProps {
  highContrast: boolean;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ highContrast }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [batchPrintList, setBatchPrintList] = useState<Student[] | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formGender, setFormGender] = useState<Gender>('L');
  const [formClass, setFormClass] = useState(CLASSES[0]);
  const [formMajor, setFormMajor] = useState(MAJORS[0].name);
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');

  // CSV Import Modal
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importPreview, setImportPreview] = useState<Partial<Student>[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getStudents({
        search: searchQuery,
        className: selectedClass,
        page: currentPage,
        limit: pageSize,
      });
      setStudents(res.students);
      setTotalStudents(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error('Failed to load students', e);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedClass, currentPage, pageSize]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Handle open add / edit modal
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName('');
    const randomNisn = `007${Math.floor(1000000 + Math.random() * 9000000)}`;
    setFormNisn(randomNisn);
    setFormGender('L');
    setFormClass(CLASSES[0]);
    setFormMajor(MAJORS[0].name);
    setFormParentName('');
    setFormParentPhone('0812');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (st: Student) => {
    setEditingStudent(st);
    setFormName(st.name);
    setFormNisn(st.nisn);
    setFormGender(st.gender);
    setFormClass(st.className);
    setFormMajor(st.major);
    setFormParentName(st.parentName);
    setFormParentPhone(st.parentPhone);
    setShowAddEditModal(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formNisn) return;

    try {
      await apiService.saveStudent({
        id: editingStudent ? editingStudent.id : undefined,
        name: formName,
        nisn: formNisn,
        gender: formGender,
        className: formClass,
        classGrade: formClass.split(' ')[0],
        major: formMajor,
        parentName: formParentName || `Orang Tua ${formName}`,
        parentPhone: formParentPhone,
        qrToken: editingStudent?.qrToken || `M3W-${formNisn}`,
      });
      setShowAddEditModal(false);
      await loadStudents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Gagal menyimpan siswa: ' + msg);
    }
  };

  const handleDeleteStudent = async (st: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus siswa "${st.name}" (${st.nisn})?`)) {
      await apiService.deleteStudent(st.id);
      await loadStudents();
    }
  };

  // CSV File reading
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseStudentCsv(text);
      setImportPreview(parsed);
      setImportStatus(`Terbaca ${parsed.length} calon siswa dari file CSV.`);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    try {
      const result = await apiService.importStudents(importPreview);
      alert(`Berhasil mengimpor ${result.count} data siswa baru/terupdate!`);
      setShowImportModal(false);
      setImportPreview([]);
      setImportStatus(null);
      await loadStudents();
    } catch (err) {
      alert('Gagal mengimpor data CSV.');
    }
  };

  const handleResetCohort = async () => {
    if (confirm('Atur ulang seluruh database ke 1.500 Siswa bawaan SMK Muhammadiyah 3 Weleri?')) {
      const count = await apiService.resetCohort1500();
      alert(`Berhasil memulihkan ${count} data siswa!`);
      setCurrentPage(1);
      await loadStudents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Student ID Card Print Modal */}
      {(selectedStudentForCard || batchPrintList) && (
        <StudentCardModal
          student={selectedStudentForCard}
          batchStudents={batchPrintList || undefined}
          onClose={() => {
            setSelectedStudentForCard(null);
            setBatchPrintList(null);
          }}
        />
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>MANAJEMEN DATA SISWA & KARTU QR</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              KAPASITAS 1.500 SISWA
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola data murid, buat kartu tanda pelajar ber-QR, dan impor data massal via CSV
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBatchPrintList(students)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            title="Cetak Kartu Pelajar untuk seluruh siswa di halaman ini"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Kartu Halaman Ini ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Impor CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Pagination Info */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama siswa, NISN, atau no. telepon wali..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Class Filter */}
          <div className="w-full md:w-60 flex-shrink-0">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">Semua Kelas ({CLASSES.length} Kelas)</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Per Page Select */}
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
            <span>Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Student Count & Reset Action */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-900">
              {totalStudents > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-900">
              {Math.min(currentPage * pageSize, totalStudents)}
            </strong>{' '}
            dari total <strong className="text-emerald-700">{totalStudents.toLocaleString('id-ID')} Siswa</strong>
          </div>

          <button
            type="button"
            onClick={handleResetCohort}
            className="text-[11px] text-slate-400 hover:text-emerald-700 underline transition-colors"
          >
            Muat Ulang Database 1.500 Siswa Bawaan
          </button>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Siswa</th>
                <th className="px-3 py-3">NISN & Token QR</th>
                <th className="px-3 py-3">Kelas & Jurusan</th>
                <th className="px-3 py-3">Orang Tua / Wali</th>
                <th className="px-3 py-3">No. WhatsApp Wali</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Tidak ada siswa yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Avatar & Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={st.photoUrl}
                          alt={st.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{st.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Jenis Kelamin: {st.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* NISN & QR Token */}
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold text-slate-800 block">
                        {st.nisn}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {st.qrToken}
                      </span>
                    </td>

                    {/* Class & Major */}
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px] mb-0.5">
                        {st.className}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                        {st.major}
                      </span>
                    </td>

                    {/* Parent Name */}
                    <td className="px-3 py-3 font-medium text-slate-700">
                      {st.parentName}
                    </td>

                    {/* Parent WA */}
                    <td className="px-3 py-3 font-mono font-semibold text-emerald-800">
                      {st.parentPhone}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForCard(st)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                          title="Pratinjau & Cetak Kartu Pelajar QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Kartu QR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(st)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold flex items-center gap-1 transition-all"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="py-3.5 px-6 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="text-sm sm:text-base">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan Al-Ghifari"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NISN (10 Digit):
                  </label>
                  <input
                    type="text"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    placeholder="0067482910"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin:
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as Gender)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas:
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kompetensi Keahlian (Jurusan):
                  </label>
                  <select
                    value={formMajor}
                    onChange={(e) => setFormMajor(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                  >
                    {MAJORS.map((m) => (
                      <option key={m.code} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Orang Tua / Wali:
                  </label>
                  <input
                    type="text"
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    placeholder="Bpk. Agus Susanto"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp Orang Tua:
                  </label>
                  <input
                    type="text"
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold block text-slate-800">Token QR Otomatis:</span>
                <span className="font-mono text-emerald-700">M3W-{formNisn || '0000000000'}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="py-3.5 px-6 bg-slate-900 text-white font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm sm:text-base">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Impor Massal Data Siswa dari File CSV
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview([]);
                  setImportStatus(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Format Kolom CSV yang didukung:
                  </span>
                  <span className="text-slate-500">
                    nisn, nama, jenis_kelamin, kelas, jurusan, nama_ortu, no_wa_ortu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={downloadStudentCsvTemplate}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1.5 flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template CSV</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-emerald-50/30 transition-colors"
              >
                <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  Klik untuk memilih file CSV dari komputer Anda
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung ribuan baris data untuk kapasitas 1.500 siswa
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvFile}
                  className="hidden"
                />
              </div>

              {/* Status & Preview Table */}
              {importStatus && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{importStatus}</span>
                </div>
              )}

              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Pratinjau {importPreview.length} Baris Data:
                  </span>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">NISN</th>
                          <th className="p-2">Nama</th>
                          <th className="p-2">Kelas</th>
                          <th className="p-2">No. WA Ortu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.slice(0, 10).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{row.nisn}</td>
                            <td className="p-2 font-medium">{row.name}</td>
                            <td className="p-2">{row.className}</td>
                            <td className="p-2 font-mono text-emerald-800">{row.parentPhone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importPreview.length > 10 && (
                    <p className="text-[11px] text-slate-400 italic">
                      + {importPreview.length - 10} data lainnya...
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleExecuteImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Proses & Simpan {importPreview.length} Siswa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
