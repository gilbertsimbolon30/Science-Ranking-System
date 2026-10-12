import fs from 'fs';
import path from 'path';
import { hashPassword } from './auth';

export interface UserAccount {
  id: string;
  username: string; // Login ID, e.g. "Guru" or "Abigail J" or "SCI-001"
  name: string;
  role: 'teacher' | 'student';
  studentId?: string; // e.g. "SCI-001"
  passwordHash: string;
  salt: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string; // e.g. "SCI-001"
  name: string; // e.g. "Abigail J"
  username: string; // for login
  avatarSeed?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MasterLevel {
  xpMin: number;
  badgeName: string;
  tier: 'Trainee' | 'Researcher' | 'Scientist' | 'Specialist' | 'Master Scientist';
  levelNumber: number;
  perkDescription: string;
}

export interface XPRecord {
  id: string;
  tanggal: string;
  idSiswa: string;
  nilaiXP: number; // can be positive or negative (-1000 to +1000)
  keterangan: string;
  createdBy: string; // username or teacher ID
  createdAt: string;
}

export interface DailyCheckinRecord {
  id: string;
  tanggal: string;
  idSiswa: string;
  pertanyaan: string;
  jawaban: string;
  streakHarian: number;
  createdAt: string;
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

export interface XPPreset {
  id: string;
  label: string;
  xp: number;
  note: string;
  type: 'reward' | 'penalty';
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

export interface DatabaseSchema {
  users: UserAccount[];
  students: StudentProfile[];
  levels: MasterLevel[];
  xpRecords: XPRecord[];
  checkins: DailyCheckinRecord[];
  privileges: PrivilegeRecord[];
  activityLogs: ActivityLog[];
  rewardPresets: XPPreset[];
  penaltyPresets: XPPreset[];
  quests: WeeklyQuest[];
  todayQuestion: DailyQuestion;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sainsquest_db.json');

// 42 Default Students for Science Class Ranking System
export const SEED_STUDENT_NAMES = [
  'Abigail J',
  'Ahmad Fauzi',
  'Alisha Putri',
  'Arya Pratama',
  'Bagas Wicaksono',
  'Bryan Christianto',
  'Cantika Dewi',
  'Chelsea Olivia',
  'Daniel Wijaya',
  'David Sitorus',
  'Dinda Kirana',
  'Edward Salim',
  'Farhan Ramadhan',
  'Felicia Anggraini',
  'Gabriel Sinaga',
  'Gabriella Santoso',
  'Hafiz Syahputra',
  'Jonathan Tanuwijaya',
  'Joshua Michael',
  'Kayla Zahra',
  'Kevin Sanjaya',
  'Larissa Chou',
  'Marcellino Siregar',
  'Michelle Angela',
  'Muhammad Rizky',
  'Nadine Chandrawinata',
  'Nathan Alexander',
  'Nicholas Saputra',
  'Olivia Paramitha',
  'Rafael Simbolon',
  'Raisa Andriana',
  'Randy Pangalila',
  'Reyhan Pratama',
  'Samuel Hutapea',
  'Sarah Sechan',
  'Stephanie Poetri',
  'Timothy Ronald',
  'Valencia Tanoesoedibjo',
  'Vanessa Angel',
  'Vania Larissa',
  'William Surya',
  'Zahra Amalia',
];

const DEFAULT_LEVELS: MasterLevel[] = [
  // Tier 1: TRAINEE
  { xpMin: 0, badgeName: 'Lab Recruit', tier: 'Trainee', levelNumber: 1, perkDescription: 'Belum ada hak istimewa' },
  { xpMin: 100, badgeName: 'Lab Trainee', tier: 'Trainee', levelNumber: 2, perkDescription: 'Belum ada hak istimewa' },
  { xpMin: 250, badgeName: 'Junior Lab Assistant', tier: 'Trainee', levelNumber: 3, perkDescription: 'Belum ada hak istimewa' },
  { xpMin: 450, badgeName: 'Senior Lab Assistant', tier: 'Trainee', levelNumber: 4, perkDescription: 'Belum ada hak istimewa' },

  // Tier 2: RESEARCHER
  { xpMin: 700, badgeName: 'Junior Researcher', tier: 'Researcher', levelNumber: 5, perkDescription: 'Boleh memilih teman kelompok praktikum' },
  { xpMin: 1000, badgeName: 'Field Researcher', tier: 'Researcher', levelNumber: 6, perkDescription: 'Boleh memilih teman kelompok praktikum' },
  { xpMin: 1350, badgeName: 'Experimental Researcher', tier: 'Researcher', levelNumber: 7, perkDescription: 'Boleh memilih teman kelompok praktikum' },
  { xpMin: 1750, badgeName: 'Senior Researcher', tier: 'Researcher', levelNumber: 8, perkDescription: 'Boleh memilih teman kelompok praktikum' },

  // Tier 3: SCIENTIST
  { xpMin: 2200, badgeName: 'Associate Scientist', tier: 'Scientist', levelNumber: 9, perkDescription: 'Dapat 1 "Hint Card" saat kuis' },
  { xpMin: 2700, badgeName: 'Staff Scientist', tier: 'Scientist', levelNumber: 10, perkDescription: 'Dapat 1 "Hint Card" saat kuis' },
  { xpMin: 3250, badgeName: 'Principal Scientist', tier: 'Scientist', levelNumber: 11, perkDescription: 'Dapat 1 "Hint Card" saat kuis' },
  { xpMin: 3850, badgeName: 'Senior Scientist', tier: 'Scientist', levelNumber: 12, perkDescription: 'Dapat 1 "Hint Card" saat kuis' },

  // Tier 4: SPECIALIST
  { xpMin: 4500, badgeName: 'Science Specialist', tier: 'Specialist', levelNumber: 13, perkDescription: 'Bebas tugas piket lab 1x / pilih tempat duduk' },
  { xpMin: 5200, badgeName: 'Research Specialist', tier: 'Specialist', levelNumber: 14, perkDescription: 'Bebas tugas piket lab 1x / pilih tempat duduk' },
  { xpMin: 6000, badgeName: 'Lead Scientist', tier: 'Specialist', levelNumber: 15, perkDescription: 'Bebas tugas piket lab 1x / pilih tempat duduk' },
  { xpMin: 7000, badgeName: 'Chief Scientist', tier: 'Specialist', levelNumber: 16, perkDescription: 'Bebas tugas piket lab 1x / pilih tempat duduk' },

  // Tier 5: MASTER SCIENTIST
  { xpMin: 8200, badgeName: 'Master Scientist Lvl 1', tier: 'Master Scientist', levelNumber: 17, perkDescription: 'Asisten Guru & Leaderboard Permanen' },
  { xpMin: 9600, badgeName: 'Master Scientist Lvl 2', tier: 'Master Scientist', levelNumber: 18, perkDescription: 'Asisten Guru & Leaderboard Permanen' },
  { xpMin: 11200, badgeName: 'Master Scientist Lvl 3', tier: 'Master Scientist', levelNumber: 19, perkDescription: 'Asisten Guru & Leaderboard Permanen' },
  { xpMin: 13000, badgeName: 'Grand Master Scientist', tier: 'Master Scientist', levelNumber: 20, perkDescription: 'Asisten Guru, Gelar Kehormatan Lab & Leaderboard Hall of Fame' },
];

const DEFAULT_REWARDS: XPPreset[] = [
  { id: 'rew-1', label: 'Bertanya Kritis / Hipotesis', xp: 50, note: 'Bertanya kritis dan merumuskan hipotesis ilmiah', type: 'reward' },
  { id: 'rew-2', label: 'Praktikum Tertib & Aman', xp: 100, note: 'Pelaksanaan praktikum sangat tertib & mematuhi SOP', type: 'reward' },
  { id: 'rew-3', label: 'Laporan Praktikum Sempurna', xp: 250, note: 'Laporan praktikum komprehensif dan analisis data mendalam', type: 'reward' },
  { id: 'rew-4', label: 'Presentasi Hasil Riset', xp: 350, note: 'Presentasi ilmiah sangat lugas dan data teruji', type: 'reward' },
  { id: 'rew-5', label: 'Proyek Sains Inovatif', xp: 500, note: 'Karya inovasi sains/rekayasa teknologi terpilih', type: 'reward' },
];

const DEFAULT_PENALTIES: XPPreset[] = [
  { id: 'pen-1', label: 'Terlambat Kumpul Tugas', xp: 20, note: 'Terlambat mengumpulkan tugas atau lembar kerja lab', type: 'penalty' },
  { id: 'pen-2', label: 'Tidak Pakai Jas Lab / APD', xp: 50, note: 'Pelanggaran SOP: Tidak mengenakan jas lab / kacamata', type: 'penalty' },
  { id: 'pen-3', label: 'Meja Praktikum Berantakan', xp: 75, note: 'Alat dan preparat lab tidak dibersihkan setelah selesai', type: 'penalty' },
  { id: 'pen-4', label: 'Merusak Alat Kaca / Tabung', xp: 100, note: 'Kelalaian penanganan peralatan kaca laboratorium', type: 'penalty' },
];

const DEFAULT_QUESTS: WeeklyQuest[] = [
  {
    id: 'quest-w1',
    weekNumber: 1,
    title: 'Laboratorium Hijau: Ekstraksi Klorofil Daun',
    category: 'Biologi',
    xpReward: 800,
    description: 'Lakukan pemisahan pigmen klorofil menggunakan alkohol panas dan saring menggunakan kertas kromatografi sederhana. Ambil foto hasil kromatogram.',
    completedStudentIds: [],
  },
  {
    id: 'quest-w2',
    weekNumber: 2,
    title: 'Detektif pH: Indikator Asam Basa Alami',
    category: 'Kimia',
    xpReward: 1000,
    description: 'Buat ekstrak kunyit atau kol ungu sebagai indikator alami untuk menguji 5 bahan dapur (cuka, sabun, soda kue, jeruk nipis, air garam). Catat spektrum perubahan warna.',
    completedStudentIds: [],
  },
  {
    id: 'quest-w3',
    weekNumber: 3,
    title: 'Eksplorasi Mikro-Kosmos: Preparat Sel Gabus & Sel Bawang',
    category: 'Biologi',
    xpReward: 1200,
    description: 'Buat sayatan membujur tipis sel epidermis Allium cepa, amati di bawah mikroskop perbesaran 400x, dan identifikasi sitoplasma, nukleus, serta dinding sel.',
    completedStudentIds: [],
  },
  {
    id: 'quest-w4',
    weekNumber: 4,
    title: 'Energi Terbarukan: Rancang Mini Turbin Air Pelton',
    category: 'Fisika',
    xpReward: 1500,
    description: 'Rancang sudu turbin dari sendok plastik dan dynamo motor DC mini. Ukur tegangan output (volt) yang dihasilkan saat dialiri kran air laboratorium.',
    completedStudentIds: [],
  },
];

const DEFAULT_TODAY_QUESTION: DailyQuestion = {
  id: 'q-today',
  tanggal: new Date().toISOString().split('T')[0],
  pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?',
  pilihan: ['Tempat respirasi seluler', 'Tempat berlangsungnya fotosintesis', 'Sintesis protein murni', 'Pengatur tekanan osmotik'],
  kunciJawaban: 'Tempat berlangsungnya fotosintesis',
  kategori: 'Biologi Sel',
  penjelasan: 'Kloroplas mengandung pigmen klorofil yang menyerap foton cahaya matahari untuk mengubah CO2 dan H2O menjadi glukosa dan oksigen.',
  xpBonus: 50,
};

let memoryDB: DatabaseSchema | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initializeDatabase(): DatabaseSchema {
  ensureDataDirectory();

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content) as DatabaseSchema;
      // Ensure defaults for backwards compatibility
      if (!data.levels || data.levels.length === 0) data.levels = DEFAULT_LEVELS;
      if (!data.rewardPresets) data.rewardPresets = DEFAULT_REWARDS;
      if (!data.penaltyPresets) data.penaltyPresets = DEFAULT_PENALTIES;
      if (!data.privileges) data.privileges = [];
      if (!data.activityLogs) data.activityLogs = [];
      if (!data.quests) data.quests = DEFAULT_QUESTS;
      if (!data.todayQuestion) data.todayQuestion = DEFAULT_TODAY_QUESTION;

      // Ensure teacher account exists
      const hasTeacher = data.users.some((u) => u.role === 'teacher');
      if (!hasTeacher) {
        const teacherPass = hashPassword('Science');
        data.users.push({
          id: 'user-teacher-guru',
          username: 'Guru',
          name: 'Guru Pembina Science',
          role: 'teacher',
          passwordHash: teacherPass.hash,
          salt: teacherPass.salt,
          mustChangePassword: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Ensure Dummy student account exists (ID: Dummy, Password: 123)
      let dummyUser = data.users.find((u) => u.username.toLowerCase() === 'dummy');
      const dummyStudentId = 'SCI-DUMMY';
      const dummyPass = hashPassword('123');

      if (!dummyUser) {
        if (!data.students.some((s) => s.id === dummyStudentId || s.username === 'Dummy')) {
          data.students.push({
            id: dummyStudentId,
            name: 'Dummy Student',
            username: 'Dummy',
            avatarSeed: 'seed-dummy',
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }

        data.users.push({
          id: 'user-dummy-student',
          username: 'Dummy',
          name: 'Dummy Student',
          role: 'student',
          studentId: dummyStudentId,
          passwordHash: dummyPass.hash,
          salt: dummyPass.salt,
          mustChangePassword: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Add initial sample XP and privilege for Dummy student to test dashboard nicely
        if (!data.xpRecords.some((x) => x.idSiswa === dummyStudentId)) {
          data.xpRecords.push({
            id: 'xp-dummy-welcome',
            tanggal: new Date().toISOString().split('T')[0],
            idSiswa: dummyStudentId,
            nilaiXP: 750,
            keterangan: 'Simulasi XP Awal (Pengujian Dashboard Siswa)',
            createdBy: 'Guru Pembina Science',
            createdAt: new Date().toISOString(),
          });
        }

        if (!data.privileges.some((p) => p.studentId === dummyStudentId)) {
          data.privileges.push({
            id: 'prv-dummy-welcome',
            studentId: dummyStudentId,
            perkTitle: 'Boleh Memilih Teman Kelompok Praktikum',
            tier: 'Researcher',
            status: 'available',
            notes: 'Kupon uji coba simulasi dashboard',
            awardedAt: new Date().toISOString(),
          });
        }
      } else {
        // Guarantee password is 123
        dummyUser.passwordHash = dummyPass.hash;
        dummyUser.salt = dummyPass.salt;
        dummyUser.mustChangePassword = false;
        dummyUser.isActive = true;
      }

      memoryDB = data;
      saveDatabase();
      return memoryDB;
    } catch (err) {
      console.error('Failed to load existing database, recreating seed:', err);
    }
  }

  // Brand new seed initialization
  const now = new Date().toISOString();
  const teacherPass = hashPassword('Science');
  const studentInitialPass = hashPassword('123456');

  const users: UserAccount[] = [
    {
      id: 'user-teacher-guru',
      username: 'Guru',
      name: 'Guru Pembina Science',
      role: 'teacher',
      passwordHash: teacherPass.hash,
      salt: teacherPass.salt,
      mustChangePassword: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const students: StudentProfile[] = [];

  // Seed 42 students
  SEED_STUDENT_NAMES.forEach((name, index) => {
    const studentId = `SCI-${String(index + 1).padStart(3, '0')}`;
    students.push({
      id: studentId,
      name,
      username: name,
      avatarSeed: `seed-${studentId}`,
      isActive: true,
      createdAt: now,
    });

    users.push({
      id: `user-${studentId}`,
      username: name,
      name,
      role: 'student',
      studentId,
      passwordHash: studentInitialPass.hash,
      salt: studentInitialPass.salt,
      mustChangePassword: true, // First login must change password!
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });

  const initialDB: DatabaseSchema = {
    users,
    students,
    levels: DEFAULT_LEVELS,
    xpRecords: [],
    checkins: [],
    privileges: [],
    activityLogs: [
      {
        id: `act-${Date.now()}`,
        actorId: 'system',
        actorName: 'System',
        actorRole: 'teacher',
        action: 'INITIALIZE_SYSTEM',
        details: 'Sistem SainsQuest diinisialisasi dengan akun Guru dan 42 akun siswa.',
        timestamp: now,
      },
    ],
    rewardPresets: DEFAULT_REWARDS,
    penaltyPresets: DEFAULT_PENALTIES,
    quests: DEFAULT_QUESTS,
    todayQuestion: DEFAULT_TODAY_QUESTION,
  };

  memoryDB = initialDB;
  saveDatabase();
  return memoryDB;
}

export function getDatabase(): DatabaseSchema {
  if (!memoryDB) {
    return initializeDatabase();
  }
  return memoryDB;
}

export function saveDatabase(): void {
  if (!memoryDB) return;
  ensureDataDirectory();
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(memoryDB, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

export function logActivity(
  actorId: string,
  actorName: string,
  actorRole: 'teacher' | 'student',
  action: string,
  details: string
): void {
  const db = getDatabase();
  db.activityLogs.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actorId,
    actorName,
    actorRole,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
  // Keep last 500 logs
  if (db.activityLogs.length > 500) {
    db.activityLogs = db.activityLogs.slice(0, 500);
  }
  saveDatabase();
}
