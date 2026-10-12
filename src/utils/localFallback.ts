import {
  AuthUser,
  Student,
  XPRecord,
  PrivilegeRecord,
  ActivityLog,
  MasterLevel,
  StudentComputedStats,
} from '../types/gamification';
import { MASTER_LEVELS } from '../data/initialData';
import { computeStudentStats } from './gamificationEngine';

export interface LocalUserAccount {
  id: string;
  username: string;
  name: string;
  role: 'teacher' | 'student';
  studentId?: string;
  password: string; // stored for local fallback mode
  mustChangePassword: boolean;
  isActive: boolean;
}

const LOCAL_USERS_KEY = 'sainsquest_local_users_v5';
const LOCAL_STUDENTS_KEY = 'sainsquest_local_students_v5';
const LOCAL_XP_KEY = 'sainsquest_local_xp_v5';
const LOCAL_PRIV_KEY = 'sainsquest_local_priv_v5';
const LOCAL_LOGS_KEY = 'sainsquest_local_logs_v5';
const LOCAL_LEVELS_KEY = 'sainsquest_local_levels_v5';
const LOCAL_SESSION_USER_KEY = 'sainsquest_local_current_user_v5';

export const SEED_STUDENT_NAMES = [
  'Abigail J',
  'Anne M',
  'Davin M',
  'Destan X',
  'Dominique D',
  'Dyleane D',
  'Eugeneo M',
  'Given O',
  'Glowry V',
  'Ignatia E',
  'Isreallea T',
  'Jevan H',
  'Jordy J',
  'Keilana J',
  'Kharenina I',
  'Naomi A',
  'Raphael A',
  'Samuel C',
  'Sean S',
  'Shean S',
  'Vallerie R',
  'Ardelia Q',
  'Audrey G',
  'Caroline A',
  'Charminique G',
  'Clifford C',
  'Devan M',
  'Garneta M',
  'Gina F',
  'Giovano G',
  'Jasmine A',
  'Jochebed P',
  'Joel T',
  'Jose S',
  'Joyce A',
  'Kalev O',
  'Malvin M',
  'Michelle M',
  'Patrick B',
  'Syakinah A',
  'William T',
  'Wyanette A',
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota
  }
}

function initializeLocalStore() {
  const existingUsers = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
  if (existingUsers.length === 0) {
    const users: LocalUserAccount[] = [];
    const students: Student[] = [];

    // 1. Teacher account: Guru / Science
    users.push({
      id: 'user-teacher-guru',
      username: 'Guru',
      name: 'Guru Pembina Science',
      role: 'teacher',
      password: 'Science',
      mustChangePassword: false,
      isActive: true,
    });

    // 2. Dummy Student account: Dummy / 123
    const dummyId = 'SCI-DUMMY';
    students.push({
      id: dummyId,
      name: 'Dummy Student',
      username: 'Dummy',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    users.push({
      id: 'user-dummy-student',
      username: 'Dummy',
      name: 'Dummy Student',
      role: 'student',
      studentId: dummyId,
      password: '123',
      mustChangePassword: false,
      isActive: true,
    });

    // 3. 42 Student accounts: ID: Abigail J etc / 123456
    SEED_STUDENT_NAMES.forEach((name, idx) => {
      const pad = String(idx + 1).padStart(3, '0');
      const studentId = `SCI-${pad}`;
      students.push({
        id: studentId,
        name,
        username: name,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      users.push({
        id: `user-${studentId}`,
        username: name,
        name,
        role: 'student',
        studentId,
        password: '123456',
        mustChangePassword: true,
        isActive: true,
      });
    });

    // Initial XP & sample privilege for Dummy Student
    const initialXP: XPRecord[] = [
      {
        id: 'xp-dummy-welcome',
        tanggal: new Date().toISOString().split('T')[0],
        idSiswa: dummyId,
        nilaiXP: 750,
        keterangan: 'Simulasi XP Awal (Pengujian Dashboard Siswa)',
        createdBy: 'Guru Pembina Science',
        createdAt: new Date().toISOString(),
      },
    ];

    const initialPrivileges: PrivilegeRecord[] = [
      {
        id: 'prv-dummy-welcome',
        studentId: dummyId,
        perkTitle: 'Boleh Memilih Teman Kelompok Praktikum',
        tier: 'Researcher',
        status: 'available',
        notes: 'Kupon uji coba simulasi dashboard',
        awardedAt: new Date().toISOString(),
      },
    ];

    setStored(LOCAL_USERS_KEY, users);
    setStored(LOCAL_STUDENTS_KEY, students);
    setStored(LOCAL_XP_KEY, initialXP);
    setStored(LOCAL_PRIV_KEY, initialPrivileges);
    setStored(LOCAL_LEVELS_KEY, MASTER_LEVELS);
    setStored(LOCAL_LOGS_KEY, [
      {
        id: `log-${Date.now()}`,
        actorId: 'system',
        actorName: 'SainsQuest Hybrid Engine',
        actorRole: 'teacher',
        action: 'Inisialisasi Database Offline/Static',
        details: 'Mode Client-Side Fallback aktif untuk lingkungan statis (GitHub Pages).',
        timestamp: new Date().toISOString(),
      },
    ]);
  }
}

// Make sure store is ready
initializeLocalStore();

export const localFallback = {
  login(username: string, password: string): { token: string; user: AuthUser } {
    initializeLocalStore();
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
    const cleanUser = username.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        (u.studentId && u.studentId.toLowerCase() === cleanUser)
    );

    if (!found) {
      throw new Error('ID Pengguna tidak terdaftar. Periksa kembali ID akun Anda.');
    }

    if (!found.isActive) {
      throw new Error('Akun ini dinonaktifkan oleh Guru Pembina.');
    }

    if (found.password !== password) {
      throw new Error('Kata sandi salah. Silakan coba lagi.');
    }

    const authUser: AuthUser = {
      id: found.id,
      username: found.username,
      name: found.name,
      role: found.role,
      studentId: found.studentId,
      mustChangePassword: found.mustChangePassword,
    };

    setStored(LOCAL_SESSION_USER_KEY, authUser);
    const fakeToken = `local-token-${found.id}-${Date.now()}`;
    return { token: fakeToken, user: authUser };
  },

  getCurrentUser(): AuthUser {
    initializeLocalStore();
    const user = getStored<AuthUser | null>(LOCAL_SESSION_USER_KEY, null);
    if (!user) {
      throw new Error('Sesi tidak ditemukan atau telah kedaluwarsa.');
    }
    // Refresh flags
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
    const found = users.find((u) => u.id === user.id);
    if (!found || !found.isActive) {
      throw new Error('Akun tidak aktif.');
    }
    return {
      id: found.id,
      username: found.username,
      name: found.name,
      role: found.role,
      studentId: found.studentId,
      mustChangePassword: found.mustChangePassword,
    };
  },

  changePassword(currentPassword: string, newPassword: string): { success: boolean; token?: string } {
    const user = this.getCurrentUser();
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
    const found = users.find((u) => u.id === user.id);
    if (!found) {
      throw new Error('Akun tidak ditemukan.');
    }

    if (!found.mustChangePassword && found.password !== currentPassword) {
      throw new Error('Kata sandi lama tidak cocok.');
    }

    if (newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }

    found.password = newPassword;
    found.mustChangePassword = false;
    setStored(LOCAL_USERS_KEY, users);

    const updatedAuthUser: AuthUser = {
      ...user,
      mustChangePassword: false,
    };
    setStored(LOCAL_SESSION_USER_KEY, updatedAuthUser);

    return { success: true, token: `local-token-${found.id}-${Date.now()}` };
  },

  logout(): void {
    localStorage.removeItem(LOCAL_SESSION_USER_KEY);
  },

  getLeaderboard(): StudentComputedStats[] {
    initializeLocalStore();
    const students = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const xpRecords = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const levels = getStored<MasterLevel[]>(LOCAL_LEVELS_KEY, MASTER_LEVELS);
    const todayStr = new Date().toISOString().split('T')[0];
    return computeStudentStats(students, xpRecords, [], todayStr, levels);
  },

  getLevels(): MasterLevel[] {
    initializeLocalStore();
    return getStored<MasterLevel[]>(LOCAL_LEVELS_KEY, MASTER_LEVELS);
  },

  getStudentMe(): {
    student: Student;
    stat: StudentComputedStats;
    privileges: PrivilegeRecord[];
    checkins: any[];
    xpHistory: XPRecord[];
  } {
    const user = this.getCurrentUser();
    if (user.role !== 'student' || !user.studentId) {
      throw new Error('Akses khusus siswa.');
    }

    const students = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const xpRecords = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const privileges = getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);
    const levels = getStored<MasterLevel[]>(LOCAL_LEVELS_KEY, MASTER_LEVELS);
    const todayStr = new Date().toISOString().split('T')[0];

    const student = students.find((s) => s.id === user.studentId);
    if (!student) {
      throw new Error('Profil siswa tidak ditemukan.');
    }

    const allStats = computeStudentStats(students, xpRecords, [], todayStr, levels);
    const stat = allStats.find((s) => s.id === user.studentId) || {
      id: student.id,
      name: student.name,
      totalXP: 0,
      currentBadge: 'Lab Recruit',
      levelNumber: 1,
      tier: 'Trainee' as const,
      perk: 'Belum ada hak istimewa',
      lastCheckinDate: null,
      currentStreak: 0,
      xpToNextLevel: 100,
      progressPercent: 0,
      nextBadge: 'Lab Trainee',
      rank: allStats.length || 1,
    };

    const myPrivs = privileges.filter((p) => p.studentId === user.studentId);
    const myXp = xpRecords
      .filter((x) => x.idSiswa === user.studentId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    return {
      student,
      stat,
      privileges: myPrivs,
      checkins: [],
      xpHistory: myXp,
    };
  },

  // Teacher Endpoints
  getTeacherStudents(): Student[] {
    initializeLocalStore();
    return getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
  },

  getTeacherXPRecords(): XPRecord[] {
    initializeLocalStore();
    return getStored<XPRecord[]>(LOCAL_XP_KEY, []);
  },

  getTeacherPrivileges(): PrivilegeRecord[] {
    initializeLocalStore();
    return getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);
  },

  getActivityLogs(): ActivityLog[] {
    initializeLocalStore();
    return getStored<ActivityLog[]>(LOCAL_LOGS_KEY, []);
  },

  addXPRecord(record: Omit<XPRecord, 'id'>): XPRecord {
    const user = this.getCurrentUser();
    const xpRecords = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const newRecord: XPRecord = {
      ...record,
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
    };
    xpRecords.push(newRecord);
    setStored(LOCAL_XP_KEY, xpRecords);
    return newRecord;
  },

  addBatchXP(records: Omit<XPRecord, 'id'>[]): XPRecord[] {
    const user = this.getCurrentUser();
    const xpRecords = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const created: XPRecord[] = records.map((r, i) => ({
      ...r,
      id: `xp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
    }));
    xpRecords.push(...created);
    setStored(LOCAL_XP_KEY, xpRecords);
    return created;
  },

  updateXPRecord(id: string, updates: { tanggal?: string; nilaiXP?: number; keterangan?: string }): XPRecord {
    const xpRecords = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const idx = xpRecords.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Catatan XP tidak ditemukan.');
    xpRecords[idx] = { ...xpRecords[idx], ...updates };
    setStored(LOCAL_XP_KEY, xpRecords);
    return xpRecords[idx];
  },

  deleteXPRecord(id: string): void {
    const xpRecords = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    setStored(
      LOCAL_XP_KEY,
      xpRecords.filter((r) => r.id !== id)
    );
  },

  createStudent(name: string, customUsername?: string): { student: Student; user: LocalUserAccount } {
    const students = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);

    const count = students.length + 1;
    const studentId = `SCI-${String(count).padStart(3, '0')}`;
    const username = (customUsername && customUsername.trim()) || name.trim();

    const newStudent: Student = {
      id: studentId,
      name: name.trim(),
      username,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const newUser: LocalUserAccount = {
      id: `user-${studentId}`,
      username,
      name: name.trim(),
      role: 'student',
      studentId,
      password: '123',
      mustChangePassword: true,
      isActive: true,
    };

    students.push(newStudent);
    users.push(newUser);
    setStored(LOCAL_STUDENTS_KEY, students);
    setStored(LOCAL_USERS_KEY, users);

    return { student: newStudent, user: newUser };
  },

  batchImportStudents(names: string[]): { students: Student[]; count: number } {
    const created: Student[] = [];
    names.forEach((name) => {
      if (name.trim()) {
        const res = this.createStudent(name);
        created.push(res.student);
      }
    });
    return { students: created, count: created.length };
  },

  replaceStudents(names: string[]): { students: Student[]; count: number } {
    const allStudents = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const allUsers = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
    const allXP = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const allPrivileges = getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);

    // Retain Dummy student
    const dummyStudent = allStudents.find((s) => s.id === 'SCI-DUMMY' || s.username?.toLowerCase() === 'dummy');
    const retainedStudents: Student[] = dummyStudent ? [dummyStudent] : [];

    // Retain teacher and dummy users
    const retainedUsers = allUsers.filter(
      (u) => u.role === 'teacher' || u.username.toLowerCase() === 'dummy' || u.studentId === 'SCI-DUMMY'
    );

    // Retain XP of dummy
    const retainedXP = allXP.filter((x) => x.idSiswa === 'SCI-DUMMY');
    const retainedPrivileges = allPrivileges.filter((p) => p.studentId === 'SCI-DUMMY');

    const created: Student[] = [];
    const now = new Date().toISOString();

    names.forEach((rawName, index) => {
      const cleanName = rawName.trim();
      if (!cleanName) return;

      const studentId = `SCI-${String(index + 1).padStart(3, '0')}`;
      const username = cleanName;

      const newStudent: Student = {
        id: studentId,
        name: cleanName,
        username,
        isActive: true,
        createdAt: now,
      };

      const newUser: LocalUserAccount = {
        id: `user-${studentId}`,
        username,
        name: cleanName,
        role: 'student',
        studentId,
        password: '123456',
        mustChangePassword: true,
        isActive: true,
      };

      created.push(newStudent);
      retainedUsers.push(newUser);
    });

    const finalStudents = [...created, ...retainedStudents];
    setStored(LOCAL_STUDENTS_KEY, finalStudents);
    setStored(LOCAL_USERS_KEY, retainedUsers);
    setStored(LOCAL_XP_KEY, retainedXP);
    setStored(LOCAL_PRIV_KEY, retainedPrivileges);

    return { students: finalStudents, count: created.length };
  },

  editStudent(studentId: string, newName: string, newUsername?: string): Student {
    const students = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);

    const s = students.find((item) => item.id === studentId);
    if (!s) throw new Error('Siswa tidak ditemukan.');

    s.name = newName.trim();
    if (newUsername && newUsername.trim()) {
      s.username = newUsername.trim();
    }

    const u = users.find((item) => item.studentId === studentId);
    if (u) {
      u.name = newName.trim();
      if (newUsername && newUsername.trim()) {
        u.username = newUsername.trim();
      }
    }

    setStored(LOCAL_STUDENTS_KEY, students);
    setStored(LOCAL_USERS_KEY, users);
    return s;
  },

  deleteStudent(studentId: string): void {
    const students = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
    const xp = getStored<XPRecord[]>(LOCAL_XP_KEY, []);
    const privs = getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);

    setStored(
      LOCAL_STUDENTS_KEY,
      students.filter((s) => s.id !== studentId)
    );
    setStored(
      LOCAL_USERS_KEY,
      users.filter((u) => u.studentId !== studentId)
    );
    setStored(
      LOCAL_XP_KEY,
      xp.filter((x) => x.idSiswa !== studentId)
    );
    setStored(
      LOCAL_PRIV_KEY,
      privs.filter((p) => p.studentId !== studentId)
    );
  },

  resetStudentPassword(studentId: string): { defaultPassword: string } {
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);
    const u = users.find((item) => item.studentId === studentId);
    if (!u) throw new Error('Akun siswa tidak ditemukan.');

    u.password = '123456';
    u.mustChangePassword = true;
    setStored(LOCAL_USERS_KEY, users);
    return { defaultPassword: '123456' };
  },

  toggleStudentActive(studentId: string): Student {
    const students = getStored<Student[]>(LOCAL_STUDENTS_KEY, []);
    const users = getStored<LocalUserAccount[]>(LOCAL_USERS_KEY, []);

    const s = students.find((item) => item.id === studentId);
    if (!s) throw new Error('Siswa tidak ditemukan.');
    s.isActive = !s.isActive;

    const u = users.find((item) => item.studentId === studentId);
    if (u) {
      u.isActive = s.isActive;
    }

    setStored(LOCAL_STUDENTS_KEY, students);
    setStored(LOCAL_USERS_KEY, users);
    return s;
  },

  awardPrivilege(payload: { studentId: string; perkTitle: string; tier?: string; notes?: string }): PrivilegeRecord {
    const privs = getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);
    const newPriv: PrivilegeRecord = {
      id: `prv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: payload.studentId,
      perkTitle: payload.perkTitle,
      tier: payload.tier || 'Researcher',
      status: 'available',
      notes: payload.notes,
      awardedAt: new Date().toISOString(),
    };
    privs.push(newPriv);
    setStored(LOCAL_PRIV_KEY, privs);
    return newPriv;
  },

  markPrivilegeUsed(id: string, notes?: string): PrivilegeRecord {
    const privs = getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);
    const p = privs.find((item) => item.id === id);
    if (!p) throw new Error('Hak istimewa tidak ditemukan.');
    p.status = 'used';
    p.usedAt = new Date().toISOString();
    if (notes) p.notes = notes;
    setStored(LOCAL_PRIV_KEY, privs);
    return p;
  },

  revokePrivilege(id: string, reason?: string): PrivilegeRecord {
    const privs = getStored<PrivilegeRecord[]>(LOCAL_PRIV_KEY, []);
    const p = privs.find((item) => item.id === id);
    if (!p) throw new Error('Hak istimewa tidak ditemukan.');
    p.status = 'revoked';
    p.revokedAt = new Date().toISOString();
    if (reason) p.notes = `${p.notes ? p.notes + ' - ' : ''}Dicabut: ${reason}`;
    setStored(LOCAL_PRIV_KEY, privs);
    return p;
  },

  updateLevels(levels: MasterLevel[]): MasterLevel[] {
    setStored(LOCAL_LEVELS_KEY, levels);
    return levels;
  },

  resetDemoData(): void {
    localStorage.removeItem(LOCAL_USERS_KEY);
    localStorage.removeItem(LOCAL_STUDENTS_KEY);
    localStorage.removeItem(LOCAL_XP_KEY);
    localStorage.removeItem(LOCAL_PRIV_KEY);
    localStorage.removeItem(LOCAL_LOGS_KEY);
    initializeLocalStore();
  },
};
