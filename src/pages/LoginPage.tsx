import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff, AlertCircle, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { ForgotPasswordModal } from '../components/common/ForgotPasswordModal';

import { api } from '../services/api';

export const LoginPage: React.FC = () => {
  const { allUsers, loginAdmin } = useBooking();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Filter akun administrator & superadmin
  const adminProfiles = allUsers.filter((u) => u.role === 'admin' || u.role === 'superadmin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Silakan masukkan alamat email akun Anda.');
      return;
    }

    if (!cleanPassword) {
      setError('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Coba verifikasi langsung ke server backend dengan enkripsi hash bcrypt
      const res = await api.login(cleanEmail, cleanPassword);
      if (res && res.user) {
        loginAdmin(res.user);
        navigate('/admin/dashboard');
        return;
      }
    } catch (apiErr: any) {
      // Jika server mengembalikan error validasi kredensial (401/400)
      if (apiErr.message && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('NetworkError')) {
        setError(apiErr.message);
        setIsLoading(false);
        return;
      }

      // Fallback offline jika server backend tidak dapat dihubungi
      const matchedUser = adminProfiles.find((u) => u.email.toLowerCase() === cleanEmail);
      const isValidPassword = cleanPassword === 'admin123' || cleanPassword === 'password';

      if (!matchedUser) {
        setError('Akun dengan email tersebut tidak terdaftar atau belum memiliki hak akses Administrator.');
        setIsLoading(false);
        return;
      }

      if (!isValidPassword) {
        setError('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
        setIsLoading(false);
        return;
      }

      loginAdmin(matchedUser);
      navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Container Utama yang Luas & Proporsional */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex justify-center mb-2">
            <Logo size="xl" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Masuk Pengelola TU SEKJEN
          </h2>
          <p className="text-base sm:text-base text-slate-500 max-w-md mx-auto leading-relaxed">
            Masuk untuk mengelola jadwal, memproses persetujuan peminjaman, dan mengelola ruangan
          </p>
        </div>

        {/* Card Form Login Luas & Elegan */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-2xl shadow-slate-200/60 space-y-7 backdrop-blur-sm">
          {/* Alert Error jika salah password / email */}
          {error && (
            <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-2xl text-base text-rose-700 flex items-start gap-3.5 font-medium animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
              <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Field Email */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider">
                Email Pengelola <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="admin@gmail.com"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-4 border border-slate-300 rounded-2xl text-base bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium shadow-xs"
                  required
                />
              </div>
            </div>

            {/* Field Password dengan Logic Show/Hide */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wider">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                >
                  <KeyRound size={13} />
                  <span>Lupa kata sandi?</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-3.5 sm:py-4 border border-slate-300 rounded-2xl text-base bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all font-medium shadow-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-blue-600" />
                  ) : (
                    <Eye size={20} className="text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Submit Besar */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white text-base font-black rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-700/25 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.99] ${isLoading ? 'opacity-70 cursor-wait' : ''
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Masuk ke Panel Pengelola</span>
                </>
              )}
            </button>
          </form>

          {/* Navigasi Kembali ke Publik */}
          <div className="pt-5 border-t border-slate-200/80 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-base sm:text-base text-slate-500 hover:text-blue-700 font-bold transition-colors group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Lupa Kata Sandi */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onAutoFillLogin={(fillEmail, fillPassword) => {
          setEmail(fillEmail);
          setPassword(fillPassword);
          setError(null);
        }}
      />
    </div>
  );
};
