import React, { useState } from 'react';
import { AuthUser } from '../types/gamification';
import { api } from '../utils/api';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  FlaskConical,
  GraduationCap,
  AlertCircle,
  Loader2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMessage('Silakan masukkan ID Pengguna atau Nama Anda.');
      return;
    }

    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login(cleanUser, password);
      onLoginSuccess(response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login gagal. Periksa kembali ID dan Password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* App Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>SainsQuest</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              Sistem Sains
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Portal Gamifikasi & Peringkat Pembelajaran Kelas Science
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan ID Guru atau Nama Siswa terdaftar untuk mengakses dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                ID Pengguna / Nama Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: Guru atau Abigail J"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  autoComplete="username"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Kata Sandi (Password)
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Hints for Testing & Onboarding */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Petunjuk Akses Awal:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleQuickFill('Guru', 'Science')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 group-hover:text-emerald-300">Akun Guru</span>
                  <span className="text-[10px] text-slate-500">Klik</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">Guru</code></div>
                <div className="text-[11px] text-slate-400">Pass: <code className="text-white font-mono">Science</code></div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Dummy', '123')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-500/40 hover:border-purple-400 hover:bg-slate-800/50 text-left transition-all group cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-400 group-hover:text-purple-300">Dummy Siswa</span>
                  <span className="text-[10px] text-purple-400 font-semibold">Test</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">Dummy</code></div>
                <div className="text-[11px] text-slate-400">Pass: <code className="text-white font-mono">123</code></div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Abigail J', '123456')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 group-hover:text-cyan-300">Siswa Roster</span>
                  <span className="text-[10px] text-slate-500">Klik</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">ID: <code className="text-white font-mono">Abigail J</code></div>
                <div className="text-[11px] text-slate-400">Pass: <code className="text-white font-mono">123456</code></div>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              * Siswa yang pertama kali login akan langsung diminta mengganti kata sandi bawaan (123456) demi keamanan akun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
