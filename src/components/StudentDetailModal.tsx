import React from 'react';
import { StudentComputedStats, XPRecord, DailyCheckinRecord, MasterLevel } from '../types/gamification';
import {
  Trophy,
  Flame,
  Gift,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { MASTER_LEVELS } from '../data/initialData';
import { getTierStyle } from '../utils/gamificationEngine';

interface StudentDetailModalProps {
  studentStat: StudentComputedStats | null;
  xpRecords: XPRecord[];
  checkins: DailyCheckinRecord[];
  onClose: () => void;
  onOpenQuickXP: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentStat,
  xpRecords,
  checkins,
  onClose,
  onOpenQuickXP,
}) => {
  if (!studentStat) return null;

  const tierStyle = getTierStyle(studentStat.tier);
  const studentXpRecords = xpRecords
    .filter((r) => r.idSiswa === studentStat.id)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const studentCheckins = checkins
    .filter((c) => c.idSiswa === studentStat.id)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-emerald-400 shadow-inner">
              {studentStat.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {studentStat.id}
                </span>
                <span className="text-xs text-amber-400 font-semibold font-mono">
                  Rank #{studentStat.rank}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {studentStat.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className={`font-semibold ${tierStyle.textColor}`}>
                  {studentStat.currentBadge}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Tier {studentStat.tier} (Level {studentStat.levelNumber})</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[11px] block">Total XP</span>
              <span className="text-lg font-bold text-white font-mono">
                {studentStat.totalXP.toLocaleString()} XP
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[11px] block">Streak Harian</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {studentStat.currentStreak} Hari
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[11px] block">Last Check-in</span>
              <span className="text-xs font-semibold text-slate-300 font-mono mt-1 block">
                {studentStat.lastCheckinDate || 'Belum ada'}
              </span>
            </div>
          </div>

          {/* Active Privilege (Perk) Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 to-cyan-950/30 border border-emerald-700/50 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Gift className="w-4 h-4" />
              <span>HAK ISTIMEWA LAB (PERK AKTIF):</span>
            </div>
            <p className="text-sm font-semibold text-white">{studentStat.perk}</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Hak istimewa ini diperoleh karena telah mencapai Tier {studentStat.tier}.
              Dapat digunakan selama praktikum sains sesuai kesepakatan dengan guru.
            </p>
          </div>

          {/* Next Level Progression Bar */}
          {studentStat.nextBadge && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Progres Menuju <strong className="text-emerald-400">{studentStat.nextBadge}</strong>:
                </span>
                <span className="font-mono text-slate-300">
                  Sisa <strong className="text-white">{studentStat.xpToNextLevel} XP</strong> ({studentStat.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${studentStat.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 17+ Level Roadmap */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Roadmap 20 Tingkatan Level Sains
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {MASTER_LEVELS.map((lvl) => {
                const isCurrent = lvl.levelNumber === studentStat.levelNumber;
                const isUnlocked = studentStat.totalXP >= lvl.xpMin;

                return (
                  <div
                    key={lvl.levelNumber}
                    className={`p-2 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-emerald-950/80 border-emerald-400 text-white shadow'
                        : isUnlocked
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span>Lvl {lvl.levelNumber}</span>
                      <span>{lvl.xpMin} XP</span>
                    </div>
                    <div className="font-bold truncate mt-1">{lvl.badgeName}</div>
                    <div className="text-[10px] text-slate-500 truncate">{lvl.tier}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Riwayat XP Siswa (Riwayat XP Sheet filter) */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Riwayat XP Personal ({studentXpRecords.length} Catatan)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {studentXpRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="truncate pr-3">
                    <span className="font-mono text-slate-500 mr-2 text-[11px]">{r.tanggal}</span>
                    <span className="text-slate-200">{r.keterangan}</span>
                  </div>
                  <span
                    className={`font-mono font-bold shrink-0 ${
                      r.nilaiXP >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {r.nilaiXP >= 0 ? `+${r.nilaiXP}` : r.nilaiXP} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950">
          <button
            onClick={() => {
              onOpenQuickXP(studentStat.id);
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
          >
            + Beri Reward / Penalti XP Siswa Ini
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
