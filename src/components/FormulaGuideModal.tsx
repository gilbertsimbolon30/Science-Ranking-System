import React, { useState } from 'react';
import { BookOpen, Copy, Check, ExternalLink, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formulas = [
    {
      key: 'sheet3_streak',
      sheet: 'Sheet 3: Daily Check-in',
      cell: 'Sel E2 (Streak Harian)',
      formula: '=IF(B2=B1, IF(A2=A1+1, E1+1, 1), 1)',
      desc: 'Mengecek apakah hari ini berurutan persis 1 hari setelah check-in sebelumnya dari siswa yang sama. Tarik rumus ke bawah. Syarat: Data disortir ID Siswa (A-Z) lalu Tanggal (Lama-Baru).',
    },
    {
      key: 'sheet4_totalxp',
      sheet: 'Sheet 4: Master Data Siswa',
      cell: 'Sel C2 (Total XP)',
      formula: "=SUMIFS('Riwayat XP'!C:C, 'Riwayat XP'!B:B, A2)",
      desc: "Menjumlahkan seluruh XP milik siswa tersebut dari sheet 'Riwayat XP' berdasarkan ID Siswa (A2).",
    },
    {
      key: 'sheet4_badge',
      sheet: 'Sheet 4: Master Data Siswa',
      cell: 'Sel D2 (Current Badge / Level)',
      formula: "=VLOOKUP(C2, 'Master Level'!A:C, 2, 1)",
      desc: "Mendeteksi Badge otomatis berdasarkan Total XP dari sheet 'Master Level'. Parameter terakhir '1' menandakan pencarian rentang (approximate match).",
    },
    {
      key: 'sheet4_tier',
      sheet: 'Sheet 4: Master Data Siswa',
      cell: 'Sel E2 (Tier)',
      formula: "=VLOOKUP(C2, 'Master Level'!A:C, 3, 1)",
      desc: "Menampilkan Tier dari Badge tersebut dari kolom ke-3 sheet 'Master Level'.",
    },
    {
      key: 'sheet4_lastcheckin',
      sheet: 'Sheet 4: Master Data Siswa',
      cell: 'Sel F2 (Last Check-in)',
      formula: "=MAXIFS('Daily Check-in'!A:A, 'Daily Check-in'!B:B, A2)",
      desc: "Mencari tanggal terakhir siswa tersebut melakukan check-in dari sheet 'Daily Check-in'.",
    },
    {
      key: 'sheet4_streak',
      sheet: 'Sheet 4: Master Data Siswa',
      cell: 'Sel G2 (Current Streak)',
      formula: "=IF(F2>=H$1-1, MAXIFS('Daily Check-in'!E:E, 'Daily Check-in'!B:B, A2, 'Daily Check-in'!A:A, F2), 0)",
      desc: 'Mengambil angka streak terakhir jika siswa check-in hari ini atau kemarin (F2 >= H1-1). Asumsi sel H1 berisi rumus =TODAY(). Jika absen > 1 hari, streak bernilai 0.',
    },
    {
      key: 'sheet4_today',
      sheet: 'Sheet 4: Master Data Siswa',
      cell: 'Sel H1 (Tanggal Hari Ini)',
      formula: '=TODAY()',
      desc: 'Menghasilkan tanggal sistem hari ini untuk patokan keaktifan streak.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Panduan Rumus Google Sheets & Excel</h3>
              <p className="text-xs text-slate-400">Salin rumus langsung ke spreadsheet Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-200/90 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Penting untuk Google Sheets:</strong> Pastikan nama tab sheet sama persis (huruf besar/kecil & spasi):
              <code className="text-amber-300 ml-1">Master Level</code>,{' '}
              <code className="text-amber-300">Riwayat XP</code>,{' '}
              <code className="text-amber-300">Daily Check-in</code>, dan{' '}
              <code className="text-amber-300">Master Data Siswa</code>.
            </div>
          </div>

          <div className="space-y-3">
            {formulas.map((item) => (
              <div
                key={item.key}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">{item.cell}</span>
                  <span className="text-[11px] text-slate-500">{item.sheet}</span>
                </div>

                <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300">
                  <code className="truncate">{item.formula}</code>
                  <button
                    onClick={() => copyToClipboard(item.formula, item.key)}
                    className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer shrink-0"
                    title="Salin rumus"
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Dapat langsung diuji di tab <strong>Spreadsheet (4 Sheet)</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
