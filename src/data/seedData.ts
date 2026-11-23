import { Student, SchoolSettings, AttendanceRecord } from '../types';

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: 'SMK Muhammadiyah 3 Weleri',
  schoolNPSN: '20321855',
  schoolAddress: 'Jl. Bahari No. 345 Weleri, Kec. Weleri, Kab. Kendal, Jawa Tengah 51355',
  schoolPhone: '(0294) 641889',
  principalName: 'H. Bambang Prasetyo, S.Pd., M.M.',
  gateOpenTime: '06:15',
  checkInLimitTime: '07:00', // Toleransi tepat waktu
  lateMaxTime: '07:30', // Batas akhir scan masuk
  checkOutStartTime: '14:30', // Jam mulai kepulangan
  checkOutEndTime: '17:00',
  cooldownMinutes: 5, // 5 menit anti double-scan
  activeDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
  soundEnabled: true,
  highContrastMode: false,
  whatsappProvider: 'fonnte',
  whatsappApiEndpoint: 'https://api.fonnte.com/send',
  whatsappApiKeyMasked: 'FN-MUGA3-••••••••••••789A',
  whatsappSenderNumber: '081229384000',
  autoSendWhatsApp: true,
  templates: {
    onTime: `Assalamu'alaikum Wr. Wb.
Bapak/Ibu Orang Tua/Wali Siswa, diberitahukan bahwa:
Nama: {nama_siswa}
NISN: {nisn}
Kelas: {kelas}
Telah tiba dan melakukan presensi di gerbang {nama_sekolah} pada pukul {waktu} WIB.
Status: *HADIR TEPAT WAKTU* ✅

Terima kasih atas kedisiplinan Ananda.
Wassalamu'alaikum Wr. Wb.`,

    late: `Assalamu'alaikum Wr. Wb.
Bapak/Ibu Orang Tua/Wali Siswa, kami informasikan bahwa:
Nama: {nama_siswa}
NISN: {nisn}
Kelas: {kelas}
Telah melakukan presensi di gerbang {nama_sekolah} pada pukul {waktu} WIB.
Status: *TERLAMBAT ({keterangan})* ⚠️

Mohon bantuannya untuk terus membimbing kedisiplinan waktu keberangkatan Ananda di rumah.
Wassalamu'alaikum Wr. Wb.`,

    checkOut: `Assalamu'alaikum Wr. Wb.
Bapak/Ibu Orang Tua/Wali Siswa, kami sampaikan bahwa:
Nama: {nama_siswa}
NISN: {nisn}
Kelas: {kelas}
Telah menyelesaikan Kegiatan Belajar Mengajar (KBM) dan melakukan presensi *PULANG* pada pukul {waktu} WIB di {nama_sekolah} 🏠

Semoga selamat sampai di rumah.
Wassalamu'alaikum Wr. Wb.`,

    permit: `Assalamu'alaikum Wr. Wb.
Pemberitahuan presensi {nama_sekolah}:
Nama: {nama_siswa}
Kelas: {kelas}
Tercatat *IZIN* pada hari ini dengan keterangan: "{keterangan}".
Terima kasih atas konfirmasinya.
Wassalamu'alaikum Wr. Wb.`,

    sick: `Assalamu'alaikum Wr. Wb.
Pemberitahuan presensi {nama_sekolah}:
Nama: {nama_siswa}
Kelas: {kelas}
Tercatat *SAKIT* pada hari ini. Semoga Ananda lekas sembuh dan dapat beraktivitas kembali di {nama_sekolah}. Aamiin.
Wassalamu'alaikum Wr. Wb.`,
  },
};

export const MAJORS = [
  { code: 'TKJ', name: 'Teknik Komputer & Jaringan' },
  { code: 'TKR', name: 'Teknik Kendaraan Ringan Otomotif' },
  { code: 'AKL', name: 'Akuntansi & Keuangan Lembaga' },
  { code: 'MPLB', name: 'Manajemen Perkantoran & Layanan Bisnis' },
  { code: 'TBSM', name: 'Teknik & Bisnis Sepeda Motor' },
];

export const CLASSES = [
  'X TKJ 1', 'X TKJ 2', 'X TKR 1', 'X TKR 2', 'X AKL 1', 'X MPLB 1', 'X TBSM 1',
  'XI TKJ 1', 'XI TKJ 2', 'XI TKR 1', 'XI TKR 2', 'XI AKL 1', 'XI MPLB 1', 'XI TBSM 1',
  'XII TKJ 1', 'XII TKJ 2', 'XII TKR 1', 'XII TKR 2', 'XII AKL 1', 'XII MPLB 1', 'XII TBSM 1',
];

// Indonesian student photo avatars
const STUDENT_AVATARS_BOYS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces&q=80',
];

const STUDENT_AVATARS_GIRLS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces&q=80',
];

// 40+ curated realistic students representing SMK Muhammadiyah 3 Weleri
export const INITIAL_STUDENTS_SAMPLE: Student[] = [
  {
    id: 'std-0001',
    nisn: '0067482910',
    name: 'Muhammad Farhan Al-Ghifari',
    gender: 'L',
    classGrade: 'X',
    major: 'Teknik Komputer & Jaringan',
    className: 'X TKJ 1',
    parentName: 'Agus Susanto',
    parentPhone: '081228491023',
    qrToken: 'M3W-0067482910',
    photoUrl: STUDENT_AVATARS_BOYS[0],
    isActive: true,
  },
  {
    id: 'std-0002',
    nisn: '0068910245',
    name: 'Aisyah Putri Rahmadani',
    gender: 'P',
    classGrade: 'X',
    major: 'Akuntansi & Keuangan Lembaga',
    className: 'X AKL 1',
    parentName: 'Siti Nurhayati',
    parentPhone: '085741289456',
    qrToken: 'M3W-0068910245',
    photoUrl: STUDENT_AVATARS_GIRLS[0],
    isActive: true,
  },
  {
    id: 'std-0003',
    nisn: '0056123498',
    name: 'Dimas Bagus Wicaksono',
    gender: 'L',
    classGrade: 'XI',
    major: 'Teknik Kendaraan Ringan Otomotif',
    className: 'XI TKR 1',
    parentName: 'Haryono, S.T.',
    parentPhone: '082138947120',
    qrToken: 'M3W-0056123498',
    photoUrl: STUDENT_AVATARS_BOYS[1],
    isActive: true,
  },
  {
    id: 'std-0004',
    nisn: '0071239841',
    name: 'Nabila Zahra Khairunnisa',
    gender: 'P',
    classGrade: 'X',
    major: 'Manajemen Perkantoran & Layanan Bisnis',
    className: 'X MPLB 1',
    parentName: 'Budi Santoso',
    parentPhone: '081390458122',
    qrToken: 'M3W-0071239841',
    photoUrl: STUDENT_AVATARS_GIRLS[1],
    isActive: true,
  },
  {
    id: 'std-0005',
    nisn: '0054781290',
    name: 'Rizki Aditya Pratama',
    gender: 'L',
    classGrade: 'XI',
    major: 'Teknik & Bisnis Sepeda Motor',
    className: 'XI TBSM 1',
    parentName: 'Supriyadi',
    parentPhone: '085640192837',
    qrToken: 'M3W-0054781290',
    photoUrl: STUDENT_AVATARS_BOYS[2],
    isActive: true,
  },
  {
    id: 'std-0006',
    nisn: '0048192039',
    name: 'Fajar Nugroho Saputro',
    gender: 'L',
    classGrade: 'XII',
    major: 'Teknik Kendaraan Ringan Otomotif',
    className: 'XII TKR 2',
    parentName: 'Kuswanto',
    parentPhone: '081298471920',
    qrToken: 'M3W-0048192039',
    photoUrl: STUDENT_AVATARS_BOYS[3],
    isActive: true,
  },
  {
    id: 'std-0007',
    nisn: '0059182374',
    name: 'Siti Aminah Nurjanah',
    gender: 'P',
    classGrade: 'XI',
    major: 'Akuntansi & Keuangan Lembaga',
    className: 'XI AKL 1',
    parentName: 'Wahyu Hidayat',
    parentPhone: '087832948192',
    qrToken: 'M3W-0059182374',
    photoUrl: STUDENT_AVATARS_GIRLS[2],
    isActive: true,
  },
  {
    id: 'std-0008',
    nisn: '0061928471',
    name: 'Aldo Febrian Ramadhan',
    gender: 'L',
    classGrade: 'X',
    major: 'Teknik Komputer & Jaringan',
    className: 'X TKJ 2',
    parentName: 'Rudi Hartono',
    parentPhone: '081903482716',
    qrToken: 'M3W-0061928471',
    photoUrl: STUDENT_AVATARS_BOYS[4],
    isActive: true,
  },
  {
    id: 'std-0009',
    nisn: '0049102837',
    name: 'Dhea Ananda Maharani',
    gender: 'P',
    classGrade: 'XII',
    major: 'Manajemen Perkantoran & Layanan Bisnis',
    className: 'XII MPLB 1',
    parentName: 'Tri Mulyono',
    parentPhone: '085290184712',
    qrToken: 'M3W-0049102837',
    photoUrl: STUDENT_AVATARS_GIRLS[3],
    isActive: true,
  },
  {
    id: 'std-0010',
    nisn: '0058291048',
    name: 'Bima Satria Pamungkas',
    gender: 'L',
    classGrade: 'XI',
    major: 'Teknik Kendaraan Ringan Otomotif',
    className: 'XI TKR 2',
    parentName: 'Joko Widodo',
    parentPhone: '081329104829',
    qrToken: 'M3W-0058291048',
    photoUrl: STUDENT_AVATARS_BOYS[0],
    isActive: true,
  },
  {
    id: 'std-0011',
    nisn: '0063948102',
    name: 'Hafiz Danendra Arsyad',
    gender: 'L',
    classGrade: 'X',
    major: 'Teknik Komputer & Jaringan',
    className: 'X TKJ 1',
    parentName: 'Bambang Irawan',
    parentPhone: '081290384729',
    qrToken: 'M3W-0063948102',
    photoUrl: STUDENT_AVATARS_BOYS[1],
    isActive: true,
  },
  {
    id: 'std-0012',
    nisn: '0051928304',
    name: 'Laila Fatimatuz Zahra',
    gender: 'P',
    classGrade: 'XI',
    major: 'Akuntansi & Keuangan Lembaga',
    className: 'XI AKL 1',
    parentName: 'Ahmad Muzaki',
    parentPhone: '085719283049',
    qrToken: 'M3W-0051928304',
    photoUrl: STUDENT_AVATARS_GIRLS[4],
    isActive: true,
  },
  {
    id: 'std-0013',
    nisn: '0047291048',
    name: 'Gilang Dwi Saputra',
    gender: 'L',
    classGrade: 'XII',
    major: 'Teknik & Bisnis Sepeda Motor',
    className: 'XII TBSM 1',
    parentName: 'Endang Subagyo',
    parentPhone: '082194810293',
    qrToken: 'M3W-0047291048',
    photoUrl: STUDENT_AVATARS_BOYS[2],
    isActive: true,
  },
  {
    id: 'std-0014',
    nisn: '0062849103',
    name: 'Kayla Salsabila',
    gender: 'P',
    classGrade: 'X',
    major: 'Manajemen Perkantoran & Layanan Bisnis',
    className: 'X MPLB 1',
    parentName: 'Suryanto',
    parentPhone: '081394810293',
    qrToken: 'M3W-0062849103',
    photoUrl: STUDENT_AVATARS_GIRLS[0],
    isActive: true,
  },
  {
    id: 'std-0015',
    nisn: '0058192034',
    name: 'Reno Arya Pangestu',
    gender: 'L',
    classGrade: 'XI',
    major: 'Teknik Komputer & Jaringan',
    className: 'XI TKJ 2',
    parentName: 'Totok Sudarsono',
    parentPhone: '087819283746',
    qrToken: 'M3W-0058192034',
    photoUrl: STUDENT_AVATARS_BOYS[3],
    isActive: true,
  },
];

// Helper to generate full cohort of 1,500 students to stress test pagination and search
export function generateFull1500Students(): Student[] {
  const result: Student[] = [...INITIAL_STUDENTS_SAMPLE];
  const firstNamesL = ['Ahmad', 'Bagas', 'Candra', 'Dwi', 'Eko', 'Fajar', 'Galih', 'Hendra', 'Ilham', 'Joko', 'Kurniawan', 'Lukman', 'Maulana', 'Naufal', 'Oki', 'Pandu', 'Raditya', 'Satria', 'Taufik', 'Wahyu', 'Yoga', 'Zulfa'];
  const firstNamesP = ['Adelia', 'Bella', 'Citra', 'Dian', 'Erna', 'Fitri', 'Gita', 'Hani', 'Indah', 'Jihan', 'Kartika', 'Lestari', 'Melani', 'Nabila', 'Oktavia', 'Putri', 'Rani', 'Sari', 'Tiara', 'Ulfa', 'Wulandari', 'Yuni'];
  const lastNames = ['Saputra', 'Pratama', 'Hidayat', 'Wicaksono', 'Nugroho', 'Kusuma', 'Santoso', 'Utomo', 'Wibowo', 'Setiawan', 'Firmansyah', 'Hakim', 'Ramadhan', 'Mahendra', 'Suryono', 'Kurnia', 'Subagyo'];

  const totalNeeded = 1500;
  for (let i = INITIAL_STUDENTS_SAMPLE.length + 1; i <= totalNeeded; i++) {
    const isBoy = (i % 2 === 0);
    const gender: 'L' | 'P' = isBoy ? 'L' : 'P';
    const firstList = isBoy ? firstNamesL : firstNamesP;
    const fName = firstList[i % firstList.length];
    const lName = lastNames[(i * 7) % lastNames.length];
    const fullName = `${fName} ${lName}`;
    
    const classIdx = (i - 1) % CLASSES.length;
    const className = CLASSES[classIdx];
    const grade = className.split(' ')[0];
    const majorCode = className.split(' ')[1];
    const majorObj = MAJORS.find(m => m.code === majorCode) || MAJORS[0];

    const nisn = `00${(50000000 + i).toString().padStart(8, '0')}`;
    const qrToken = `M3W-${nisn}`;
    const avatar = isBoy
      ? STUDENT_AVATARS_BOYS[i % STUDENT_AVATARS_BOYS.length]
      : STUDENT_AVATARS_GIRLS[i % STUDENT_AVATARS_GIRLS.length];

    result.push({
      id: `std-${i.toString().padStart(4, '0')}`,
      nisn,
      name: fullName,
      gender,
      classGrade: grade,
      major: majorObj.name,
      className,
      parentName: `Bpk/Ibu ${lName}`,
      parentPhone: `0812${(10000000 + i * 37).toString().slice(0, 8)}`,
      qrToken,
      photoUrl: avatar,
      isActive: true,
    });
  }

  return result;
}

export function generateInitialAttendanceLogs(students: Student[], settings: SchoolSettings): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  const logs: AttendanceRecord[] = [];

  // Generate around 25 sample scans for today (mix of on-time, late, checkout, permit)
  const sampledStudents = students.slice(0, 24);

  sampledStudents.forEach((st, idx) => {
    let status: AttendanceRecord['status'] = 'HADIR_TEPAT_WAKTU';
    let checkInTime: string | null = '06:42:15';
    let minutesLate = 0;
    let scanMode: AttendanceRecord['scanMode'] = 'MASUK';
    let waStatus: AttendanceRecord['whatsappStatus'] = 'TERKIRIM';
    let note = '';

    if (idx < 12) {
      // On time
      status = 'HADIR_TEPAT_WAKTU';
      const minute = 30 + (idx * 2);
      checkInTime = `06:${minute.toString().padStart(2, '0')}:${(12 + idx * 3).toString().padStart(2, '0')}`;
      waStatus = 'TERKIRIM';
    } else if (idx < 18) {
      // Late
      status = 'TERLAMBAT';
      minutesLate = 6 + (idx - 12) * 4;
      const minute = 7 * 60 + minutesLate;
      const h = Math.floor(minute / 60);
      const m = minute % 60;
      checkInTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:22`;
      waStatus = idx % 2 === 0 ? 'TERKIRIM' : 'ANTREAN';
      note = `Terlambat ${minutesLate} menit`;
    } else if (idx < 21) {
      // Checked out early / pulang
      status = 'PULANG';
      checkInTime = '06:45:00';
      scanMode = 'PULANG';
      waStatus = 'TERKIRIM';
    } else if (idx === 21) {
      status = 'IZIN';
      checkInTime = null;
      scanMode = 'MANUAL';
      note = 'Mengikuti LKS SMK Tingkat Kabupaten Kendal';
      waStatus = 'TERKIRIM';
    } else if (idx === 22) {
      status = 'SAKIT';
      checkInTime = null;
      scanMode = 'MANUAL';
      note = 'Surat Dokter Terlampir (Demam)';
      waStatus = 'TERKIRIM';
    } else {
      status = 'HADIR_TEPAT_WAKTU';
      checkInTime = '06:58:30';
      waStatus = 'ANTREAN';
    }

    logs.push({
      id: `att-log-${today}-${idx + 1}`,
      studentId: st.id,
      nisn: st.nisn,
      studentName: st.name,
      className: st.className,
      photoUrl: st.photoUrl,
      parentPhone: st.parentPhone,
      parentName: st.parentName,
      date: today,
      time: checkInTime || '07:15:00',
      checkInTime,
      checkOutTime: status === 'PULANG' ? '15:10:45' : null,
      status,
      minutesLate,
      notes: note,
      whatsappStatus: waStatus,
      whatsappSentAt: waStatus === 'TERKIRIM' ? `${today} ${checkInTime || '07:15:00'}` : undefined,
      whatsappMessage: `Assalamu'alaikum... Presensi Ananda ${st.name} (${status})`,
      scanMode,
      gateLocation: 'Gerbang Utama SMK Muhammadiyah 3 Weleri',
    });
  });

  return logs;
}
