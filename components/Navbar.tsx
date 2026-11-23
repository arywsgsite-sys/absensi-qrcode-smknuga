'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Menu,
  X,
  Wifi,
  ShieldCheck,
} from 'lucide-react';
import { SchoolLogo } from './common/SchoolLogo';

interface NavbarProps {
  highContrast: boolean;
  onToggleContrast: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isKiosk: boolean;
  onToggleKiosk: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  highContrast,
  onToggleContrast,
  soundEnabled,
  onToggleSound,
  isKiosk,
  onToggleKiosk,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        highContrast
          ? 'bg-black text-yellow-300 border-yellow-400'
          : 'bg-slate-900 text-white border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: School Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              <SchoolLogo size={42} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1
                    className={`font-black tracking-tight text-sm sm:text-base md:text-lg leading-tight ${
                      highContrast ? 'text-yellow-300' : 'text-white'
                    }`}
                  >
                    SMK MUHAMMADIYAH 3 WELERI
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" /> GATE SYSTEM
                  </span>
                </div>
                <p
                  className={`text-[11px] sm:text-xs font-medium truncate ${
                    highContrast ? 'text-yellow-200' : 'text-slate-400'
                  }`}
                >
                  Presensi QR Code 1.500 Siswa & WA Gateway Otomatis
                </p>
              </div>
            </div>
          </div>

          {/* Middle: Live Digital Clock (WIB) */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-inner">
            <Clock
              className={`w-4 h-4 ${highContrast ? 'text-yellow-400 animate-pulse' : 'text-emerald-400 animate-pulse'}`}
            />
            <div className="flex flex-col text-right">
              <span
                className={`text-sm font-mono font-black tracking-wider leading-none ${
                  highContrast ? 'text-yellow-300' : 'text-white'
                }`}
              >
                {timeStr || '00:00:00 WIB'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {dateStr || 'Memuat waktu...'}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Gateway indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Gerbang Siap</span>
            </div>

            {/* Outdoor High Contrast Toggle */}
            <button
              type="button"
              onClick={onToggleContrast}
              title={
                highContrast
                  ? 'Kembali ke Tampilan Normal'
                  : 'Mode Kontras Tinggi (Cocok untuk Layar Luar Ruangan/Gerbang)'
              }
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {highContrast ? 'Kontras Aktif' : 'Mode Terik'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
              className={`p-2 rounded-lg transition-colors border ${
                soundEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700'
                  : 'bg-slate-800/50 text-slate-500 border-slate-800 line-through'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Kiosk Fullscreen Toggle */}
            <button
              type="button"
              onClick={onToggleKiosk}
              title={isKiosk ? 'Keluar Mode Kiosk' : 'Masuk Mode Kiosk (Layar Penuh Gerbang)'}
              className={`p-2 rounded-lg transition-all border ${
                isKiosk
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              {isKiosk ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
