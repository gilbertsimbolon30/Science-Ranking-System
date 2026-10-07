import React, { useState } from 'react';
import { MasterLevel, Student, XPRecord, DailyCheckinRecord, StudentComputedStats } from '../types/gamification';
import {
  FileSpreadsheet,
  Download,
  Code2,
  HelpCircle,
  Copy,
  Check,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { sortAndComputeCheckins } from '../utils/gamificationEngine';
import { exportToExcel, exportSheetToCSV } from '../utils/excelExporter';

interface SpreadsheetSimulatorProps {
  masterLevels: MasterLevel[];
  xpRecords: XPRecord[];
  checkins: DailyCheckinRecord[];
  students: Student[];
  stats: StudentComputedStats[];
  todayStr: string;
  onOpenFormulaGuide: () => void;
}

export const SpreadsheetSimulator: React.FC<SpreadsheetSimulatorProps> = ({
  masterLevels,
  xpRecords,
  checkins,
  students,
  stats,
  todayStr,
  onOpenFormulaGuide,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<1 | 2 | 3 | 4>(4);
  const [showFormulaView, setShowFormulaView] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{
    coord: string;
    value: string;
    formula?: string;
    description?: string;
  }>({
    coord: 'C2',
    value: stats[0]?.totalXP.toString() ?? '0',
    formula: "=SUMIFS('Riwayat XP'!C:C, 'Riwayat XP'!B:B, A2)",
    description: "Menjumlahkan seluruh XP siswa tersebut dari sheet 'Riwayat XP'",
  });

  const [copiedFormula, setCopiedFormula] = useState<boolean>(false);

  const sortedLevels = [...masterLevels].sort((a, b) => a.xpMin - b.xpMin);
  const sortedCheckins = sortAndComputeCheckins(checkins);
  const sortedXp = [...xpRecords].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const handleCopyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  const handleExportCurrentSheetCSV = () => {
    if (activeSheetTab === 1) {
      const data = [
        ['XP Minimal', 'Nama Badge', 'Tier'],
        ...sortedLevels.map((l) => [l.xpMin, l.badgeName, l.tier]),
      ];
      exportSheetToCSV(data, 'Sheet1_Master_Level');
    } else if (activeSheetTab === 2) {
      const data = [
        ['Tanggal', 'ID Siswa', 'Nilai XP', 'Keterangan'],
        ...sortedXp.map((x) => [x.tanggal, x.idSiswa, x.nilaiXP, x.keterangan]),
      ];
      exportSheetToCSV(data, 'Sheet2_Riwayat_XP');
    } else if (activeSheetTab === 3) {
      const data = [
        ['Tanggal', 'ID Siswa', 'Pertanyaan', 'Jawaban', 'Streak Harian'],
        ...sortedCheckins.map((c) => [c.tanggal, c.idSiswa, c.pertanyaan, c.jawaban, c.streakHarian]),
      ];
      exportSheetToCSV(data, 'Sheet3_Daily_Checkin');
    } else {
      const data = [
        ['ID Siswa', 'Nama Siswa', 'Total XP', 'Current Badge / Level', 'Tier', 'Last Check-in', 'Current Streak', 'Today'],
        ...stats.map((s) => [
          s.id,
          s.name,
          s.totalXP,
          s.currentBadge,
          s.tier,
          s.lastCheckinDate || '',
          s.currentStreak,
          todayStr,
        ]),
      ];
      exportSheetToCSV(data, 'Sheet4_Master_Data_Siswa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
            <span>SPREADSHEET ENGINE & FORMULA SIMULATOR</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Simulasi Database 4 Sheet (Google Sheets & Excel)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Struktur 4 tab dengan penamaan kolom dan rumus otomatis sesuai spesifikasi.
            Klik sel mana pun untuk memeriksa rumus, atau alihkan ke Mode Tampilkan Rumus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFormulaView(!showFormulaView)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showFormulaView
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showFormulaView ? 'Mode Nilai Hasil' : 'Tampilkan Rumus [fx]'}</span>
          </button>

          <button
            onClick={onOpenFormulaGuide}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panduan Rumus</span>
          </button>

          <button
            onClick={() => exportToExcel(masterLevels, xpRecords, checkins, students, todayStr)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh File Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Formula Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-inner">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400">
            {selectedCell.coord}
          </span>
          <span className="text-xs text-slate-500 font-bold font-mono">fx</span>
        </div>

        <div className="flex-1 font-mono text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-300 overflow-x-auto whitespace-nowrap">
          {selectedCell.formula || selectedCell.value}
        </div>

        {selectedCell.formula && (
          <button
            onClick={() => handleCopyFormula(selectedCell.formula!)}
            className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            title="Salin rumus ke clipboard"
          >
            {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFormula ? 'Tersalin' : 'Salin'}</span>
          </button>
        )}
      </div>

      {/* Sheet Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 4, label: 'Sheet 4: Master Data Siswa', sub: 'Dashboard Utama' },
            { id: 3, label: 'Sheet 3: Daily Check-in', sub: 'Streak Log' },
            { id: 2, label: 'Sheet 2: Riwayat XP', sub: 'Input Poin Guru' },
            { id: 1, label: 'Sheet 1: Master Level', sub: 'Tingkatan & Perk' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSheetTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-t border-x whitespace-nowrap ${
                activeSheetTab === tab.id
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 shadow'
                  : 'bg-slate-950/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div>{tab.label}</div>
              <div className="text-[10px] text-slate-500 font-normal">{tab.sub}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleExportCurrentSheetCSV}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1 cursor-pointer"
          title="Download tab ini dalam format CSV"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">CSV Sheet Ini</span>
        </button>
      </div>

      {/* Sheet Content Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-b-2xl rounded-tr-2xl overflow-hidden shadow-xl">
        {/* ========================================================= */}
        {/* TAB 4: MASTER DATA SISWA (DASHBOARD UTAMA) */}
        {/* ========================================================= */}
        {activeSheetTab === 4 && (
          <div>
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-medium">
                Sheet ini adalah <strong>Leaderboard Utama</strong> yang merangkum data otomatis menggunakan rumus.
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-400">
                  Sel H1: <strong className="text-emerald-300">=TODAY()</strong> ({todayStr})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center text-slate-600">Row</th>
                    <th className="py-3 px-4">
                      A: ID Siswa
                      <span className="block text-[10px] text-slate-500 font-normal">[Manual]</span>
                    </th>
                    <th className="py-3 px-4">
                      B: Nama Siswa
                      <span className="block text-[10px] text-slate-500 font-normal">[Manual]</span>
                    </th>
                    <th className="py-3 px-4 text-right">
                      C: Total XP
                      <span className="block text-[10px] text-emerald-400 font-normal">[RUMUS SUMIFS]</span>
                    </th>
                    <th className="py-3 px-4">
                      D: Current Badge / Level
                      <span className="block text-[10px] text-cyan-400 font-normal">[RUMUS VLOOKUP]</span>
                    </th>
                    <th className="py-3 px-4">
                      E: Tier
                      <span className="block text-[10px] text-cyan-400 font-normal">[RUMUS VLOOKUP]</span>
                    </th>
                    <th className="py-3 px-4">
                      F: Last Check-in
                      <span className="block text-[10px] text-amber-400 font-normal">[RUMUS MAXIFS]</span>
                    </th>
                    <th className="py-3 px-4 text-center">
                      G: Current Streak
                      <span className="block text-[10px] text-amber-400 font-normal">[RUMUS IF/MAXIFS]</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {stats.map((s, idx) => {
                    const rowNum = idx + 2;
                    const sumifsFormula = `=SUMIFS('Riwayat XP'!C:C, 'Riwayat XP'!B:B, A${rowNum})`;
                    const vlookupBadge = `=VLOOKUP(C${rowNum}, 'Master Level'!A:C, 2, 1)`;
                    const vlookupTier = `=VLOOKUP(C${rowNum}, 'Master Level'!A:C, 3, 1)`;
                    const maxifsCheckin = `=MAXIFS('Daily Check-in'!A:A, 'Daily Check-in'!B:B, A${rowNum})`;
                    const streakFormula = `=IF(F${rowNum}>=H1-1, MAXIFS('Daily Check-in'!E:E, 'Daily Check-in'!B:B, A${rowNum}, 'Daily Check-in'!A:A, F${rowNum}), 0)`;

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-600">{rowNum}</td>

                        {/* Col A */}
                        <td
                          className="py-2.5 px-4 font-semibold text-slate-300 cursor-pointer"
                          onClick={() =>
                            setSelectedCell({
                              coord: `A${rowNum}`,
                              value: s.id,
                              description: 'ID Unik Siswa (Input Manual)',
                            })
                          }
                        >
                          {s.id}
                        </td>

                        {/* Col B */}
                        <td
                          className="py-2.5 px-4 font-sans text-slate-200 cursor-pointer"
                          onClick={() =>
                            setSelectedCell({
                              coord: `B${rowNum}`,
                              value: s.name,
                              description: 'Nama Lengkap Siswa (Input Manual)',
                            })
                          }
                        >
                          {s.name}
                        </td>

                        {/* Col C: Total XP [SUMIFS] */}
                        <td
                          className="py-2.5 px-4 text-right cursor-pointer group"
                          onClick={() =>
                            setSelectedCell({
                              coord: `C${rowNum}`,
                              value: `${s.totalXP} XP`,
                              formula: sumifsFormula,
                              description: "Menjumlahkan seluruh XP milik siswa tersebut dari sheet 'Riwayat XP'",
                            })
                          }
                        >
                          {showFormulaView ? (
                            <span className="text-emerald-400 text-[11px]">{sumifsFormula}</span>
                          ) : (
                            <span className="font-bold text-white group-hover:text-emerald-400">
                              {s.totalXP.toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Col D: Current Badge [VLOOKUP] */}
                        <td
                          className="py-2.5 px-4 font-sans cursor-pointer group"
                          onClick={() =>
                            setSelectedCell({
                              coord: `D${rowNum}`,
                              value: s.currentBadge,
                              formula: vlookupBadge,
                              description: "Mendeteksi Badge otomatis berdasarkan Total XP dari sheet 'Master Level'",
                            })
                          }
                        >
                          {showFormulaView ? (
                            <span className="text-cyan-400 font-mono text-[11px]">{vlookupBadge}</span>
                          ) : (
                            <span className="text-slate-200 font-semibold group-hover:text-cyan-400">
                              {s.currentBadge}
                            </span>
                          )}
                        </td>

                        {/* Col E: Tier [VLOOKUP] */}
                        <td
                          className="py-2.5 px-4 font-sans cursor-pointer group"
                          onClick={() =>
                            setSelectedCell({
                              coord: `E${rowNum}`,
                              value: s.tier,
                              formula: vlookupTier,
                              description: "Menampilkan Tier dari Badge tersebut dari sheet 'Master Level'",
                            })
                          }
                        >
                          {showFormulaView ? (
                            <span className="text-cyan-400 font-mono text-[11px]">{vlookupTier}</span>
                          ) : (
                            <span className="text-slate-300">{s.tier}</span>
                          )}
                        </td>

                        {/* Col F: Last Check-in [MAXIFS] */}
                        <td
                          className="py-2.5 px-4 cursor-pointer group"
                          onClick={() =>
                            setSelectedCell({
                              coord: `F${rowNum}`,
                              value: s.lastCheckinDate || 'None',
                              formula: maxifsCheckin,
                              description: "Mencari tanggal terakhir siswa tersebut melakukan check-in dari sheet 'Daily Check-in'",
                            })
                          }
                        >
                          {showFormulaView ? (
                            <span className="text-amber-400 text-[11px]">{maxifsCheckin}</span>
                          ) : (
                            <span className="text-slate-400">
                              {s.lastCheckinDate || '-'}
                            </span>
                          )}
                        </td>

                        {/* Col G: Current Streak [IF/MAXIFS] */}
                        <td
                          className="py-2.5 px-4 text-center cursor-pointer group"
                          onClick={() =>
                            setSelectedCell({
                              coord: `G${rowNum}`,
                              value: s.currentStreak.toString(),
                              formula: streakFormula,
                              description: "Mengambil angka streak terakhir jika siswa check-in hari ini atau kemarin (F2 >= H1-1)",
                            })
                          }
                        >
                          {showFormulaView ? (
                            <span className="text-amber-400 text-[11px] block truncate max-w-xs" title={streakFormula}>
                              {streakFormula}
                            </span>
                          ) : (
                            <span className="font-bold text-amber-400">
                              🔥 {s.currentStreak}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DAILY CHECK-IN */}
        {/* ========================================================= */}
        {activeSheetTab === 3 && (
          <div>
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300">
              Syarat: Data di-sortir berdasarkan <strong>ID Siswa (A-Z)</strong> lalu <strong>Tanggal (Lama-Baru)</strong>.
              Rumus di sel E2: <code className="text-amber-300">=IF(B2=B1, IF(A2=A1+1, E1+1, 1), 1)</code>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center text-slate-600">Row</th>
                    <th className="py-3 px-4">A: Tanggal</th>
                    <th className="py-3 px-4">B: ID Siswa</th>
                    <th className="py-3 px-4">C: Pertanyaan</th>
                    <th className="py-3 px-4">D: Jawaban</th>
                    <th className="py-3 px-4 text-center">E: Streak Harian [RUMUS]</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sortedCheckins.map((c, idx) => {
                    const rowNum = idx + 2;
                    const prevRow = idx + 1;
                    const formula =
                      idx === 0
                        ? '1 (Entri Pertama)'
                        : `=IF(B${rowNum}=B${prevRow}, IF(A${rowNum}=A${prevRow}+1, E${prevRow}+1, 1), 1)`;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 text-center text-slate-600">{rowNum}</td>
                        <td className="py-2.5 px-4 text-slate-300">{c.tanggal}</td>
                        <td className="py-2.5 px-4 font-semibold text-emerald-400">{c.idSiswa}</td>
                        <td className="py-2.5 px-4 font-sans text-slate-300 max-w-xs truncate">{c.pertanyaan}</td>
                        <td className="py-2.5 px-4 font-sans text-slate-200 max-w-xs truncate">{c.jawaban}</td>
                        <td
                          className="py-2.5 px-4 text-center cursor-pointer"
                          onClick={() =>
                            setSelectedCell({
                              coord: `E${rowNum}`,
                              value: c.streakHarian.toString(),
                              formula: idx === 0 ? undefined : formula,
                              description: 'Streak harian bertambah jika tanggal berurutan +1 hari untuk siswa yang sama',
                            })
                          }
                        >
                          {showFormulaView && idx > 0 ? (
                            <span className="text-amber-400 text-[11px]">{formula}</span>
                          ) : (
                            <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
                              {c.streakHarian}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RIWAYAT XP */}
        {/* ========================================================= */}
        {activeSheetTab === 2 && (
          <div>
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300">
              Tempat guru menginput nilai poin siswa. Nilai penalti ditulis dengan angka minus (contoh: -50).
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center text-slate-600">Row</th>
                    <th className="py-3 px-4">A: Tanggal</th>
                    <th className="py-3 px-4">B: ID Siswa</th>
                    <th className="py-3 px-4 text-right">C: Nilai XP</th>
                    <th className="py-3 px-4">D: Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sortedXp.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-600">{idx + 2}</td>
                      <td className="py-2.5 px-4 text-slate-300">{r.tanggal}</td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-400">{r.idSiswa}</td>
                      <td className="py-2.5 px-4 text-right font-bold">
                        <span
                          className={r.nilaiXP >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                        >
                          {r.nilaiXP >= 0 ? `+${r.nilaiXP}` : r.nilaiXP}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-200">{r.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: MASTER LEVEL */}
        {/* ========================================================= */}
        {activeSheetTab === 1 && (
          <div>
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300">
              Database penentu level. <strong>Penting:</strong> Kolom XP Minimal harus diurutkan dari yang terkecil ke terbesar agar rumus VLOOKUP berfungsi (approximate match).
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center text-slate-600">Row</th>
                    <th className="py-3 px-4 text-right">A: XP Minimal</th>
                    <th className="py-3 px-4">B: Nama Badge</th>
                    <th className="py-3 px-4">C: Tier</th>
                    <th className="py-3 px-4 font-sans">Hak Istimewa (Perk)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sortedLevels.map((lvl, idx) => (
                    <tr key={lvl.levelNumber} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-600">{idx + 2}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-400">
                        {lvl.xpMin.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">{lvl.badgeName}</td>
                      <td className="py-2.5 px-4 text-cyan-300">{lvl.tier}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-300">{lvl.perkDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
