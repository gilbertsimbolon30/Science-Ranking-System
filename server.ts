import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initializeDatabase,
  getDatabase,
  saveDatabase,
  logActivity,
  StudentProfile,
  UserAccount,
  XPRecord,
  DailyCheckinRecord,
  PrivilegeRecord,
  MasterLevel,
} from './server/db';
import { hashPassword, verifyPassword, generateToken, verifyToken, TokenPayload } from './server/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Database on startup
initializeDatabase();

// Extended Request type with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Authentication Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Sesi tidak ditemukan. Silakan login terlebih dahulu.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sesi telah kedaluwarsa atau tidak valid. Silakan login ulang.' });
  }

  // Verify user still exists and is active in DB
  const db = getDatabase();
  const user = db.users.find((u) => u.id === payload.userId);
  if (!user || !user.isActive) {
    return res.status(403).json({ error: 'Akun telah dinonaktifkan atau tidak ditemukan.' });
  }

  req.user = payload;
  next();
}

function requireTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Akses ditolak. Fitur ini hanya untuk Guru Pembina.' });
  }
  next();
}

function requireStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ error: 'Akses khusus untuk akun Siswa.' });
  }
  next();
}

// Stats Computation Helper (matching Google Sheets formulas)
function computeLeaderboardStats(db = getDatabase()) {
  const { students, xpRecords, checkins, levels } = db;
  const sortedLevels = [...levels].sort((a, b) => a.xpMin - b.xpMin);
  const todayStr = new Date().toISOString().split('T')[0];

  // Map student XP
  const xpByStudent: Record<string, number> = {};
  xpRecords.forEach((r) => {
    xpByStudent[r.idSiswa] = (xpByStudent[r.idSiswa] || 0) + Number(r.nilaiXP);
  });

  // Calculate checkins & streaks
  const checkinsByStudent: Record<string, DailyCheckinRecord[]> = {};
  checkins.forEach((c) => {
    if (!checkinsByStudent[c.idSiswa]) checkinsByStudent[c.idSiswa] = [];
    checkinsByStudent[c.idSiswa].push(c);
  });

  const stats = students
    .filter((s) => s.isActive)
    .map((s) => {
      const totalXP = xpByStudent[s.id] || 0;

      // Find current level (VLOOKUP logic)
      let currentLevel = sortedLevels[0];
      for (let i = sortedLevels.length - 1; i >= 0; i--) {
        if (totalXP >= sortedLevels[i].xpMin) {
          currentLevel = sortedLevels[i];
          break;
        }
      }

      const nextLevel = sortedLevels.find((l) => l.xpMin > totalXP) || null;
      const xpToNextLevel = nextLevel ? nextLevel.xpMin - totalXP : 0;
      let progressPercent = 100;
      if (nextLevel) {
        const range = nextLevel.xpMin - currentLevel.xpMin;
        const progress = totalXP - currentLevel.xpMin;
        progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
      }

      // Checkin streak
      const sCheckins = checkinsByStudent[s.id] || [];
      sCheckins.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      const latestCheckin = sCheckins[0];
      let currentStreak = 0;
      if (latestCheckin) {
        const checkinDate = new Date(latestCheckin.tanggal);
        const todayDate = new Date(todayStr);
        const diffDays = Math.round((todayDate.getTime() - checkinDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 1) {
          currentStreak = latestCheckin.streakHarian;
        }
      }

      return {
        id: s.id,
        name: s.name,
        totalXP,
        currentBadge: currentLevel.badgeName,
        levelNumber: currentLevel.levelNumber,
        tier: currentLevel.tier,
        perk: currentLevel.perkDescription,
        lastCheckinDate: latestCheckin ? latestCheckin.tanggal : null,
        currentStreak,
        xpToNextLevel,
        progressPercent,
        nextBadge: nextLevel ? nextLevel.badgeName : null,
        rank: 1, // Will be computed below
      };
    });

  // Sort by totalXP descending, then name ascending
  stats.sort((a, b) => {
    if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
    return a.name.localeCompare(b.name);
  });

  // Assign ranks
  stats.forEach((s, index) => {
    s.rank = index + 1;
  });

  return stats;
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'User ID dan Password wajib diisi.' });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const db = getDatabase();

  // Find user by username, studentId, or exact name
  const user = db.users.find((u) => {
    return (
      u.username.toLowerCase() === cleanUsername ||
      (u.studentId && u.studentId.toLowerCase() === cleanUsername) ||
      u.name.toLowerCase() === cleanUsername
    );
  });

  if (!user) {
    return res.status(401).json({ error: 'User ID atau Password salah. Periksa kembali akun Anda.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Akun Anda dinonaktifkan oleh Guru. Silakan hubungi Guru pembina.' });
  }

  const isValidPassword = verifyPassword(String(password), user.passwordHash, user.salt);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'User ID atau Password salah. Periksa kembali akun Anda.' });
  }

  const tokenPayload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    studentId: user.studentId,
    name: user.name,
    mustChangePassword: user.mustChangePassword,
  };

  const token = generateToken(tokenPayload, 48); // 48-hour valid session

  logActivity(user.id, user.name, user.role, 'LOGIN', `Pengguna ${user.name} (${user.role}) berhasil masuk.`);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      mustChangePassword: user.mustChangePassword,
    },
  });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDatabase();
  const user = db.users.find((u) => u.id === req.user!.userId);

  if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal harus 6 karakter.' });
  }

  // If user was not forced to change password, verify current password
  if (!user.mustChangePassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Password saat ini wajib diisi.' });
    }
    const isCurrentValid = verifyPassword(String(currentPassword), user.passwordHash, user.salt);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Password saat ini yang Anda masukkan salah.' });
    }
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.mustChangePassword = false;
  user.updatedAt = new Date().toISOString();

  saveDatabase();
  logActivity(user.id, user.name, user.role, 'PASSWORD_CHANGE', `Pengguna ${user.name} memperbarui kata sandi.`);

  // Return refreshed token
  const tokenPayload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    studentId: user.studentId,
    name: user.name,
    mustChangePassword: false,
  };
  const token = generateToken(tokenPayload, 48);

  res.json({ success: true, message: 'Password berhasil diperbarui!', token });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  logActivity(req.user!.userId, req.user!.name, req.user!.role, 'LOGOUT', `Pengguna ${req.user!.name} keluar.`);
  res.json({ success: true });
});

// ==========================================
// SHARED & LEADERBOARD ROUTES
// ==========================================

// GET /api/leaderboard (Full class leaderboard)
app.get('/api/leaderboard', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  const stats = computeLeaderboardStats();
  res.json({ stats });
});

// GET /api/levels (Master levels)
app.get('/api/levels', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ levels: db.levels });
});

// GET /api/daily-question
app.get('/api/daily-question', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ todayQuestion: db.todayQuestion });
});

// GET /api/weekly-quests
app.get('/api/weekly-quests', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ quests: db.quests });
});

// ==========================================
// STUDENT EXCLUSIVE ROUTES
// ==========================================

// GET /api/student/me (Student's private dashboard & profile)
app.get('/api/student/me', authenticateToken, requireStudent, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const studentId = req.user!.studentId;

  if (!studentId) {
    return res.status(404).json({ error: 'Data profil siswa tidak terhubung.' });
  }

  const student = db.students.find((s) => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Profil siswa tidak ditemukan.' });
  }

  const stats = computeLeaderboardStats(db);
  const myStat = stats.find((s) => s.id === studentId);

  // Student's private privileges
  const myPrivileges = db.privileges.filter((p) => p.studentId === studentId);

  // Student's check-ins
  const myCheckins = db.checkins.filter((c) => c.idSiswa === studentId).sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  // Student's XP history
  const myXpHistory = db.xpRecords.filter((x) => x.idSiswa === studentId).sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  res.json({
    student,
    stat: myStat,
    privileges: myPrivileges,
    checkins: myCheckins,
    xpHistory: myXpHistory,
  });
});

// POST /api/student/checkin (Daily check-in)
app.post('/api/student/checkin', authenticateToken, requireStudent, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user!.studentId!;
  const { answer } = req.body;

  if (!answer || typeof answer !== 'string') {
    return res.status(400).json({ error: 'Jawaban check-in wajib diisi.' });
  }

  const db = getDatabase();
  const todayStr = new Date().toISOString().split('T')[0];

  // Check if student already checked in today
  const existing = db.checkins.find((c) => c.idSiswa === studentId && c.tanggal === todayStr);
  if (existing) {
    return res.status(400).json({ error: 'Kamu sudah melakukan daily check-in hari ini!' });
  }

  // Calculate streak based on yesterday
  const studentCheckins = db.checkins.filter((c) => c.idSiswa === studentId).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const latest = studentCheckins[0];
  let earnedStreak = 1;

  if (latest) {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    if (latest.tanggal === yesterdayStr) {
      earnedStreak = latest.streakHarian + 1;
    }
  }

  const newCheckin: DailyCheckinRecord = {
    id: `chk-${Date.now()}`,
    tanggal: todayStr,
    idSiswa: studentId,
    pertanyaan: db.todayQuestion.pertanyaan,
    jawaban: answer.trim(),
    streakHarian: earnedStreak,
    createdAt: new Date().toISOString(),
  };

  db.checkins.push(newCheckin);

  // Award checkin bonus XP
  const xpBonus = db.todayQuestion.xpBonus || 50;
  const newXP: XPRecord = {
    id: `xp-chk-${Date.now()}`,
    tanggal: todayStr,
    idSiswa: studentId,
    nilaiXP: xpBonus,
    keterangan: `Daily Check-in: ${db.todayQuestion.pertanyaan} (Streak ke-${earnedStreak})`,
    createdBy: 'System (Daily Check-in)',
    createdAt: new Date().toISOString(),
  };

  db.xpRecords.push(newXP);
  saveDatabase();

  logActivity(studentId, req.user!.name, 'student', 'DAILY_CHECKIN', `Check-in hari ${todayStr}, streak ${earnedStreak}, +${xpBonus} XP.`);

  res.json({
    success: true,
    checkin: newCheckin,
    earnedStreak,
    xpBonus,
    stats: computeLeaderboardStats(db),
  });
});

// ==========================================
// TEACHER EXCLUSIVE ROUTES (Protected)
// ==========================================

// GET /api/teacher/students (Full roster with account status)
app.get('/api/teacher/students', authenticateToken, requireTeacher, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userMap = new Map(db.users.filter((u) => u.studentId).map((u) => [u.studentId!, u]));

  const studentList = db.students.map((s) => {
    const account = userMap.get(s.id);
    return {
      ...s,
      username: account ? account.username : s.name,
      isActive: account ? account.isActive : s.isActive,
      mustChangePassword: account ? account.mustChangePassword : true,
      lastLogin: account?.updatedAt || null,
    };
  });

  res.json({ students: studentList });
});

// POST /api/teacher/students (Add single student)
app.post('/api/teacher/students', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { name, customUsername } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Nama siswa wajib diisi.' });
  }

  const db = getDatabase();
  const cleanName = name.trim();
  const username = customUsername ? String(customUsername).trim() : cleanName;

  // Check unique username
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: `Username "${username}" sudah digunakan.` });
  }

  const nextNum = db.students.length + 1;
  const newId = `SCI-${String(nextNum).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newStudent: StudentProfile = {
    id: newId,
    name: cleanName,
    username,
    avatarSeed: `seed-${newId}`,
    isActive: true,
    createdAt: now,
  };

  const initialPass = hashPassword('123456');
  const newUser: UserAccount = {
    id: `user-${newId}`,
    username,
    name: cleanName,
    role: 'student',
    studentId: newId,
    passwordHash: initialPass.hash,
    salt: initialPass.salt,
    mustChangePassword: true,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  db.students.push(newStudent);
  db.users.push(newUser);
  saveDatabase();

  logActivity(req.user!.userId, req.user!.name, 'teacher', 'CREATE_STUDENT', `Menambahkan siswa: ${cleanName} (${newId}).`);

  res.json({ success: true, student: newStudent, account: { username, initialPassword: '123456' } });
});

// POST /api/teacher/students/batch (Batch add students)
app.post('/api/teacher/students/batch', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { names } = req.body;
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Daftar nama siswa wajib diisi.' });
  }

  const db = getDatabase();
  const now = new Date().toISOString();
  const initialPass = hashPassword('123456');
  const addedStudents: StudentProfile[] = [];

  let currentCount = db.students.length;
  for (const rawName of names) {
    const cleanName = String(rawName).trim();
    if (!cleanName) continue;

    currentCount++;
    const studentId = `SCI-${String(currentCount).padStart(3, '0')}`;
    let username = cleanName;
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      username = `${cleanName}-${studentId}`;
    }

    const student: StudentProfile = {
      id: studentId,
      name: cleanName,
      username,
      avatarSeed: `seed-${studentId}`,
      isActive: true,
      createdAt: now,
    };

    const user: UserAccount = {
      id: `user-${studentId}`,
      username,
      name: cleanName,
      role: 'student',
      studentId,
      passwordHash: initialPass.hash,
      salt: initialPass.salt,
      mustChangePassword: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    db.students.push(student);
    db.users.push(user);
    addedStudents.push(student);
  }

  saveDatabase();
  logActivity(req.user!.userId, req.user!.name, 'teacher', 'BATCH_IMPORT_STUDENTS', `Mengimpor ${addedStudents.length} siswa baru.`);

  res.json({ success: true, count: addedStudents.length, students: addedStudents });
});

// PUT /api/teacher/students/:id (Edit student)
app.put('/api/teacher/students/:id', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, username } = req.body;

  const db = getDatabase();
  const student = db.students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan.' });

  if (name && typeof name === 'string') {
    student.name = name.trim();
  }

  const user = db.users.find((u) => u.studentId === id);
  if (user) {
    if (name) user.name = name.trim();
    if (username && typeof username === 'string' && username.trim().toLowerCase() !== user.username.toLowerCase()) {
      const cleanUser = username.trim();
      if (db.users.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase() && u.id !== user.id)) {
        return res.status(400).json({ error: `Username "${cleanUser}" sudah digunakan.` });
      }
      user.username = cleanUser;
      student.username = cleanUser;
    }
    user.updatedAt = new Date().toISOString();
  }

  saveDatabase();
  logActivity(req.user!.userId, req.user!.name, 'teacher', 'UPDATE_STUDENT', `Memperbarui data siswa ${student.name} (${id}).`);

  res.json({ success: true, student });
});

// DELETE /api/teacher/students/:id (Delete student)
app.delete('/api/teacher/students/:id', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const student = db.students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan.' });

  db.students = db.students.filter((s) => s.id !== id);
  db.users = db.users.filter((u) => u.studentId !== id);
  db.xpRecords = db.xpRecords.filter((x) => x.idSiswa !== id);
  db.checkins = db.checkins.filter((c) => c.idSiswa !== id);
  db.privileges = db.privileges.filter((p) => p.studentId !== id);

  saveDatabase();
  logActivity(req.user!.userId, req.user!.name, 'teacher', 'DELETE_STUDENT', `Menghapus siswa ${student.name} (${id}) beserta riwayatnya.`);

  res.json({ success: true, message: `Siswa ${student.name} berhasil dihapus.` });
});

// POST /api/teacher/students/:id/reset-password (Reset student password to 123456)
app.post('/api/teacher/students/:id/reset-password', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const user = db.users.find((u) => u.studentId === id);

  if (!user) return res.status(404).json({ error: 'Akun siswa tidak ditemukan.' });

  const resetPass = hashPassword('123456');
  user.passwordHash = resetPass.hash;
  user.salt = resetPass.salt;
  user.mustChangePassword = true;
  user.updatedAt = new Date().toISOString();

  saveDatabase();
  logActivity(req.user!.userId, req.user!.name, 'teacher', 'RESET_PASSWORD', `Mereset kata sandi akun ${user.name} (${user.username}) ke '123456'.`);

  res.json({ success: true, message: `Password siswa ${user.name} berhasil di-reset ke "123456".` });
});

// POST /api/teacher/students/:id/toggle-active (Activate / deactivate account)
app.post('/api/teacher/students/:id/toggle-active', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const student = db.students.find((s) => s.id === id);
  const user = db.users.find((u) => u.studentId === id);

  if (!student || !user) return res.status(404).json({ error: 'Data siswa tidak ditemukan.' });

  const nextStatus = !user.isActive;
  user.isActive = nextStatus;
  student.isActive = nextStatus;
  user.updatedAt = new Date().toISOString();

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'TOGGLE_ACTIVE',
    `${nextStatus ? 'Mengaktifkan' : 'Menonaktifkan'} akun siswa ${student.name} (${id}).`
  );

  res.json({ success: true, isActive: nextStatus });
});

// GET /api/teacher/xp-records
app.get('/api/teacher/xp-records', authenticateToken, requireTeacher, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ xpRecords: db.xpRecords });
});

// POST /api/teacher/xp-records (Add single XP record - strict validation 1 to 1000)
app.post('/api/teacher/xp-records', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { tanggal, idSiswa, nilaiXP, keterangan } = req.body;

  if (!idSiswa || !keterangan) {
    return res.status(400).json({ error: 'ID Siswa dan Keterangan wajib diisi.' });
  }

  const rawXP = Number(nilaiXP);
  const absXP = Math.abs(rawXP);

  // STRICT REQUIREMENT: range 1 - 1000
  if (isNaN(rawXP) || absXP < 1 || absXP > 1000) {
    return res.status(400).json({ error: 'Nilai XP harus berada dalam rentang 1 - 1.000 poin XP.' });
  }

  const db = getDatabase();
  const student = db.students.find((s) => s.id === idSiswa);
  if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan.' });

  const newRecord: XPRecord = {
    id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tanggal: tanggal || new Date().toISOString().split('T')[0],
    idSiswa,
    nilaiXP: rawXP,
    keterangan: String(keterangan).trim(),
    createdBy: req.user!.name,
    createdAt: new Date().toISOString(),
  };

  db.xpRecords.unshift(newRecord);
  saveDatabase();

  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    rawXP > 0 ? 'AWARD_XP' : 'PENALTY_XP',
    `${rawXP > 0 ? '+' : ''}${rawXP} XP untuk ${student.name} (${idSiswa}): ${newRecord.keterangan}`
  );

  res.json({ success: true, record: newRecord, stats: computeLeaderboardStats(db) });
});

// POST /api/teacher/xp-records/batch (Add batch XP records - strict validation 1 to 1000)
app.post('/api/teacher/xp-records/batch', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'Daftar catatan XP wajib diisi.' });
  }

  const db = getDatabase();
  const added: XPRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const rawXP = Number(r.nilaiXP);
    const absXP = Math.abs(rawXP);

    if (isNaN(rawXP) || absXP < 1 || absXP > 1000) {
      return res.status(400).json({ error: `Nilai XP baris #${i + 1} harus dalam rentang 1 - 1.000 poin XP.` });
    }

    const rec: XPRecord = {
      id: `xp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      tanggal: r.tanggal || new Date().toISOString().split('T')[0],
      idSiswa: r.idSiswa,
      nilaiXP: rawXP,
      keterangan: String(r.keterangan || '').trim(),
      createdBy: req.user!.name,
      createdAt: new Date().toISOString(),
    };

    db.xpRecords.unshift(rec);
    added.push(rec);
  }

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'BATCH_XP',
    `Mencatat XP batch untuk ${added.length} siswa.`
  );

  res.json({ success: true, count: added.length, records: added, stats: computeLeaderboardStats(db) });
});

// PUT /api/teacher/xp-records/:id (Update / correct XP record)
app.put('/api/teacher/xp-records/:id', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { tanggal, nilaiXP, keterangan } = req.body;

  const db = getDatabase();
  const record = db.xpRecords.find((r) => r.id === id);
  if (!record) return res.status(404).json({ error: 'Catatan XP tidak ditemukan.' });

  if (nilaiXP !== undefined) {
    const rawXP = Number(nilaiXP);
    const absXP = Math.abs(rawXP);
    if (isNaN(rawXP) || absXP < 1 || absXP > 1000) {
      return res.status(400).json({ error: 'Nilai XP harus berada dalam rentang 1 - 1.000 poin XP.' });
    }
    record.nilaiXP = rawXP;
  }

  if (tanggal) record.tanggal = tanggal;
  if (keterangan) record.keterangan = String(keterangan).trim();

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'UPDATE_XP_RECORD',
    `Koreksi catatan XP (${id}): ${record.nilaiXP} XP - ${record.keterangan}`
  );

  res.json({ success: true, record, stats: computeLeaderboardStats(db) });
});

// DELETE /api/teacher/xp-records/:id (Delete XP record)
app.delete('/api/teacher/xp-records/:id', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();

  const record = db.xpRecords.find((r) => r.id === id);
  if (!record) return res.status(404).json({ error: 'Catatan XP tidak ditemukan.' });

  db.xpRecords = db.xpRecords.filter((r) => r.id !== id);
  saveDatabase();

  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'DELETE_XP_RECORD',
    `Menghapus catatan XP (${id}): ${record.nilaiXP} XP untuk ${record.idSiswa}`
  );

  res.json({ success: true, message: 'Catatan XP berhasil dihapus.', stats: computeLeaderboardStats(db) });
});

// GET /api/teacher/privileges (Privileges list)
app.get('/api/teacher/privileges', authenticateToken, requireTeacher, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ privileges: db.privileges });
});

// POST /api/teacher/privileges/award (Award privilege to student)
app.post('/api/teacher/privileges/award', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { studentId, perkTitle, tier, notes } = req.body;
  if (!studentId || !perkTitle) {
    return res.status(400).json({ error: 'Siswa dan nama hak istimewa (perk) wajib diisi.' });
  }

  const db = getDatabase();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan.' });

  const newPrivilege: PrivilegeRecord = {
    id: `prv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    perkTitle: String(perkTitle).trim(),
    tier: tier || 'Researcher',
    status: 'available',
    notes: notes ? String(notes).trim() : undefined,
    awardedAt: new Date().toISOString(),
  };

  db.privileges.unshift(newPrivilege);
  saveDatabase();

  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'AWARD_PRIVILEGE',
    `Memberikan privilege "${newPrivilege.perkTitle}" kepada ${student.name} (${studentId}).`
  );

  res.json({ success: true, privilege: newPrivilege });
});

// POST /api/teacher/privileges/:id/mark-used (Mark privilege as used)
app.post('/api/teacher/privileges/:id/mark-used', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const db = getDatabase();

  const priv = db.privileges.find((p) => p.id === id);
  if (!priv) return res.status(404).json({ error: 'Hak istimewa tidak ditemukan.' });

  priv.status = 'used';
  priv.usedAt = new Date().toISOString();
  if (notes) priv.notes = `${priv.notes ? priv.notes + ' | ' : ''}Digunakan: ${notes}`;

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'USE_PRIVILEGE',
    `Menandai hak istimewa "${priv.perkTitle}" untuk ${priv.studentId} sebagai TELAH DIGUNAKAN.`
  );

  res.json({ success: true, privilege: priv });
});

// POST /api/teacher/privileges/:id/revoke (Revoke privilege)
app.post('/api/teacher/privileges/:id/revoke', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const db = getDatabase();

  const priv = db.privileges.find((p) => p.id === id);
  if (!priv) return res.status(404).json({ error: 'Hak istimewa tidak ditemukan.' });

  priv.status = 'revoked';
  priv.revokedAt = new Date().toISOString();
  if (reason) priv.notes = `${priv.notes ? priv.notes + ' | ' : ''}Dicabut: ${reason}`;

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'REVOKE_PRIVILEGE',
    `Mencabut hak istimewa "${priv.perkTitle}" untuk ${priv.studentId}.`
  );

  res.json({ success: true, privilege: priv });
});

// PUT /api/teacher/levels (Configure ranks and point thresholds)
app.put('/api/teacher/levels', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { levels } = req.body;
  if (!Array.isArray(levels) || levels.length === 0) {
    return res.status(400).json({ error: 'Konfigurasi level harus berupa array.' });
  }

  const db = getDatabase();
  db.levels = levels.sort((a: MasterLevel, b: MasterLevel) => a.xpMin - b.xpMin);
  saveDatabase();

  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'UPDATE_LEVELS',
    `Memperbarui konfigurasi tingkatan level & badge (${levels.length} level).`
  );

  res.json({ success: true, levels: db.levels, stats: computeLeaderboardStats(db) });
});

// GET /api/teacher/activity-logs (View audit logs)
app.get('/api/teacher/activity-logs', authenticateToken, requireTeacher, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({ activityLogs: db.activityLogs });
});

// GET & PUT /api/teacher/presets (Reward & penalty quick presets)
app.get('/api/teacher/presets', authenticateToken, requireTeacher, (_req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json({
    rewardPresets: db.rewardPresets,
    penaltyPresets: db.penaltyPresets,
  });
});

app.put('/api/teacher/presets', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { rewardPresets, penaltyPresets } = req.body;
  const db = getDatabase();

  if (Array.isArray(rewardPresets)) db.rewardPresets = rewardPresets;
  if (Array.isArray(penaltyPresets)) db.penaltyPresets = penaltyPresets;

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'UPDATE_PRESETS',
    'Memperbarui konfigurasi preset cepat reward dan penalti.'
  );

  res.json({
    success: true,
    rewardPresets: db.rewardPresets,
    penaltyPresets: db.penaltyPresets,
  });
});

// POST /api/teacher/quests/:id/toggle-student
app.post('/api/teacher/quests/:id/toggle-student', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const db = getDatabase();
  const quest = db.quests.find((q) => q.id === id);
  if (!quest) return res.status(404).json({ error: 'Quest tidak ditemukan.' });

  const isCompleted = quest.completedStudentIds.includes(studentId);
  if (isCompleted) {
    // Revoke
    quest.completedStudentIds = quest.completedStudentIds.filter((sid) => sid !== studentId);
  } else {
    // Complete & award quest XP
    quest.completedStudentIds.push(studentId);
    const xpRecord: XPRecord = {
      id: `xp-quest-${Date.now()}-${studentId}`,
      tanggal: new Date().toISOString().split('T')[0],
      idSiswa: studentId,
      nilaiXP: quest.xpReward,
      keterangan: `Selesai Quest Mingguan ${quest.weekNumber}: ${quest.title}`,
      createdBy: req.user!.name,
      createdAt: new Date().toISOString(),
    };
    db.xpRecords.unshift(xpRecord);
  }

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'TOGGLE_QUEST',
    `${isCompleted ? 'Membatalkan' : 'Menyelesaikan'} quest "${quest.title}" untuk ${studentId}.`
  );

  res.json({ success: true, quest, stats: computeLeaderboardStats(db) });
});

// POST /api/teacher/sync-local-data (Preserve & sync 42 students or records from client if needed)
app.post('/api/teacher/sync-local-data', authenticateToken, requireTeacher, (req: AuthenticatedRequest, res: Response) => {
  const { clientStudents, clientXpRecords, clientCheckins } = req.body;
  const db = getDatabase();
  let importedCount = 0;

  if (Array.isArray(clientStudents) && clientStudents.length > 0) {
    clientStudents.forEach((cs) => {
      if (!db.students.some((s) => s.id === cs.id || s.name.toLowerCase() === cs.name.toLowerCase())) {
        const student: StudentProfile = {
          id: cs.id,
          name: cs.name,
          username: cs.name,
          avatarSeed: `seed-${cs.id}`,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        const initialPass = hashPassword('123456');
        const user: UserAccount = {
          id: `user-${cs.id}`,
          username: cs.name,
          name: cs.name,
          role: 'student',
          studentId: cs.id,
          passwordHash: initialPass.hash,
          salt: initialPass.salt,
          mustChangePassword: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.students.push(student);
        db.users.push(user);
        importedCount++;
      }
    });
  }

  if (Array.isArray(clientXpRecords) && clientXpRecords.length > 0) {
    clientXpRecords.forEach((cx) => {
      if (!db.xpRecords.some((x) => x.id === cx.id)) {
        db.xpRecords.push({
          ...cx,
          createdBy: cx.createdBy || 'Teacher Import',
          createdAt: cx.createdAt || new Date().toISOString(),
        });
      }
    });
  }

  if (Array.isArray(clientCheckins) && clientCheckins.length > 0) {
    clientCheckins.forEach((cc) => {
      if (!db.checkins.some((c) => c.id === cc.id)) {
        db.checkins.push({
          ...cc,
          createdAt: cc.createdAt || new Date().toISOString(),
        });
      }
    });
  }

  saveDatabase();
  logActivity(
    req.user!.userId,
    req.user!.name,
    'teacher',
    'SYNC_DATA',
    `Sinkronisasi data browser: ${importedCount} siswa ditambahkan/disinkronkan.`
  );

  res.json({
    success: true,
    totalStudents: db.students.length,
    totalXPRecords: db.xpRecords.length,
    stats: computeLeaderboardStats(db),
  });
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SainsQuest Server] Running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer();
