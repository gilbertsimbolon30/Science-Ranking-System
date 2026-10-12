import React, { useState } from 'react';
import { api } from '../utils/api';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck, X, ArrowLeft } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  isForced?: boolean;
  userName: string;
  onClose: () => void;
  onPasswordChanged: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  isForced = false,
  userName,
  onClose,
  onPasswordChanged,
}) => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isForced && !currentPassword) {
      setError('Masukkan kata sandi lama Anda.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!isForced && currentPassword === newPassword) {
      setError('Kata sandi baru tidak boleh sama dengan kata sandi lama.');
      return;
    }

    setIsLoading(true);

    try {
      await api.changePassword(isForced ? '' : currentPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onPasswordChanged();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Gagal mengganti kata sandi. Periksa password saat ini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        {/* Back / Close button */}
        {isForced ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Batal & Kembali ke Halaman Login"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kembali ke Login</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4 pr-32 sm:pr-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isForced ? 'Wajib Buat Kata Sandi Baru' : 'Ubah Kata Sandi'}
            </h3>
            <p className="text-xs text-slate-400">Akun: <strong className="text-slate-200">{userName}</strong></p>
          </div>
        </div>

        {isForced && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 leading-relaxed">
            Demi keamanan data dan privasi laboratorium, Anda wajib mengganti kata sandi bawaan (default) saat pertama kali masuk sebelum dapat menggunakan fitur SainsQuest.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-white">Kata Sandi Berhasil Diperbarui!</h4>
            <p className="text-xs text-slate-400 mt-1">Mengalihkan ke dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isForced && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi Baru (Minimal 6 Karakter)
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Buat kata sandi baru"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPass}
                  onChange={(e) => setShowPass(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                />
                <span>Perlihatkan kata sandi</span>
              </label>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>{isForced ? 'Batal & Kembali ke Login' : 'Batal'}</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Simpan Kata Sandi Baru</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
