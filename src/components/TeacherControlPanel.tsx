import React, { useState, useEffect } from 'react';
import { Student, XPRecord, StudentComputedStats, XPPreset } from '../types/gamification';
import {
  ShieldAlert,
  PlusCircle,
  MinusCircle,
  Users,
  UserPlus,
  Trash2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Edit2,
  Check,
  X,
  Settings,
  Plus,
} from 'lucide-react';
import {
  triggerLevelUpConfetti,
  triggerTeacherRewardSound,
  triggerPenaltySound,
} from '../utils/celebration';

const DEFAULT_REWARD_PRESETS: XPPreset[] = [
  { id: 'rew-1', label: 'Bertanya Kritis / Hipotesis', xp: 50, note: 'Bertanya kritis dan merumuskan hipotesis ilmiah', type: 'reward' },
  { id: 'rew-2', label: 'Praktikum Tertib & Aman', xp: 100, note: 'Pelaksanaan praktikum sangat tertib & mematuhi SOP', type: 'reward' },
  { id: 'rew-3', label: 'Laporan Praktikum Sempurna', xp: 250, note: 'Laporan praktikum komprehensif dan analisis data mendalam', type: 'reward' },
  { id: 'rew-4', label: 'Presentasi Hasil Riset', xp: 350, note: 'Presentasi ilmiah sangat lugas dan data teruji', type: 'reward' },
  { id: 'rew-5', label: 'Proyek Sains Inovatif', xp: 500, note: 'Karya inovasi sains/rekayasa teknologi terpilih', type: 'reward' },
];

const DEFAULT_PENALTY_PRESETS: XPPreset[] = [
  { id: 'pen-1', label: 'Terlambat Kumpul Tugas', xp: 20, note: 'Terlambat mengumpulkan tugas atau lembar kerja lab', type: 'penalty' },
  { id: 'pen-2', label: 'Tidak Pakai Jas Lab / APD', xp: 50, note: 'Pelanggaran SOP: Tidak mengenakan jas lab / kacamata', type: 'penalty' },
  { id: 'pen-3', label: 'Meja Praktikum Berantakan', xp: 75, note: 'Alat dan preparat lab tidak dibersihkan setelah selesai', type: 'penalty' },
  { id: 'pen-4', label: 'Merusak Alat Kaca / Tabung', xp: 100, note: 'Kelalaian penanganan peralatan kaca laboratorium', type: 'penalty' },
];

interface TeacherControlPanelProps {
  students: Student[];
  xpRecords: XPRecord[];
  stats: StudentComputedStats[];
  onAddXPRecord: (record: Omit<XPRecord, 'id'>) => void;
  onAddBatchXP: (records: Omit<XPRecord, 'id'>[]) => void;
  onDeleteXPRecord: (recordId: string) => void;
  onAddStudent: (name: string) => void;
  onAddBatchStudents: (names: string[]) => void;
  onDeleteStudent: (studentId: string) => void;
  onEditStudent: (studentId: string, newName: string) => void;
  onResetDemoData: () => void;
  preselectedStudentId?: string;
}

export const TeacherControlPanel: React.FC<TeacherControlPanelProps> = ({
  students,
  xpRecords,
  stats,
  onAddXPRecord,
  onAddBatchXP,
  onDeleteXPRecord,
  onAddStudent,
  onAddBatchStudents,
  onDeleteStudent,
  onEditStudent,
  onResetDemoData,
  preselectedStudentId,
}) => {
  // Input Form State
  const [targetMode, setTargetMode] = useState<'single' | 'batch'>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || (students[0]?.id ?? '')
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [pointType, setPointType] = useState<'reward' | 'penalty'>('reward');
  const [xpValue, setXpValue] = useState<number>(100);
  const [keterangan, setKeterangan] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Student modal / form state
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);

  // Batch paste students modal state
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState<boolean>(false);
  const [batchNamesInput, setBatchNamesInput] = useState<string>('');

  // Editing student state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentNameValue, setEditStudentNameValue] = useState<string>('');

  // Active sub-view in teacher panel
  const [activeTeacherSection, setActiveTeacherSection] = useState<'inputXP' | 'manageRoster'>('inputXP');

  // XP Log Search & Filter
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'reward' | 'penalty'>('all');

  // Custom Presets State (Persistent in localStorage)
  const [rewardPresets, setRewardPresets] = useState<XPPreset[]>(() => {
    try {
      const saved = localStorage.getItem('sainsquest_reward_presets_v2');
      return saved ? JSON.parse(saved) : DEFAULT_REWARD_PRESETS;
    } catch {
      return DEFAULT_REWARD_PRESETS;
    }
  });

  const [penaltyPresets, setPenaltyPresets] = useState<XPPreset[]>(() => {
    try {
      const saved = localStorage.getItem('sainsquest_penalty_presets_v2');
      return saved ? JSON.parse(saved) : DEFAULT_PENALTY_PRESETS;
    } catch {
      return DEFAULT_PENALTY_PRESETS;
    }
  });

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem('sainsquest_reward_presets_v2', JSON.stringify(rewardPresets));
  }, [rewardPresets]);

  useEffect(() => {
    localStorage.setItem('sainsquest_penalty_presets_v2', JSON.stringify(penaltyPresets));
  }, [penaltyPresets]);

  // Preset Editor Modal State
  const [presetModalOpen, setPresetModalOpen] = useState<boolean>(false);
  const [presetModalType, setPresetModalType] = useState<'reward' | 'penalty'>('reward');
  const [editingPresetItem, setEditingPresetItem] = useState<XPPreset | null>(null);
  const [presetFormLabel, setPresetFormLabel] = useState<string>('');
  const [presetFormXp, setPresetFormXp] = useState<number>(100);
  const [presetFormNote, setPresetFormNote] = useState<string>('');

  // Ensure selectedStudentId is always valid if students list changes
  useEffect(() => {
    if (preselectedStudentId && students.some((s) => s.id === preselectedStudentId)) {
      setSelectedStudentId(preselectedStudentId);
    } else if (students.length > 0 && !students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, preselectedStudentId]);

  const handleApplyPreset = (preset: XPPreset) => {
    setPointType(preset.type);
    setXpValue(Math.min(1000, Math.max(1, preset.xp)));
    setKeterangan(preset.note);
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleToggleStudentSelection = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) {
      alert('Tambahkan siswa terlebih dahulu sebelum menginput XP');
      return;
    }

    if (!keterangan.trim()) {
      alert('Silakan masukkan keterangan input XP');
      return;
    }

    // Strict validation: rentang 1 - 1000 poin XP
    const parsedXp = Number(xpValue);
    if (isNaN(parsedXp) || parsedXp < 1 || parsedXp > 1000) {
      alert('Nilai XP harus berada dalam rentang 1 - 1.000 poin XP');
      return;
    }

    const calculatedXP = pointType === 'penalty' ? -Math.abs(parsedXp) : Math.abs(parsedXp);

    if (targetMode === 'single') {
      if (!selectedStudentId) {
        alert('Pilih siswa target');
        return;
      }
      onAddXPRecord({
        tanggal: inputDate,
        idSiswa: selectedStudentId,
        nilaiXP: calculatedXP,
        keterangan: keterangan.trim(),
      });

      const s = students.find((item) => item.id === selectedStudentId);
      setSuccessToast(`Berhasil mencatat ${calculatedXP > 0 ? '+' : ''}${calculatedXP} XP untuk ${s?.name || selectedStudentId}!`);
      if (calculatedXP > 0) {
        triggerTeacherRewardSound();
        triggerLevelUpConfetti();
      } else {
        triggerPenaltySound();
      }
    } else {
      // Batch mode
      if (selectedStudentIds.length === 0) {
        alert('Pilih minimal 1 siswa untuk input batch');
        return;
      }
      const records = selectedStudentIds.map((sid) => ({
        tanggal: inputDate,
        idSiswa: sid,
        nilaiXP: calculatedXP,
        keterangan: keterangan.trim(),
      }));
      onAddBatchXP(records);
      setSuccessToast(`Berhasil mencatat ${calculatedXP > 0 ? '+' : ''}${calculatedXP} XP untuk ${selectedStudentIds.length} siswa!`);
      if (calculatedXP > 0) {
        triggerTeacherRewardSound();
        triggerLevelUpConfetti();
      } else {
        triggerPenaltySound();
      }
    }

    // Reset some form fields
    setKeterangan('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent(newStudentName.trim());
    setNewStudentName('');
    setIsAddingStudent(false);
    setSuccessToast('Siswa baru berhasil ditambahkan!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleBatchImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawLines = batchNamesInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rawLines.length === 0) {
      alert('Masukkan minimal 1 nama siswa');
      return;
    }

    onAddBatchStudents(rawLines);
    setBatchNamesInput('');
    setIsBatchImportModalOpen(false);
    setSuccessToast(`Berhasil menambahkan ${rawLines.length} siswa ke dalam kelas!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const startEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setEditStudentNameValue(s.name);
  };

  const saveEditStudent = (id: string) => {
    if (editStudentNameValue.trim()) {
      onEditStudent(id, editStudentNameValue.trim());
      setEditingStudentId(null);
      setSuccessToast('Nama siswa berhasil diperbarui!');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Preset Management Handlers
  const openPresetModal = (type: 'reward' | 'penalty', presetToEdit?: XPPreset) => {
    setPresetModalType(type);
    if (presetToEdit) {
      setEditingPresetItem(presetToEdit);
      setPresetFormLabel(presetToEdit.label);
      setPresetFormXp(presetToEdit.xp);
      setPresetFormNote(presetToEdit.note);
    } else {
      setEditingPresetItem(null);
      setPresetFormLabel('');
      setPresetFormXp(type === 'reward' ? 100 : 50);
      setPresetFormNote('');
    }
    setPresetModalOpen(true);
  };

  const handleSavePresetForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetFormLabel.trim() || !presetFormNote.trim()) {
      alert('Mohon isi nama preset dan keterangannya');
      return;
    }

    const cleanXp = Math.min(1000, Math.max(1, Number(presetFormXp) || 1));

    if (editingPresetItem) {
      // Edit existing
      const updatedItem: XPPreset = {
        ...editingPresetItem,
        label: presetFormLabel.trim(),
        xp: cleanXp,
        note: presetFormNote.trim(),
      };

      if (presetModalType === 'reward') {
        setRewardPresets((prev) => prev.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
      } else {
        setPenaltyPresets((prev) => prev.map((p) => (p.id === updatedItem.id ? updatedItem : p)));
      }
      setSuccessToast(`Preset "${updatedItem.label}" berhasil diperbarui!`);
    } else {
      // Add new preset
      const newItem: XPPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        label: presetFormLabel.trim(),
        xp: cleanXp,
        note: presetFormNote.trim(),
        type: presetModalType,
      };

      if (presetModalType === 'reward') {
        setRewardPresets((prev) => [...prev, newItem]);
      } else {
        setPenaltyPresets((prev) => [...prev, newItem]);
      }
      setSuccessToast(`Preset baru "${newItem.label}" berhasil ditambahkan!`);
    }

    // Reset form fields
    setEditingPresetItem(null);
    setPresetFormLabel('');
    setPresetFormNote('');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeletePreset = (id: string, type: 'reward' | 'penalty') => {
    if (window.confirm('Hapus preset ini?')) {
      if (type === 'reward') {
        setRewardPresets((prev) => prev.filter((p) => p.id !== id));
      } else {
        setPenaltyPresets((prev) => prev.filter((p) => p.id !== id));
      }
      if (editingPresetItem?.id === id) {
        setEditingPresetItem(null);
        setPresetFormLabel('');
        setPresetFormNote('');
      }
    }
  };

  const handleResetPresetsToDefault = (type: 'reward' | 'penalty') => {
    if (window.confirm(`Kembalikan daftar preset ${type === 'reward' ? 'Reward' : 'Penalti'} ke default awal?`)) {
      if (type === 'reward') {
        setRewardPresets(DEFAULT_REWARD_PRESETS);
      } else {
        setPenaltyPresets(DEFAULT_PENALTY_PRESETS);
      }
      setEditingPresetItem(null);
    }
  };

  // Filtered XP History
  const filteredHistory = xpRecords.filter((rec) => {
    const student = students.find((s) => s.id === rec.idSiswa);
    const matchesSearch =
      rec.idSiswa.toLowerCase().includes(historySearch.toLowerCase()) ||
      rec.keterangan.toLowerCase().includes(historySearch.toLowerCase()) ||
      (student?.name.toLowerCase().includes(historySearch.toLowerCase()) ?? false);

    const matchesType =
      historyFilter === 'all' ||
      (historyFilter === 'reward' && rec.nilaiXP > 0) ||
      (historyFilter === 'penalty' && rec.nilaiXP < 0);

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900/90 border border-emerald-600 text-emerald-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <span>KONTROL UTAMA GURU (KENDALI PENUH XP)</span>
            <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
              {students.length} Siswa Aktif
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Input Reward, Penalti & Roster Siswa</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Guru memegang kendali manual untuk menambah (Reward) atau mengurangi (Penalti) poin siswa di rentang <strong>1 – 1.000 XP</strong>.
            Semua input dicatat pada sheet <strong>'Riwayat XP'</strong> dan otomatis memperbarui leaderboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBatchImportModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            title="Tempel daftar nama siswa dari Excel / Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tempel Daftar Siswa (Batch)</span>
          </button>

          <button
            onClick={() => setIsAddingStudent(!isAddingStudent)}
            className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAddingStudent ? 'Batal' : '+ Tambah Siswa'}</span>
          </button>

          {/* Secure reset button requiring text confirmation to prevent accidental student data loss */}
          <button
            onClick={() => {
              if (students.length > 0) {
                const confirmation = window.prompt(
                  `PERINGATAN KESELAMATAN DATA:\nSaat ini terdapat ${students.length} data siswa terdaftar!\n\nJika Anda yakin ingin mengosongkan seluruh data siswa & riwayat XP, ketik kata "RESET":`
                );
                if (confirmation === 'RESET') {
                  onResetDemoData();
                }
              } else {
                if (window.confirm('Kosongkan semua data kelas?')) {
                  onResetDemoData();
                }
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
            title="Kosongkan Semua Data (Memerlukan Konfirmasi)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Roster Empty State Prompt */}
      {students.length === 0 && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-600/40 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Kelas Sains Siap Digunakan! Belum Ada Siswa Terdaftar</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Silakan masukkan daftar nama siswa Anda. Anda bisa menempel langsung seluruh daftar nama
              dari Google Sheets atau Microsoft Excel menggunakan tombol <strong>Tempel Daftar Siswa (Batch)</strong>.
            </p>
          </div>
          <button
            onClick={() => setIsBatchImportModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-md"
          >
            Tempel Daftar Nama Siswa Sekarang
          </button>
        </div>
      )}

      {/* Sub-view toggle (Input XP vs Kelola Roster) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTeacherSection('inputXP')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTeacherSection === 'inputXP'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Formulir Input XP</span>
        </button>

        <button
          onClick={() => setActiveTeacherSection('manageRoster')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTeacherSection === 'manageRoster'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kelola Roster Siswa ({students.length} Siswa Terdaftar)</span>
        </button>
      </div>

      {/* Add New Single Student Form Drawer */}
      {isAddingStudent && (
        <form
          onSubmit={handleCreateStudent}
          className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-lg space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan 1 Siswa Baru</span>
            </h3>
            <span className="text-xs text-slate-400">
              ID Otomatis: <strong className="font-mono text-emerald-300">SCI-{String(students.length + 1).padStart(3, '0')}</strong>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Contoh: Muhammad Al Fatih"
              className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              Simpan Siswa
            </button>
          </div>
        </form>
      )}

      {/* Batch Import Modal */}
      {isBatchImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Impor Cepat dari Spreadsheet
                </span>
                <h3 className="text-base font-bold text-white">Tempel Daftar Nama Siswa (Batch)</h3>
              </div>
              <button
                onClick={() => setIsBatchImportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBatchImportSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="text-xs text-slate-300 leading-relaxed">
                Salin kolom nama siswa dari file <strong>Excel</strong> atau <strong>Google Sheets</strong> Anda,
                lalu tempelkan di kotak bawah ini (satu nama per baris). Sistem akan otomatis menetapkan nomor ID
                seperti <code className="text-emerald-300 font-mono">SCI-001</code>, <code className="text-emerald-300 font-mono">SCI-002</code>, dst.
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Daftar Nama Siswa:
                </label>
                <textarea
                  value={batchNamesInput}
                  onChange={(e) => setBatchNamesInput(e.target.value)}
                  rows={8}
                  placeholder={`Ahmad Rizki Pratama\nSiti Nurhaliza\nBudi Santoso\nDewi Lestari`}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-sans placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {batchNamesInput.split('\n').filter((l) => l.trim().length > 0).length} siswa terdeteksi
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBatchImportModalOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl cursor-pointer"
                  >
                    Impor Semua Siswa
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 1: FORMULIR INPUT XP */}
      {activeTeacherSection === 'inputXP' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Formulir Input XP Guru</span>
                </h3>

                {/* Target mode switch */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetMode('single')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      targetMode === 'single'
                        ? 'bg-slate-900 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1 Siswa
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode('batch')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      targetMode === 'batch'
                        ? 'bg-slate-900 text-emerald-400 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Multi-Siswa / Kelas</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Student Selector */}
                {students.length === 0 ? (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 flex items-center justify-between">
                    <span>Belum ada siswa terdaftar.</span>
                    <button
                      type="button"
                      onClick={() => setIsBatchImportModalOpen(true)}
                      className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      + Tambah Siswa Sekarang
                    </button>
                  </div>
                ) : targetMode === 'single' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Pilih Siswa Target:
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-sans"
                    >
                      {students.map((st) => {
                        const stStat = stats.find((s) => s.id === st.id);
                        return (
                          <option key={st.id} value={st.id}>
                            {st.id} - {st.name} ({stStat?.totalXP ?? 0} XP, {stStat?.currentBadge ?? ''})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-400">
                        Pilih Siswa ({selectedStudentIds.length} terpilih):
                      </label>
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        {selectedStudentIds.length === students.length ? 'Batal Semua' : 'Pilih Semua Siswa'}
                      </button>
                    </div>
                    <div className="max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {students.map((st) => (
                        <label
                          key={st.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(st.id)}
                            onChange={() => handleToggleStudentSelection(st.id)}
                            className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                          />
                          <span className="truncate text-slate-300">
                            <span className="font-mono text-slate-500 mr-1">{st.id}</span>
                            {st.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reward vs Penalty Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPointType('reward')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      pointType === 'reward'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>REWARD (+) POIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPointType('penalty')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      pointType === 'penalty'
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4 text-rose-400" />
                    <span>PENALTI (-) POIN</span>
                  </button>
                </div>

                {/* Point Value & Date - FIX: min=1, max=1000, step=1 to allow any integer 1-1000 without 96/101 step validation errors! */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nilai XP {pointType === 'penalty' ? '(Pengurangan)' : '(Penambahan)'}:
                    </label>
                    <div className="relative">
                      <span
                        className={`absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-sm ${
                          pointType === 'penalty' ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {pointType === 'penalty' ? '-' : '+'}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        step="1"
                        value={xpValue}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (isNaN(val)) {
                            setXpValue(1);
                          } else {
                            setXpValue(Math.min(1000, Math.max(1, val)));
                          }
                        }}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-semibold focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Rentang diperbolehkan: 1 – 1.000 XP
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Tanggal Pencatatan:
                    </label>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={inputDate}
                        onChange={(e) => setInputDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Keterangan / Alasan (Dicatat ke Sheet Riwayat XP):
                  </label>
                  <textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Selesai eksperimen ekstraksi klorofil, kuis termodinamika sempurna..."
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={students.length === 0}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    students.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : pointType === 'reward'
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  {pointType === 'reward' ? (
                    <PlusCircle className="w-4 h-4" />
                  ) : (
                    <MinusCircle className="w-4 h-4" />
                  )}
                  <span>
                    Catat {pointType === 'reward' ? 'Reward' : 'Penalti'} (
                    {pointType === 'penalty' ? `-${xpValue}` : `+${xpValue}`} XP)
                  </span>
                </button>
              </form>
            </div>

            {/* Right Column: Editable Fast Preset Selector (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Reward Presets Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Preset Reward Cepat (Sains)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openPresetModal('reward')}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800/40 hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1"
                      title="Kelola, Edit, atau Tambah Preset Reward"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Edit Preset</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {rewardPresets.map((pr) => (
                    <div
                      key={pr.id}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-colors flex items-center justify-between group"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(pr)}
                        className="text-left flex-1 pr-2 cursor-pointer"
                        title="Klik untuk terapkan ke formulir input XP"
                      >
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                          {pr.label}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {pr.note}
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                          +{pr.xp} XP
                        </span>
                        <button
                          type="button"
                          onClick={() => openPresetModal('reward', pr)}
                          className="p-1 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit preset ini"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Penalty Presets Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Preset Penalti Disiplin / Lab</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openPresetModal('penalty')}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-950/60 border border-rose-800/40 hover:bg-rose-900 transition-colors cursor-pointer flex items-center gap-1"
                      title="Kelola, Edit, atau Tambah Preset Penalti"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Edit Preset</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {penaltyPresets.map((pr) => (
                    <div
                      key={pr.id}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/40 transition-colors flex items-center justify-between group"
                    >
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(pr)}
                        className="text-left flex-1 pr-2 cursor-pointer"
                        title="Klik untuk terapkan ke formulir input XP"
                      >
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-rose-300">
                          {pr.label}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {pr.note}
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded">
                          -{pr.xp} XP
                        </span>
                        <button
                          type="button"
                          onClick={() => openPresetModal('penalty', pr)}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit preset ini"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sheet 2: Riwayat XP Audit Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Sheet 2: Riwayat XP (Audit Log Guru)</span>
                  <span className="text-xs text-slate-500 font-mono font-normal">
                    ({filteredHistory.length} Baris Data)
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Semua penambahan (+) dan penalti (-) dicatat permanen dengan tanggal dan keterangan
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Filter Reward/Penalty */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                      historyFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setHistoryFilter('reward')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                      historyFilter === 'reward' ? 'bg-slate-900 text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    Reward (+)
                  </button>
                  <button
                    onClick={() => setHistoryFilter('penalty')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                      historyFilter === 'penalty' ? 'bg-slate-900 text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    Penalti (-)
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Cari ID/Keterangan..."
                    className="pl-7 pr-2.5 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none w-36 sm:w-44"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96">
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Belum ada catatan Riwayat XP. Input penambahan atau penalti pertama Anda menggunakan formulir di atas.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0 z-10 backdrop-blur">
                    <tr>
                      <th className="py-2.5 px-4 w-28">Tanggal (Kolom A)</th>
                      <th className="py-2.5 px-4 w-32">ID Siswa (Kolom B)</th>
                      <th className="py-2.5 px-4">Nama Siswa</th>
                      <th className="py-2.5 px-4 w-28 text-right">Nilai XP (Kolom C)</th>
                      <th className="py-2.5 px-4">Keterangan (Kolom D)</th>
                      <th className="py-2.5 px-4 w-16 text-center">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredHistory.map((rec) => {
                      const student = students.find((s) => s.id === rec.idSiswa);
                      const isPositive = rec.nilaiXP >= 0;
                      return (
                        <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-400">{rec.tanggal}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-300">
                            {rec.idSiswa}
                          </td>
                          <td className="py-2.5 px-4 text-slate-200">{student?.name || 'Siswa'}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                                isPositive
                                  ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/30'
                                  : 'text-rose-400 bg-rose-950/50 border border-rose-800/30'
                              }`}
                            >
                              {isPositive ? `+${rec.nilaiXP}` : rec.nilaiXP} XP
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300 leading-relaxed">
                            {rec.keterangan}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus catatan XP ini (${rec.idSiswa}: ${rec.nilaiXP} XP)?`)) {
                                  onDeleteXPRecord(rec.id);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded cursor-pointer"
                              title="Hapus baris ini dari Riwayat XP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: KELOLA ROSTER SISWA */}
      {activeTeacherSection === 'manageRoster' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Daftar Siswa Kelas Science ({students.length} Siswa Terdaftar)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola nama, periksa total XP, atau hapus siswa yang salah diinput.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBatchImportModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                + Tempel Daftar Siswa (Batch)
              </button>
              <button
                onClick={() => setIsAddingStudent(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                + Tambah 1 Siswa
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {students.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Belum Ada Siswa Terdaftar</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tambahkan siswa secara manual satu per satu atau gunakan fitur Tempel Daftar Siswa (Batch) untuk mengimpor dari spreadsheet.
                </p>
                <button
                  onClick={() => setIsBatchImportModalOpen(true)}
                  className="mt-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl cursor-pointer"
                >
                  Tempel Daftar Siswa (Batch)
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 w-28">ID Siswa</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4 text-right">Total XP</th>
                    <th className="py-3 px-4">Level & Badge</th>
                    <th className="py-3 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((st, idx) => {
                    const stStat = stats.find((s) => s.id === st.id);
                    const isEditing = editingStudentId === st.id;

                    return (
                      <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{st.id}</td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editStudentNameValue}
                                onChange={(e) => setEditStudentNameValue(e.target.value)}
                                className="px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-emerald-500"
                              />
                              <button
                                onClick={() => saveEditStudent(st.id)}
                                className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                title="Simpan Perubahan"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStudentId(null)}
                                className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                                title="Batal"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-200">{st.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {(stStat?.totalXP ?? 0).toLocaleString()} XP
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 font-medium">
                            {stStat?.currentBadge ?? 'Lab Recruit'}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1.5">
                            (Tier {stStat?.tier ?? 'Trainee'})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditStudent(st)}
                              className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                              title="Edit Nama Siswa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Hapus siswa ${st.name} (${st.id}) dari kelas? Catatan XP siswa ini juga akan dibersihkan.`
                                  )
                                ) {
                                  onDeleteStudent(st.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: KELOLA & EDIT PRESET REWARD & PENALTI */}
      {presetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Konfigurasi Preset Guru
                </span>
                <h3 className="text-base font-bold text-white">
                  Kelola & Edit Preset Cepat
                </h3>
              </div>
              <button
                onClick={() => setPresetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setPresetModalType('reward');
                    setEditingPresetItem(null);
                    setPresetFormLabel('');
                    setPresetFormXp(100);
                    setPresetFormNote('');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    presetModalType === 'reward'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preset Reward (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPresetModalType('penalty');
                    setEditingPresetItem(null);
                    setPresetFormLabel('');
                    setPresetFormXp(50);
                    setPresetFormNote('');
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    presetModalType === 'penalty'
                      ? 'bg-rose-950 text-rose-300 border border-rose-600/50 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Preset Penalti (-)</span>
                </button>
              </div>

              {/* Form Add / Edit Preset */}
              <form
                onSubmit={handleSavePresetForm}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {editingPresetItem ? (
                      <>
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit Preset: {editingPresetItem.label}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tambah Preset {presetModalType === 'reward' ? 'Reward' : 'Penalti'} Baru</span>
                      </>
                    )}
                  </h4>
                  {editingPresetItem && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPresetItem(null);
                        setPresetFormLabel('');
                        setPresetFormXp(presetModalType === 'reward' ? 100 : 50);
                        setPresetFormNote('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Nama / Judul Preset:
                    </label>
                    <input
                      type="text"
                      value={presetFormLabel}
                      onChange={(e) => setPresetFormLabel(e.target.value)}
                      placeholder="Contoh: Praktikum Sangat Disiplin"
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Poin XP (1 – 1.000):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={presetFormXp}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        setPresetFormXp(isNaN(v) ? 1 : Math.min(1000, Math.max(1, v)));
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Keterangan Otomatis (Dicatat ke Riwayat XP):
                  </label>
                  <input
                    type="text"
                    value={presetFormNote}
                    onChange={(e) => setPresetFormNote(e.target.value)}
                    placeholder="Contoh: Mematuhi seluruh SOP keselamatan laboratorium"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                  >
                    {editingPresetItem ? 'Simpan Perubahan' : '+ Tambahkan Preset'}
                  </button>
                </div>
              </form>

              {/* Current Presets List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>
                    Daftar Preset {presetModalType === 'reward' ? 'Reward' : 'Penalti'} Saat Ini:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleResetPresetsToDefault(presetModalType)}
                    className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    Reset ke Default Awal
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {(presetModalType === 'reward' ? rewardPresets : penaltyPresets).map((pr) => (
                    <div
                      key={pr.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs group"
                    >
                      <div className="pr-3 flex-1">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{pr.label}</span>
                          <span
                            className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                              presetModalType === 'reward'
                                ? 'text-emerald-400 bg-emerald-950/60'
                                : 'text-rose-400 bg-rose-950/60'
                            }`}
                          >
                            {presetModalType === 'reward' ? '+' : '-'}{pr.xp} XP
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {pr.note}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPresetItem(pr);
                            setPresetFormLabel(pr.label);
                            setPresetFormXp(pr.xp);
                            setPresetFormNote(pr.note);
                          }}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit preset ini"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(pr.id, presetModalType)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hapus preset ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPresetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
