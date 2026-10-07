import { MasterLevel, Student, XPRecord, DailyCheckinRecord, StudentComputedStats, TierType } from '../types/gamification';
import { MASTER_LEVELS } from '../data/initialData';

/**
 * Parses date string (YYYY-MM-DD) into UTC midnight timestamp for accurate date math
 */
export function parseDateToMidnight(dateStr: string): number {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr).setUTCHours(0, 0, 0, 0);
}

/**
 * Returns difference in days between dateStr2 and dateStr1 (dateStr2 - dateStr1)
 */
export function getDaysDiff(dateStrEarlier: string, dateStrLater: string): number {
  const t1 = parseDateToMidnight(dateStrEarlier);
  const t2 = parseDateToMidnight(dateStrLater);
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((t2 - t1) / oneDay);
}

/**
 * Recalculates Daily Check-in records according to the exact Google Sheets formula:
 * Syarat: Data di-sortir berdasarkan ID Siswa (A-Z) lalu Tanggal (Lama-Baru).
 * Rumus di E2: =IF(B2=B1, IF(A2=A1+1, E1+1, 1), 1)
 */
export function sortAndComputeCheckins(records: DailyCheckinRecord[]): DailyCheckinRecord[] {
  // Sort by idSiswa ascending, then tanggal ascending
  const sorted = [...records].sort((a, b) => {
    if (a.idSiswa !== b.idSiswa) {
      return a.idSiswa.localeCompare(b.idSiswa);
    }
    return a.tanggal.localeCompare(b.tanggal);
  });

  const result: DailyCheckinRecord[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let computedStreak = 1;

    if (i > 0) {
      const prev = result[i - 1];
      // Check if same student ID
      if (current.idSiswa === prev.idSiswa) {
        const diff = getDaysDiff(prev.tanggal, current.tanggal);
        // If consecutive day (+1 day)
        if (diff === 1) {
          computedStreak = prev.streakHarian + 1;
        } else if (diff === 0) {
          // Same day check-in keeps streak
          computedStreak = prev.streakHarian;
        } else {
          // Missed at least 1 day, reset to 1
          computedStreak = 1;
        }
      } else {
        computedStreak = 1;
      }
    }

    result.push({
      ...current,
      streakHarian: computedStreak,
    });
  }

  return result;
}

/**
 * Evaluates VLOOKUP with approximate match (range_lookup = 1) on Master Level:
 * =VLOOKUP(TotalXP, 'Master Level'!A:C, colIndex, 1)
 */
export function vlookupMasterLevel(xp: number, masterLevels: MasterLevel[] = MASTER_LEVELS): MasterLevel {
  const sorted = [...masterLevels].sort((a, b) => a.xpMin - b.xpMin);
  let matched = sorted[0];
  for (const lvl of sorted) {
    if (xp >= lvl.xpMin) {
      matched = lvl;
    } else {
      break;
    }
  }
  return matched;
}

/**
 * Gets next level information
 */
export function getNextLevelInfo(currentXp: number, masterLevels: MasterLevel[] = MASTER_LEVELS): {
  nextBadge: string | null;
  xpToNext: number;
  progressPercent: number;
} {
  const sorted = [...masterLevels].sort((a, b) => a.xpMin - b.xpMin);
  const currentLevel = vlookupMasterLevel(currentXp, sorted);
  const currentIndex = sorted.findIndex((lvl) => lvl.levelNumber === currentLevel.levelNumber);

  if (currentIndex < sorted.length - 1) {
    const nextLevel = sorted[currentIndex + 1];
    const span = nextLevel.xpMin - currentLevel.xpMin;
    const progressInLevel = Math.max(0, currentXp - currentLevel.xpMin);
    const progressPercent = Math.min(100, Math.round((progressInLevel / (span || 1)) * 100));
    return {
      nextBadge: nextLevel.badgeName,
      xpToNext: Math.max(0, nextLevel.xpMin - currentXp),
      progressPercent,
    };
  }

  return {
    nextBadge: null,
    xpToNext: 0,
    progressPercent: 100,
  };
}

/**
 * Computes all columns for Master Data Siswa (Dashboard Utama)
 * according to Sheet 4 formula logic:
 * - Total XP: =SUMIFS('Riwayat XP'!C:C, 'Riwayat XP'!B:B, A2)
 * - Current Badge: =VLOOKUP(C2, 'Master Level'!A:C, 2, 1)
 * - Tier: =VLOOKUP(C2, 'Master Level'!A:C, 3, 1)
 * - Last Check-in: =MAXIFS('Daily Check-in'!A:A, 'Daily Check-in'!B:B, A2)
 * - Current Streak: =IF(F2>=H1-1, MAXIFS('Daily Check-in'!E:E, 'Daily Check-in'!B:B, A2, 'Daily Check-in'!A:A, F2), 0)
 */
export function computeStudentStats(
  students: Student[],
  xpRecords: XPRecord[],
  checkinRecords: DailyCheckinRecord[],
  todayStr: string,
  masterLevels: MasterLevel[] = MASTER_LEVELS
): StudentComputedStats[] {
  // Ensure checkins are sorted and calculated
  const processedCheckins = sortAndComputeCheckins(checkinRecords);

  const stats = students.map((student) => {
    // 1. Total XP [SUMIFS]
    const totalXP = xpRecords
      .filter((r) => r.idSiswa === student.id)
      .reduce((sum, r) => sum + r.nilaiXP, 0);

    // 2. Current Badge & Tier [VLOOKUP]
    const levelInfo = vlookupMasterLevel(totalXP, masterLevels);

    // 3. Last Check-in [MAXIFS]
    const studentCheckins = processedCheckins.filter((c) => c.idSiswa === student.id);
    let lastCheckinDate: string | null = null;
    if (studentCheckins.length > 0) {
      // Find max date string (lexicographically or timestamp)
      const sortedDates = [...studentCheckins].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      lastCheckinDate = sortedDates[0].tanggal;
    }

    // 4. Current Streak [IF(F2>=H1-1, MAXIFS(...), 0)]
    let currentStreak = 0;
    if (lastCheckinDate) {
      const daysSinceLastCheckin = getDaysDiff(lastCheckinDate, todayStr);
      // F2 >= H1 - 1 means daysSinceLastCheckin <= 1 (checked in today (0) or yesterday (1))
      if (daysSinceLastCheckin <= 1) {
        const lastRecords = studentCheckins.filter((c) => c.tanggal === lastCheckinDate);
        currentStreak = Math.max(...lastRecords.map((c) => c.streakHarian), 0);
      } else {
        currentStreak = 0;
      }
    }

    // Progress details
    const nextInfo = getNextLevelInfo(totalXP, masterLevels);

    return {
      id: student.id,
      name: student.name,
      totalXP,
      currentBadge: levelInfo.badgeName,
      levelNumber: levelInfo.levelNumber,
      tier: levelInfo.tier,
      perk: levelInfo.perkDescription,
      lastCheckinDate,
      currentStreak,
      xpToNextLevel: nextInfo.xpToNext,
      progressPercent: nextInfo.progressPercent,
      nextBadge: nextInfo.nextBadge,
      rank: 0,
    };
  });

  // Assign rank by totalXP descending
  stats.sort((a, b) => b.totalXP - a.totalXP);
  stats.forEach((st, idx) => {
    st.rank = idx + 1;
  });

  return stats;
}

/**
 * Returns color classes and badge styles for each tier
 */
export function getTierStyle(tier: TierType): {
  color: string;
  bgLight: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  textColor: string;
} {
  switch (tier) {
    case 'Trainee':
      return {
        color: 'slate',
        bgLight: 'bg-slate-800/60',
        border: 'border-slate-700',
        badgeBg: 'bg-slate-800',
        badgeText: 'text-slate-300',
        textColor: 'text-slate-300',
      };
    case 'Researcher':
      return {
        color: 'cyan',
        bgLight: 'bg-cyan-950/40',
        border: 'border-cyan-800/60',
        badgeBg: 'bg-cyan-900/60',
        badgeText: 'text-cyan-300',
        textColor: 'text-cyan-400',
      };
    case 'Scientist':
      return {
        color: 'emerald',
        bgLight: 'bg-emerald-950/40',
        border: 'border-emerald-800/60',
        badgeBg: 'bg-emerald-900/60',
        badgeText: 'text-emerald-300',
        textColor: 'text-emerald-400',
      };
    case 'Specialist':
      return {
        color: 'purple',
        bgLight: 'bg-purple-950/40',
        border: 'border-purple-800/60',
        badgeBg: 'bg-purple-900/60',
        badgeText: 'text-purple-300',
        textColor: 'text-purple-400',
      };
    case 'Master Scientist':
      return {
        color: 'amber',
        bgLight: 'bg-amber-950/40',
        border: 'border-amber-700/60',
        badgeBg: 'bg-amber-900/60',
        badgeText: 'text-amber-300',
        textColor: 'text-amber-400',
      };
  }
}
