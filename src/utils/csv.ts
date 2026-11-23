import { AttendanceRecord, Student } from '../types';

export function exportAttendanceToCsv(records: AttendanceRecord[], filenamePrefix = 'Rekap_Presensi_SMK_Muga_3_Weleri'): void {
  const headers = [
    'Tanggal',
    'Waktu Scan',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'Status Presensi',
    'Keterlambatan (Menit)',
    'Nama Orang Tua/Wali',
    'No. WhatsApp Orang Tua',
    'Status Notifikasi WA',
    'Keterangan',
  ];

  const statusLabelMap: Record<string, string> = {
    HADIR_TEPAT_WAKTU: 'Hadir Tepat Waktu',
    TERLAMBAT: 'Terlambat',
    PULANG: 'Pulang',
    IZIN: 'Izin',
    SAKIT: 'Sakit',
    ALPA: 'Alpa / Tanpa Keterangan',
  };

  const rows = records.map((r) => [
    r.date,
    r.time || r.checkInTime || '-',
    `'${r.nisn}`, // apostrophe prevents Excel from converting NISN to scientific notation
    `"${(r.studentName || '').replace(/"/g, '""')}"`,
    `"${r.className}"`,
    `"${statusLabelMap[r.status] || r.status}"`,
    r.minutesLate || 0,
    `"${(r.parentName || '').replace(/"/g, '""')}"`,
    `'${r.parentPhone}`,
    r.whatsappStatus,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadStudentCsvTemplate(): void {
  const headers = ['nisn', 'nama', 'jenis_kelamin', 'kelas', 'jurusan', 'nama_ortu', 'no_wa_ortu'];
  const sampleRows = [
    ['0067482910', 'Muhammad Farhan', 'L', 'X TKJ 1', 'Teknik Komputer & Jaringan', 'Agus Susanto', '081228491023'],
    ['0068910245', 'Aisyah Putri Rahmadani', 'P', 'X AKL 1', 'Akuntansi & Keuangan Lembaga', 'Siti Nurhayati', '085741289456'],
    ['0056123498', 'Dimas Bagus Wicaksono', 'L', 'XI TKR 1', 'Teknik Kendaraan Ringan Otomotif', 'Haryono', '082138947120'],
  ];

  const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((e) => e.map(val => `"${val}"`).join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Import_Siswa_SMK_Muga_3.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseStudentCsv(csvText: string): Partial<Student>[] {
  const lines = csvText.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0].toLowerCase();
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

  const students: Partial<Student>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values: string[] = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let j = 0; j < rawLine.length; j++) {
      const char = rawLine[j];
      if (char === '"' || char === "'") {
        insideQuotes = !insideQuotes;
      } else if (char === delimiter && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = (values[idx] || '').replace(/^["']|["']$/g, '').trim();
    });

    const nisn = rowObj['nisn'] || rowObj['nomor_induk'] || rowObj['id'];
    const name = rowObj['nama'] || rowObj['nama_siswa'] || rowObj['name'];
    const className = rowObj['kelas'] || rowObj['class'] || 'X TKJ 1';
    const parentPhone = rowObj['no_wa_ortu'] || rowObj['no_wa'] || rowObj['telepon'] || rowObj['phone'] || '081234567890';
    const parentName = rowObj['nama_ortu'] || rowObj['orang_tua'] || `Orang Tua ${name || 'Siswa'}`;
    const gender = (rowObj['jenis_kelamin'] || rowObj['jk'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L';
    const major = rowObj['jurusan'] || 'Teknik Komputer & Jaringan';
    const classGrade = className.split(' ')[0] || 'X';

    if (nisn && name) {
      students.push({
        nisn,
        name,
        className,
        classGrade,
        major,
        gender,
        parentPhone,
        parentName,
        qrToken: `M3W-${nisn}`,
        photoUrl: gender === 'L'
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&q=80',
        isActive: true,
      });
    }
  }

  return students;
}
