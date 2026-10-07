import React, { useState } from 'react';
import { StudentComputedStats, TierType } from '../types/gamification';
import { Flame, Trophy, Search, PlusCircle, User, ChevronRight, Gift } from 'lucide-react';
import { getTierStyle } from '../utils/gamificationEngine';

interface LeaderboardViewProps {
  stats: StudentComputedStats[];
  onSelectStudent: (studentId: string) => void;
  onOpenQuickXP: (studentId: string) => void;
  onGoToCheckin: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  stats,
  onSelectStudent,
  onOpenQuickXP,
  onGoToCheckin,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtering
  const filteredStats = stats.filter((st) => {
    const matchesTier = selectedTier === 'all' || st.tier.toLowerCase() === selectedTier.toLowerCase();
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.currentBadge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  // Top 3 students
  const topThree = stats.slice(0, 3);
  const totalStudents = stats.length;
  const avgXP = totalStudents > 0 ? Math.round(stats.reduce((acc, s) => acc + s.totalXP, 0) / totalStudents) : 0;
  const maxStreak = stats.length > 0 ? Math.max(...stats.map((s) => s.currentStreak)) : 0;
  const activeStreakCount = stats.filter((s) => s.currentStreak > 0).length;

  return (
    <div className="space-y-6">
      {/* Hero Banner with Generated Laboratory Asset */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/science_lab_gamification_hero_1791358813655.jpg"
            alt="Laboratorium Science"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
            <span>TAHUN AJARAN 2026/2027</span>
            <span>·</span>
            <span>KONTROL PENUH GURU</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Leaderboard Sains & Ekosistem Gamifikasi
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Meningkatkan partisipasi, rasa ingin tahu ilmiah, dan konsistensi siswa melalui sistem poin absolut,
            streak check-in harian, dan hak istimewa (perks) lab.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-lg">
              <span className="text-slate-400 block">Total Siswa Terdaftar</span>
              <span className="text-lg font-bold text-white font-mono">{totalStudents} Siswa</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-lg">
              <span className="text-slate-400 block">Rata-rata XP Kelas</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{avgXP.toLocaleString()} XP</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-lg">
              <span className="text-slate-400 block">Streak Tertinggi Aktif</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{maxStreak} Hari</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-lg">
              <span className="text-slate-400 block">Siswa Streak Aktif</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{activeStreakCount} Siswa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium (Rank 1, 2, 3) */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                RANK #2
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-200">
                <Trophy className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">{topThree[1].id}</div>
              <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-cyan-400 transition-colors">
                {topThree[1].name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-cyan-400 font-semibold">{topThree[1].currentBadge}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Tier {topThree[1].tier}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total XP</span>
                <span className="text-lg font-bold text-white font-mono">{topThree[1].totalXP.toLocaleString()} XP</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{topThree[1].currentStreak} Hari</span>
              </div>
            </div>
            <button
              onClick={() => onSelectStudent(topThree[1].id)}
              className="mt-3 w-full py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-center"
            >
              Lihat Detail Passport
            </button>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/30 to-slate-900 border-2 border-amber-500/50 rounded-xl p-6 flex flex-col justify-between relative shadow-lg shadow-amber-950/20 group hover:border-amber-400 transition-colors">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-bl-lg">
              LABORATORY CHAMPION
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                RANK #1
              </span>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-xs text-amber-400/80 font-mono">{topThree[0].id}</div>
              <h3 className="text-lg font-extrabold text-white mt-0.5 group-hover:text-amber-300 transition-colors">
                {topThree[0].name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-amber-300 font-semibold">{topThree[0].currentBadge}</span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-200/80">Tier {topThree[0].tier}</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 bg-slate-950/40 p-2 rounded border border-slate-800">
                <span className="text-amber-400 font-medium">Perk Aktif:</span> {topThree[0].perk}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total XP</span>
                <span className="text-xl font-black text-amber-400 font-mono">{topThree[0].totalXP.toLocaleString()} XP</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 text-sm font-bold bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-800/40">
                <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                <span>{topThree[0].currentStreak} Hari Streak</span>
              </div>
            </div>
            <button
              onClick={() => onSelectStudent(topThree[0].id)}
              className="mt-3 w-full py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer text-center"
            >
              Lihat Detail Passport
            </button>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                RANK #3
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-500">
                <Trophy className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">{topThree[2].id}</div>
              <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-emerald-400 transition-colors">
                {topThree[2].name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-400 font-semibold">{topThree[2].currentBadge}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Tier {topThree[2].tier}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total XP</span>
                <span className="text-lg font-bold text-white font-mono">{topThree[2].totalXP.toLocaleString()} XP</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{topThree[2].currentStreak} Hari</span>
              </div>
            </div>
            <button
              onClick={() => onSelectStudent(topThree[2].id)}
              className="mt-3 w-full py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer text-center"
            >
              Lihat Detail Passport
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Tier Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Semua Tier' },
            { id: 'Trainee', label: 'Trainee' },
            { id: 'Researcher', label: 'Researcher' },
            { id: 'Scientist', label: 'Scientist' },
            { id: 'Specialist', label: 'Specialist' },
            { id: 'Master Scientist', label: 'Master' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTier(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedTier === tab.id
                  ? 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa, ID (SCI-001), atau badge..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Peringkat Kelas Sains ({filteredStats.length} Siswa)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Diperbarui otomatis berdasarkan rumus SUMIFS('Riwayat XP') & VLOOKUP('Master Level')
            </p>
          </div>
          <button
            onClick={onGoToCheckin}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Portal Check-in</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-14 text-center">Rank</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Tingkatan & Badge</th>
                <th className="py-3 px-4">Perk Istimewa</th>
                <th className="py-3 px-4 text-right">Total XP</th>
                <th className="py-3 px-4 text-center">Current Streak</th>
                <th className="py-3 px-4 text-center">Aksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStats.map((st) => {
                const tierStyle = getTierStyle(st.tier);
                return (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectStudent(st.id)}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center font-mono">
                      {st.rank === 1 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                          1
                        </span>
                      )}
                      {st.rank === 2 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-slate-200 font-bold">
                          2
                        </span>
                      )}
                      {st.rank === 3 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-900/40 text-amber-600 font-bold">
                          3
                        </span>
                      )}
                      {st.rank > 3 && <span className="text-slate-400 font-medium">#{st.rank}</span>}
                    </td>

                    {/* Siswa */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                            {st.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{st.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Level & Badge */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${tierStyle.textColor}`}>
                            {st.currentBadge}
                          </span>
                          <span className="text-slate-500 text-[10px]">Lvl {st.levelNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-400">Tier {st.tier}</span>
                          {st.nextBadge && (
                            <span className="text-[10px] text-slate-400">
                              · sisa {st.xpToNextLevel} XP ke {st.nextBadge}
                            </span>
                          )}
                        </div>
                        {/* Progress mini bar */}
                        <div className="w-36 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${st.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Perk Privilege */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300 max-w-[240px]">
                        <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate" title={st.perk}>
                          {st.perk}
                        </span>
                      </div>
                    </td>

                    {/* Total XP */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-white font-mono text-sm">
                        {st.totalXP.toLocaleString()} XP
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {st.totalXP >= 0 ? 'Poin Positif' : 'Penalti Bersih'}
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono">
                        <Flame
                          className={`w-3.5 h-3.5 ${
                            st.currentStreak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            st.currentStreak > 0 ? 'text-amber-400' : 'text-slate-500'
                          }`}
                        >
                          {st.currentStreak}
                        </span>
                        <span className="text-[10px] text-slate-400">hari</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenQuickXP(st.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 rounded-md transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                          title="Input Reward / Penalti XP Siswa"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>XP</span>
                        </button>
                        <button
                          onClick={() => onSelectStudent(st.id)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="Lihat Rincian Siswa"
                        >
                          <User className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
