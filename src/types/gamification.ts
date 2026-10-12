export type TierType = 'Trainee' | 'Researcher' | 'Scientist' | 'Specialist' | 'Master Scientist';

export type UserRole = 'teacher' | 'student';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  studentId?: string;
  mustChangePassword: boolean;
}

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
  username?: string;
  avatarSeed?: string;
  isActive?: boolean;
  createdAt?: string;
  mustChangePassword?: boolean;
  lastLogin?: string | null;
  activePerksUsed?: Record<string, number>;
}

export interface XPRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  idSiswa: string;
  nilaiXP: number; // positive or negative (-1000 to +1000)
  keterangan: string;
  createdBy?: string;
  createdAt?: string;
}

export interface DailyCheckinRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  idSiswa: string;
  pertanyaan: string;
  jawaban: string;
  streakHarian: number; // Formula calculated
  createdAt?: string;
}

export interface PrivilegeRecord {
  id: string;
  studentId: string;
  perkTitle: string;
  tier: string;
  status: 'available' | 'used' | 'revoked';
  notes?: string;
  awardedAt: string;
  usedAt?: string;
  revokedAt?: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'teacher' | 'student';
  action: string;
  details: string;
  timestamp: string;
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

export interface XPPreset {
  id: string;
  label: string;
  xp: number;
  note: string;
  type: 'reward' | 'penalty';
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
