export type TierType = 'Trainee' | 'Researcher' | 'Scientist' | 'Specialist' | 'Master Scientist';

export interface MasterLevel {
  xpMin: number;
  badgeName: string;
  tier: TierType;
  levelNumber: number;
  perkDescription: string;
}

export interface Student {
  id: string; // e.g. "SCI-001"
  name: string;
  avatarSeed?: string;
  activePerksUsed?: Record<string, number>; // perk ID to count used
}

export interface XPRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  idSiswa: string;
  nilaiXP: number; // positive or negative
  keterangan: string;
}

export interface DailyCheckinRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  idSiswa: string;
  pertanyaan: string;
  jawaban: string;
  streakHarian: number; // Formula calculated
}

export interface WeeklyQuest {
  id: string;
  weekNumber: number;
  title: string;
  category: 'Biologi' | 'Fisika' | 'Kimia' | 'Astronomi & Lingkungan';
  xpReward: number;
  description: string;
  completedStudentIds: string[];
}

export interface DailyQuestion {
  id: string;
  tanggal: string;
  pertanyaan: string;
  pilihan?: string[];
  kunciJawaban: string;
  kategori: string;
  penjelasan: string;
  xpBonus: number;
}

export interface StudentComputedStats {
  id: string;
  name: string;
  totalXP: number;
  currentBadge: string;
  levelNumber: number;
  tier: TierType;
  perk: string;
  lastCheckinDate: string | null;
  currentStreak: number;
  xpToNextLevel: number;
  progressPercent: number;
  nextBadge: string | null;
  rank: number;
}
