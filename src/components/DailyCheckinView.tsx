import React, { useState } from 'react';
import { Student, DailyCheckinRecord, DailyQuestion, StudentComputedStats } from '../types/gamification';
import {
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  Send,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { triggerStreakConfetti, triggerLevelUpConfetti } from '../utils/celebration';
import { getDaysDiff } from '../utils/gamificationEngine';

interface DailyCheckinViewProps {
  students: Student[];
  checkins: DailyCheckinRecord[];
  stats: StudentComputedStats[];
  todayQuestion: DailyQuestion;
  questionBank: DailyQuestion[];
  todayStr: string;
  onStudentCheckin: (studentId: string, answer: string, earnedStreak: number) => void;
  onUpdateTodayQuestion: (newQuestion: DailyQuestion) => void;
}

export const DailyCheckinView: React.FC<DailyCheckinViewProps> = ({
  students,
  checkins,
  stats,
  todayQuestion,
  questionBank,
  todayStr,
  onStudentCheckin,
  onUpdateTodayQuestion,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [submittedFeedback, setSubmittedFeedback] = useState<{
    success: boolean;
    streak: number;
    message: string;
  } | null>(null);

  // Check if current selected student has checked in today
  const currentStudentCheckinToday = checkins.find(
    (c) => c.idSiswa === selectedStudentId && c.tanggal === todayStr
  );

  const selectedStudentStats = stats.find((s) => s.id === selectedStudentId);

  // Predict streak for selected student if they check in today
  const calculateNextStreak = (studentId: string): number => {
    const studentCheckins = checkins
      .filter((c) => c.idSiswa === studentId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    if (studentCheckins.length === 0) return 1;

    const latest = studentCheckins[0];
    if (latest.tanggal === todayStr) {
      return latest.streakHarian; // Already checked in
    }

    const diff = getDaysDiff(latest.tanggal, todayStr);
    if (diff === 1) {
      // Consecutive day!
      return latest.streakHarian + 1;
    } else {
      // Missed a day or more
      return 1;
    }
  };

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAnswer = selectedOption || customAnswer.trim();
    if (!finalAnswer) {
      alert('Silakan pilih atau tulis jawaban kuis sains harian');
      return;
    }

    if (currentStudentCheckinToday) {
      alert('Siswa ini sudah melakukan daily check-in hari ini!');
      return;
    }

    const predictedStreak = calculateNextStreak(selectedStudentId);

    onStudentCheckin(selectedStudentId, finalAnswer, predictedStreak);
    triggerStreakConfetti();
    if (predictedStreak >= 5) {
      triggerLevelUpConfetti();
    }

    setSubmittedFeedback({
      success: true,
      streak: predictedStreak,
      message: `Jawaban tersimpan! Streak harian aktif menjadi ${predictedStreak} hari. +${todayQuestion.xpBonus} XP ditambahkan!`,
    });

    setSelectedOption('');
    setCustomAnswer('');
  };

  // Checked in today vs pending
  const checkedInStudentIds = new Set(
    checkins.filter((c) => c.tanggal === todayStr).map((c) => c.idSiswa)
  );
  const checkedInStudents = students.filter((s) => checkedInStudentIds.has(s.id));
  const pendingStudents = students.filter((s) => !checkedInStudentIds.has(s.id));

  return (
    <div className="space-y-8">
      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
            <span>DAILY CHECK-IN & STREAK SYSTEM</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Check-in Sains Harian & Perhitungan Streak Otomatis
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Siswa menjawab 1 pertanyaan sains setiap hari untuk membangun streak konsistensi.
            Streak dihitung berurutan menggunakan rumus spreadsheet:{' '}
            <code className="text-amber-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded text-[11px]">
              =IF(B2=B1, IF(A2=A1+1, E1+1, 1), 1)
            </code>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-400 block">Tanggal Hari Ini (H1)</span>
            <span className="text-white font-mono font-bold">{todayStr}</span>
          </div>
        </div>
      </div>

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Check-in Station (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Stasiun Check-in Mandiri Siswa</h3>
                <span className="text-[11px] text-slate-400">Pilih nama kamu dan jawab kuis hari ini</span>
              </div>
            </div>

            {selectedStudentStats && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-mono">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Streak: {selectedStudentStats.currentStreak} Hari</span>
              </div>
            )}
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Identitas Siswa:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setSubmittedFeedback(null);
                setSelectedOption('');
              }}
              className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-sans focus:outline-none focus:border-emerald-500"
            >
              {students.map((st) => {
                const isDone = checkedInStudentIds.has(st.id);
                return (
                  <option key={st.id} value={st.id}>
                    {isDone ? '✓ [Sudah Check-in]' : '○ [Belum Check-in]'} {st.id} - {st.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status indicator if already checked in today */}
          {currentStudentCheckinToday ? (
            <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Siswa ini telah berhasil Check-in untuk Hari Ini!</span>
              </div>
              <p className="text-slate-300">
                Pertanyaan: <strong className="text-white">{currentStudentCheckinToday.pertanyaan}</strong>
              </p>
              <p className="text-slate-300">
                Jawaban: <span className="text-emerald-400 font-mono">"{currentStudentCheckinToday.jawaban}"</span>
              </p>
              <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-slate-400">
                <span>Streak Tercatat Hari Ini:</span>
                <span className="font-bold text-amber-400 font-mono text-sm">
                  🔥 {currentStudentCheckinToday.streakHarian} Hari Berturut-turut
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckinSubmit} className="space-y-5">
              {/* Science Question Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-medium">
                    Kategori: {todayQuestion.kategori}
                  </span>
                  <span className="text-amber-400 font-mono font-bold">
                    +{todayQuestion.xpBonus} XP Bonus
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {todayQuestion.pertanyaan}
                </h4>

                {/* Multiple choice options */}
                {todayQuestion.pilihan && todayQuestion.pilihan.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {todayQuestion.pilihan.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedOption === opt
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quizOption"
                          value={opt}
                          checked={selectedOption === opt}
                          onChange={() => setSelectedOption(opt)}
                          className="text-emerald-500 focus:ring-0"
                        />
                        <span className="font-mono text-slate-500">[{String.fromCharCode(65 + idx)}]</span>
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      placeholder="Ketik jawaban sains kamu di sini..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Streak preview alert */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Proyeksi Streak Baru:</span>
                </div>
                <div className="font-mono font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{calculateNextStreak(selectedStudentId)} Hari</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Jawaban & Klaim Streak Harian</span>
              </button>
            </form>
          )}

          {/* Feedback banner */}
          {submittedFeedback && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200 animate-fade-in flex items-center gap-3">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-amber-300">Streak Sains Diperbarui!</strong>
                <span>{submittedFeedback.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Attendance & Question Management (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Progress Today */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Partisipasi Hari Ini ({todayStr})</span>
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {checkedInStudents.length} / {students.length} Siswa
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{
                  width: `${(checkedInStudents.length / (students.length || 1)) * 100}%`,
                }}
              />
            </div>

            {/* Student Attendance List */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                Sudah Check-in ({checkedInStudents.length}):
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {checkedInStudents.map((st) => {
                  const cRec = checkins.find((c) => c.idSiswa === st.id && c.tanggal === todayStr);
                  return (
                    <div
                      key={st.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950 border border-slate-800"
                    >
                      <span className="truncate text-slate-300">
                        <span className="font-mono text-slate-500 mr-1">{st.id}</span>
                        {st.name}
                      </span>
                      <span className="font-mono text-amber-400 text-[11px] flex items-center gap-1 shrink-0">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        {cRec?.streakHarian ?? 1}d
                      </span>
                    </div>
                  );
                })}
              </div>

              {pendingStudents.length > 0 && (
                <>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide pt-2">
                    Belum Check-in ({pendingStudents.length}):
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {pendingStudents.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudentId(st.id)}
                        className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-slate-800/60 cursor-pointer text-slate-400"
                      >
                        <span className="truncate">
                          <span className="font-mono text-slate-600 mr-1">{st.id}</span>
                          {st.name}
                        </span>
                        <span className="text-[10px] text-slate-500">Pilih</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Bank Switcher (Guru) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Ganti Pertanyaan Hari Ini (Bank Sains)</span>
            </h3>
            <div className="space-y-2">
              {questionBank.map((q) => (
                <button
                  key={q.id}
                  onClick={() => onUpdateTodayQuestion({ ...q, tanggal: todayStr })}
                  className={`w-full text-left p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    todayQuestion.pertanyaan === q.pertanyaan
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                    <span>{q.kategori}</span>
                    {todayQuestion.pertanyaan === q.pertanyaan && (
                      <span className="text-cyan-400 font-semibold">Aktif Hari Ini</span>
                    )}
                  </div>
                  <div className="font-medium text-slate-200 truncate">{q.pertanyaan}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sheet 3: Daily Check-in Raw Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Sheet 3: Daily Check-in (Tersortir ID Siswa A-Z lalu Tanggal)</span>
              <span className="text-xs text-slate-500 font-mono font-normal">
                ({checkins.length} Log Check-in)
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kolom E: Streak Harian dihitung dengan rumus{' '}
              <code className="text-amber-300 font-mono">=IF(B2=B1, IF(A2=A1+1, E1+1, 1), 1)</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0 z-10 backdrop-blur">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">Row</th>
                <th className="py-2.5 px-4 w-28">Tanggal (Kolom A)</th>
                <th className="py-2.5 px-4 w-28">ID Siswa (Kolom B)</th>
                <th className="py-2.5 px-4">Pertanyaan (Kolom C)</th>
                <th className="py-2.5 px-4">Jawaban (Kolom D)</th>
                <th className="py-2.5 px-4 w-32 text-center text-amber-300">
                  Streak Harian (Kolom E)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {checkins.map((rec, idx) => (
                <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-center font-mono text-slate-500">
                    {idx + 2}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-300">{rec.tanggal}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-emerald-400">
                    {rec.idSiswa}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 max-w-xs truncate" title={rec.pertanyaan}>
                    {rec.pertanyaan}
                  </td>
                  <td className="py-2.5 px-4 text-slate-200 max-w-xs truncate" title={rec.jawaban}>
                    {rec.jawaban}
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-400">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {rec.streakHarian}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
