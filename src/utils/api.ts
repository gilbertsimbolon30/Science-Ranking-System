import {
  AuthUser,
  Student,
  XPRecord,
  DailyCheckinRecord,
  PrivilegeRecord,
  ActivityLog,
  MasterLevel,
  XPPreset,
  WeeklyQuest,
  DailyQuestion,
  StudentComputedStats,
} from '../types/gamification';
import { localFallback } from './localFallback';

const TOKEN_KEY = 'sainsquest_auth_token_v3';
const STATIC_MODE_KEY = 'sainsquest_is_static_mode';

let isStaticMode = localStorage.getItem(STATIC_MODE_KEY) === 'true';

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

function enableStaticMode() {
  isStaticMode = true;
  localStorage.setItem(STATIC_MODE_KEY, 'true');
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (isStaticMode) {
    throw new Error('STATIC_FALLBACK_TRIGGERED');
  }

  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    // If 404 is encountered on an API route, this is a static hosting environment like GitHub Pages!
    if (res.status === 404) {
      enableStaticMode();
      throw new Error('STATIC_FALLBACK_TRIGGERED');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Terjadi kesalahan (Status ${res.status})`);
    }

    return data as T;
  } catch (err: any) {
    if (err.message === 'STATIC_FALLBACK_TRIGGERED' || err.name === 'TypeError' || err.message?.includes('fetch')) {
      enableStaticMode();
      throw new Error('STATIC_FALLBACK_TRIGGERED');
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    try {
      const data = await apiRequest<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      authStorage.setToken(data.token);
      return data;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const res = localFallback.login(username, password);
        authStorage.setToken(res.token);
        return res;
      }
      throw err;
    }
  },

  async getCurrentUser(): Promise<AuthUser> {
    try {
      const data = await apiRequest<{ user: AuthUser }>('/api/auth/me');
      return data.user;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getCurrentUser();
      }
      throw err;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; token?: string }> {
    try {
      const data = await apiRequest<{ success: boolean; token?: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (data.token) {
        authStorage.setToken(data.token);
      }
      return data;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const res = localFallback.changePassword(currentPassword, newPassword);
        if (res.token) authStorage.setToken(res.token);
        return res;
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      authStorage.clearToken();
      localFallback.logout();
    }
  },

  // Leaderboard & shared
  async getLeaderboard(): Promise<StudentComputedStats[]> {
    try {
      const data = await apiRequest<{ stats: StudentComputedStats[] }>('/api/leaderboard');
      return data.stats;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getLeaderboard();
      }
      throw err;
    }
  },

  async getLevels(): Promise<MasterLevel[]> {
    try {
      const data = await apiRequest<{ levels: MasterLevel[] }>('/api/levels');
      return data.levels;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getLevels();
      }
      throw err;
    }
  },

  async getTodayQuestion(): Promise<DailyQuestion> {
    try {
      const data = await apiRequest<{ todayQuestion: DailyQuestion }>('/api/daily-question');
      return data.todayQuestion;
    } catch {
      return {
        id: 'q-today',
        tanggal: new Date().toISOString().split('T')[0],
        pertanyaan: 'Sains Eksperimen Kimia & Biologi',
        pilihan: [],
        kunciJawaban: '',
        kategori: 'Sains',
        penjelasan: '',
        xpBonus: 50,
      };
    }
  },

  async getWeeklyQuests(): Promise<WeeklyQuest[]> {
    try {
      const data = await apiRequest<{ quests: WeeklyQuest[] }>('/api/weekly-quests');
      return data.quests;
    } catch {
      return [];
    }
  },

  // Student portal
  async getStudentMe(): Promise<{
    student: Student;
    stat: StudentComputedStats;
    privileges: PrivilegeRecord[];
    checkins: DailyCheckinRecord[];
    xpHistory: XPRecord[];
  }> {
    try {
      return await apiRequest('/api/student/me');
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getStudentMe();
      }
      throw err;
    }
  },

  async submitStudentCheckin(_answer: string): Promise<{
    success: boolean;
    checkin: DailyCheckinRecord;
    earnedStreak: number;
    xpBonus: number;
    stats: StudentComputedStats[];
  }> {
    return {
      success: true,
      checkin: {
        id: `chk-${Date.now()}`,
        tanggal: new Date().toISOString().split('T')[0],
        idSiswa: '',
        pertanyaan: '',
        jawaban: '',
        streakHarian: 1,
        createdAt: new Date().toISOString(),
      },
      earnedStreak: 1,
      xpBonus: 0,
      stats: [],
    };
  },

  // Teacher portal
  async getTeacherStudents(): Promise<Student[]> {
    try {
      const data = await apiRequest<{ students: Student[] }>('/api/teacher/students');
      return data.students;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getTeacherStudents();
      }
      throw err;
    }
  },

  async createTeacherStudent(name: string, customUsername?: string): Promise<{ student: Student }> {
    try {
      return await apiRequest('/api/teacher/students', {
        method: 'POST',
        body: JSON.stringify({ name, customUsername }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const res = localFallback.createStudent(name, customUsername);
        return { student: res.student };
      }
      throw err;
    }
  },

  async batchImportStudents(names: string[]): Promise<{ count: number; students: Student[] }> {
    try {
      return await apiRequest('/api/teacher/students/batch', {
        method: 'POST',
        body: JSON.stringify({ names }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.batchImportStudents(names);
      }
      throw err;
    }
  },

  async replaceAllStudents(names: string[]): Promise<{ count: number; students: Student[] }> {
    try {
      return await apiRequest('/api/teacher/students/replace', {
        method: 'POST',
        body: JSON.stringify({ names }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.replaceStudents(names);
      }
      throw err;
    }
  },

  async editTeacherStudent(id: string, name: string, username?: string): Promise<{ student: Student }> {
    try {
      return await apiRequest(`/api/teacher/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, username }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const s = localFallback.editStudent(id, name, username);
        return { student: s };
      }
      throw err;
    }
  },

  async deleteTeacherStudent(id: string): Promise<void> {
    try {
      await apiRequest(`/api/teacher/students/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        localFallback.deleteStudent(id);
        return;
      }
      throw err;
    }
  },

  async resetStudentPassword(id: string): Promise<{ message: string }> {
    try {
      return await apiRequest(`/api/teacher/students/${id}/reset-password`, {
        method: 'POST',
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        localFallback.resetStudentPassword(id);
        return { message: 'Kata sandi siswa berhasil direset ke "123456"' };
      }
      throw err;
    }
  },

  async toggleStudentActive(id: string): Promise<{ isActive: boolean }> {
    try {
      return await apiRequest(`/api/teacher/students/${id}/toggle-active`, {
        method: 'POST',
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const s = localFallback.toggleStudentActive(id);
        return { isActive: Boolean(s.isActive) };
      }
      throw err;
    }
  },

  async getTeacherXPRecords(): Promise<XPRecord[]> {
    try {
      const data = await apiRequest<{ xpRecords: XPRecord[] }>('/api/teacher/xp-records');
      return data.xpRecords;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getTeacherXPRecords();
      }
      throw err;
    }
  },

  async addTeacherXPRecord(record: {
    tanggal: string;
    idSiswa: string;
    nilaiXP: number;
    keterangan: string;
  }): Promise<{ record: XPRecord; stats: StudentComputedStats[] }> {
    try {
      return await apiRequest('/api/teacher/xp-records', {
        method: 'POST',
        body: JSON.stringify(record),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const rec = localFallback.addXPRecord(record);
        const stats = localFallback.getLeaderboard();
        return { record: rec, stats };
      }
      throw err;
    }
  },

  async addBatchTeacherXP(records: {
    tanggal: string;
    idSiswa: string;
    nilaiXP: number;
    keterangan: string;
  }[]): Promise<{ count: number; records: XPRecord[]; stats: StudentComputedStats[] }> {
    try {
      return await apiRequest('/api/teacher/xp-records/batch', {
        method: 'POST',
        body: JSON.stringify({ records }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const recs = localFallback.addBatchXP(records);
        const stats = localFallback.getLeaderboard();
        return { count: recs.length, records: recs, stats };
      }
      throw err;
    }
  },

  async updateTeacherXPRecord(
    id: string,
    updates: { tanggal?: string; nilaiXP?: number; keterangan?: string }
  ): Promise<{ record: XPRecord; stats: StudentComputedStats[] }> {
    try {
      return await apiRequest(`/api/teacher/xp-records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const rec = localFallback.updateXPRecord(id, updates);
        const stats = localFallback.getLeaderboard();
        return { record: rec, stats };
      }
      throw err;
    }
  },

  async deleteTeacherXPRecord(id: string): Promise<{ stats: StudentComputedStats[] }> {
    try {
      return await apiRequest(`/api/teacher/xp-records/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        localFallback.deleteXPRecord(id);
        const stats = localFallback.getLeaderboard();
        return { stats };
      }
      throw err;
    }
  },

  async getTeacherPrivileges(): Promise<PrivilegeRecord[]> {
    try {
      const data = await apiRequest<{ privileges: PrivilegeRecord[] }>('/api/teacher/privileges');
      return data.privileges;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getTeacherPrivileges();
      }
      throw err;
    }
  },

  async awardPrivilege(payload: {
    studentId: string;
    perkTitle: string;
    tier?: string;
    notes?: string;
  }): Promise<{ privilege: PrivilegeRecord }> {
    try {
      return await apiRequest('/api/teacher/privileges/award', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const p = localFallback.awardPrivilege(payload);
        return { privilege: p };
      }
      throw err;
    }
  },

  async markPrivilegeUsed(id: string, notes?: string): Promise<{ privilege: PrivilegeRecord }> {
    try {
      return await apiRequest(`/api/teacher/privileges/${id}/mark-used`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const p = localFallback.markPrivilegeUsed(id, notes);
        return { privilege: p };
      }
      throw err;
    }
  },

  async revokePrivilege(id: string, reason?: string): Promise<{ privilege: PrivilegeRecord }> {
    try {
      return await apiRequest(`/api/teacher/privileges/${id}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const p = localFallback.revokePrivilege(id, reason);
        return { privilege: p };
      }
      throw err;
    }
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const data = await apiRequest<{ activityLogs: ActivityLog[] }>('/api/teacher/activity-logs');
      return data.activityLogs;
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        return localFallback.getActivityLogs();
      }
      throw err;
    }
  },

  async updateLevels(levels: MasterLevel[]): Promise<{ levels: MasterLevel[]; stats: StudentComputedStats[] }> {
    try {
      return await apiRequest('/api/teacher/levels', {
        method: 'PUT',
        body: JSON.stringify({ levels }),
      });
    } catch (err: any) {
      if (err.message === 'STATIC_FALLBACK_TRIGGERED') {
        const updated = localFallback.updateLevels(levels);
        const stats = localFallback.getLeaderboard();
        return { levels: updated, stats };
      }
      throw err;
    }
  },

  async getPresets(): Promise<{ rewardPresets: XPPreset[]; penaltyPresets: XPPreset[] }> {
    try {
      return await apiRequest('/api/teacher/presets');
    } catch {
      return { rewardPresets: [], penaltyPresets: [] };
    }
  },

  async updatePresets(payload: {
    rewardPresets: XPPreset[];
    penaltyPresets: XPPreset[];
  }): Promise<{ rewardPresets: XPPreset[]; penaltyPresets: XPPreset[] }> {
    try {
      return await apiRequest('/api/teacher/presets', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      return payload;
    }
  },

  async toggleQuestStudent(questId: string, studentId: string): Promise<{ quest: WeeklyQuest; stats: StudentComputedStats[] }> {
    try {
      return await apiRequest(`/api/teacher/quests/${questId}/toggle-student`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
    } catch {
      return {
        quest: { id: questId, weekNumber: 1, title: '', category: 'Biologi', xpReward: 0, description: '', completedStudentIds: [] },
        stats: [],
      };
    }
  },

  async syncLocalData(payload: {
    clientStudents?: Student[];
    clientXpRecords?: XPRecord[];
    clientCheckins?: DailyCheckinRecord[];
  }): Promise<{ totalStudents: number; totalXPRecords: number; stats: StudentComputedStats[] }> {
    try {
      return await apiRequest('/api/teacher/sync-local-data', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return { totalStudents: 0, totalXPRecords: 0, stats: [] };
    }
  },

  resetDemoData(): void {
    localFallback.resetDemoData();
  },
};
