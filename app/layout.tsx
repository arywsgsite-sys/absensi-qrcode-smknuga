import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Presensi Siswa QR & Notifikasi WhatsApp - SMK Muhammadiyah 3 Weleri',
  description: 'Sistem Presensi Siswa Berbasis QR Code & Notifikasi WhatsApp Real-time untuk SMK Muhammadiyah 3 Weleri, mendukung 1.500 siswa dengan pemindaian cepat di gerbang sekolah.',
  openGraph: {
    title: 'Presensi Siswa QR - SMK Muhammadiyah 3 Weleri',
    description: 'Sistem presensi cepat berbasis QR Code dengan notifikasi otomatis ke WhatsApp orang tua siswa.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Presensi Siswa QR - SMK Muhammadiyah 3 Weleri',
    description: 'Sistem presensi cepat berbasis QR Code dengan notifikasi otomatis ke WhatsApp orang tua siswa.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
