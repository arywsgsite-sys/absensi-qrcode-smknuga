import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
        <h2 className="text-3xl font-black text-slate-900">404</h2>
        <h3 className="text-base font-bold text-slate-700 mt-1">Halaman Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
          Halaman yang Anda tuju tidak ditemukan pada sistem Presensi SMK Muhammadiyah 3 Weleri.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
        >
          Kembali ke Halaman Scanner
        </Link>
      </div>
    </div>
  );
}
