/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Student,
  XPRecord,
  DailyCheckinRecord,
  AuthUser,
  PrivilegeRecord,
  ActivityLog,
  MasterLevel,
  StudentComputedStats,
} from './types/gamification';
import {
  MASTER_LEVELS,
  INITIAL_STUDENTS,
  INITIAL_XP_RECORDS,
  formatDateStr,
} from './data/initialData';
import { computeStudentStats } from './utils/gamificationEngine';
import { exportToExcel } from './utils/excelExporter';
import { api, authStorage } from './utils/api';
import { Header, ActiveTab } from './components/Header';
import { LoginView } from './components/LoginView';
import { StudentDashboard } from './components/StudentDashboard';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherControlPanel } from './components/TeacherControlPanel';
import { SpreadsheetSimulator } from './components/SpreadsheetSimulator';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { StudentDetailModal } from './components/StudentDetailModal';

export default function App() {
  const todayStr = useMemo(() => formatDateStr(new Date()), []);

  // Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState<boolean>(false);

  // App Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [xpRecords, setXpRecords] = useState<XPRecord[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckinRecord[]>([]);
  const [levels, setLevels] = useState<MasterLevel[]>(MASTER_LEVELS);
  const [privileges, setPrivileges] = useState<PrivilegeRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Student portal specific state
  const [myStudentProfile, setMyStudentProfile] = useState<Student | null>(null);
  const [myStudentStat, setMyStudentStat] = useState<StudentComputedStats | null>(null);
  const [myPrivileges, setMyPrivileges] = useState<PrivilegeRecord[]>([]);
  const [myXpHistory, setMyXpHistory] = useState<XPRecord[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('leaderboard');
  const [formulaGuideOpen, setFormulaGuideOpen] = useState<boolean>(false);
  const [selectedStudentIdForDetail, setSelectedStudentIdForDetail] = useState<string | null>(null);
  const [preselectedStudentIdForTeacher, setPreselectedStudentIdForTeacher] = useState<string | undefined>(undefined);

  // Load Initial Session
  useEffect(() => {
    async function initAuth() {
      const token = authStorage.getToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        if (user.role === 'student') {
          setActiveTab('studentDashboard');
        } else {
          setActiveTab('leaderboard');
        }
      } catch {
        authStorage.clearToken();
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    initAuth();
  }, []);

  // Fetch Data when authenticated
  const loadClassData = useCallback(async () => {
    if (!currentUser) return;

    try {
      // 1. Shared data
      const fetchedLevels = await api.getLevels().catch(() => MASTER_LEVELS);
      setLevels(fetchedLevels);

      // 2. If Teacher, fetch administrative data & perform local migration if needed
      if (currentUser.role === 'teacher') {
        const [teacherStudents, teacherXP, teacherPrivs, teacherLogs] = await Promise.all([
          api.getTeacherStudents(),
          api.getTeacherXPRecords(),
          api.getTeacherPrivileges(),
          api.getActivityLogs(),
        ]);

        setStudents(teacherStudents);
        setXpRecords(teacherXP);
        setPrivileges(teacherPrivs);
        setActivityLogs(teacherLogs);

        // One-time safe client localStorage sync check (preserve 42 students from browser if any)
        const localStudentsRaw = localStorage.getItem('sainsquest_students_v2');
        const syncDone = localStorage.getItem('sainsquest_synced_v3');
        if (localStudentsRaw && syncDone !== 'true') {
          try {
            const localStudents = JSON.parse(localStudentsRaw);
            if (Array.isArray(localStudents) && localStudents.length > 0) {
              const localXP = JSON.parse(localStorage.getItem('sainsquest_xprecords_v2') || '[]');
              await api.syncLocalData({
                clientStudents: localStudents,
                clientXpRecords: localXP,
              });
              localStorage.setItem('sainsquest_synced_v3', 'true');
              const updatedStudents = await api.getTeacherStudents();
              const updatedXP = await api.getTeacherXPRecords();
              setStudents(updatedStudents);
              setXpRecords(updatedXP);
            }
          } catch (e) {
            console.error('Migration error:', e);
          }
        }
      }

      // 3. If Student, load student-specific dashboard data
      if (currentUser.role === 'student') {
        const myData = await api.getStudentMe();
        setMyStudentProfile(myData.student);
        setMyStudentStat(myData.stat);
        setMyPrivileges(myData.privileges);
        setMyXpHistory(myData.xpHistory);

        // Also fetch students list for leaderboard calculation
        const stats = await api.getLeaderboard();
        setStudents(stats.map((s) => ({ id: s.id, name: s.name })));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadClassData();
    }
  }, [currentUser, loadClassData]);

  // Compute student stats
  const computedStats = useMemo(() => {
    return computeStudentStats(students, xpRecords, checkins, todayStr, levels);
  }, [students, xpRecords, checkins, todayStr, levels]);

  // Login handler
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setActiveTab('studentDashboard');
    } else {
      setActiveTab('leaderboard');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setStudents([]);
    setXpRecords([]);
  };

  // Back / Exit navigation logic
  const handleGoBack = () => {
    if (currentUser?.role === 'student') {
      setActiveTab('studentDashboard');
    } else {
      setActiveTab('leaderboard');
    }
    setPreselectedStudentIdForTeacher(undefined);
  };

  // ==========================================
  // TEACHER HANDLERS
  // ==========================================
  const handleAddStudent = async (name: string, customUsername?: string) => {
    try {
      const res = await api.createTeacherStudent(name, customUsername);
      setStudents((prev) => [...prev, res.student]);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan siswa.');
    }
  };

  const handleAddBatchStudents = async (names: string[]) => {
    try {
      const res = await api.batchImportStudents(names);
      setStudents((prev) => [...prev, ...res.students]);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor siswa.');
    }
  };

  const handleReplaceBatchStudents = async (names: string[]) => {
    try {
      const res = await api.replaceAllStudents(names);
      setStudents(res.students);
      const freshXP = await api.getTeacherXPRecords();
      setXpRecords(freshXP);
      const freshPrivs = await api.getTeacherPrivileges();
      setPrivileges(freshPrivs);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mengganti data siswa.');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await api.deleteTeacherStudent(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setXpRecords((prev) => prev.filter((r) => r.idSiswa !== studentId));
      setPrivileges((prev) => prev.filter((p) => p.studentId !== studentId));
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus siswa.');
    }
  };

  const handleEditStudent = async (studentId: string, newName: string, newUsername?: string) => {
    try {
      const res = await api.editTeacherStudent(studentId, newName, newUsername);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...res.student } : s))
      );
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mengedit nama siswa.');
    }
  };

  const handleResetStudentPassword = async (studentId: string) => {
    try {
      await api.resetStudentPassword(studentId);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mereset kata sandi.');
    }
  };

  const handleToggleStudentActive = async (studentId: string) => {
    try {
      const res = await api.toggleStudentActive(studentId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isActive: res.isActive } : s))
      );
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status aktif siswa.');
    }
  };

  const handleAddXPRecord = async (record: Omit<XPRecord, 'id'>) => {
    try {
      const res = await api.addTeacherXPRecord({
        tanggal: record.tanggal,
        idSiswa: record.idSiswa,
        nilaiXP: record.nilaiXP,
        keterangan: record.keterangan,
      });
      setXpRecords((prev) => [res.record, ...prev]);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan XP.');
    }
  };

  const handleAddBatchXP = async (records: Omit<XPRecord, 'id'>[]) => {
    try {
      const res = await api.addBatchTeacherXP(
        records.map((r) => ({
          tanggal: r.tanggal,
          idSiswa: r.idSiswa,
          nilaiXP: r.nilaiXP,
          keterangan: r.keterangan,
        }))
      );
      setXpRecords((prev) => [...res.records, ...prev]);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan XP batch.');
    }
  };

  const handleUpdateXPRecord = async (
    id: string,
    updates: { tanggal?: string; nilaiXP?: number; keterangan?: string }
  ) => {
    try {
      const res = await api.updateTeacherXPRecord(id, updates);
      setXpRecords((prev) => prev.map((r) => (r.id === id ? res.record : r)));
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mengoreksi catatan XP.');
    }
  };

  const handleDeleteXPRecord = async (id: string) => {
    try {
      await api.deleteTeacherXPRecord(id);
      setXpRecords((prev) => prev.filter((r) => r.id !== id));
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus catatan XP.');
    }
  };

  const handleAwardPrivilege = async (payload: {
    studentId: string;
    perkTitle: string;
    tier?: string;
    notes?: string;
  }) => {
    try {
      const res = await api.awardPrivilege(payload);
      setPrivileges((prev) => [res.privilege, ...prev]);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal memberikan privilege.');
    }
  };

  const handleMarkPrivilegeUsed = async (id: string, notes?: string) => {
    try {
      const res = await api.markPrivilegeUsed(id, notes);
      setPrivileges((prev) => prev.map((p) => (p.id === id ? res.privilege : p)));
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status privilege.');
    }
  };

  const handleRevokePrivilege = async (id: string, reason?: string) => {
    try {
      const res = await api.revokePrivilege(id, reason);
      setPrivileges((prev) => prev.map((p) => (p.id === id ? res.privilege : p)));
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal mencabut privilege.');
    }
  };

  const handleUpdateLevels = async (updatedLevels: MasterLevel[]) => {
    try {
      const res = await api.updateLevels(updatedLevels);
      setLevels(res.levels);
      const logs = await api.getActivityLogs();
      setActivityLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui tingkatan level.');
    }
  };

  const handleOpenQuickXP = (studentId: string) => {
    if (currentUser?.role === 'teacher') {
      setPreselectedStudentIdForTeacher(studentId);
      setActiveTab('teacher');
    }
  };

  const handleResetDemoData = () => {
    setStudents([]);
    setXpRecords([]);
    setPrivileges([]);
  };

  const selectedStudentStat = useMemo(() => {
    if (!selectedStudentIdForDetail) return null;
    return computedStats.find((s) => s.id === selectedStudentIdForDetail) || null;
  }, [selectedStudentIdForDetail, computedStats]);

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Memuat Sistem SainsQuest...
          </p>
        </div>
      </div>
    );
  }

  // If Not Authenticated, show Login View
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isTeacher = currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        currentUser={currentUser}
        onTabChange={(tab) => {
          // Access-control boundary check: Students cannot access teacher or sheets tabs
          if (isStudent && (tab === 'teacher' || tab === 'sheets')) {
            return;
          }
          setActiveTab(tab);
          setPreselectedStudentIdForTeacher(undefined);
        }}
        onExportExcel={() => exportToExcel(levels, xpRecords, checkins, students, todayStr)}
        onOpenFormulaGuide={() => setFormulaGuideOpen(true)}
        onOpenChangePassword={() => setChangePasswordModalOpen(true)}
        onLogout={handleLogout}
        onBack={handleGoBack}
      />

      {/* Main View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Student Dedicated Dashboard View */}
        {isStudent && activeTab === 'studentDashboard' && myStudentProfile && (
          <StudentDashboard
            student={myStudentProfile}
            myStat={myStudentStat || computedStats.find((s) => s.id === currentUser.studentId) || null}
            allStats={computedStats}
            privileges={myPrivileges}
            xpHistory={myXpHistory}
            onChangePasswordClick={() => setChangePasswordModalOpen(true)}
            onGoBack={handleGoBack}
          />
        )}

        {/* Leaderboard View (Accessible to both Teacher & Student) */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            stats={computedStats}
            onSelectStudent={(id) => {
              if (isTeacher) {
                setSelectedStudentIdForDetail(id);
              }
            }}
            onOpenQuickXP={handleOpenQuickXP}
            onGoToTeacherPanel={() => isTeacher && setActiveTab('teacher')}
          />
        )}

        {/* Teacher Control Panel (Protected: Teacher Role Only) */}
        {isTeacher && activeTab === 'teacher' && (
          <TeacherControlPanel
            students={students}
            xpRecords={xpRecords}
            stats={computedStats}
            privileges={privileges}
            activityLogs={activityLogs}
            levels={levels}
            onAddXPRecord={handleAddXPRecord}
            onAddBatchXP={handleAddBatchXP}
            onUpdateXPRecord={handleUpdateXPRecord}
            onDeleteXPRecord={handleDeleteXPRecord}
            onAddStudent={handleAddStudent}
            onAddBatchStudents={handleAddBatchStudents}
            onReplaceBatchStudents={handleReplaceBatchStudents}
            onDeleteStudent={handleDeleteStudent}
            onEditStudent={handleEditStudent}
            onResetStudentPassword={handleResetStudentPassword}
            onToggleStudentActive={handleToggleStudentActive}
            onAwardPrivilege={handleAwardPrivilege}
            onMarkPrivilegeUsed={handleMarkPrivilegeUsed}
            onRevokePrivilege={handleRevokePrivilege}
            onUpdateLevels={handleUpdateLevels}
            onResetDemoData={handleResetDemoData}
            onGoBack={handleGoBack}
            preselectedStudentId={preselectedStudentIdForTeacher}
          />
        )}

        {/* Spreadsheet 4-Sheet Simulator (Teacher Role Only) */}
        {isTeacher && activeTab === 'sheets' && (
          <SpreadsheetSimulator
            masterLevels={levels}
            xpRecords={xpRecords}
            checkins={checkins}
            students={students}
            stats={computedStats}
            todayStr={todayStr}
            onOpenFormulaGuide={() => setFormulaGuideOpen(true)}
          />
        )}
      </main>

      {/* Force Change Password Modal (First Login or Voluntary) */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen || currentUser.mustChangePassword}
        isForced={currentUser.mustChangePassword}
        userName={currentUser.name}
        onClose={() => {
          if (currentUser.mustChangePassword) {
            // User cancelled/clicked back on mandatory password change screen -> return to login page
            handleLogout();
          } else {
            setChangePasswordModalOpen(false);
          }
        }}
        onPasswordChanged={() => {
          setCurrentUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null));
          setChangePasswordModalOpen(false);
        }}
      />

      {/* Modals */}
      <FormulaGuideModal
        isOpen={formulaGuideOpen}
        onClose={() => setFormulaGuideOpen(false)}
      />

      <StudentDetailModal
        studentStat={selectedStudentStat}
        xpRecords={xpRecords}
        onClose={() => setSelectedStudentIdForDetail(null)}
        onOpenQuickXP={handleOpenQuickXP}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SainsQuest</span>
            <span>—</span>
            <span>Gamifikasi Pembelajaran Kelas Science 1 Tahun Ajaran</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Sistem Poin Absolut: Guru Kontrol Penuh · Ranks & Badges</span>
            {isTeacher && (
              <button
                onClick={() => setFormulaGuideOpen(true)}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Panduan Rumus
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
