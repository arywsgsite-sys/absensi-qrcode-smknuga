'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, X, User, ShieldCheck } from 'lucide-react';
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
    const svgEl = document.getElementById(`qr-code-svg-${st.id}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = svgUrl;
    downloadLink.download = `QR_${st.nisn}_${st.name.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  if (studentsToRender.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-md sm:p-6">
      <div className="relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Modal Top Bar */}
        <div className="no-print flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-extrabold tracking-tight sm:text-base">
                {isBatch
                  ? `Cetak Massal Kartu Pelajar (${studentsToRender.length} Siswa)`
                  : `Kartu Tanda Pelajar QR - ${student?.name}`}
              </h3>
              <p className="text-xs text-slate-400">
                Format kartu pelajar potrait SMK Muhammadiyah 3 Weleri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isBatch && student && (
              <button
                type="button"
                onClick={() => handleDownloadQr(student)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-600"
                title="Unduh QR Code SVG"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Unduh QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-500"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Kartu (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Card Preview Container */}
        <div className="flex max-h-[75vh] flex-col items-center justify-center gap-8 overflow-y-auto bg-slate-950 p-6 sm:p-8">
          {studentsToRender.map((st) => (
            <div
              key={st.id}
              className="printable-card-container relative flex h-[86mm] w-[54mm] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-emerald-600 bg-white text-slate-900 shadow-2xl select-none"
              style={{ pageBreakAfter: 'always' }}
            >
              {/* School Identity */}
              <div className="flex items-center gap-2 border-b-2 border-amber-400 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-2 py-2 text-white">
                <SchoolLogo size={30} />
                <div className="min-w-0 flex-1 text-center">
                  <div className="text-[6px] font-bold uppercase tracking-wide text-emerald-200">
                    MAJELIS DIKDASMEN PDM KENDAL
                  </div>
                  <div className="text-[9px] font-black leading-tight">
                    SMK MUHAMMADIYAH 3 WELERI
                  </div>
                  <div className="text-[5.5px] leading-tight text-emerald-100">
                    Jl. Bahari No. 345 Weleri, Kab. Kendal
                  </div>
                </div>
              </div>

              {/* Title Badge */}
              <div className="border-b border-emerald-100 bg-emerald-50 px-2 py-1 text-center">
                <div className="text-[7px] font-black uppercase tracking-wide text-emerald-900">
                  Kartu Tanda Pelajar
                </div>
                <div className="text-[6px] font-bold text-emerald-700">
                  Presensi Gerbang • Berlaku S/D Lulus
                </div>
              </div>

              {/* Photo and Student Identity */}
              <div className="flex items-center gap-2 px-2 pt-2">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-[22mm] w-[17mm] items-center justify-center overflow-hidden rounded border border-emerald-600 bg-slate-100">
                    {st.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={st.photoUrl}
                        alt={st.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-7 w-7 text-slate-400" />
                    )}
                  </div>
                  <span className="mt-0.5 text-[5.5px] font-bold text-slate-500">
                    {st.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1 text-[7px] leading-tight">
                  <div>
                    <span className="block text-[5.5px] font-semibold uppercase text-slate-400">
                      Nama Lengkap
                    </span>
                    <span className="block break-words font-black text-slate-900">
                      {st.name}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[5.5px] font-semibold uppercase text-slate-400">
                      NISN
                    </span>
                    <span className="block font-mono font-black">
                      {st.nisn}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[5.5px] font-semibold uppercase text-slate-400">
                      Kelas / Kompetensi
                    </span>
                    <span className="block break-words font-bold text-emerald-800">
                      {st.className} • {st.major}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[5.5px] font-semibold uppercase text-slate-400">
                      WA Orang Tua / Wali
                    </span>
                    <span className="block break-all font-mono text-slate-700">
                      {st.parentPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-1 flex-col items-center justify-center px-2 py-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                  <div className="rounded bg-white p-1">
                    <QRCodeSVG
                      id={`qr-code-svg-${st.id}`}
                      value={st.qrToken}
                      size={96}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                </div>
                <span className="mt-1 break-all text-center font-mono text-[6px] font-bold text-slate-600">
                  {st.qrToken}
                </span>
                <span className="text-[6px] font-bold text-emerald-700">
                  Scan Gerbang
                </span>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-gradient-to-r from-slate-100 to-emerald-50 px-2 py-1 text-center text-[5.5px] text-slate-600">
                SMK Muga 3 Weleri • Presensi Digital
              </div>
            </div>
          ))}
        </div>

        {/* Modal Bottom Note */}
        <div className="no-print border-t border-slate-700 bg-slate-800 px-6 py-3 text-center text-xs text-slate-400">
          Gunakan kertas PVC Card atau kertas foto tebal saat mencetak.
          QR Code dapat langsung dipindai pada kamera gerbang.
        </div>
      </div>
    </div>
  );
};
