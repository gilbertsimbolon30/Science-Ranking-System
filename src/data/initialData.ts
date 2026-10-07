import { MasterLevel, Student, XPRecord, DailyCheckinRecord, WeeklyQuest, DailyQuestion } from '../types/gamification';

export const MASTER_LEVELS: MasterLevel[] = [
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

export const INITIAL_STUDENTS: Student[] = [];

// Helper to format ISO date string relative to today
const today = new Date();
export const formatDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDate = (offsetDays: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return formatDateStr(d);
};

export const INITIAL_XP_RECORDS: XPRecord[] = [];

export const INITIAL_DAILY_CHECKINS: DailyCheckinRecord[] = [];

export const INITIAL_WEEKLY_QUESTS: WeeklyQuest[] = [
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
  {
    id: 'quest-w5',
    weekNumber: 5,
    title: 'Spektrometri Prisma: Difraksi & Pembiasan Cahaya',
    category: 'Fisika',
    xpReward: 1800,
    description: 'Ukur sudut deviasi minimum sinar monokromatis laser melewati prisma kaca dan hitung indeks bias material menggunakan hukum Snellius.',
    completedStudentIds: [],
  },
  {
    id: 'quest-w6',
    weekNumber: 6,
    title: 'Astro-Nite: Peta Konstelasi Bintang & Fase Bulan',
    category: 'Astronomi & Lingkungan',
    xpReward: 1600,
    description: 'Lakukan pengamatan langit malam selama 7 hari berturut-turut. Gambar pergeseran fase bulan dan cari rasi bintang Orion atau Crux (Salib Selatan).',
    completedStudentIds: [],
  },
];

export const QUESTION_BANK: DailyQuestion[] = [
  {
    id: 'q-today',
    tanggal: formatDateStr(today),
    pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?',
    pilihan: ['Tempat respirasi seluler', 'Tempat berlangsungnya fotosintesis', 'Sintesis protein murni', 'Pengatur tekanan osmotik'],
    kunciJawaban: 'Tempat berlangsungnya fotosintesis',
    kategori: 'Biologi Sel',
    penjelasan: 'Kloroplas mengandung pigmen klorofil yang menyerap foton cahaya matahari untuk mengubah CO2 dan H2O menjadi glukosa dan oksigen.',
    xpBonus: 50,
  },
  {
    id: 'q-yesterday',
    tanggal: getOffsetDate(-1),
    pertanyaan: 'Mengapa es mengapung di atas air cair?',
    pilihan: ['Karena es lebih berat', 'Karena massa jenis es lebih kecil dari air', 'Karena es tidak memiliki molekul', 'Karena gaya gesek udara'],
    kunciJawaban: 'Karena massa jenis es lebih kecil dari air',
    kategori: 'Fisika Molekuler',
    penjelasan: 'Ketika air membeku pada 0°C, ikatan hidrogen membentuk kisi kristal heksagonal yang lebih renggang sehingga volumenya membesar dan densitasnya berkurang.',
    xpBonus: 50,
  },
  {
    id: 'q-bank-1',
    tanggal: getOffsetDate(1),
    pertanyaan: 'Hukum Newton ke berapakah yang berbunyi: "Setiap aksi selalu menghasilkan reaksi yang sama besar namun berlawanan arah"?',
    pilihan: ['Hukum Keppler', 'Hukum Newton I', 'Hukum Newton II', 'Hukum Newton III'],
    kunciJawaban: 'Hukum Newton III',
    kategori: 'Fisika Klasik',
    penjelasan: 'Hukum Newton III (Aksi-Reaksi) menyatakan jika benda A memberi gaya pada benda B, maka benda B memberi gaya yang sama besar dan berlawanan arah pada benda A.',
    xpBonus: 50,
  },
  {
    id: 'q-bank-2',
    tanggal: getOffsetDate(2),
    pertanyaan: 'Unsur apakah yang memiliki lambang kimia Au dalam tabel periodik?',
    pilihan: ['Perak (Argentum)', 'Emas (Aurum)', 'Aluminium', 'Tembaga (Cuprum)'],
    kunciJawaban: 'Emas (Aurum)',
    kategori: 'Kimia Anorganik',
    penjelasan: 'Au berasal dari bahasa Latin "Aurum" yang berarti cahaya fajar yang berkilau, merupakan simbol kimia untuk unsur Emas dengan nomor atom 79.',
    xpBonus: 50,
  },
  {
    id: 'q-bank-3',
    tanggal: getOffsetDate(3),
    pertanyaan: 'Gas apakah yang paling melimpah menyusun atmosfer Bumi?',
    pilihan: ['Oksigen (O2)', 'Karbon Dioksida (CO2)', 'Nitrogen (N2)', 'Argon (Ar)'],
    kunciJawaban: 'Nitrogen (N2)',
    kategori: 'Ilmu Bumi & Atmosfer',
    penjelasan: 'Atmosfer bumi tersusun atas sekitar 78% gas Nitrogen (N2), sekitar 21% Oksigen (O2), dan 1% gas lainnya.',
    xpBonus: 50,
  },
];
