import React from 'react';
import { Download, BookOpen, Sparkles, Shield, Award, FileSpreadsheet, LogOut, Lock, UserCheck, GraduationCap, ArrowLeft } from 'lucide-react';
import { AuthUser } from '../types/gamification';

export type ActiveTab = 'leaderboard' | 'teacher' | 'sheets' | 'studentDashboard';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: AuthUser | null;
  onTabChange: (tab: ActiveTab) => void;
  onExportExcel: () => void;
  onOpenFormulaGuide: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onTabChange,
  onExportExcel,
  onOpenFormulaGuide,
  onOpenChangePassword,
  onLogout,
  onBack,
}) => {
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';
  const defaultTab: ActiveTab = isStudent ? 'studentDashboard' : 'leaderboard';
  const canGoBack = activeTab !== defaultTab;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      onTabChange(defaultTab);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark & Back Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {canGoBack && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-bold border border-slate-700/80 transition-all cursor-pointer shadow-sm group"
                title="Kembali ke halaman utama (Leaderboard / Dashboard)"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Kembali</span>
              </button>
            )}

            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <button
              onClick={() => onTabChange(defaultTab)}
              className="text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  SainsQuest
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-emerald-300 border border-slate-700/60 hidden sm:inline">
                  {isTeacher ? 'Portal Guru' : 'Portal Siswa'}
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden lg:inline">
                Sistem Peringkat & Gamifikasi Sains
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Student Portal Dashboard */}
            {isStudent && (
              <button
                onClick={() => onTabChange('studentDashboard')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'studentDashboard'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Dashboard Saya</span>
              </button>
            )}

            {/* Leaderboard is visible to both teacher and student */}
            <button
              onClick={() => onTabChange('leaderboard')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'leaderboard'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            {/* Teacher Exclusive Controls */}
            {isTeacher && (
              <button
                onClick={() => onTabChange('teacher')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'teacher'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Kontrol Guru</span>
              </button>
            )}

            {isTeacher && (
              <button
                onClick={() => onTabChange('sheets')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'sheets'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Spreadsheet (4 Sheet)</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary actions & User Menu */}
          <div className="flex items-center gap-2">
            {isTeacher && (
              <>
                <button
                  onClick={onOpenFormulaGuide}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  title="Panduan Rumus Google Sheets"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rumus Sheets</span>
                </button>

                <button
                  onClick={onExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                  title="Download Excel Workbook (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download Excel</span>
                </button>
              </>
            )}

            {/* User Profile Pill */}
            {currentUser && (
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 ml-1">
                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {isTeacher ? 'Guru Pembina' : `Siswa (${currentUser.studentId || currentUser.username})`}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-1.5">
                  <button
                    onClick={onOpenChangePassword}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Ubah Kata Sandi"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Keluar (Logout)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800 gap-1 text-xs">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="px-2.5 py-1.5 rounded font-bold text-emerald-400 bg-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {isStudent && (
            <button
              onClick={() => onTabChange('studentDashboard')}
              className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
                activeTab === 'studentDashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              Dashboard Saya
            </button>
          )}

          <button
            onClick={() => onTabChange('leaderboard')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'leaderboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Leaderboard
          </button>

          {isTeacher && (
            <button
              onClick={() => onTabChange('teacher')}
              className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
                activeTab === 'teacher' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              Kontrol Guru
            </button>
          )}

          {isTeacher && (
            <button
              onClick={() => onTabChange('sheets')}
              className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
                activeTab === 'sheets' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
              }`}
            >
              Sheets
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
