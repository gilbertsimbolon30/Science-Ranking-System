import React from 'react';
import { Download, BookOpen, Sparkles, Shield, CalendarCheck, Award, FileSpreadsheet } from 'lucide-react';

export type ActiveTab = 'leaderboard' | 'teacher' | 'checkin' | 'quests' | 'sheets';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onExportExcel: () => void;
  onOpenFormulaGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onExportExcel,
  onOpenFormulaGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <button
              onClick={() => onTabChange('leaderboard')}
              className="text-left group cursor-pointer"
            >
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                SainsQuest
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline ml-2 border-l border-slate-700 pl-2">
                Gamifikasi Kelas Science
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1">
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

            <button
              onClick={() => onTabChange('checkin')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'checkin'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Check-in Siswa</span>
            </button>

            <button
              onClick={() => onTabChange('quests')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'quests'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Weekly Quests</span>
            </button>

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
          </nav>

          {/* Zone 3: Primary actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFormulaGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Panduan Rumus Google Sheets"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Panduan Rumus</span>
            </button>

            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              title="Download Excel Workbook (.xlsx) dengan rumus & 4 Sheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800 gap-1 text-xs">
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'leaderboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => onTabChange('teacher')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'teacher' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Kontrol Guru
          </button>
          <button
            onClick={() => onTabChange('checkin')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'checkin' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Check-in
          </button>
          <button
            onClick={() => onTabChange('quests')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'quests' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => onTabChange('sheets')}
            className={`px-2.5 py-1.5 rounded font-medium whitespace-nowrap ${
              activeTab === 'sheets' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
            }`}
          >
            4 Sheet
          </button>
        </div>
      </div>
    </header>
  );
};
