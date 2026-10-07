import * as XLSX from 'xlsx';
import { MasterLevel, Student, XPRecord, DailyCheckinRecord } from '../types/gamification';
import { sortAndComputeCheckins } from './gamificationEngine';

/**
 * Builds and downloads a full Microsoft Excel (.xlsx) file
 * with all 4 sheets as specified in the rubric.
 */
export function exportToExcel(
  masterLevels: MasterLevel[],
  xpRecords: XPRecord[],
  checkins: DailyCheckinRecord[],
  students: Student[],
  todayStr: string
): void {
  const wb = XLSX.utils.book_new();

  // ----------------------------------------------------
  // Sheet 1: Master Level
  // ----------------------------------------------------
  // Kolom A: XP Minimal
  // Kolom B: Nama Badge
  // Kolom C: Tier
  const sortedLevels = [...masterLevels].sort((a, b) => a.xpMin - b.xpMin);
  const masterLevelData = [
    ['XP Minimal', 'Nama Badge', 'Tier'],
    ...sortedLevels.map((lvl) => [lvl.xpMin, lvl.badgeName, lvl.tier]),
  ];
  const wsMasterLevel = XLSX.utils.aoa_to_sheet(masterLevelData);
  XLSX.utils.book_append_sheet(wb, wsMasterLevel, 'Master Level');

  // ----------------------------------------------------
  // Sheet 2: Riwayat XP
  // ----------------------------------------------------
  // Kolom A: Tanggal
  // Kolom B: ID Siswa
  // Kolom C: Nilai XP
  // Kolom D: Keterangan
  const sortedXp = [...xpRecords].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const riwayatXpData = [
    ['Tanggal', 'ID Siswa', 'Nilai XP', 'Keterangan'],
    ...sortedXp.map((r) => [r.tanggal, r.idSiswa, r.nilaiXP, r.keterangan]),
  ];
  const wsRiwayatXp = XLSX.utils.aoa_to_sheet(riwayatXpData);
  XLSX.utils.book_append_sheet(wb, wsRiwayatXp, 'Riwayat XP');

  // ----------------------------------------------------
  // Sheet 3: Daily Check-in
  // ----------------------------------------------------
  // Syarat: Data di-sortir berdasarkan ID Siswa (A-Z) lalu Tanggal (Lama-Baru)
  // Kolom A: Tanggal
  // Kolom B: ID Siswa
  // Kolom C: Pertanyaan
  // Kolom D: Jawaban
  // Kolom E: Streak Harian [RUMUS: =IF(B2=B1, IF(A2=A1+1, E1+1, 1), 1)]
  const sortedCheckins = sortAndComputeCheckins(checkins);
  const dailyCheckinData: (string | number | { f: string; v: number })[][] = [
    ['Tanggal', 'ID Siswa', 'Pertanyaan', 'Jawaban', 'Streak Harian'],
  ];

  for (let i = 0; i < sortedCheckins.length; i++) {
    const rowNum = i + 2;
    const prevRowNum = i + 1;
    const c = sortedCheckins[i];

    if (i === 0) {
      dailyCheckinData.push([c.tanggal, c.idSiswa, c.pertanyaan, c.jawaban, c.streakHarian]);
    } else {
      // Cell with formula and evaluated fallback value
      const formula = `IF(B${rowNum}=B${prevRowNum}, IF(A${rowNum}=A${prevRowNum}+1, E${prevRowNum}+1, 1), 1)`;
      dailyCheckinData.push([
        c.tanggal,
        c.idSiswa,
        c.pertanyaan,
        c.jawaban,
        { f: formula, v: c.streakHarian },
      ]);
    }
  }
  const wsDailyCheckin = XLSX.utils.aoa_to_sheet(dailyCheckinData);
  XLSX.utils.book_append_sheet(wb, wsDailyCheckin, 'Daily Check-in');

  // ----------------------------------------------------
  // Sheet 4: Master Data Siswa (Dashboard Utama)
  // ----------------------------------------------------
  // Kolom A: ID Siswa (Input manual)
  // Kolom B: Nama Siswa (Input manual)
  // Kolom C: Total XP [RUMUS: =SUMIFS('Riwayat XP'!C:C, 'Riwayat XP'!B:B, A2)]
  // Kolom D: Current Badge / Level [RUMUS: =VLOOKUP(C2, 'Master Level'!A:C, 2, 1)]
  // Kolom E: Tier [RUMUS: =VLOOKUP(C2, 'Master Level'!A:C, 3, 1)]
  // Kolom F: Last Check-in [RUMUS: =MAXIFS('Daily Check-in'!A:A, 'Daily Check-in'!B:B, A2)]
  // Kolom G: Current Streak [RUMUS: =IF(F2>=H$1-1, MAXIFS('Daily Check-in'!E:E, 'Daily Check-in'!B:B, A2, 'Daily Check-in'!A:A, F2), 0)]
  // Sel H1: =TODAY()
  const masterDataSiswaRows: any[][] = [
    ['ID Siswa', 'Nama Siswa', 'Total XP', 'Current Badge / Level', 'Tier', 'Last Check-in', 'Current Streak', todayStr],
  ];

  students.forEach((s, idx) => {
    const rowNum = idx + 2;
    // Calculate fallback values
    const totalXP = xpRecords
      .filter((r) => r.idSiswa === s.id)
      .reduce((sum, r) => sum + r.nilaiXP, 0);

    const matchedLevel = sortedLevels.slice().reverse().find((lvl) => totalXP >= lvl.xpMin) || sortedLevels[0];

    const studentCheckins = sortedCheckins.filter((c) => c.idSiswa === s.id);
    const lastCheckin = studentCheckins.length > 0
      ? studentCheckins.slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0].tanggal
      : '';

    let streakVal = 0;
    if (lastCheckin) {
      const partsA = lastCheckin.split('-').map(Number);
      const partsB = todayStr.split('-').map(Number);
      const d1 = Date.UTC(partsA[0], partsA[1] - 1, partsA[2]);
      const d2 = Date.UTC(partsB[0], partsB[1] - 1, partsB[2]);
      const diffDays = Math.round((d2 - d1) / (24 * 60 * 60 * 1000));
      if (diffDays <= 1) {
        streakVal = studentCheckins.find((c) => c.tanggal === lastCheckin)?.streakHarian || 0;
      }
    }

    masterDataSiswaRows.push([
      s.id,
      s.name,
      { f: `SUMIFS('Riwayat XP'!C:C, 'Riwayat XP'!B:B, A${rowNum})`, v: totalXP },
      { f: `VLOOKUP(C${rowNum}, 'Master Level'!A:C, 2, 1)`, v: matchedLevel.badgeName },
      { f: `VLOOKUP(C${rowNum}, 'Master Level'!A:C, 3, 1)`, v: matchedLevel.tier },
      { f: `MAXIFS('Daily Check-in'!A:A, 'Daily Check-in'!B:B, A${rowNum})`, v: lastCheckin },
      { f: `IF(F${rowNum}>=H$1-1, MAXIFS('Daily Check-in'!E:E, 'Daily Check-in'!B:B, A${rowNum}, 'Daily Check-in'!A:A, F${rowNum}), 0)`, v: streakVal },
    ]);
  });

  const wsMasterDataSiswa = XLSX.utils.aoa_to_sheet(masterDataSiswaRows);
  // Set cell H1 formula to TODAY()
  if (wsMasterDataSiswa['H1']) {
    wsMasterDataSiswa['H1'] = { f: 'TODAY()', v: todayStr, t: 's' };
  }
  XLSX.utils.book_append_sheet(wb, wsMasterDataSiswa, 'Master Data Siswa');

  // Trigger download
  XLSX.writeFile(wb, `Gamifikasi_Kelas_Science_${todayStr}.xlsx`);
}

/**
 * Download a single sheet as CSV
 */
export function exportSheetToCSV(data: any[][], fileName: string): void {
  const ws = XLSX.utils.aoa_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
