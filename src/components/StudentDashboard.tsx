import React, { useState } from 'react';
import {
  Student,
  StudentComputedStats,
  PrivilegeRecord,
  XPRecord,
} from '../types/gamification';
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  Gift,
  Shield,
  Clock,
  Medal,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { getTierStyle } from '../utils/gamificationEngine';

interface StudentDashboardProps {
  student: Student;
  myStat: StudentComputedStats | null;
  allStats: StudentComputedStats[];
  privileges: PrivilegeRecord[];
  xpHistory: XPRecord[];
  onChangePasswordClick: () => void;
  onGoBack?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  myStat,
  allStats,
  privileges,
  xpHistory,
  onChangePasswordClick,
  onGoBack,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'history'>('overview');
  const tierStyle = myStat ? getTierStyle(myStat.tier) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Back / Exit bar if available */}
      {onGoBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Kembali ke Papan Peringkat</span>
          </button>
          <span className="text-xs text-slate-500">Mode Pratinjau Siswa</span>
        </div>
      )}

      {/* Student Passport Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-2xl text-emerald-400">
                  {student.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
              {myStat && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full border-2 border-slate-900 shadow">
                  #{myStat.rank}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                  {student.id}
                </span>
                {tierStyle && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${tierStyle.badge}`}>
                    {myStat?.tier}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{student.name}</h2>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-0.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-amber-300">{myStat?.currentBadge || 'Lab Recruit'}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Level {myStat?.levelNumber || 1}</span>
              </p>
            </div>
          </div>

          {/* Key Metric Chips */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-slate-950/70 border border-slate-800/80 rounded-2xl px-5 py-3 text-center min-w-[120px]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Total XP</span>
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {(myStat?.totalXP || 0).toLocaleString()} <span className="text-xs font-medium text-emerald-400">XP</span>
              </div>
            </div>

            <div className="flex-1 md:flex-initial bg-slate-950/70 border border-slate-800/80 rounded-2xl px-5 py-3 text-center min-w-[120px]">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                <Medal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Peringkat Kelas</span>
              </div>
              <div className="text-xl font-black text-cyan-300 mt-0.5">
                #{myStat?.rank || 1} <span className="text-xs font-medium text-slate-400">dari {allStats.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar to Next Badge */}
        {myStat && (
          <div className="mt-6 pt-5 border-t border-slate-800/70">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-400">
                Menuju: <strong className="text-emerald-300">{myStat.nextBadge || 'Puncak Peneliti Teratas'}</strong>
              </span>
              <span className="text-slate-400">
                {myStat.nextBadge ? (
                  <>
                    Kurang <strong className="text-emerald-400 font-bold">{myStat.xpToNextLevel.toLocaleString()} XP</strong> lagi ({myStat.progressPercent}%)
                  </>
                ) : (
                  'Level Maksimal Tercapai'
                )}
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                style={{ width: `${myStat.progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs for Student Portal */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ringkasan & Hak Istimewa</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'leaderboard'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Papan Peringkat Kelas ({allStats.length} Siswa)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Riwayat XP Saya ({xpHistory.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PRIVILEGES */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unlocked Perks & Privileges Box */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Hak Istimewa & Reward Laboratorium</h3>
                </div>
                <span className="text-xs text-slate-400">Didapat dari Kenaikan Tier</span>
              </div>

              {/* Tier Perk Status */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Perk Tier Aktif: {myStat?.tier}</h4>
                    <p className="text-sm font-semibold text-white mt-1 leading-relaxed">
                      "{myStat?.perk || 'Belum ada hak istimewa'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Awarded Privileges History List */}
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Kupon & Hak Istimewa Khusus Guru ({privileges.length})
              </h4>

              {privileges.length === 0 ? (
                <div className="p-6 text-center bg-slate-950/50 rounded-xl border border-slate-800/60 text-xs text-slate-400">
                  <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>Belum ada kupon reward manual yang diberikan oleh guru.</p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Kupon seperti "Hint Card Kuis" atau "Bebas Piket" akan muncul di sini saat diberikan oleh guru pembina.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {privileges.map((p) => {
                    const isAvailable = p.status === 'available';
                    const isUsed = p.status === 'used';
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          isAvailable
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                            : isUsed
                            ? 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-75'
                            : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{p.perkTitle}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isAvailable
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : isUsed
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {isAvailable ? 'Siap Digunakan' : isUsed ? 'Telah Digunakan' : 'Dicabut'}
                            </span>
                          </div>
                          {p.notes && <p className="text-xs text-slate-300 mt-1">{p.notes}</p>}
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                            <span>Diberikan: {p.awardedAt.split('T')[0]}</span>
                            {p.usedAt && <span>Digunakan: {p.usedAt.split('T')[0]}</span>}
                          </div>
                        </div>

                        {isAvailable && (
                          <div className="shrink-0 text-right">
                            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 inline-block">
                              Tunjukkan ke Guru
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Account Settings Box */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-2">Pengaturan Akun</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Jaga keamanan akun siswa Anda dengan mengganti kata sandi secara berkala.
              </p>
              <button
                onClick={onChangePasswordClick}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Ganti Kata Sandi Saya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Papan Peringkat Resmi Kelas Science</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Peringkat seluruh {allStats.length} siswa berdasarkan akumulasi poin XP.
              </p>
            </div>

            {myStat && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2 self-start sm:self-auto">
                <span>Posisi Anda:</span>
                <strong className="text-white font-bold">#{myStat.rank}</strong>
                <span>({myStat.totalXP.toLocaleString()} XP)</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Tingkat Badge</th>
                  <th className="py-3.5 px-4">Tier Perk</th>
                  <th className="py-3.5 px-4 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {allStats.map((s) => {
                  const isMe = s.id === student.id;
                  const tStyle = getTierStyle(s.tier);
                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/20 font-bold border-l-4 border-l-emerald-400'
                          : 'hover:bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {s.rank === 1 && <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow">1</span>}
                        {s.rank === 2 && <span className="inline-block px-2 py-0.5 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow">2</span>}
                        {s.rank === 3 && <span className="inline-block px-2 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs shadow">3</span>}
                        {s.rank > 3 && <span className="text-slate-400 font-mono">#{s.rank}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={isMe ? 'text-emerald-300 font-bold' : 'text-white'}>
                            {s.name}
                          </span>
                          {isMe && (
                            <span className="text-[10px] bg-emerald-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                              SAYA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>{s.currentBadge}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tStyle.badge}`}>
                          {s.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-mono ${isMe ? 'text-emerald-300 text-sm' : 'text-slate-200'}`}>
                          {s.totalXP.toLocaleString()} XP
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: XP HISTORY FOR CURRENT STUDENT */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">Catatan Perolehan Poin XP Pribadi</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hanya menampilkan catatan reward dan penalti khusus untuk akun Anda ({student.name}).
            </p>
          </div>

          {xpHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada riwayat XP yang tercatat untuk akun Anda.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {xpHistory.map((rec) => {
                const isPositive = rec.nilaiXP > 0;
                return (
                  <div key={rec.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-white">{rec.keterangan}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{rec.tanggal}</span>
                        {rec.createdBy && (
                          <>
                            <span>•</span>
                            <span>Oleh: {rec.createdBy}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className={`font-mono font-black text-sm shrink-0 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? `+${rec.nilaiXP}` : rec.nilaiXP} XP
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
