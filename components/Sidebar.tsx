'use client';

import React from 'react';
import {
  QrCode,
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'scanner' | 'dashboard' | 'students' | 'settings';
  setActiveTab: (tab: 'scanner' | 'dashboard' | 'students' | 'settings') => void;
  highContrast: boolean;
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    todayScansCount?: number;
    totalStudents?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  highContrast,
  isOpen,
  onClose,
  stats,
}) => {
  const menuItems = [
    {
      id: 'scanner' as const,
      label: 'Scanner Gerbang',
      sublabel: 'Mode Kiosk / Pemindaian QR',
      icon: QrCode,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
    },
    {
      id: 'dashboard' as const,
      label: 'Dashboard & Monitoring',
      sublabel: 'Statistik & Log Kehadiran Real-time',
      icon: LayoutDashboard,
      badge: stats?.todayScansCount ? `${stats.todayScansCount} Scan` : undefined,
      badgeColor: 'bg-blue-100 text-blue-700 font-bold',
    },
    {
      id: 'students' as const,
      label: 'Data Siswa & Kartu QR',
      sublabel: '1.500 Siswa, Impor & Cetak Kartu',
      icon: Users,
      badge: stats?.totalStudents ? `${stats.totalStudents}` : '1.500',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'settings' as const,
      label: 'Pengaturan Jam & WA',
      sublabel: 'Jam Masuk & Template Notifikasi',
      icon: Settings,
    },
  ];

  const handleSelect = (id: 'scanner' | 'dashboard' | 'students' | 'settings') => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 sm:top-18 z-35 h-[calc(100vh-4rem)] sm:h-[calc(100vh-4.5rem)] w-72 flex-shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          highContrast
            ? 'bg-black text-yellow-300 border-r-2 border-yellow-400'
            : 'bg-white text-slate-700 border-r border-slate-200'
        } flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Quick Gate Mode Indicator Card */}
          <div
            className={`p-3.5 rounded-xl border ${
              highContrast
                ? 'bg-yellow-950/40 border-yellow-400 text-yellow-300'
                : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Gerbang Masuk Siap
              </span>
              <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                WIB
              </span>
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              Pemindaian QR berkecepatan tinggi dengan validasi anti-duplikasi 5 menit.
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu Utama Presensi
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group ${
                    isActive
                      ? highContrast
                        ? 'bg-yellow-400 text-black font-black shadow-md'
                        : 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-700/20'
                      : highContrast
                      ? 'text-yellow-300 hover:bg-yellow-950/40'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? highContrast
                            ? 'bg-black text-yellow-300'
                            : 'bg-white/20 text-white'
                          : highContrast
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-emerald-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm leading-snug truncate">{item.label}</div>
                      <div
                        className={`text-[11px] truncate ${
                          isActive
                            ? highContrast
                              ? 'text-black/80'
                              : 'text-emerald-100'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight whitespace-nowrap ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info: School & WA Gateway */}
        <div
          className={`p-4 border-t ${
            highContrast ? 'border-yellow-400/40 text-yellow-300' : 'border-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Gateway
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              AKTIF
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Notifikasi otomatis terkirim langsung ke nomor WA Orang Tua siswa saat scan.
          </p>
        </div>
      </aside>
    </>
  );
};
