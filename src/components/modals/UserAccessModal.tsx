import React, { useState } from 'react';
import { X, UserPlus, Trash2, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { AppUser } from '../../types/inventory';

interface UserAccessModalProps {
  users: AppUser[];
  onClose: () => void;
  onSaveUser: (user: Partial<AppUser>) => void;
  onDeleteUser: (userId: string) => void;
  currentUserEmail?: string;
}

export const UserAccessModal: React.FC<UserAccessModalProps> = ({
  users,
  onClose,
  onSaveUser,
  onDeleteUser,
  currentUserEmail
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Staff'>('Staff');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    onSaveUser({
      email: newEmail.trim().toLowerCase(),
      nama: newNama.trim(),
      role: newRole,
      status: 'Aktif'
    });

    setNewEmail('');
    setNewNama('');
    setNewRole('Staff');
  };

  const activeAdmins = users.filter(u => u.role === 'Admin' && u.status === 'Aktif');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Kelola Hak Akses Pengguna</h3>
              <p className="text-xs text-slate-400">Atur akun Google yang diizinkan mengakses Equipment Hub.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Add New User Form */}
          <form onSubmit={handleAdd} className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#E30000]" />
              <span>Tambah Pengguna Baru</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@gmail.com *"
                className="px-3 py-1.5 rounded-lg text-xs border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
              <input
                type="text"
                value={newNama}
                onChange={e => setNewNama(e.target.value)}
                placeholder="Nama Pengguna"
                className="px-3 py-1.5 rounded-lg text-xs border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
              <div className="flex gap-1.5">
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#E30000] hover:bg-[#DC2626] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>
          </form>

          {/* User List */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daftar Akun Terdaftar ({users.length})
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800">
              {users.map(u => {
                const isOnlyAdmin = u.role === 'Admin' && u.status === 'Aktif' && activeAdmins.length <= 1;

                return (
                  <div key={u.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {u.email}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        {u.nama || 'Tanpa Nama'} {u.createdAt ? `• Dibuat ${u.createdAt}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={isOnlyAdmin}
                        onChange={e => onSaveUser({ ...u, role: e.target.value as any })}
                        className="px-2 py-1 rounded-md text-xs font-semibold border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700"
                      >
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                      </select>

                      <select
                        value={u.status}
                        disabled={isOnlyAdmin}
                        onChange={e => onSaveUser({ ...u, status: e.target.value as any })}
                        className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Nonaktif">Nonaktif</option>
                      </select>

                      {!isOnlyAdmin && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Hapus Akses"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-[#070D19]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
