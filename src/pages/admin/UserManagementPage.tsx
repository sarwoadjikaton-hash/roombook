import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Crown,
  ShieldCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  AlertTriangle,
  Building,
  Mail,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
  Dot,
} from 'lucide-react';
import { CustomDropdown } from '../../components/common/CustomDropdown';
import { validatePassword } from '../../utils/passwordValidator';

export const UserManagementPage: React.FC = () => {
  const { allUsers, adminUser, createUser, updateUser, deleteUser, resetUserPassword } = useBooking();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Reset Password Modal State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCustomPassword, setShowCustomPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [department, setDepartment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const isSuperAdmin = adminUser?.role === 'superadmin';

  // KPI
  const adminUsers = allUsers.filter((u) => u.role === 'admin' || u.role === 'superadmin');
  const superAdminCount = allUsers.filter((u) => u.role === 'superadmin').length;
  const regularAdminCount = allUsers.filter((u) => u.role === 'admin').length;

  const handleOpenCreateModal = () => {
    setName('');
    setEmail('');
    setCreatePassword('');
    setShowCreatePassword(false);
    setRole('admin');
    setDepartment('Biro Umum & Pengelola Fasilitas');
    setFormError(null);
    setFormSuccess(null);
    setEditingUserId(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department);
    setFormError(null);
    setFormSuccess(null);
    setEditingUserId(user.id);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !department.trim()) {
      setFormError('Semua kolom wajib diisi.');
      return;
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
      });
      setFormSuccess('Data admin berhasil diperbarui!');
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setEditingUserId(null);
      }, 700);
    } else {
      const passVal = validatePassword(createPassword);
      if (!passVal.isValid) {
        setFormError(passVal.errorMessage || 'Kata sandi tidak memenuhi syarat.');
        return;
      }

      const res = createUser({
        name: name.trim(),
        email: email.trim(),
        role,
        department: department.trim(),
        password: createPassword.trim(),
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        isActive: true,
      });

      if (!res.success) {
        setFormError(res.message);
        return;
      }

      setFormSuccess('Akun admin baru berhasil dibuat!');
      setTimeout(() => {
        setIsCreateModalOpen(false);
      }, 700);
    }
  };

  const handleDelete = (user: User) => {
    if (user.role === 'superadmin') {
      alert('Akun Super Admin tidak dapat dihapus.');
      return;
    }

    if (window.confirm(`Yakin ingin menghapus akun admin "${user.name}" (${user.email})?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleOpenResetModal = (user: User) => {
    setResetTargetUser(user);
    setCustomPassword('');
    setConfirmPassword('');
    setShowCustomPassword(false);
    setShowConfirmPassword(false);
    setResetError(null);
    setResetSuccess(null);
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetError(null);
    setResetSuccess(null);

    const passwordToSet = customPassword.trim();
    const passVal = validatePassword(passwordToSet);

    if (!passVal.isValid) {
      setResetError(passVal.errorMessage || 'Kata sandi baru tidak memenuhi syarat keamanan.');
      return;
    }

    if (passwordToSet !== confirmPassword.trim()) {
      setResetError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await resetUserPassword(resetTargetUser.email, passwordToSet);
      if (res.success) {
        setResetSuccess(`Kata sandi akun "${resetTargetUser.name}" berhasil diperbarui.`);
        setTimeout(() => {
          setResetTargetUser(null);
          setResetSuccess(null);
        }, 1800);
      } else {
        setResetError(res.message);
      }
    } catch (err: any) {
      setResetError(err.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface rounded-2xl border border-border p-7 sm:p-8 shadow-card">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Crown size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              Manajemen Akun Pengelola
            </h1>
          </div>
          <p className="text-base sm:text-base text-text-secondary">
            Pengaturan akun pengelola ruangan dan pemberian hak akses sistem peminjaman.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2.5 px-6 py-3.5 bg-primary hover:bg-primary-light text-white text-base font-black rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <UserPlus size={18} strokeWidth={2.5} />
            <span>Tambah Pengelola</span>
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Total Pengelola</span>
            <div className="text-3xl font-black text-text-primary">{adminUsers.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">Superadmin</span>
            <div className="text-3xl font-black text-amber-600">{superAdminCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Crown size={24} />
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-border shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">Pengelola Aktif</span>
            <div className="text-3xl font-black text-primary">{regularAdminCount}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Tabel Manajemen Admin */}
      <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-text-primary">
            Daftar Akun Pengelola
          </h2>
          <span className="text-sm font-bold text-text-muted">
            {adminUsers.length} Akun Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead className="bg-surface-secondary/70 text-sm font-bold text-text-secondary uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-4">Nama & Email</th>
                <th className="px-6 py-4">Hak Akses</th>
                <th className="px-6 py-4">Unit Kerja</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminUsers.map((user) => {
                const isUserSuperAdmin = user.role === 'superadmin';

                return (
                  <tr key={user.id} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-black shrink-0 ${
                            isUserSuperAdmin
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-text-primary">{user.name}</span>
                          <span className="text-sm text-text-muted">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isUserSuperAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full text-sm font-black">
                          <Crown size={12} />
                          <span>Super Administrator</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-black">
                          <ShieldCheck size={12} />
                          <span>Admin Pengelola</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-text-secondary font-medium">
                      {user.department}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Aktif</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenResetModal(user)}
                          className="p-2 text-text-secondary hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                          title="Reset Kata Sandi Akun"
                        >
                          <KeyRound size={16} />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                          title="Edit Akun"
                        >
                          <Edit2 size={16} />
                        </button>

                        {!isUserSuperAdmin && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-text-secondary hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Hapus Akun"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat / Edit Akun Admin */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-secondary/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary">
                    {editingUserId ? 'Edit Akun Administrator' : 'Buat Akun Administrator Baru'}
                  </h3>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Masukkan rincian identitas dan hak akses admin instansi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-status-danger flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-status-success flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">
                  Nama Lengkap & Gelar *
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-3 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Hendra Kusuma, S.Kom"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-border rounded-xl text-base bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">
                  Email Akun Instansi *
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hendra@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-border rounded-xl text-base bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <CustomDropdown
                  label="Role & Tingkat Hak Akses *"
                  options={[
                    {
                      value: 'admin',
                      label: 'Administrator Pengelola',
                      sublabel: '@admin-layanan',
                      badge: 'Approval & Ruangan',
                    },
                    {
                      value: 'superadmin',
                      label: 'Super Administrator',
                      sublabel: '@superadmin',
                      badge: 'Akses Penuh + User',
                      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
                    },
                  ]}
                  value={role}
                  onChange={(val) => setRole(val as UserRole)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-1.5">
                  Unit Kerja / Departemen *
                </label>
                <div className="relative">
                  <Building size={16} className="absolute left-3.5 top-3 text-text-muted" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Contoh: Bagian Umum & Rumah Tangga"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-border rounded-xl text-base bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                    required
                  />
                </div>
              </div>

              {!editingUserId && (
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-1.5">
                    Kata Sandi Akun *
                  </label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Min. 8 karakter (Capslock & Angka)"
                      className="w-full pl-3.5 pr-10 py-2.5 border border-border rounded-xl text-base bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 font-medium">
                    Syarat: Minimal 8 karakter, mengandung huruf besar (A-Z) dan angka numerik (0-9).
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm font-bold text-text-secondary hover:bg-surface-secondary transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-black rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Buat Akun Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Kata Sandi oleh Super Admin */}
      {resetTargetUser && (() => {
        const resetPassVal = validatePassword(customPassword);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-amber-500/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-primary">
                      Reset Kata Sandi
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Akun: <span className="font-bold text-text-primary">{resetTargetUser.name}</span> ({resetTargetUser.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setResetTargetUser(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleExecuteReset} className="p-6 space-y-4">
                {resetError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div className="p-3 bg-surface-secondary/70 rounded-xl border border-border text-xs text-text-secondary leading-relaxed">
                  Masukkan kata sandi baru untuk akun <span className="font-bold text-text-primary">{resetTargetUser.email}</span>.
                </div>

                {/* Input Custom Password */}
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-black text-text-primary uppercase tracking-wider">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCustomPassword ? 'text' : 'password'}
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Minimal 8 karakter (Capslock & Angka)"
                      className="w-full pl-3.5 pr-10 py-2.5 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomPassword(!showCustomPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showCustomPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Checklist Syarat Password */}
                  <div className="p-3 bg-surface-secondary/50 border border-border rounded-xl text-xs space-y-1.5 mt-2">
                    <span className="font-extrabold text-text-muted block text-[11px] uppercase tracking-wider">
                      Syarat Keamanan Kata Sandi:
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      <div className={`flex items-center gap-1.5 font-semibold ${resetPassVal.hasMinLength ? 'text-emerald-600' : 'text-text-muted'}`}>
                        {resetPassVal.hasMinLength ? <Check size={14} className="text-emerald-600 shrink-0" /> : <Dot size={14} className="text-text-muted shrink-0" />}
                        <span>Minimal 8 karakter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-semibold ${resetPassVal.hasUppercase ? 'text-emerald-600' : 'text-text-muted'}`}>
                        {resetPassVal.hasUppercase ? <Check size={14} className="text-emerald-600 shrink-0" /> : <Dot size={14} className="text-text-muted shrink-0" />}
                        <span>Mengandung huruf besar / kapital (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-semibold ${resetPassVal.hasNumber ? 'text-emerald-600' : 'text-text-muted'}`}>
                        {resetPassVal.hasNumber ? <Check size={14} className="text-emerald-600 shrink-0" /> : <Dot size={14} className="text-text-muted shrink-0" />}
                        <span>Mengandung angka numerik (0-9)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Konfirmasi Kata Sandi Baru */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-text-primary uppercase tracking-wider">
                    Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full pl-3.5 pr-10 py-2.5 border border-border rounded-xl text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-primary transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setResetTargetUser(null)}
                    className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetPassVal.isValid}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {resetLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        <span>Simpan Kata Sandi Baru</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
