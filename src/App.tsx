/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Student,
  XPRecord,
  DailyCheckinRecord,
  WeeklyQuest,
  DailyQuestion,
} from './types/gamification';
import {
  MASTER_LEVELS,
  INITIAL_STUDENTS,
  INITIAL_XP_RECORDS,
  INITIAL_DAILY_CHECKINS,
  INITIAL_WEEKLY_QUESTS,
  QUESTION_BANK,
  formatDateStr,
} from './data/initialData';
import { computeStudentStats, sortAndComputeCheckins } from './utils/gamificationEngine';
import { exportToExcel } from './utils/excelExporter';
import { Header, ActiveTab } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { TeacherControlPanel } from './components/TeacherControlPanel';
import { DailyCheckinView } from './components/DailyCheckinView';
import { WeeklyQuestsView } from './components/WeeklyQuestsView';
import { SpreadsheetSimulator } from './components/SpreadsheetSimulator';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { StudentDetailModal } from './components/StudentDetailModal';

const STORAGE_KEYS = {
  STUDENTS: 'sainsquest_students_v1',
  XP_RECORDS: 'sainsquest_xprecords_v1',
  CHECKINS: 'sainsquest_checkins_v1',
  QUESTS: 'sainsquest_quests_v1',
  TODAY_QUESTION: 'sainsquest_today_question_v1',
};

export default function App() {
  const todayStr = useMemo(() => formatDateStr(new Date()), []);

  // State Management with LocalStorage Fallback
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [xpRecords, setXpRecords] = useState<XPRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.XP_RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_XP_RECORDS;
  });

  const [checkins, setCheckins] = useState<DailyCheckinRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_CHECKINS;
  });

  const [quests, setQuests] = useState<WeeklyQuest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_QUESTS;
  });

  const [todayQuestion, setTodayQuestion] = useState<DailyQuestion>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TODAY_QUESTION);
    return saved ? JSON.parse(saved) : QUESTION_BANK[0];
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('leaderboard');
  const [formulaGuideOpen, setFormulaGuideOpen] = useState<boolean>(false);
  const [selectedStudentIdForDetail, setSelectedStudentIdForDetail] = useState<string | null>(null);
  const [preselectedStudentIdForTeacher, setPreselectedStudentIdForTeacher] = useState<string | undefined>(undefined);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.XP_RECORDS, JSON.stringify(xpRecords));
  }, [xpRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins));
  }, [checkins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TODAY_QUESTION, JSON.stringify(todayQuestion));
  }, [todayQuestion]);

  // Compute stats dynamically using the formula engine
  const computedStats = useMemo(() => {
    return computeStudentStats(students, xpRecords, checkins, todayStr, MASTER_LEVELS);
  }, [students, xpRecords, checkins, todayStr]);

  // Handlers
  const handleAddXPRecord = (record: Omit<XPRecord, 'id'>) => {
    const newRecord: XPRecord = {
      ...record,
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setXpRecords((prev) => [newRecord, ...prev]);
  };

  const handleAddBatchXP = (records: Omit<XPRecord, 'id'>[]) => {
    const newRecords: XPRecord[] = records.map((r, i) => ({
      ...r,
      id: `xp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    setXpRecords((prev) => [...newRecords, ...prev]);
  };

  const handleDeleteXPRecord = (id: string) => {
    setXpRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddStudent = (name: string) => {
    const nextNum = students.length + 1;
    const newId = `SCI-${String(nextNum).padStart(3, '0')}`;
    const newStudent: Student = { id: newId, name };
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleStudentCheckin = (studentId: string, answer: string, earnedStreak: number) => {
    // 1. Add record to Daily Check-in
    const newCheckin: DailyCheckinRecord = {
      id: `chk-${Date.now()}`,
      tanggal: todayStr,
      idSiswa: studentId,
      pertanyaan: todayQuestion.pertanyaan,
      jawaban: answer,
      streakHarian: earnedStreak,
    };
    const updatedCheckins = sortAndComputeCheckins([...checkins, newCheckin]);
    setCheckins(updatedCheckins);

    // 2. Add bonus XP to Riwayat XP
    const xpBonus = todayQuestion.xpBonus || 50;
    const newXP: XPRecord = {
      id: `xp-checkin-${Date.now()}`,
      tanggal: todayStr,
      idSiswa: studentId,
      nilaiXP: xpBonus,
      keterangan: `Daily Check-in: ${todayQuestion.pertanyaan} (Streak ke-${earnedStreak})`,
    };
    setXpRecords((prev) => [newXP, ...prev]);
  };

  const handleCompleteQuest = (questId: string, studentId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    if (!quest.completedStudentIds.includes(studentId)) {
      // Update quest completions
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, completedStudentIds: [...q.completedStudentIds, studentId] } : q
        )
      );

      // Log high XP reward into Riwayat XP
      const xpLog: XPRecord = {
        id: `xp-quest-${Date.now()}`,
        tanggal: todayStr,
        idSiswa: studentId,
        nilaiXP: quest.xpReward,
        keterangan: `Selesai Quest Mingguan ${quest.weekNumber}: ${quest.title}`,
      };
      setXpRecords((prev) => [xpLog, ...prev]);
    }
  };

  const handleRevokeQuest = (questId: string, studentId: string) => {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? { ...q, completedStudentIds: q.completedStudentIds.filter((id) => id !== studentId) }
          : q
      )
    );
  };

  const handleResetDemoData = () => {
    setStudents(INITIAL_STUDENTS);
    setXpRecords(INITIAL_XP_RECORDS);
    setCheckins(INITIAL_DAILY_CHECKINS);
    setQuests(INITIAL_WEEKLY_QUESTS);
    setTodayQuestion(QUESTION_BANK[0]);
    localStorage.clear();
  };

  const handleOpenQuickXP = (studentId: string) => {
    setPreselectedStudentIdForTeacher(studentId);
    setActiveTab('teacher');
  };

  const selectedStudentStat = useMemo(() => {
    if (!selectedStudentIdForDetail) return null;
    return computedStats.find((s) => s.id === selectedStudentIdForDetail) || null;
  }, [selectedStudentIdForDetail, computedStats]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal 3-Zone Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPreselectedStudentIdForTeacher(undefined);
        }}
        onExportExcel={() => exportToExcel(MASTER_LEVELS, xpRecords, checkins, students, todayStr)}
        onOpenFormulaGuide={() => setFormulaGuideOpen(true)}
      />

      {/* Main View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            stats={computedStats}
            onSelectStudent={(id) => setSelectedStudentIdForDetail(id)}
            onOpenQuickXP={handleOpenQuickXP}
            onGoToCheckin={() => setActiveTab('checkin')}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherControlPanel
            students={students}
            xpRecords={xpRecords}
            stats={computedStats}
            onAddXPRecord={handleAddXPRecord}
            onAddBatchXP={handleAddBatchXP}
            onDeleteXPRecord={handleDeleteXPRecord}
            onAddStudent={handleAddStudent}
            onResetDemoData={handleResetDemoData}
            preselectedStudentId={preselectedStudentIdForTeacher}
          />
        )}

        {activeTab === 'checkin' && (
          <DailyCheckinView
            students={students}
            checkins={checkins}
            stats={computedStats}
            todayQuestion={todayQuestion}
            questionBank={QUESTION_BANK}
            todayStr={todayStr}
            onStudentCheckin={handleStudentCheckin}
            onUpdateTodayQuestion={setTodayQuestion}
          />
        )}

        {activeTab === 'quests' && (
          <WeeklyQuestsView
            quests={quests}
            students={students}
            onCompleteQuest={handleCompleteQuest}
            onRevokeQuest={handleRevokeQuest}
          />
        )}

        {activeTab === 'sheets' && (
          <SpreadsheetSimulator
            masterLevels={MASTER_LEVELS}
            xpRecords={xpRecords}
            checkins={checkins}
            students={students}
            stats={computedStats}
            todayStr={todayStr}
            onOpenFormulaGuide={() => setFormulaGuideOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <FormulaGuideModal
        isOpen={formulaGuideOpen}
        onClose={() => setFormulaGuideOpen(false)}
      />

      <StudentDetailModal
        studentStat={selectedStudentStat}
        xpRecords={xpRecords}
        checkins={checkins}
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
            <span>Formula Google Sheets: SUMIFS · VLOOKUP · MAXIFS · IF Streak</span>
            <button
              onClick={() => setFormulaGuideOpen(true)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Panduan Rumus
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
