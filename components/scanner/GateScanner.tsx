'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  QrCode,
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  User,
  Zap,
  RotateCw,
  Keyboard,
  Upload,
} from 'lucide-react';
import { apiService } from '../../src/services/apiService';
import { playAudioFeedback } from '../../src/utils/audio';
import { ScanResult, AttendanceRecord, Student } from '../../src/types';
import { ScanSuccessModal } from './ScanSuccessModal';

interface GateScannerProps {
  highContrast: boolean;
  soundEnabled: boolean;
  isKiosk: boolean;
  onToggleKiosk: () => void;
  onAttendanceUpdated?: () => void;
}

export const GateScanner: React.FC<GateScannerProps> = ({
  highContrast,
  soundEnabled,
  isKiosk,
  onToggleKiosk,
  onAttendanceUpdated,
}) => {
  const [gateMode, setGateMode] = useState<'MASUK' | 'PULANG'>('MASUK');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);
  const [sampleStudents, setSampleStudents] = useState<Student[]>([]);

  const html5QrCodeRef = useRef<any>(null);
  const qrRegionId = 'qr-reader-gate-canvas';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  // Load recent scans and sample students for test buttons
  const loadRecentData = useCallback(async () => {
    try {
      const scans = await apiService.getRecentScans(10);
      setRecentScans(scans);
      const res = await apiService.getStudents({ limit: 8 });
      setSampleStudents(res.students);
    } catch (e) {
      console.error('Failed to load recent data', e);
    }
  }, []);

  useEffect(() => {
    loadRecentData();
  }, [loadRecentData]);

  // Handle Scan processing
  const handleScanSubmit = useCallback(
    async (token: string) => {
      if (!token || isProcessing) return;
      setIsProcessing(true);

      try {
        const result = await apiService.submitScan(token, {
          forceMode: gateMode,
        });

        setLastScanResult(result);

        if (soundEnabled) {
          if (result.code === 'ALREADY_SCANNED') {
            playAudioFeedback.cooldownWarning();
          } else if (result.success) {
            if (result.record?.status === 'HADIR_TEPAT_WAKTU') {
              playAudioFeedback.success();
            } else if (result.record?.status === 'TERLAMBAT') {
              playAudioFeedback.late();
            } else if (result.record?.status === 'PULANG') {
              playAudioFeedback.checkOut();
            }
          } else {
            playAudioFeedback.cooldownWarning();
          }
        }

        // Refresh recent scans list and dashboard
        await loadRecentData();
        if (onAttendanceUpdated) onAttendanceUpdated();
      } catch (err: unknown) {
        console.error('Scan error:', err);
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          // Refocus barcode input for hardware scanner gun
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 800);
      }
    },
    [gateMode, isProcessing, soundEnabled, loadRecentData, onAttendanceUpdated]
  );

  // Initialize Cameras
  const startCamera = async (cameraIdToUse?: string) => {
    try {
      setCameraError(null);

      // Clean up previous instance
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch (e) {
          console.warn('Error clearing previous scanner instance:', e);
        }
      }

      const { Html5Qrcode } = await import('html5-qrcode');
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setCameraError('Tidak ada kamera yang terdeteksi pada perangkat ini.');
        setCameraActive(false);
        return;
      }

      setAvailableCameras(devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id.slice(0, 5)}` })));

      const targetCameraId = cameraIdToUse || selectedCameraId || devices[0].id;
      setSelectedCameraId(targetCameraId);

      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        targetCameraId,
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          handleScanSubmit(decodedText);
        },
        () => {
          // Frame without QR, silent
        }
      );

      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera start error (expected if iframe restricts camera permission):', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(
        `Kamera tidak dapat diakses (${errMsg.slice(0, 70)}...). Gunakan simulasi scan cepat atau scan manual barcode di bawah ini.`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    setCameraActive(false);
  };

  // Switch camera
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    if (cameraActive) {
      startCamera(newId);
    }
  };

  // Upload QR code image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-temp-file-reader');
      const decoded = await html5QrCode.scanFile(file, true);
      handleScanSubmit(decoded);
    } catch (err) {
      alert('QR Code tidak terdeteksi pada gambar yang diunggah. Mohon gunakan gambar QR yang lebih jelas.');
    }
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Hidden file scanner container */}
      <div id="qr-temp-file-reader" className="hidden" />

      {/* Instant Scan Success / Cooldown Modal */}
      <ScanSuccessModal
        scanResult={lastScanResult}
        onClose={() => setLastScanResult(null)}
        highContrast={highContrast}
      />

      {/* Top Banner & Mode Toggle */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
          highContrast
            ? 'bg-black text-yellow-300 border-yellow-400'
            : 'bg-white text-slate-800 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-700/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>SCANNER GERBANG SEKOLAH</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                1.500 SISWA
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              SMK Muhammadiyah 3 Weleri • Pos Satpam / Piket Gerbang Utama
            </p>
          </div>
        </div>

        {/* Gate Mode Select (Pagi: Masuk vs Sore: Pulang) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Modus Presensi:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setGateMode('MASUK')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                gateMode === 'MASUK'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☀️ Gerbang Masuk (Pagi)
            </button>
            <button
              type="button"
              onClick={() => setGateMode('PULANG')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                gateMode === 'PULANG'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏠 Gerbang Pulang (Siang)
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleKiosk}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isKiosk
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Layar Penuh Kiosk Gerbang"
          >
            {isKiosk ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden lg:inline">{isKiosk ? 'Keluar Kiosk' : 'Layar Penuh'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Scanner Area, Right is Recent 10 Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: QR Camera Feed & Fast Input (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* QR Camera Box */}
          <div
            className={`rounded-2xl border overflow-hidden shadow-md ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-sm tracking-tight text-slate-800">
                  Lensa Pemindai Kamera Gerbang
                </span>
              </div>
              <div className="flex items-center gap-2">
                {availableCameras.length > 1 && (
                  <select
                    value={selectedCameraId}
                    onChange={handleCameraChange}
                    className="text-xs bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                  >
                    {availableCameras.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}

                {cameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold"
                  >
                    <CameraOff className="w-3.5 h-3.5" /> Matikan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" /> Aktifkan Kamera
                  </button>
                )}
              </div>
            </div>

            {/* Viewfinder Canvas Area */}
            <div className="relative min-h-[340px] bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
              {/* HTML5 QR Container */}
              <div
                id={qrRegionId}
                className={`w-full max-w-sm mx-auto overflow-hidden rounded-xl ${
                  cameraActive ? 'block' : 'hidden'
                }`}
              />

              {/* Inactive or Error State Placeholder */}
              {!cameraActive && (
                <div className="max-w-md p-6 space-y-4 text-slate-300">
                  <div className="relative w-24 h-24 mx-auto rounded-2xl border-2 border-dashed border-emerald-400/50 flex items-center justify-center bg-emerald-950/40">
                    <QrCode className="w-12 h-12 text-emerald-400 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl animate-ping opacity-25" />
                  </div>

                  <div>
                    <h3 className="text-white font-black text-base sm:text-lg">
                      Kamera Gerbang Siap Digunakan
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Klik tombol &ldquo;Aktifkan Kamera&rdquo; untuk membaca kartu QR siswa secara langsung, atau gunakan tombol simulasi instan / barcode scanner fisik di bawah.
                    </p>
                  </div>

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs text-left flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
                    >
                      <Camera className="w-4 h-4" /> Buka Kamera Gerbang
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> Unggah Gambar QR
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Scanning Overlay Grid Lines if camera is active */}
              {cameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-emerald-400 rounded-2xl relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Anti-Double Scan Status Banner */}
            <div className="px-4 py-2.5 bg-slate-900 text-slate-300 text-xs flex items-center justify-between border-t border-slate-800">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Anti-Double Scan Cooldown: <strong className="text-white">5 Menit Aktif</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Pencegahan scan berulang pada siswa yang sama
              </span>
            </div>
          </div>

          {/* Barcode Scanner Gun / Direct Manual Token Input */}
          <div
            className={`p-4 rounded-2xl border shadow-sm ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="barcode-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
              >
                <Keyboard className="w-4 h-4 text-emerald-600" />
                Input Manual / Scanner Barcode USB
              </label>
              <span className="text-[10px] text-slate-400">
                Tekan <strong>Enter</strong> untuk proses instan
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualTokenInput.trim()) {
                  handleScanSubmit(manualTokenInput.trim());
                  setManualTokenInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                id="barcode-input"
                ref={barcodeInputRef}
                type="text"
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                placeholder="Contoh: M3W-0067482910 atau ketikkan NISN..."
                className="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isProcessing || !manualTokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </form>
          </div>

          {/* Quick Simulation Buttons for Easy Testing in Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Tombol Uji Coba Presensi Cepat (Klik untuk Simulasi):
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                Siap Tes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleStudents.slice(0, 4).map((st, idx) => {
                const label =
                  idx === 0
                    ? 'Scan Tepat Waktu (Farhan - TKJ)'
                    : idx === 1
                    ? 'Scan Siswa Putri (Aisyah - AKL)'
                    : idx === 2
                    ? 'Scan Siswa TKR (Dimas - XI TKR)'
                    : 'Scan Siswa MPLB (Nabila - X MPLB)';
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleScanSubmit(st.qrToken)}
                    className="p-2.5 text-left rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-800 shadow-sm transition-all flex items-center justify-between group"
                  >
                    <div className="truncate">
                      <div className="text-slate-900 group-hover:text-emerald-700 truncate">
                        {label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.qrToken} ({st.className})
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono ml-2 group-hover:bg-emerald-600 group-hover:text-white">
                      Scan
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Test Double Scan Button (Trigger 5-minute cooldown) */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (sampleStudents[0]) {
                    handleScanSubmit(sampleStudents[0].qrToken);
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold border border-amber-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Uji Anti-Double Scan: Klik 2x Berturut-turut untuk Cek Cooldown</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Log 10 Scan Terakhir (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`rounded-2xl border shadow-md overflow-hidden ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400'
                : 'bg-white text-slate-800 border-slate-200'
            }`}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm tracking-tight text-slate-800">
                  10 Scan Terakhir di Gerbang
                </h3>
              </div>
              <button
                type="button"
                onClick={loadRecentData}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                title="Muat Ulang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recent Scans List */}
            <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
              {recentScans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada presensi yang tercatat hari ini di gerbang.
                </div>
              ) : (
                recentScans.map((r) => {
                  let badge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  let statusTxt = 'HADIR TEPAT WAKTU';
                  if (r.status === 'TERLAMBAT') {
                    badge = 'bg-amber-100 text-amber-800 border-amber-300';
                    statusTxt = `TELAT ${r.minutesLate}m`;
                  } else if (r.status === 'PULANG') {
                    badge = 'bg-sky-100 text-sky-800 border-sky-300';
                    statusTxt = 'PULANG';
                  } else if (r.status === 'IZIN') {
                    badge = 'bg-purple-100 text-purple-800 border-purple-300';
                    statusTxt = 'IZIN';
                  }

                  return (
                    <div
                      key={r.id}
                      className="p-3 sm:p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300 flex items-center justify-center">
                          {r.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.photoUrl}
                              alt={r.studentName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate">
                            {r.studentName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">{r.className}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">{r.time} WIB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badge}`}
                        >
                          {statusTxt}
                        </span>

                        <span
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold"
                          title="WhatsApp Terkirim"
                        >
                          <Send className="w-2.5 h-2.5" /> WA Terkirim
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
