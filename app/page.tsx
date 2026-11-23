'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AttendanceDashboard } from '../components/dashboard/AttendanceDashboard';
import { StudentManagement } from '../components/students/StudentManagement';
import { SettingsView } from '../components/settings/SettingsView';
import { apiService } from '../src/services/apiService';
import { Minimize2 } from 'lucide-react';

const GateScanner = dynamic(
  () => import('../components/scanner/GateScanner').then((m) => m.GateScanner),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-600">Menyiapkan Lensa Kamera Pemindai Gerbang...</p>
      </div>
    ),
  }
);

export default function HomePage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scanner' | 'dashboard' | 'students' | 'settings'>('scanner');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isKiosk, setIsKiosk] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<{ todayScansCount: number; totalStudents: number }>({
    todayScansCount: 0,
    totalStudents: 1500,
  });

  const loadStats = useCallback(async () => {
    try {
      const summary = await apiService.getDashboardSummary();
      setStats({
        todayScansCount: summary.presentOnTime + summary.presentLate + summary.checkedOut,
        totalStudents: summary.totalStudents || 1500,
      });
    } catch (e) {
      console.warn('Failed to load stats', e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadStats();
  }, [loadStats]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input or textarea, ignore
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'F11' || (e.key === 'f' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setIsKiosk((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundEnabled((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        highContrast ? 'bg-black text-yellow-300' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        highContrast={highContrast}
        onToggleContrast={() => setHighContrast((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        isKiosk={isKiosk}
        onToggleKiosk={() => setIsKiosk((prev) => !prev)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        activeTab={activeTab}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex w-full">
        {/* Sidebar Navigation (Hidden if in full Kiosk mode) */}
        {!isKiosk && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            highContrast={highContrast}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            stats={stats}
          />
        )}

        {/* Content Area */}
        <main
          className={`flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all ${
            isKiosk ? 'p-2 sm:p-4' : ''
          }`}
        >
          {/* Floating Exit Kiosk button if in Kiosk Mode */}
          {isKiosk && (
            <div className="mb-3 flex items-center justify-between bg-emerald-950 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/40">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Mode Kiosk Gerbang Aktif (Layar Penuh Pemindaian Cepat)
              </span>
              <button
                type="button"
                onClick={() => setIsKiosk(false)}
                className="px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Keluar Kiosk</span>
              </button>
            </div>
          )}

          {!mounted ? (
            <div className="p-8 sm:p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80 shadow-sm animate-pulse max-w-2xl mx-auto my-8">
              <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-700">Memuat Sistem Presensi Siswa...</p>
              <p className="text-xs text-slate-400 mt-1">SMK Muhammadiyah 3 Weleri • Presensi QR & WhatsApp Gateway</p>
            </div>
          ) : (
            <>
              {activeTab === 'scanner' && (
                <GateScanner
                  highContrast={highContrast}
                  soundEnabled={soundEnabled}
                  isKiosk={isKiosk}
                  onToggleKiosk={() => setIsKiosk((prev) => !prev)}
                  onAttendanceUpdated={loadStats}
                />
              )}

              {activeTab === 'dashboard' && (
                <AttendanceDashboard
                  highContrast={highContrast}
                  onRefreshNeeded={loadStats}
                />
              )}

              {activeTab === 'students' && (
                <StudentManagement highContrast={highContrast} />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  highContrast={highContrast}
                  onSettingsSaved={loadStats}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
