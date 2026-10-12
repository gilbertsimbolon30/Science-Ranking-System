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

const TOKEN_KEY = 'sainsquest_auth_token_v3';

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

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Terjadi kesalahan (Status ${res.status})`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const data = await apiRequest<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    authStorage.setToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<AuthUser> {
    const data = await apiRequest<{ user: AuthUser }>('/api/auth/me');
    return data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; token?: string }> {
    const data = await apiRequest<{ success: boolean; token?: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      authStorage.clearToken();
    }
  },

  // Leaderboard & shared
  async getLeaderboard(): Promise<StudentComputedStats[]> {
    const data = await apiRequest<{ stats: StudentComputedStats[] }>('/api/leaderboard');
    return data.stats;
  },

  async getLevels(): Promise<MasterLevel[]> {
    const data = await apiRequest<{ levels: MasterLevel[] }>('/api/levels');
    return data.levels;
  },

  async getTodayQuestion(): Promise<DailyQuestion> {
    const data = await apiRequest<{ todayQuestion: DailyQuestion }>('/api/daily-question');
    return data.todayQuestion;
  },

  async getWeeklyQuests(): Promise<WeeklyQuest[]> {
    const data = await apiRequest<{ quests: WeeklyQuest[] }>('/api/weekly-quests');
    return data.quests;
  },

  // Student portal
  async getStudentMe(): Promise<{
    student: Student;
    stat: StudentComputedStats;
    privileges: PrivilegeRecord[];
    checkins: DailyCheckinRecord[];
    xpHistory: XPRecord[];
  }> {
    return apiRequest('/api/student/me');
  },

  async submitStudentCheckin(answer: string): Promise<{
    success: boolean;
    checkin: DailyCheckinRecord;
    earnedStreak: number;
    xpBonus: number;
    stats: StudentComputedStats[];
  }> {
    return apiRequest('/api/student/checkin', {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  },

  // Teacher portal
  async getTeacherStudents(): Promise<Student[]> {
    const data = await apiRequest<{ students: Student[] }>('/api/teacher/students');
    return data.students;
  },

  async createTeacherStudent(name: string, customUsername?: string): Promise<{ student: Student }> {
    return apiRequest('/api/teacher/students', {
      method: 'POST',
      body: JSON.stringify({ name, customUsername }),
    });
  },

  async batchImportStudents(names: string[]): Promise<{ count: number; students: Student[] }> {
    return apiRequest('/api/teacher/students/batch', {
      method: 'POST',
      body: JSON.stringify({ names }),
    });
  },

  async editTeacherStudent(id: string, name: string, username?: string): Promise<{ student: Student }> {
    return apiRequest(`/api/teacher/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, username }),
    });
  },

  async deleteTeacherStudent(id: string): Promise<void> {
    await apiRequest(`/api/teacher/students/${id}`, {
      method: 'DELETE',
    });
  },

  async resetStudentPassword(id: string): Promise<{ message: string }> {
    return apiRequest(`/api/teacher/students/${id}/reset-password`, {
      method: 'POST',
    });
  },

  async toggleStudentActive(id: string): Promise<{ isActive: boolean }> {
    return apiRequest(`/api/teacher/students/${id}/toggle-active`, {
      method: 'POST',
    });
  },

  async getTeacherXPRecords(): Promise<XPRecord[]> {
    const data = await apiRequest<{ xpRecords: XPRecord[] }>('/api/teacher/xp-records');
    return data.xpRecords;
  },

  async addTeacherXPRecord(record: {
    tanggal: string;
    idSiswa: string;
    nilaiXP: number;
    keterangan: string;
  }): Promise<{ record: XPRecord; stats: StudentComputedStats[] }> {
    return apiRequest('/api/teacher/xp-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  async addBatchTeacherXP(records: {
    tanggal: string;
    idSiswa: string;
    nilaiXP: number;
    keterangan: string;
  }[]): Promise<{ count: number; records: XPRecord[]; stats: StudentComputedStats[] }> {
    return apiRequest('/api/teacher/xp-records/batch', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },

  async updateTeacherXPRecord(
    id: string,
    updates: { tanggal?: string; nilaiXP?: number; keterangan?: string }
  ): Promise<{ record: XPRecord; stats: StudentComputedStats[] }> {
    return apiRequest(`/api/teacher/xp-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTeacherXPRecord(id: string): Promise<{ stats: StudentComputedStats[] }> {
    return apiRequest(`/api/teacher/xp-records/${id}`, {
      method: 'DELETE',
    });
  },

  async getTeacherPrivileges(): Promise<PrivilegeRecord[]> {
    const data = await apiRequest<{ privileges: PrivilegeRecord[] }>('/api/teacher/privileges');
    return data.privileges;
  },

  async awardPrivilege(payload: {
    studentId: string;
    perkTitle: string;
    tier?: string;
    notes?: string;
  }): Promise<{ privilege: PrivilegeRecord }> {
    return apiRequest('/api/teacher/privileges/award', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async markPrivilegeUsed(id: string, notes?: string): Promise<{ privilege: PrivilegeRecord }> {
    return apiRequest(`/api/teacher/privileges/${id}/mark-used`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async revokePrivilege(id: string, reason?: string): Promise<{ privilege: PrivilegeRecord }> {
    return apiRequest(`/api/teacher/privileges/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const data = await apiRequest<{ activityLogs: ActivityLog[] }>('/api/teacher/activity-logs');
    return data.activityLogs;
  },

  async updateLevels(levels: MasterLevel[]): Promise<{ levels: MasterLevel[]; stats: StudentComputedStats[] }> {
    return apiRequest('/api/teacher/levels', {
      method: 'PUT',
      body: JSON.stringify({ levels }),
    });
  },

  async getPresets(): Promise<{ rewardPresets: XPPreset[]; penaltyPresets: XPPreset[] }> {
    return apiRequest('/api/teacher/presets');
  },

  async updatePresets(payload: {
    rewardPresets: XPPreset[];
    penaltyPresets: XPPreset[];
  }): Promise<{ rewardPresets: XPPreset[]; penaltyPresets: XPPreset[] }> {
    return apiRequest('/api/teacher/presets', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async toggleQuestStudent(questId: string, studentId: string): Promise<{ quest: WeeklyQuest; stats: StudentComputedStats[] }> {
    return apiRequest(`/api/teacher/quests/${questId}/toggle-student`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  async syncLocalData(payload: {
    clientStudents?: Student[];
    clientXpRecords?: XPRecord[];
    clientCheckins?: DailyCheckinRecord[];
  }): Promise<{ totalStudents: number; totalXPRecords: number; stats: StudentComputedStats[] }> {
    return apiRequest('/api/teacher/sync-local-data', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
