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

export const INITIAL_STUDENTS: Student[] = [
  { id: 'SCI-001', name: 'Ahmad Rizki Pratama' },
  { id: 'SCI-002', name: 'Siti Nurhaliza Zahra' },
  { id: 'SCI-003', name: 'Budi Santoso Wibowo' },
  { id: 'SCI-004', name: 'Dewi Lestari Anggraini' },
  { id: 'SCI-005', name: 'Fajar Nugraha Saputra' },
  { id: 'SCI-006', name: 'Gita Maharani Putri' },
  { id: 'SCI-007', name: 'Hafiz Maulana Syah' },
  { id: 'SCI-008', name: 'Indah Kusuma Wardani' },
  { id: 'SCI-009', name: 'Joko Tri Pamungkas' },
  { id: 'SCI-010', name: 'Kania Citra Kirana' },
  { id: 'SCI-011', name: 'Luthfi Hakim Ananta' },
  { id: 'SCI-012', name: 'Maya Melinda Salsabila' },
  { id: 'SCI-013', name: 'Naufal Arya Ramadhan' },
  { id: 'SCI-014', name: 'Putri Ayu Wandira' },
  { id: 'SCI-015', name: 'Rian Dwi Kurniawan' },
  { id: 'SCI-016', name: 'Shinta Bella Rosalina' },
  { id: 'SCI-017', name: 'Tegar Bagus Wicaksana' },
  { id: 'SCI-018', name: 'Vina Febriani Cantika' },
  { id: 'SCI-019', name: 'Wahyu Hidayatullah' },
  { id: 'SCI-020', name: 'Zahra Aulia Rahmah' },
];

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

export const INITIAL_XP_RECORDS: XPRecord[] = [
  // Ahmad Rizki (Top tier)
  { id: 'xp-1', tanggal: getOffsetDate(-20), idSiswa: 'SCI-001', nilaiXP: 500, keterangan: 'Pre-test Sains & Pemahaman Teori Sel: Nilai Sempurna' },
  { id: 'xp-2', tanggal: getOffsetDate(-18), idSiswa: 'SCI-001', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-3', tanggal: getOffsetDate(-15), idSiswa: 'SCI-001', nilaiXP: 1000, keterangan: 'Selesai Quest Mingguan 2: Titrasi Asam Basa Alami' },
  { id: 'xp-4', tanggal: getOffsetDate(-12), idSiswa: 'SCI-001', nilaiXP: 1200, keterangan: 'Selesai Quest Mingguan 3: Preparat Mikroskop Sel Gabus' },
  { id: 'xp-5', tanggal: getOffsetDate(-9), idSiswa: 'SCI-001', nilaiXP: 1500, keterangan: 'Selesai Quest Mingguan 4: Mini Turbin Tenaga Air' },
  { id: 'xp-6', tanggal: getOffsetDate(-6), idSiswa: 'SCI-001', nilaiXP: 1800, keterangan: 'Selesai Quest Mingguan 5: Simulasi Spektroskopi Cahaya' },
  { id: 'xp-7', tanggal: getOffsetDate(-3), idSiswa: 'SCI-001', nilaiXP: 1500, keterangan: 'Juara 1 Olimpiade Sains Antar Kelas' },
  { id: 'xp-8', tanggal: getOffsetDate(-1), idSiswa: 'SCI-001', nilaiXP: 250, keterangan: 'Bonus Konsistensi Daily Check-in Streak 15 Hari' },
  { id: 'xp-9', tanggal: getOffsetDate(-14), idSiswa: 'SCI-001', nilaiXP: -50, keterangan: 'Penalti: Lupa mengenakan jas laboratorium saat praktikum' },

  // Siti Nurhaliza (High tier)
  { id: 'xp-10', tanggal: getOffsetDate(-20), idSiswa: 'SCI-002', nilaiXP: 450, keterangan: 'Pre-test Sains & Konsep Fotosintesis' },
  { id: 'xp-11', tanggal: getOffsetDate(-17), idSiswa: 'SCI-002', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-12', tanggal: getOffsetDate(-14), idSiswa: 'SCI-002', nilaiXP: 1000, keterangan: 'Selesai Quest Mingguan 2: Titrasi Asam Basa Alami' },
  { id: 'xp-13', tanggal: getOffsetDate(-10), idSiswa: 'SCI-002', nilaiXP: 1200, keterangan: 'Selesai Quest Mingguan 3: Preparat Mikroskop Sel Gabus' },
  { id: 'xp-14', tanggal: getOffsetDate(-7), idSiswa: 'SCI-002', nilaiXP: 1500, keterangan: 'Selesai Quest Mingguan 4: Mini Turbin Tenaga Air' },
  { id: 'xp-15', tanggal: getOffsetDate(-4), idSiswa: 'SCI-002', nilaiXP: 900, keterangan: 'Presentasi Terbaik Siklus Krebs & Respirasi Seluler' },
  { id: 'xp-16', tanggal: getOffsetDate(-1), idSiswa: 'SCI-002', nilaiXP: 300, keterangan: 'Bonus Tutor Sebaya praktikum kimia analitik' },

  // Budi Santoso
  { id: 'xp-17', tanggal: getOffsetDate(-19), idSiswa: 'SCI-003', nilaiXP: 400, keterangan: 'Partisipasi aktif diskusi mekanika fluida' },
  { id: 'xp-18', tanggal: getOffsetDate(-16), idSiswa: 'SCI-003', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-19', tanggal: getOffsetDate(-12), idSiswa: 'SCI-003', nilaiXP: 1000, keterangan: 'Selesai Quest Mingguan 2: Titrasi Asam Basa Alami' },
  { id: 'xp-20', tanggal: getOffsetDate(-8), idSiswa: 'SCI-003', nilaiXP: 1200, keterangan: 'Selesai Quest Mingguan 3: Preparat Mikroskop Sel Gabus' },
  { id: 'xp-21', tanggal: getOffsetDate(-4), idSiswa: 'SCI-003', nilaiXP: 650, keterangan: 'Laporan praktikum Hukum Ohm sangat rapi' },
  { id: 'xp-22', tanggal: getOffsetDate(-11), idSiswa: 'SCI-003', nilaiXP: -30, keterangan: 'Penalti: Terlambat mengumpulkan tugas ringkasan gelombang' },

  // Dewi Lestari
  { id: 'xp-23', tanggal: getOffsetDate(-18), idSiswa: 'SCI-004', nilaiXP: 350, keterangan: 'Pemahaman materi Termodinamika dasar' },
  { id: 'xp-24', tanggal: getOffsetDate(-15), idSiswa: 'SCI-004', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-25', tanggal: getOffsetDate(-11), idSiswa: 'SCI-004', nilaiXP: 1000, keterangan: 'Selesai Quest Mingguan 2: Titrasi Asam Basa Alami' },
  { id: 'xp-26', tanggal: getOffsetDate(-6), idSiswa: 'SCI-004', nilaiXP: 850, keterangan: 'Rancang poster edukasi Dampak Pemanasan Global' },
  { id: 'xp-27', tanggal: getOffsetDate(-2), idSiswa: 'SCI-004', nilaiXP: 400, keterangan: 'Menjawab pertanyaan tantangan Hukum Gravitasi Newton' },

  // Fajar Nugraha
  { id: 'xp-28', tanggal: getOffsetDate(-19), idSiswa: 'SCI-005', nilaiXP: 300, keterangan: 'Aktif bertanya di sesi Genetika Mendel' },
  { id: 'xp-29', tanggal: getOffsetDate(-14), idSiswa: 'SCI-005', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-30', tanggal: getOffsetDate(-9), idSiswa: 'SCI-005', nilaiXP: 1000, keterangan: 'Selesai Quest Mingguan 2: Titrasi Asam Basa Alami' },
  { id: 'xp-31', tanggal: getOffsetDate(-3), idSiswa: 'SCI-005', nilaiXP: 500, keterangan: 'Desain model 3D DNA Double Helix dari bahan daur ulang' },

  // Gita Maharani
  { id: 'xp-32', tanggal: getOffsetDate(-17), idSiswa: 'SCI-006', nilaiXP: 300, keterangan: 'Pre-test struktur anatomi tumbuhan' },
  { id: 'xp-33', tanggal: getOffsetDate(-13), idSiswa: 'SCI-006', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-34', tanggal: getOffsetDate(-8), idSiswa: 'SCI-006', nilaiXP: 600, keterangan: 'Pengamatan mitosis akar bawang bombay' },
  { id: 'xp-35', tanggal: getOffsetDate(-5), idSiswa: 'SCI-006', nilaiXP: -40, keterangan: 'Penalti: Meja praktikum belum dibersihkan setelah selesai' },

  // Hafiz Maulana
  { id: 'xp-36', tanggal: getOffsetDate(-16), idSiswa: 'SCI-007', nilaiXP: 250, keterangan: 'Aktif merangkum video tata surya' },
  { id: 'xp-37', tanggal: getOffsetDate(-12), idSiswa: 'SCI-007', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-38', tanggal: getOffsetDate(-6), idSiswa: 'SCI-007', nilaiXP: 500, keterangan: 'Eksperimen difusi dan osmosis membran telur' },

  // Indah Kusuma
  { id: 'xp-39', tanggal: getOffsetDate(-15), idSiswa: 'SCI-008', nilaiXP: 250, keterangan: 'Partisipasi kuis tabel periodik unsur' },
  { id: 'xp-40', tanggal: getOffsetDate(-10), idSiswa: 'SCI-008', nilaiXP: 800, keterangan: 'Selesai Quest Mingguan 1: Ekstraksi Klorofil Daun' },
  { id: 'xp-41', tanggal: getOffsetDate(-5), idSiswa: 'SCI-008', nilaiXP: 400, keterangan: 'Laporan uji amilum pada daun tertutup' },

  // Joko Tri
  { id: 'xp-42', tanggal: getOffsetDate(-14), idSiswa: 'SCI-009', nilaiXP: 200, keterangan: 'Pemahaman konsep Hukum Archimedes' },
  { id: 'xp-43', tanggal: getOffsetDate(-9), idSiswa: 'SCI-009', nilaiXP: 600, keterangan: 'Percobaan kapal selam sederhana dalam botol' },

  // Kania Citra
  { id: 'xp-44', tanggal: getOffsetDate(-12), idSiswa: 'SCI-010', nilaiXP: 250, keterangan: 'Presentasi klasifikasi makhluk hidup 5 kingdom' },
  { id: 'xp-45', tanggal: getOffsetDate(-7), idSiswa: 'SCI-010', nilaiXP: 450, keterangan: 'Pembuatan herbarium daun monokotil & dikotil' },

  // Luthfi Hakim
  { id: 'xp-46', tanggal: getOffsetDate(-11), idSiswa: 'SCI-011', nilaiXP: 200, keterangan: 'Membantu persiapan alat praktikum optik' },
  { id: 'xp-47', tanggal: getOffsetDate(-5), idSiswa: 'SCI-011', nilaiXP: 300, keterangan: 'Pengukuran indeks bias kaca prisma' },

  // Maya Melinda
  { id: 'xp-48', tanggal: getOffsetDate(-10), idSiswa: 'SCI-012', nilaiXP: 180, keterangan: 'Kuis organ sistem pencernaan manusia' },
  { id: 'xp-49', tanggal: getOffsetDate(-4), idSiswa: 'SCI-012', nilaiXP: 250, keterangan: 'Identifikasi uji uji biuret dan benedict' },

  // Naufal Arya
  { id: 'xp-50', tanggal: getOffsetDate(-9), idSiswa: 'SCI-013', nilaiXP: 150, keterangan: 'Catatan sains teratur dan rapi' },
  { id: 'xp-51', tanggal: getOffsetDate(-3), idSiswa: 'SCI-013', nilaiXP: 150, keterangan: 'Kerja sama tim praktikum larutan elektrolit' },

  // Putri Ayu
  { id: 'xp-52', tanggal: getOffsetDate(-8), idSiswa: 'SCI-014', nilaiXP: 120, keterangan: 'Tanya jawab sistem peredaran darah' },
  { id: 'xp-53', tanggal: getOffsetDate(-2), idSiswa: 'SCI-014', nilaiXP: 100, keterangan: 'Pengukuran denyut nadi sebelum dan setelah lari' },

  // Rian Dwi
  { id: 'xp-54', tanggal: getOffsetDate(-7), idSiswa: 'SCI-015', nilaiXP: 100, keterangan: 'Tugas resume ekosistem mangrove' },

  // Shinta Bella
  { id: 'xp-55', tanggal: getOffsetDate(-6), idSiswa: 'SCI-016', nilaiXP: 100, keterangan: 'Aktif dalam simulasi rantai makanan' },

  // Tegar Bagus
  { id: 'xp-56', tanggal: getOffsetDate(-5), idSiswa: 'SCI-017', nilaiXP: 80, keterangan: 'Menyelesaikan lembar kerja besaran dan satuan' },

  // Vina Febriani
  { id: 'xp-57', tanggal: getOffsetDate(-4), idSiswa: 'SCI-018', nilaiXP: 60, keterangan: 'Mengisi form keselamatan laboratorium' },

  // Wahyu Hidayatullah
  { id: 'xp-58', tanggal: getOffsetDate(-3), idSiswa: 'SCI-019', nilaiXP: 40, keterangan: 'Orientasi laboratorium sains baru' },

  // Zahra Aulia
  { id: 'xp-59', tanggal: getOffsetDate(-2), idSiswa: 'SCI-020', nilaiXP: 20, keterangan: 'Check-in pertama pengenalan guru sains' },
];

export const INITIAL_DAILY_CHECKINS: DailyCheckinRecord[] = [
  // Sorted by idSiswa A-Z, then tanggal Old-to-New (as required by formula logic)
  // SCI-001 (Ahmad Rizki): 5 consecutive days check-in (streak 1, 2, 3, 4, 5)
  { id: 'chk-1', tanggal: getOffsetDate(-4), idSiswa: 'SCI-001', pertanyaan: 'Apa organel sel penghasil ATP?', jawaban: 'Mitokondria', streakHarian: 1 },
  { id: 'chk-2', tanggal: getOffsetDate(-3), idSiswa: 'SCI-001', pertanyaan: 'Apakah rumus kimia asam cuka?', jawaban: 'CH3COOH', streakHarian: 2 },
  { id: 'chk-3', tanggal: getOffsetDate(-2), idSiswa: 'SCI-001', pertanyaan: 'Berapakah percepatan gravitasi bumi rata-rata?', jawaban: '9.8 m/s²', streakHarian: 3 },
  { id: 'chk-4', tanggal: getOffsetDate(-1), idSiswa: 'SCI-001', pertanyaan: 'Mengapa es mengapung di atas air?', jawaban: 'Karena massa jenis es lebih kecil dari air cair (anomali air)', streakHarian: 4 },
  { id: 'chk-5', tanggal: getOffsetDate(0), idSiswa: 'SCI-001', pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?', jawaban: 'Tempat berlangsungnya fotosintesis', streakHarian: 5 },

  // SCI-002 (Siti Nurhaliza): 4 consecutive days (streak 1, 2, 3, 4)
  { id: 'chk-6', tanggal: getOffsetDate(-3), idSiswa: 'SCI-002', pertanyaan: 'Apakah rumus kimia asam cuka?', jawaban: 'CH3COOH (Asam Asetat)', streakHarian: 1 },
  { id: 'chk-7', tanggal: getOffsetDate(-2), idSiswa: 'SCI-002', pertanyaan: 'Berapakah percepatan gravitasi bumi rata-rata?', jawaban: '9.8 m/s²', streakHarian: 2 },
  { id: 'chk-8', tanggal: getOffsetDate(-1), idSiswa: 'SCI-002', pertanyaan: 'Mengapa es mengapung di atas air?', jawaban: 'Ikatan hidrogen membentuk kisi kristal bervolume lebih besar', streakHarian: 3 },
  { id: 'chk-9', tanggal: getOffsetDate(0), idSiswa: 'SCI-002', pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?', jawaban: 'Sintesis glukosa melalui reaksi fotosintesis', streakHarian: 4 },

  // SCI-003 (Budi Santoso): 3 days streak
  { id: 'chk-10', tanggal: getOffsetDate(-2), idSiswa: 'SCI-003', pertanyaan: 'Berapakah percepatan gravitasi bumi rata-rata?', jawaban: '9.8 m/s²', streakHarian: 1 },
  { id: 'chk-11', tanggal: getOffsetDate(-1), idSiswa: 'SCI-003', pertanyaan: 'Mengapa es mengapung di atas air?', jawaban: 'Massa jenis es lebih rendah dibanding air', streakHarian: 2 },
  { id: 'chk-12', tanggal: getOffsetDate(0), idSiswa: 'SCI-003', pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?', jawaban: 'Menangkap energi cahaya matahari', streakHarian: 3 },

  // SCI-004 (Dewi Lestari): checked in yesterday and today (streak 2)
  { id: 'chk-13', tanggal: getOffsetDate(-1), idSiswa: 'SCI-004', pertanyaan: 'Mengapa es mengapung di atas air?', jawaban: 'Struktur molekul es lebih renggang', streakHarian: 1 },
  { id: 'chk-14', tanggal: getOffsetDate(0), idSiswa: 'SCI-004', pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?', jawaban: 'Melakukan fotosintesis dengan pigmen klorofil', streakHarian: 2 },

  // SCI-005 (Fajar Nugraha): checked in 3 days ago, missed yesterday, checked in today (streak reset to 1)
  { id: 'chk-15', tanggal: getOffsetDate(-4), idSiswa: 'SCI-005', pertanyaan: 'Apa organel sel penghasil ATP?', jawaban: 'Mitokondria', streakHarian: 1 },
  { id: 'chk-16', tanggal: getOffsetDate(0), idSiswa: 'SCI-005', pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?', jawaban: 'Fotosintesis', streakHarian: 1 },

  // SCI-006 (Gita Maharani): checked in yesterday only (streak 1)
  { id: 'chk-17', tanggal: getOffsetDate(-1), idSiswa: 'SCI-006', pertanyaan: 'Mengapa es mengapung di atas air?', jawaban: 'Massa jenisnya lebih kecil', streakHarian: 1 },

  // SCI-007 (Hafiz Maulana): checked in 4 days ago (streak broke, current streak will be 0)
  { id: 'chk-18', tanggal: getOffsetDate(-5), idSiswa: 'SCI-007', pertanyaan: 'Apa fungsi dinding sel?', jawaban: 'Melindungi sel tumbuhan', streakHarian: 1 },

  // SCI-008 (Indah Kusuma): checked in today (streak 1)
  { id: 'chk-19', tanggal: getOffsetDate(0), idSiswa: 'SCI-008', pertanyaan: 'Apa fungsi kloroplas pada sel tumbuhan?', jawaban: 'Membuat amilum dan oksigen', streakHarian: 1 },
];

export const INITIAL_WEEKLY_QUESTS: WeeklyQuest[] = [
  {
    id: 'quest-w1',
    weekNumber: 1,
    title: 'Laboratorium Hijau: Ekstraksi Klorofil Daun',
    category: 'Biologi',
    xpReward: 800,
    description: 'Lakukan pemisahan pigmen klorofil menggunakan alkohol panas dan saring menggunakan kertas kromatografi sederhana. Ambil foto hasil kromatogram.',
    completedStudentIds: ['SCI-001', 'SCI-002', 'SCI-003', 'SCI-004', 'SCI-005', 'SCI-006', 'SCI-007', 'SCI-008'],
  },
  {
    id: 'quest-w2',
    weekNumber: 2,
    title: 'Detektif pH: Indikator Asam Basa Alami',
    category: 'Kimia',
    xpReward: 1000,
    description: 'Buat ekstrak kunyit atau kol ungu sebagai indikator alami untuk menguji 5 bahan dapur (cuka, sabun, soda kue, jeruk nipis, air garam). Catat spektrum perubahan warna.',
    completedStudentIds: ['SCI-001', 'SCI-002', 'SCI-003', 'SCI-004', 'SCI-005'],
  },
  {
    id: 'quest-w3',
    weekNumber: 3,
    title: 'Eksplorasi Mikro-Kosmos: Preparat Sel Gabus & Sel Bawang',
    category: 'Biologi',
    xpReward: 1200,
    description: 'Buat sayatan membujur tipis sel epidermis Allium cepa, amati di bawah mikroskop perbesaran 400x, dan identifikasi sitoplasma, nukleus, serta dinding sel.',
    completedStudentIds: ['SCI-001', 'SCI-002', 'SCI-003'],
  },
  {
    id: 'quest-w4',
    weekNumber: 4,
    title: 'Energi Terbarukan: Rancang Mini Turbin Air Pelton',
    category: 'Fisika',
    xpReward: 1500,
    description: 'Rancang sudu turbin dari sendok plastik dan dynamo motor DC mini. Ukur tegangan output (volt) yang dihasilkan saat dialiri kran air laboratorium.',
    completedStudentIds: ['SCI-001', 'SCI-002'],
  },
  {
    id: 'quest-w5',
    weekNumber: 5,
    title: 'Spektrometri Prisma: Difraksi & Pembiasan Cahaya',
    category: 'Fisika',
    xpReward: 1800,
    description: 'Ukur sudut deviasi minimum sinar monokromatis laser melewati prisma kaca dan hitung indeks bias material menggunakan hukum Snellius.',
    completedStudentIds: ['SCI-001'],
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
