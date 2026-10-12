import React, { useState, useEffect } from 'react';
import {
  Student,
  XPRecord,
  StudentComputedStats,
  XPPreset,
  PrivilegeRecord,
  ActivityLog,
  MasterLevel,
} from '../types/gamification';
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
  KeyRound,
  Shield,
  Gift,
  Award,
  History,
  FileText,
  UserCheck,
  UserX,
  Lock,
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
  privileges: PrivilegeRecord[];
  activityLogs: ActivityLog[];
  levels: MasterLevel[];
  onAddXPRecord: (record: Omit<XPRecord, 'id'>) => Promise<void> | void;
  onAddBatchXP: (records: Omit<XPRecord, 'id'>[]) => Promise<void> | void;
  onUpdateXPRecord: (id: string, updates: { tanggal?: string; nilaiXP?: number; keterangan?: string }) => Promise<void> | void;
  onDeleteXPRecord: (recordId: string) => Promise<void> | void;
  onAddStudent: (name: string, customUsername?: string) => Promise<void> | void;
  onAddBatchStudents: (names: string[]) => Promise<void> | void;
  onDeleteStudent: (studentId: string) => Promise<void> | void;
  onEditStudent: (studentId: string, newName: string, newUsername?: string) => Promise<void> | void;
  onResetStudentPassword: (studentId: string) => Promise<void> | void;
  onToggleStudentActive: (studentId: string) => Promise<void> | void;
  onAwardPrivilege: (payload: { studentId: string; perkTitle: string; tier?: string; notes?: string }) => Promise<void> | void;
  onMarkPrivilegeUsed: (id: string, notes?: string) => Promise<void> | void;
  onRevokePrivilege: (id: string, reason?: string) => Promise<void> | void;
  onUpdateLevels: (levels: MasterLevel[]) => Promise<void> | void;
  onResetDemoData: () => void;
  onGoBack?: () => void;
  preselectedStudentId?: string;
}

export const TeacherControlPanel: React.FC<TeacherControlPanelProps> = ({
  students,
  xpRecords,
  stats,
  privileges,
  activityLogs,
  levels,
  onAddXPRecord,
  onAddBatchXP,
  onUpdateXPRecord,
  onDeleteXPRecord,
  onAddStudent,
  onAddBatchStudents,
  onDeleteStudent,
  onEditStudent,
  onResetStudentPassword,
  onToggleStudentActive,
  onAwardPrivilege,
  onMarkPrivilegeUsed,
  onRevokePrivilege,
  onUpdateLevels,
  onResetDemoData,
  onGoBack,
  preselectedStudentId,
}) => {
  // Navigation Section in Teacher Panel
  const [activeSection, setActiveSection] = useState<'inputXP' | 'manageRoster' | 'privileges' | 'levels' | 'history' | 'auditLogs'>('inputXP');

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
    return new Date().toISOString().split('T')[0];
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Student modal / form state
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentUsername, setNewStudentUsername] = useState<string>('');
  const [isAddingStudent, setIsAddingStudent] = useState<boolean>(false);

  // Batch paste students modal state
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState<boolean>(false);
  const [batchNamesInput, setBatchNamesInput] = useState<string>('');

  // Editing student state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentNameValue, setEditStudentNameValue] = useState<string>('');
  const [editStudentUsernameValue, setEditStudentUsernameValue] = useState<string>('');

  // XP Log Search & Filter & Correction
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'reward' | 'penalty'>('all');
  const [editingXPRecord, setEditingXPRecord] = useState<XPRecord | null>(null);
  const [editXpValue, setEditXpValue] = useState<number>(100);
  const [editXpDate, setEditXpDate] = useState<string>('');
  const [editXpNote, setEditXpNote] = useState<string>('');

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

  // Privilege awarding modal state
  const [awardModalOpen, setAwardModalOpen] = useState<boolean>(false);
  const [awardStudentId, setAwardStudentId] = useState<string>(students[0]?.id || '');
  const [awardPerkTitle, setAwardPerkTitle] = useState<string>('Boleh Memilih Teman Kelompok Praktikum');
  const [awardTier, setAwardTier] = useState<string>('Researcher');
  const [awardNotes, setAwardNotes] = useState<string>('');

  // Ranks configuration state
  const [editableLevels, setEditableLevels] = useState<MasterLevel[]>(levels);
  useEffect(() => {
    setEditableLevels(levels);
  }, [levels]);

  // Ensure selectedStudentId is valid
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

  // Submit XP Record (Strict validation: 1 to 1000)
  const handleSubmitXP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) {
      alert('Tambahkan siswa terlebih dahulu sebelum menginput XP');
      return;
    }

    if (!keterangan.trim()) {
      alert('Silakan masukkan keterangan input XP');
      return;
    }

    // STRICT VALIDATION: rentang 1 - 1000 poin XP saja
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
      await onAddXPRecord({
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
      await onAddBatchXP(records);
      setSuccessToast(`Berhasil mencatat ${calculatedXP > 0 ? '+' : ''}${calculatedXP} XP untuk ${selectedStudentIds.length} siswa!`);
      if (calculatedXP > 0) {
        triggerTeacherRewardSound();
        triggerLevelUpConfetti();
      } else {
        triggerPenaltySound();
      }
    }

    setKeterangan('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    await onAddStudent(newStudentName.trim(), newStudentUsername.trim() || undefined);
    setNewStudentName('');
    setNewStudentUsername('');
    setIsAddingStudent(false);
    setSuccessToast('Siswa baru berhasil didaftarkan dengan kata sandi awal: 123456');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleBatchImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLines = batchNamesInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rawLines.length === 0) {
      alert('Masukkan minimal 1 nama siswa');
      return;
    }

    await onAddBatchStudents(rawLines);
    setBatchNamesInput('');
    setIsBatchImportModalOpen(false);
    setSuccessToast(`Berhasil menambahkan ${rawLines.length} siswa ke dalam kelas!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const startEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setEditStudentNameValue(s.name);
    setEditStudentUsernameValue(s.username || s.name);
  };

  const saveEditStudent = async (id: string) => {
    if (editStudentNameValue.trim()) {
      await onEditStudent(id, editStudentNameValue.trim(), editStudentUsernameValue.trim() || undefined);
      setEditingStudentId(null);
      setSuccessToast('Data siswa berhasil diperbarui!');
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
    }
  };

  // Correction for XP Record
  const startEditXPRecord = (rec: XPRecord) => {
    setEditingXPRecord(rec);
    setEditXpValue(Math.abs(rec.nilaiXP));
    setEditXpDate(rec.tanggal);
    setEditXpNote(rec.keterangan);
  };

  const saveEditXPRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingXPRecord) return;

    const cleanVal = Number(editXpValue);
    if (isNaN(cleanVal) || cleanVal < 1 || cleanVal > 1000) {
      alert('Nilai XP harus berada dalam rentang 1 - 1.000 XP');
      return;
    }

    const isNegative = editingXPRecord.nilaiXP < 0;
    const finalVal = isNegative ? -Math.abs(cleanVal) : Math.abs(cleanVal);

    await onUpdateXPRecord(editingXPRecord.id, {
      tanggal: editXpDate,
      nilaiXP: finalVal,
      keterangan: editXpNote.trim(),
    });

    setEditingXPRecord(null);
    setSuccessToast('Catatan XP berhasil dikoreksi!');
    setTimeout(() => setSuccessToast(null), 3000);
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900/90 border border-emerald-600 text-emerald-100 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold backdrop-blur animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Back / Exit Button Bar */}
      {onGoBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer group shadow-sm"
          >
            <span className="text-emerald-400 group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Kembali ke Leaderboard</span>
          </button>
          <span className="text-xs text-slate-500">Panel Guru</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldAlert className="w-4 h-4" />
            <span>KONTROL UTAMA GURU (KENDALI PENUH XP & AKUN)</span>
            <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
              {students.length} Siswa Terdaftar
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Dashboard Administratif Kelas Science</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Guru memegang kendali manual untuk menambah (Reward) atau mengurangi (Penalti) poin siswa di rentang <strong>1 – 1.000 XP</strong>,
            mengelola akun siswa, reset kata sandi, kupon hak istimewa, dan memantau audit aktivitas.
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

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSection('inputXP')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSection === 'inputXP'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Formulir Input XP</span>
        </button>

        <button
          onClick={() => setActiveSection('manageRoster')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSection === 'manageRoster'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Kelola Akun Siswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('privileges')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSection === 'privileges'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-amber-400" />
          <span>Kupon Hak Istimewa ({privileges.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('levels')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSection === 'levels'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>Tingkatan Level & Perk ({levels.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('history')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSection === 'history'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>Koreksi Riwayat XP ({xpRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('auditLogs')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSection === 'auditLogs'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Log Audit ({activityLogs.length})</span>
        </button>
      </div>

      {/* Add Single Student Drawer */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Nama Lengkap Siswa"
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
            <input
              type="text"
              value={newStudentUsername}
              onChange={(e) => setNewStudentUsername(e.target.value)}
              placeholder="Username Login (Opsional, bawaan: Nama Siswa)"
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingStudent(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer"
            >
              Simpan & Buat Akun Siswa
            </button>
          </div>
        </form>
      )}

      {/* SECTION 1: INPUT XP (Strict 1-1000 + Editable Presets) */}
      {activeSection === 'inputXP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Input XP (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
              <span>Formulir Pencatatan XP Manual</span>
              <span className="text-[11px] font-normal text-slate-400">
                Mode: {targetMode === 'single' ? 'Satu Siswa' : 'Banyak Siswa Sekaligus'}
              </span>
            </h3>

            <form onSubmit={handleSubmitXP} className="space-y-4">
              {/* Single vs Batch Mode Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTargetMode('single')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                    targetMode === 'single'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Satu Siswa (Spesifik)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('batch')}
                  className={`py-1.5 px-3 rounded-lg font-semibold transition-colors cursor-pointer ${
                    targetMode === 'batch'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Input Batch ({selectedStudentIds.length} Siswa Terpilih)
                </button>
              </div>

              {/* Student Selector */}
              {targetMode === 'single' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Pilih Siswa Target:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-medium"
                    required
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.id} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pilih Siswa yang Menerima Poin:</span>
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-emerald-400 hover:underline cursor-pointer font-medium"
                    >
                      {selectedStudentIds.length === students.length ? 'Batal Pilih Semua' : 'Pilih Semua Siswa'}
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 grid grid-cols-2 gap-1.5 text-xs">
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

              {/* Point Value & Date - Strict Range 1 - 1000 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-400">
                      Nilai XP {pointType === 'penalty' ? '(Pengurangan)' : '(Penambahan)'}:
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">1 – 1.000 XP</span>
                  </div>
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
                      min={1}
                      max={1000}
                      step={1}
                      value={xpValue}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
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
                  {/* Quick XP Chip Buttons */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {[10, 25, 50, 100, 250, 500, 1000].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setXpValue(quick)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          xpValue === quick
                            ? 'bg-slate-700 text-white border-slate-500 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {quick}
                      </button>
                    ))}
                  </div>
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
                  placeholder="Contoh: Bertanya kritis tentang sintesis protein, menyelesaikan tugas tepat waktu..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  required
                />
              </div>

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
                {pointType === 'reward' ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                <span>
                  Catat {pointType === 'reward' ? 'Reward' : 'Penalti'} (
                  {pointType === 'penalty' ? `-${xpValue}` : `+${xpValue}`} XP)
                </span>
              </button>
            </form>
          </div>

          {/* Preset Selector & Editor (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Reward Presets Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Preset Reward Cepat</span>
                </div>
                <button
                  type="button"
                  onClick={() => openPresetModal('reward')}
                  className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  <span>Kelola</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {rewardPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <span className="truncate text-slate-300 group-hover:text-white mr-2">
                      {preset.label}
                    </span>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">
                      +{preset.xp} XP
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Penalty Presets Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>Preset Penalti Cepat</span>
                </div>
                <button
                  type="button"
                  onClick={() => openPresetModal('penalty')}
                  className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  <span>Kelola</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {penaltyPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-rose-500/50 hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <span className="truncate text-slate-300 group-hover:text-white mr-2">
                      {preset.label}
                    </span>
                    <span className="font-mono font-bold text-rose-400 shrink-0">
                      -{preset.xp} XP
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ROSTER & ACCOUNT MANAGEMENT */}
      {activeSection === 'manageRoster' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Manajemen Akun Siswa ({students.length} Siswa Terdaftar)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola kredensial siswa, reset kata sandi ke 123456, serta aktifkan/nonaktifkan akun siswa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBatchImportModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                + Tempel Batch
              </button>
              <button
                onClick={() => setIsAddingStudent(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                + Tambah Siswa
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-24">ID Siswa</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Username Login</th>
                  <th className="py-3 px-4 text-center">Status Akun</th>
                  <th className="py-3 px-4 text-right">Total XP</th>
                  <th className="py-3 px-4 text-center w-40">Aksi & Keamanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {students.map((st, idx) => {
                  const stStat = stats.find((s) => s.id === st.id);
                  const isEditing = editingStudentId === st.id;
                  const isActive = st.isActive !== false;

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{st.id}</td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editStudentNameValue}
                            onChange={(e) => setEditStudentNameValue(e.target.value)}
                            className="px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-emerald-500"
                          />
                        ) : (
                          <span className="font-semibold text-slate-200">{st.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editStudentUsernameValue}
                            onChange={(e) => setEditStudentUsernameValue(e.target.value)}
                            className="px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-emerald-500"
                          />
                        ) : (
                          st.username || st.name
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {(stStat?.totalXP ?? 0).toLocaleString()} XP
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => saveEditStudent(st.id)}
                              className="p-1 text-emerald-400 hover:text-emerald-300"
                              title="Simpan"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-1 text-slate-400 hover:text-slate-200"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEditStudent(st)}
                              className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors"
                              title="Edit Profil"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm(`Reset kata sandi siswa ${st.name} ke "123456"?`)) {
                                  await onResetStudentPassword(st.id);
                                  setSuccessToast(`Password ${st.name} berhasil di-reset ke 123456`);
                                  setTimeout(() => setSuccessToast(null), 3000);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                              title="Reset Password ke '123456'"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={async () => {
                                await onToggleStudentActive(st.id);
                                setSuccessToast(`Status akun ${st.name} diperbarui.`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }}
                              className={`p-1 rounded transition-colors ${
                                isActive ? 'text-slate-400 hover:text-rose-400' : 'text-slate-400 hover:text-emerald-400'
                              }`}
                              title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={async () => {
                                if (window.confirm(`Hapus siswa ${st.name} (${st.id}) dari kelas? Catatan XP siswa ini juga akan dibersihkan.`)) {
                                  await onDeleteStudent(st.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: PRIVILEGES & REWARDS */}
      {activeSection === 'privileges' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span>Kupon & Hak Istimewa Siswa ({privileges.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Berikan hak istimewa khusus (bebas piket, hint card kuis, pilih teman praktikum), tandai saat digunakan, atau cabut jika melanggar SOP.
              </p>
            </div>

            <button
              onClick={() => setAwardModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Berikan Hak Istimewa</span>
            </button>
          </div>

          <div className="p-5">
            {privileges.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <Gift className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p>Belum ada kupon reward atau hak istimewa yang diberikan.</p>
                <p className="text-slate-500 mt-1">Klik "+ Berikan Hak Istimewa" untuk memberikan reward khusus kepada siswa.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {privileges.map((p) => {
                  const student = students.find((s) => s.id === p.studentId);
                  const isAvail = p.status === 'available';
                  const isUsed = p.status === 'used';
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{p.perkTitle}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isAvail
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isUsed
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isAvail ? 'Siap Digunakan' : isUsed ? 'Telah Digunakan' : 'Dicabut'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                          <span>Siswa: <strong className="text-white">{student?.name || p.studentId}</strong> ({p.studentId})</span>
                          <span>•</span>
                          <span>Tier: {p.tier}</span>
                        </div>
                        {p.notes && <p className="text-xs text-slate-400 mt-1 italic">{p.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isAvail && (
                          <button
                            onClick={async () => {
                              const note = window.prompt('Catatan penggunaan (opsional):') || undefined;
                              await onMarkPrivilegeUsed(p.id, note);
                              setSuccessToast('Hak istimewa berhasil ditandai sebagai TELAH DIGUNAKAN.');
                              setTimeout(() => setSuccessToast(null), 3000);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-lg cursor-pointer"
                          >
                            Tandai Digunakan
                          </button>
                        )}
                        {isAvail && (
                          <button
                            onClick={async () => {
                              const reason = window.prompt('Alasan pencabutan (opsional):') || undefined;
                              await onRevokePrivilege(p.id, reason);
                              setSuccessToast('Hak istimewa berhasil dicabut.');
                              setTimeout(() => setSuccessToast(null), 3000);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-lg cursor-pointer"
                          >
                            Cabut
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: CONFIGURE RANKS & LEVELS */}
      {activeSection === 'levels' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>Konfigurasi Tingkatan Level & Syarat Poin XP</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur nama badge, ambang batas XP minimal, dan hak istimewa (perk) per tingkat level.
              </p>
            </div>
            <button
              onClick={async () => {
                await onUpdateLevels(editableLevels);
                setSuccessToast('Konfigurasi tingkatan level berhasil disimpan!');
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              className="px-4 py-2 text-xs font-bold bg-purple-500 hover:bg-purple-400 text-white rounded-xl shadow cursor-pointer"
            >
              Simpan Konfigurasi Level
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Lvl</th>
                  <th className="py-3 px-4 w-32">XP Minimal</th>
                  <th className="py-3 px-4 w-48">Nama Badge</th>
                  <th className="py-3 px-4 w-36">Tier</th>
                  <th className="py-3 px-4">Deskripsi Hak Istimewa (Perk)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {editableLevels.map((lvl, index) => (
                  <tr key={index} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{lvl.levelNumber}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        value={lvl.xpMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 0;
                          setEditableLevels((prev) =>
                            prev.map((item, i) => (i === index ? { ...item, xpMin: val } : item))
                          );
                        }}
                        className="w-24 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white font-mono"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={lvl.badgeName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditableLevels((prev) =>
                            prev.map((item, i) => (i === index ? { ...item, badgeName: val } : item))
                          );
                        }}
                        className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-300">{lvl.tier}</span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={lvl.perkDescription}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditableLevels((prev) =>
                            prev.map((item, i) => (i === index ? { ...item, perkDescription: val } : item))
                          );
                        }}
                        className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: XP HISTORY & CORRECTION */}
      {activeSection === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                <span>Koreksi & Riwayat Transaksi Poin XP ({xpRecords.length} Catatan)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cari, koreksi salah input, atau hapus catatan XP siswa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari siswa atau keterangan..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white w-48 sm:w-64"
                />
              </div>

              <select
                value={historyFilter}
                onChange={(e: any) => setHistoryFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-300"
              >
                <option value="all">Semua</option>
                <option value="reward">Reward Saja</option>
                <option value="penalty">Penalti Saja</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-28">Tanggal</th>
                  <th className="py-3 px-4 w-28">ID Siswa</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center w-28">Nilai XP</th>
                  <th className="py-3 px-4">Keterangan / Alasan</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredHistory.map((rec) => {
                  const student = students.find((s) => s.id === rec.idSiswa);
                  const isPositive = rec.nilaiXP > 0;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono text-slate-400">{rec.tanggal}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">{rec.idSiswa}</td>
                      <td className="py-3 px-4 font-semibold text-white">{student?.name || rec.idSiswa}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? `+${rec.nilaiXP}` : rec.nilaiXP} XP
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{rec.keterangan}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEditXPRecord(rec)}
                            className="p-1 text-slate-400 hover:text-emerald-400"
                            title="Koreksi Nilai XP"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Hapus catatan XP ini?')) {
                                await onDeleteXPRecord(rec.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400"
                            title="Hapus Catatan XP"
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
          </div>
        </div>
      )}

      {/* SECTION 6: AUDIT ACTIVITY LOGS */}
      {activeSection === 'auditLogs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span>Log Aktivitas Administratif & Sistem ({activityLogs.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Catatan audit permanen seluruh operasi guru dan check-in siswa beserta stempel waktu (timestamp).
            </p>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-96 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.actorName}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">{log.details}</p>
                </div>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  {log.timestamp.replace('T', ' ').substring(0, 19)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CORRECTION OF XP RECORD */}
      {editingXPRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Koreksi Catatan XP Siswa</h3>
              <button
                type="button"
                onClick={() => setEditingXPRecord(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Tutup & Kembali"
              >
                <span>✕</span>
                <span>Tutup / Batal</span>
              </button>
            </div>
            <form onSubmit={saveEditXPRecord} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nilai XP Absolut (Rentang 1 - 1000):</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={editXpValue}
                  onChange={(e) => setEditXpValue(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tanggal:</label>
                <input
                  type="date"
                  value={editXpDate}
                  onChange={(e) => setEditXpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Keterangan:</label>
                <textarea
                  value={editXpNote}
                  onChange={(e) => setEditXpNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingXPRecord(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AWARD PRIVILEGE */}
      {awardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Berikan Hak Istimewa (Reward)</span>
              </h3>
              <button
                type="button"
                onClick={() => setAwardModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Tutup & Kembali"
              >
                <span>✕</span>
                <span>Tutup / Batal</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onAwardPrivilege({
                  studentId: awardStudentId,
                  perkTitle: awardPerkTitle.trim(),
                  tier: awardTier,
                  notes: awardNotes.trim() || undefined,
                });
                setAwardModalOpen(false);
                setSuccessToast('Hak istimewa berhasil diberikan!');
                setTimeout(() => setSuccessToast(null), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1">Siswa Penerima:</label>
                <select
                  value={awardStudentId}
                  onChange={(e) => setAwardStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.id} - {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nama Hak Istimewa (Perk):</label>
                <input
                  type="text"
                  value={awardPerkTitle}
                  onChange={(e) => setAwardPerkTitle(e.target.value)}
                  placeholder="Contoh: 1 Hint Card Saat Kuis, Bebas Piket Lab 1x"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tingkat Tier Acuan:</label>
                <select
                  value={awardTier}
                  onChange={(e) => setAwardTier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="Researcher">Tier 2: Researcher</option>
                  <option value="Scientist">Tier 3: Scientist</option>
                  <option value="Specialist">Tier 4: Specialist</option>
                  <option value="Master Scientist">Tier 5: Master Scientist</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catatan Tambahan (Opsional):</label>
                <input
                  type="text"
                  value={awardNotes}
                  onChange={(e) => setAwardNotes(e.target.value)}
                  placeholder="Contoh: Berlaku untuk kuis bab Termodinamika"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAwardModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl"
                >
                  Kirim Hak Istimewa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BATCH IMPORT */}
      {isBatchImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Tempel Daftar Siswa (Batch Import)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Salin kolom nama dari spreadsheet dan tempel di kotak ini. Akun siswa otomatis dibuat dengan password awal: 123456.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchImportModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Tutup & Kembali"
              >
                <span>✕</span>
                <span>Tutup / Batal</span>
              </button>
            </div>

            <form onSubmit={handleBatchImportSubmit} className="p-5 flex-1 flex flex-col gap-4">
              <textarea
                value={batchNamesInput}
                onChange={(e) => setBatchNamesInput(e.target.value)}
                rows={8}
                placeholder="Contoh:&#10;Abigail J&#10;Ahmad Fauzi&#10;Alisha Putri&#10;Arya Pratama"
                className="w-full flex-1 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchImportModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl"
                >
                  Impor & Buat Akun Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRESET EDITOR */}
      {presetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400">
                  Konfigurasi Preset Cepat Guru
                </span>
                <h3 className="text-base font-bold text-white">
                  Kelola & Edit Preset Cepat
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPresetModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Tutup & Kembali"
              >
                <span>✕</span>
                <span>Tutup / Kembali</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
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
                        <Edit2 className="w-3 h-3 text-cyan-400" />
                        <span>Edit Preset "{editingPresetItem.label}"</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 text-emerald-400" />
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
                        setPresetFormNote('');
                      }}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nama Tombol Preset:</label>
                  <input
                    type="text"
                    value={presetFormLabel}
                    onChange={(e) => setPresetFormLabel(e.target.value)}
                    placeholder="Contoh: Bertanya Kritis / Hipotesis"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nilai XP (1 – 1.000):</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={presetFormXp}
                      onChange={(e) => setPresetFormXp(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tipe Preset:</label>
                    <span className="inline-block px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-300 w-full font-semibold">
                      {presetModalType === 'reward' ? 'Reward (+)' : 'Penalti (-)'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Keterangan Default:</label>
                  <input
                    type="text"
                    value={presetFormNote}
                    onChange={(e) => setPresetFormNote(e.target.value)}
                    placeholder="Keterangan yang akan otomatis tertulis di log XP"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg ${
                    presetModalType === 'reward'
                      ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                      : 'bg-rose-500 text-white hover:bg-rose-400'
                  }`}
                >
                  {editingPresetItem ? 'Simpan Perubahan Preset' : '+ Simpan Preset Baru'}
                </button>
              </form>

              {/* Current List of Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Daftar Preset {presetModalType === 'reward' ? 'Reward' : 'Penalti'} Aktif:
                </span>
                {(presetModalType === 'reward' ? rewardPresets : penaltyPresets).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{p.label}</span>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {p.type === 'reward' ? `+${p.xp}` : `-${p.xp}`} XP
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.note}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPresetModal(presetModalType, p)}
                        className="p-1 text-slate-400 hover:text-emerald-400"
                        title="Edit Preset"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePreset(p.id, presetModalType)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Hapus Preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
