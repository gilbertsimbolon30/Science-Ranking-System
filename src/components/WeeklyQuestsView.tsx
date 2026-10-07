import React, { useState } from 'react';
import { WeeklyQuest, Student } from '../types/gamification';
import {
  Sparkles,
  Award,
  CheckCircle,
  Users,
  FlaskConical,
  Atom,
  Dna,
  Globe2,
  Calendar,
} from 'lucide-react';
import { triggerLevelUpConfetti, triggerTeacherRewardSound } from '../utils/celebration';

interface WeeklyQuestsViewProps {
  quests: WeeklyQuest[];
  students: Student[];
  onCompleteQuest: (questId: string, studentId: string) => void;
  onRevokeQuest: (questId: string, studentId: string) => void;
}

export const WeeklyQuestsView: React.FC<WeeklyQuestsViewProps> = ({
  quests,
  students,
  onCompleteQuest,
  onRevokeQuest,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedQuestForModal, setSelectedQuestForModal] = useState<WeeklyQuest | null>(null);

  const filteredQuests = quests.filter(
    (q) => activeCategory === 'all' || q.category === activeCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Biologi':
        return <Dna className="w-4 h-4 text-emerald-400" />;
      case 'Kimia':
        return <FlaskConical className="w-4 h-4 text-cyan-400" />;
      case 'Fisika':
        return <Atom className="w-4 h-4 text-purple-400" />;
      default:
        return <Globe2 className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleToggleCompletion = (quest: WeeklyQuest, studentId: string) => {
    const isCompleted = quest.completedStudentIds.includes(studentId);
    if (isCompleted) {
      if (window.confirm(`Batalkan penyelesaian Quest untuk siswa ini?`)) {
        onRevokeQuest(quest.id, studentId);
      }
    } else {
      onCompleteQuest(quest.id, studentId);
      triggerTeacherRewardSound();
      triggerLevelUpConfetti();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>WEEKLY SCIENCE QUESTS</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Eksperimen & Proyek Mingguan</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Aktivitas laboratorium dan investigasi ilmiah dengan bonus XP besar (+800 s/d +1800 XP).
            Siswa yang berhasil menyelesaikan quest akan langsung melonjak level dan badge-nya!
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          {['all', 'Biologi', 'Kimia', 'Fisika', 'Astronomi & Lingkungan'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuests.map((quest) => {
          const completionCount = quest.completedStudentIds.length;
          const percent = Math.round((completionCount / (students.length || 1)) * 100);

          return (
            <div
              key={quest.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 font-semibold text-slate-300">
                    {getCategoryIcon(quest.category)}
                    <span>{quest.category}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    +{quest.xpReward} XP
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-500 mb-1">
                  MINGGU KE-{quest.weekNumber}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {quest.title}
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  {quest.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Siswa Selesai:</span>
                  </span>
                  <span className="font-mono text-white font-bold">
                    {completionCount} / {students.length} ({percent}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <button
                  onClick={() => setSelectedQuestForModal(quest)}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kelola Penerima Quest Siswa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quest Completion Management Modal */}
      {selectedQuestForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Kelola Capaian Quest Mingguan
                </span>
                <h3 className="text-base font-bold text-white">{selectedQuestForModal.title}</h3>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  Hadiah: +{selectedQuestForModal.xpReward} XP per siswa
                </span>
              </div>
              <button
                onClick={() => setSelectedQuestForModal(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2 flex-1">
              <p className="text-xs text-slate-400 mb-3">
                Klik tombol centang untuk memberi tanda selesai. Tindakan ini akan otomatis
                menambahkan baris baru ke <strong>Sheet 'Riwayat XP'</strong> dan memperbarui level siswa.
              </p>

              {students.map((st) => {
                const isCompleted = selectedQuestForModal.completedStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isCompleted
                        ? 'bg-emerald-950/40 border-emerald-600/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-slate-500 mr-2">{st.id}</span>
                      <span className="font-semibold">{st.name}</span>
                    </div>

                    <button
                      onClick={() => handleToggleCompletion(selectedQuestForModal, st.id)}
                      className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Selesai (+XP)' : 'Beri Tanda Selesai'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedQuestForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
