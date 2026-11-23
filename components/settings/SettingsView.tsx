'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  Save,
  Check,
  Smartphone,
  Sparkles,
  HelpCircle,
  Radio,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { apiService, formatWhatsAppMessage } from '../../src/services/apiService';
import { SchoolSettings, WhatsAppTemplateConfig } from '../../src/types';

interface SettingsViewProps {
  highContrast: boolean;
  onSettingsSaved?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ highContrast, onSettingsSaved }) => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Template active tab
  const [activeTemplateTab, setActiveTemplateTab] = useState<keyof WhatsAppTemplateConfig>('onTime');

  // Form State
  const [checkInLimitTime, setCheckInLimitTime] = useState<string>('07:00');
  const [lateMaxTime, setLateMaxTime] = useState<string>('07:30');
  const [checkOutStartTime, setCheckOutStartTime] = useState<string>('14:30');
  const [cooldownMinutes, setCooldownMinutes] = useState<number>(5);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(true);
  const [whatsappProvider, setWhatsappProvider] = useState<'fonnte' | 'wablas' | 'custom_webhook' | 'mock'>('fonnte');
  const [whatsappApiEndpoint, setWhatsappApiEndpoint] = useState<string>('https://api.fonnte.com/send');
  const [whatsappSenderNumber, setWhatsappSenderNumber] = useState<string>('081229384000');
  const [templates, setTemplates] = useState<WhatsAppTemplateConfig>({
    onTime: '',
    late: '',
    checkOut: '',
    permit: '',
    sick: '',
  });

  // Test send input
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('081234567890');
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getSettings();
        setSettings(data);
        setCheckInLimitTime(data.checkInLimitTime || '07:00');
        setLateMaxTime(data.lateMaxTime || '07:30');
        setCheckOutStartTime(data.checkOutStartTime || '14:30');
        setCooldownMinutes(data.cooldownMinutes || 5);
        setAutoSendWhatsApp(data.autoSendWhatsApp ?? true);
        setWhatsappProvider(data.whatsappProvider || 'fonnte');
        setWhatsappApiEndpoint(data.whatsappApiEndpoint || 'https://api.fonnte.com/send');
        setWhatsappSenderNumber(data.whatsappSenderNumber || '081229384000');
        setTemplates(data.templates);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await apiService.updateSettings({
        checkInLimitTime,
        lateMaxTime,
        checkOutStartTime,
        cooldownMinutes,
        autoSendWhatsApp,
        whatsappProvider,
        whatsappApiEndpoint,
        whatsappSenderNumber,
        templates,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      if (onSettingsSaved) onSettingsSaved();
    } catch (e) {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInsertTag = (tag: string) => {
    setTemplates((prev) => ({
      ...prev,
      [activeTemplateTab]: prev[activeTemplateTab] + tag,
    }));
  };

  const handleTestSend = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  // Live preview formatting
  const currentTemplateText = templates[activeTemplateTab] || '';
  const previewFormattedText = formatWhatsAppMessage(currentTemplateText, {
    studentName: 'Muhammad Farhan Al-Ghifari',
    nisn: '0067482910',
    className: 'X TKJ 1',
    time: '06:45:12',
    status:
      activeTemplateTab === 'onTime'
        ? 'HADIR TEPAT WAKTU'
        : activeTemplateTab === 'late'
        ? 'TERLAMBAT (15 menit)'
        : activeTemplateTab === 'checkOut'
        ? 'PULANG'
        : activeTemplateTab === 'permit'
        ? 'IZIN'
        : 'SAKIT',
    notes: activeTemplateTab === 'late' ? 'Terlambat 15 menit' : 'Kegiatan Belajar Mengajar',
    schoolName: settings?.schoolName || 'SMK Muhammadiyah 3 Weleri',
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>PENGATURAN JAM & TEMPLATE PESAN WHATSAPP</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              GATE CONFIG
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Atur batas toleransi kedisiplinan gerbang sekolah dan pesan otomatis ke orang tua
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-md transition-all flex items-center gap-2"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Pengaturan Tersimpan!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-700" />
          <span>Pengaturan jam operasional sekolah dan template WhatsApp berhasil diperbarui!</span>
        </div>
      )}

      {/* Main Grid: Left is Settings Forms, Right is WhatsApp Phone Live Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Jam & Template Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Jam Operasional Gerbang Sekolah */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  1. Jam Operasional & Batas Kedisiplinan Gerbang
                </h3>
                <p className="text-xs text-slate-400">
                  Waktu acuan status presensi siswa saat pemindaian QR di gerbang
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Jam Masuk / Toleransi Tepat Waktu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Batas Masuk:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={checkInLimitTime}
                    onChange={(e) => setCheckInLimitTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  ≤ {checkInLimitTime} : Hadir Tepat Waktu
                </span>
              </div>

              {/* Batas Akhir Scan Masuk / Terlambat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batas Akhir Terlambat:
                </label>
                <input
                  type="time"
                  value={lateMaxTime}
                  onChange={(e) => setLateMaxTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                  &gt; {checkInLimitTime} : Terlambat
                </span>
              </div>

              {/* Jam Mulai Kepulangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Mulai Pulang:
                </label>
                <input
                  type="time"
                  value={checkOutStartTime}
                  onChange={(e) => setCheckOutStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-sky-700 font-semibold block mt-1">
                  ≥ {checkOutStartTime} : Status Pulang
                </span>
              </div>
            </div>

            {/* Anti-Double Scan Cooldown Form */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Anti-Double Scan Cooldown (Mencegah Scan Ulang):
                </span>
                <span className="text-slate-400 text-[11px]">
                  Durasi jeda wajib sebelum kartu QR siswa yang sama dapat dipindai lagi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 text-xs font-bold font-mono rounded-lg bg-slate-50 border border-slate-300 text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700">Menit</span>
              </div>
            </div>
          </div>

          {/* Section 2: Editor Template Pesan WhatsApp */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  2. Editor Template Pesan WhatsApp Dinamis
                </h3>
                <p className="text-xs text-slate-400">
                  Sesuaikan kata-kata pesan otomatis untuk tiap skenario kehadiran
                </p>
              </div>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              {[
                { id: 'onTime' as const, label: 'Tepat Waktu' },
                { id: 'late' as const, label: 'Terlambat' },
                { id: 'checkOut' as const, label: 'Pulang' },
                { id: 'permit' as const, label: 'Izin' },
                { id: 'sick' as const, label: 'Sakit' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTemplateTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTemplateTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dynamic Placeholder Insertion Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Klik variabel untuk menambahkan ke template:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{nama_siswa}', label: 'Nama Siswa' },
                  { tag: '{nisn}', label: 'NISN' },
                  { tag: '{kelas}', label: 'Kelas' },
                  { tag: '{waktu}', label: 'Waktu' },
                  { tag: '{status}', label: 'Status' },
                  { tag: '{keterangan}', label: 'Keterangan' },
                  { tag: '{nama_sekolah}', label: 'Nama Sekolah' },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                  >
                    <span>+ {item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Template Editor */}
            <div>
              <textarea
                value={templates[activeTemplateTab] || ''}
                onChange={(e) =>
                  setTemplates((prev) => ({
                    ...prev,
                    [activeTemplateTab]: e.target.value,
                  }))
                }
                rows={9}
                className="w-full p-3.5 text-xs sm:text-sm font-sans rounded-xl bg-slate-50 border border-slate-300 text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 whitespace-pre-wrap"
                placeholder="Tuliskan format template pesan WhatsApp..."
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Mendukung formatting standar WhatsApp (*tebal*, _miring_, ~coret~).
              </span>
            </div>
          </div>

          {/* Section 3: WhatsApp Gateway Connection Settings */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  3. Integrasi WhatsApp Gateway Provider
                </h3>
                <p className="text-xs text-slate-400">
                  Koneksi server penyedia layanan WhatsApp blast (Fonnte, Wablas, Custom API)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Penyedia Gateway:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'fonnte', label: 'Fonnte (Populer)' },
                    { id: 'wablas', label: 'Wablas' },
                    { id: 'custom_webhook', label: 'Custom Webhook' },
                    { id: 'mock', label: 'Simulasi Lokal' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setWhatsappProvider(p.id as typeof whatsappProvider)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        whatsappProvider === p.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    API Endpoint:
                  </label>
                  <input
                    type="text"
                    value={whatsappApiEndpoint}
                    onChange={(e) => setWhatsappApiEndpoint(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Pengirim / Sender:
                  </label>
                  <input
                    type="text"
                    value={whatsappSenderNumber}
                    onChange={(e) => setWhatsappSenderNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Automatic Dispatch Toggle */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Kirim Otomatis Saat Scan di Gerbang:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Kirim langsung begitu kartu QR siswa berhasil diverifikasi oleh kamera
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSendWhatsApp}
                  onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Smartphone WhatsApp Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="rounded-3xl border border-slate-300 bg-slate-900 shadow-2xl p-4 sm:p-5 text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h4 className="font-extrabold text-xs sm:text-sm tracking-tight text-white">
                  Pratinjau Layar WhatsApp Orang Tua
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-500/40">
                LIVE PREVIEW
              </span>
            </div>

            {/* Smartphone Mockup Body */}
            <div className="relative rounded-2xl overflow-hidden border-4 border-slate-700 shadow-inner bg-[#efeae2] text-slate-900">
              {/* WhatsApp App Header */}
              <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 border border-white/20">
                    M3
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs block leading-tight truncate">
                      SMK Muhammadiyah 3 Weleri
                    </span>
                    <span className="text-[9px] text-emerald-200 block">
                      Official Attendance Gateway
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>

              {/* Chat Wallpaper & Bubble Container */}
              <div className="p-3.5 min-h-[380px] max-h-[460px] overflow-y-auto flex flex-col justify-end space-y-3">
                {/* Date stamp pill */}
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/80 text-[10px] font-semibold text-slate-600 shadow-sm">
                    Hari ini
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="self-start max-w-[92%] bg-white rounded-lg rounded-tl-none p-3 shadow text-xs text-slate-800 space-y-2 border border-slate-200">
                  <div className="text-[11px] font-sans whitespace-pre-wrap leading-relaxed">
                    {previewFormattedText}
                  </div>

                  {/* Delivery time & double checkmark */}
                  <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-medium pt-1">
                    <span>06:45 WIB</span>
                    <span className="text-emerald-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Fake WhatsApp Message Bar */}
              <div className="p-2 bg-[#f0f2f5] border-t border-slate-200 flex items-center gap-2 text-slate-400 text-xs">
                <span className="flex-1 bg-white px-3 py-1.5 rounded-full border border-slate-300 text-[11px] text-slate-400">
                  Pesan terkirim secara otomatis...
                </span>
                <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Test Send Simulation */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">
                Kirim Simulasi Uji Coba:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="Nomor WhatsApp..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestSend}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tes</span>
                </button>
              </div>

              {testSent && (
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Simulasi notifikasi WA terkirim ke {testPhoneNumber}!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
