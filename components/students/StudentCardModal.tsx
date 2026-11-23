'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, X, User, Check, ShieldCheck } from 'lucide-react';
import { Student } from '../../src/types';
import { SchoolLogo } from '../common/SchoolLogo';

interface StudentCardModalProps {
  student: Student | null;
  onClose: () => void;
  batchStudents?: Student[];
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  onClose,
  batchStudents,
}) => {
  const isBatch = Boolean(batchStudents && batchStudents.length > 0);
  const studentsToRender = isBatch ? batchStudents! : student ? [student] : [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = (st: Student) => {
    // Generate SVG download
    const svgEl = document.getElementById(`qr-code-svg-${st.id}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR_${st.nisn}_${st.name.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (studentsToRender.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="py-4 px-6 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-white no-print">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                {isBatch
                  ? `Cetak Massal Kartu Pelajar (${studentsToRender.length} Siswa)`
                  : `Kartu Tanda Pelajar QR - ${student?.name}`}
              </h3>
              <p className="text-xs text-slate-400">
                Format standar ID Pelajar SMK Muhammadiyah 3 Weleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isBatch && student && (
              <button
                type="button"
                onClick={() => handleDownloadQr(student)}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Unduh QR Code SVG"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unduh QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Preview Container */}
        <div className="p-6 sm:p-8 bg-slate-950 flex flex-col items-center justify-center gap-8 max-h-[75vh] overflow-y-auto">
          {studentsToRender.map((st) => (
            <div
              key={st.id}
              className="printable-card-container relative w-full max-w-[500px] h-[310px] rounded-2xl overflow-hidden shadow-2xl bg-white text-slate-900 border-2 border-emerald-600 flex flex-col justify-between select-none"
              style={{
                pageBreakAfter: 'always',
              }}
            >
              {/* Header: School Identity */}
              <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-2.5 flex items-center gap-3 border-b-2 border-amber-400">
                <SchoolLogo size={42} />
                <div className="flex-1 text-center pr-4">
                  <div className="text-[8px] sm:text-[9px] font-bold tracking-wider uppercase text-emerald-200">
                    MAJELIS DIKDASMEN PDM KENDAL
                  </div>
                  <div className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                    SMK MUHAMMADIYAH 3 WELERI
                  </div>
                  <div className="text-[7.5px] sm:text-[8.5px] text-emerald-100 font-medium leading-tight mt-0.5">
                    Jl. Bahari No. 345 Weleri, Kec. Weleri, Kab. Kendal • Telp. (0294) 641889
                  </div>
                </div>
              </div>

              {/* Title Badge */}
              <div className="bg-emerald-50 px-4 py-1 flex items-center justify-between border-b border-emerald-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
                  KARTU TANDA PELAJAR & PRESENSI GERBANG
                </span>
                <span className="text-[9px] font-bold text-emerald-700 uppercase">
                  BERLAKU S/D LULUS
                </span>
              </div>

              {/* Middle Section: Photo, Bio, QR Code */}
              <div className="px-4 py-2 flex items-center justify-between gap-3 flex-1 bg-white">
                {/* Photo */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-emerald-600 shadow-sm bg-slate-100 flex items-center justify-center">
                    {st.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={st.photoUrl}
                        alt={st.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 mt-1 uppercase">
                    {st.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                  </span>
                </div>

                {/* Bio Details */}
                <div className="flex-1 min-w-0 text-left text-[11px] leading-tight space-y-1">
                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                      Nama Lengkap
                    </span>
                    <span className="font-black text-slate-900 text-xs sm:text-sm truncate block">
                      {st.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                        NISN
                      </span>
                      <span className="font-mono font-black text-slate-800 text-xs block">
                        {st.nisn}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                        Kelas
                      </span>
                      <span className="font-bold text-emerald-800 text-xs block">
                        {st.className}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                      Kompetensi Keahlian
                    </span>
                    <span className="font-semibold text-slate-700 text-[10px] block truncate">
                      {st.major}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                      No. WA Orang Tua / Wali
                    </span>
                    <span className="font-mono text-[10px] text-slate-600 block">
                      {st.parentPhone}
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center flex-shrink-0 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner">
                  <div className="bg-white p-1 rounded-lg border border-slate-300">
                    <QRCodeSVG
                      id={`qr-code-svg-${st.id}`}
                      value={st.qrToken}
                      size={86}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <span className="font-mono text-[8px] font-black text-slate-600 mt-1 tracking-tighter">
                    {st.qrToken}
                  </span>
                  <span className="text-[7.5px] text-emerald-700 font-bold">
                    Scan Gerbang
                  </span>
                </div>
              </div>

              {/* Card Footer: Signature & Hologram placeholder */}
              <div className="px-4 py-1.5 bg-gradient-to-r from-slate-100 to-emerald-50 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[6px]">
                    M
                  </div>
                  <span className="font-semibold">SMK Muga 3 Weleri Presensi Digital</span>
                </div>

                <div className="text-right">
                  <span>Weleri, Kendal • Kepala Sekolah</span>
                  <div className="font-bold text-slate-900 leading-tight">
                    H. Bambang Prasetyo, S.Pd., M.M.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Bottom note */}
        <div className="py-3 px-6 bg-slate-800 text-center text-xs text-slate-400 border-t border-slate-700 no-print">
          Gunakan kertas PVC Card atau kertas foto tebal saat mencetak. QR Code dapat langsung dipindai pada kamera gerbang.
        </div>
      </div>
    </div>
  );
};
