import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { KeyRound, Mail, X, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff, ArrowRight, Check, Dot } from 'lucide-react';
import { validatePassword } from '../../utils/passwordValidator';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoFillLogin: (email: string, password: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onAutoFillLogin,
}) => {
  const { resetUserPassword } = useBooking();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; password: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const passwordVal = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanEmail) {
      setError('Silakan masukkan alamat email akun Anda.');
      return;
    }

    if (!passwordVal.isValid) {
      setError(passwordVal.errorMessage || 'Kata sandi baru tidak memenuhi syarat keamanan.');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetUserPassword(cleanEmail, cleanPassword);

      if (res.success) {
        setResult({
          email: cleanEmail,
          password: cleanPassword,
          message: res.message,
        });
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengatur ulang kata sandi. Pastikan email terdaftar di sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseToLogin = () => {
    if (result) {
      onAutoFillLogin(result.email, result.password);
      handleClose();
    }
  };

  const handleClose = () => {
    setError(null);
    setResult(null);
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
              <KeyRound size={22} className="shrink-0" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Bantuan Lupa Kata Sandi</h3>
              <p className="text-xs font-semibold text-slate-500">
                Atur ulang kata sandi akun pengelola Anda
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-semibold text-rose-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            /* Tampilan Sukses Reset */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <span>Kata Sandi Berhasil Diperbarui!</span>
                </div>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  {result.message}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Kredensial Akun Anda:
                </span>
                <div className="flex items-center justify-between text-sm bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="font-bold text-slate-900">{result.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium">Kata Sandi Baru:</span>
                  <span className="font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    {result.password}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseToLogin}
                className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-sm font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Gunakan untuk Masuk Sekarang</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* Form Permintaan Reset */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-blue-800 leading-relaxed font-medium">
                Masukkan alamat email akun pengelola yang terdaftar dan buat kata sandi baru untuk akun Anda.
              </div>

              {/* Field Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Alamat Email Akun <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Input Kata Sandi Baru */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter (Capslock & Angka)"
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Checklist Syarat Password */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 mt-2">
                  <span className="font-extrabold text-slate-600 block text-[11px] uppercase tracking-wider">
                    Syarat Keamanan Kata Sandi:
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    <div className={`flex items-center gap-1.5 font-semibold ${passwordVal.hasMinLength ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {passwordVal.hasMinLength ? <Check size={14} className="text-emerald-600 shrink-0" /> : <Dot size={14} className="text-slate-400 shrink-0" />}
                      <span>Minimal 8 karakter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-semibold ${passwordVal.hasUppercase ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {passwordVal.hasUppercase ? <Check size={14} className="text-emerald-600 shrink-0" /> : <Dot size={14} className="text-slate-400 shrink-0" />}
                      <span>Mengandung huruf besar / kapital (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-semibold ${passwordVal.hasNumber ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {passwordVal.hasNumber ? <Check size={14} className="text-emerald-600 shrink-0" /> : <Dot size={14} className="text-slate-400 shrink-0" />}
                      <span>Mengandung angka numerik (0-9)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !passwordVal.isValid}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Atur Ulang Sandi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
