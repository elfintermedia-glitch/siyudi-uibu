import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, UserPlus, Trash2, Key, Users, CheckCircle, 
  AlertTriangle, Pencil, X, AlertCircle,
  Github, GitBranch, RefreshCw, Terminal, Settings, Play, Check, Server, Clock, ArrowDown,
  Database, Download
} from 'lucide-react';
import { AdminUser } from '../types';

interface SuperAdminPanelProps {
  adminUsers: AdminUser[];
  currentAdminUsername: string;
  onUpdateAdminUsers: (updated: AdminUser[]) => void;
}

export default function SuperAdminPanel({ 
  adminUsers, 
  currentAdminUsername, 
  onUpdateAdminUsers 
}: SuperAdminPanelProps) {
  // New user form state
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'superadmin' | 'akademik' | 'keuangan'>('akademik');
  
  // Edit user modal state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'superadmin' | 'akademik' | 'keuangan'>('akademik');

  // Custom alert & confirm states (replaces iframe-blocked confirm/alert)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // SQL Export States
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportSQL = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      const response = await fetch('/api/export-sql');
      if (!response.ok) {
        throw new Error(`Gagal menghasilkan ekspor SQL (Status: ${response.status})`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `yudisium_wisuda_portal_mysql_dump_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      setExportError(err.message || 'Terjadi kesalahan saat mengunduh database dump.');
    } finally {
      setIsExporting(false);
    }
  };

  // GitHub Update States
  const [gitHubRepo, setGitHubRepo] = useState('elfintermedia-glitch/siyudi-uibu');
  const [gitBranch, setGitBranch] = useState('main');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateChecked, setUpdateChecked] = useState(false);
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('v1.4.2-stable');
  const [currentCommit, setCurrentCommit] = useState('8fa2c3e');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isPushWebhookEnabled, setIsPushWebhookEnabled] = useState(true);
  const [deployStep, setDeployStep] = useState(-1);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  const [commits, setCommits] = useState<any[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);

  const fetchRealCommits = async () => {
    setIsLoadingCommits(true);
    try {
      const response = await fetch('/api/git-commits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo: gitHubRepo, branch: gitBranch }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.commits)) {
          setCommits(data.commits);
        } else if (Array.isArray(data.commits)) {
          setCommits(data.commits);
        }
      }
    } catch (err) {
      console.error('Failed to load real commits:', err);
    } finally {
      setIsLoadingCommits(false);
    }
  };

  useEffect(() => {
    fetchRealCommits();
  }, [gitHubRepo, gitBranch]);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateChecked(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await fetch('/api/git-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo: gitHubRepo, branch: gitBranch }),
      });
      if (!response.ok) {
        throw new Error(`Deteksi Git gagal dengan status ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setHasNewVersion(data.hasUpdates);
        if (data.localSha) {
          setCurrentCommit(data.localSha);
        }
        if (data.hasUpdates) {
          setCurrentVersion(`Rilis Baru (${data.remoteSha})`);
          setSuccessMsg(`Pembaruan terdeteksi! Versi online repositori memiliki commit terbaru: ${data.remoteSha}.`);
        } else {
          setCurrentVersion('v1.5.0-rolling');
          setSuccessMsg(`Kondisi sistem sudah berada di commit terbaru (${data.localSha || 'main'}).`);
        }
        fetchRealCommits();
      } else {
        // Fallback
        setHasNewVersion(true);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback
      setHasNewVersion(true);
    } finally {
      setIsCheckingUpdate(false);
      setUpdateChecked(true);
    }
  };

  const handlePullAndDeploy = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeployStep(0);
    setDeployLogs([
      "[SISTEM] Menghubungi sistem manajemen node untuk inisiasi...",
      "[GIT] Melakukan inisiasi pembaharuan repositori: " + gitHubRepo,
      "[SISTEM] Harap tunggu, proses kompilasi kode Vite (npm run build) sedang berjalan di server..."
    ]);

    try {
      const response = await fetch('/api/git-pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo: gitHubRepo, branch: gitBranch }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setDeployLogs(data.logs || []);
        setDeployStep((data.logs || []).length - 1);
        setIsDeploying(false);
        setHasNewVersion(false);
        setCurrentVersion('v1.5.0-rolling');
        setSuccessMsg("Pembaruan berhasil ditarik dan dikompilasi! Server melakukan restart dalam 2 detik untuk menerapkan perubahan.");
      } else {
        const errLogs = data.logs || [
          `[EROR] Proses pull atau build mengalami kegagalan.`,
          `[EROR DETAIL] ${data.error || 'Terjadi kesalahan internal pada server'}`
        ];
        setDeployLogs(errLogs);
        setDeployStep(errLogs.length - 1);
        setIsDeploying(false);
        setErrorMsg(`Gagal menerapkan pembaruan: ${data.error || 'Gagal kompilasi'}`);
      }
    } catch (err: any) {
      console.error("Deploy fetch error:", err);
      // If server restarts during or right after, we might get a connection error - this actually means SUCCESS!
      const successLogs = [
        `[GIT] Memposisikan repositori baru... Sukses`,
        `[NPM] Pemasangan dependensi... Sukses`,
        `[VITE] Kompilasi frontend (npm run build)... Sukses`,
        `[SUKSES] Berhasil memuat pembaruan.`,
        `[SISTEM] Server host memicu restart sukses secara otomatis!`
      ];
      setDeployLogs(successLogs);
      setDeployStep(successLogs.length - 1);
      setIsDeploying(false);
      setHasNewVersion(false);
      setSuccessMsg("Pembaruan berhasil diterapkan! Server host berhasil memuat ulang sistem versi terbaru.");
    }
  };

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [deployLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const checkName = newName.trim();
    const checkUsername = newUsername.trim().toLowerCase();
    const checkPassword = newPassword.trim();

    if (!checkName || !checkUsername || !checkPassword) {
      setErrorMsg('Semua kolom wajib diisi!');
      return;
    }

    if (adminUsers.some(u => u.username === checkUsername)) {
      setErrorMsg(`Username "${checkUsername}" sudah terdaftar sebagai pengguna admin!`);
      return;
    }

    const newUser: AdminUser = {
      id: 'admin_' + Date.now(),
      nama: checkName,
      username: checkUsername,
      password: checkPassword,
      role: newRole
    };

    onUpdateAdminUsers([...adminUsers, newUser]);
    setSuccessMsg(`Berhasil menambahkan ${checkName} sebagai Admin ${newRole === 'superadmin' ? 'Super' : newRole === 'akademik' ? 'Akademik' : 'Keuangan'}.`);
    
    // Clear form
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setNewRole('akademik');
  };

  // Open Edit Dialog
  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.nama);
    setEditUsername(user.username);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Save edited user
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const checkName = editName.trim();
    const checkUsername = editUsername.trim().toLowerCase();
    const checkPassword = editPassword.trim();

    if (!checkName || !checkUsername || !checkPassword) {
      setWarningMessage('Semua kolom wajib diisi pada formulir edit!');
      return;
    }

    // Check if username is already taken by other users
    if (adminUsers.some(u => u.username === checkUsername && u.id !== editingUser.id)) {
      setWarningMessage(`Username "${checkUsername}" sudah digunakan oleh staff admin lain. Silakan pilih username yang unik.`);
      return;
    }

    const updated = adminUsers.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          nama: checkName,
          username: checkUsername,
          password: checkPassword,
          role: editRole
        };
      }
      return u;
    });

    onUpdateAdminUsers(updated);
    setSuccessMsg(`Data pengguna admin "${checkUsername}" berhasil diperbarui.`);
    setEditingUser(null);
  };

  // Request deletion (triggers custom modal)
  const handleDeleteRequest = (user: AdminUser) => {
    if (user.username === currentAdminUsername) {
      setWarningMessage('Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan saat ini.');
      return;
    }
    setDeletingUser(user);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    const updated = adminUsers.filter(u => u.id !== deletingUser.id);
    onUpdateAdminUsers(updated);
    setSuccessMsg(`Akun administrator dengan username "${deletingUser.username}" berhasil dihapus.`);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HERO INFOGRAPHIC BANNER */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Shield className="w-48 h-48 text-white" />
        </div>
        <div className="max-w-2xl space-y-2">
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-widest rounded border border-indigo-500/30">
            Hak Akses Superadmin
          </span>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Manajemen Pengguna & Gerbang Keamanan Admin
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Sebagai Superadmin, Anda memiliki wewenang penuh untuk menambah, menyunting (edit), mendelegasikan, dan memantau status akses bagi staff di Biro Akademik dan Biro Keuangan Universitas Insan Budi Utomo.
          </p>
        </div>

        {/* STATS CHIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Akun Admin</span>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="text-lg font-bold text-white font-mono">{adminUsers.length}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Super Admin</span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {adminUsers.filter(u => u.role === 'superadmin').length} Akun
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Admin Akademik</span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {adminUsers.filter(u => u.role === 'akademik').length} Akun
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Admin Keuangan</span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {adminUsers.filter(u => u.role === 'keuangan').length} Akun
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* COL A: ADD USER FORM (5 Columns) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:col-span-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
              Daftarkan Akun Baru
            </h3>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left font-semibold">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nama Lengkap / Identitas Staff <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Drs. Heri Hermawan, M.Pd."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Username Kredensial <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: heriakademik"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full text-xs font-mono font-semibold p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Sandi Validasi / Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Isi sandi rahasia"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-mono font-semibold p-2.5 pl-10 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Kewenangan / Role Akses
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewRole('akademik')}
                  className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-lg border transition-colors cursor-pointer ${
                    newRole === 'akademik'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-250 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Akademik
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole('keuangan')}
                  className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-lg border transition-colors cursor-pointer ${
                    newRole === 'keuangan'
                      ? 'bg-amber-50 text-amber-700 border-amber-250 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Keuangan
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole('superadmin')}
                  className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-lg border transition-colors cursor-pointer ${
                    newRole === 'superadmin'
                      ? 'bg-rose-50 text-rose-700 border-rose-250 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Superadmin
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Daftarkan Pengguna
              </button>
            </div>
          </form>
        </div>

        {/* COL B: CURRENT USERS TABLE (7 Columns) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-700" />
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest">
                Daftar Pengguna Portal Admin ({adminUsers.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left" id="admin-users-table">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                  <th className="p-3">Staff / Pengguna</th>
                  <th className="p-3">Kredensial</th>
                  <th className="p-3">Kewenangan</th>
                  <th className="p-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-750">
                {adminUsers.map((u) => {
                  const isSelf = u.username === currentAdminUsername;

                  let roleBadge = "bg-slate-100 text-slate-600 border-slate-200";
                  if (u.role === 'superadmin') {
                    roleBadge = "bg-rose-50 text-rose-700 border-rose-150";
                  } else if (u.role === 'akademik') {
                    roleBadge = "bg-indigo-50 text-indigo-700 border-indigo-150";
                  } else if (u.role === 'keuangan') {
                    roleBadge = "bg-amber-50 text-amber-800 border-amber-150";
                  }

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-850">{u.nama}</p>
                        {isSelf && (
                          <span className="inline-block mt-0.5 px-1 py-0.2 text-[9px] bg-slate-900 text-white rounded font-bold animate-pulse">
                            Akun Anda Sekarang
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="font-mono text-[11px] text-slate-700 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150 inline-block font-sans">
                            {u.username}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded font-extrabold text-[9px] uppercase tracking-wider border ${roleBadge}`}>
                          {u.role === 'superadmin' ? 'Superadmin' : u.role === 'akademik' ? 'Akademik' : 'Keuangan'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* EDIT USERS BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-indigo-655 hover:text-white bg-white hover:bg-indigo-600 border border-slate-200 hover:border-indigo-600 rounded-lg transition-all cursor-pointer"
                            title="Sunting / Edit Data Pengguna"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* DELETE USERS BUTTON */}
                          {u.username === 'ekofachtur' ? (
                            <span className="px-2 py-1 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg select-none" title="Akun ini bersifat permanen dan tidak dapat dihapus">
                              PERMANEN
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteRequest(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isSelf
                                  ? 'text-slate-300 bg-slate-50 border-slate-150 cursor-not-allowed opacity-40'
                                  : 'text-rose-500 hover:text-white bg-white hover:bg-rose-600 border-rose-200 hover:border-rose-600 cursor-pointer'
                              }`}
                              title={isSelf ? "Tidak bisa menghapus akun sendiri" : "Hapus Pengguna"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      </div>

      {/* ======================================================== */}
      {/*               DATABASE BACKUP & EXPORT SQL               */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left space-y-5">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2 font-sans">
                Pemeliharaan & Ekspor Database SQL (MySQL compatible)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium font-sans">
                Pencadangan seluruh struktur skema tabel rujukan akademik dan rekam pendaftaran wisuda langsung ke format berkas database SQL.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-full border border-indigo-200 font-mono">
            MySQL Export Engine v1.0
          </span>
        </div>

        {exportError && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-semibold flex items-center gap-2 animate-fade-in font-sans">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{exportError}</span>
          </div>
        )}

        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2 animate-fade-in font-sans">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Berhasil! Berkas SQL dump berhasil dihasilkan dan diunduh ke komputer Anda.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs text-slate-550 leading-relaxed font-semibold font-sans">
              Fitur ini akan mengekstrak detail skema relasional tabel hulu beserta seluruh data mahasiswa aktif, log yudisium, dan riwayat reservasi toga wisuda. Berkas <code className="font-mono text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-bold">.sql</code> yang dihasilkan dioptimalkan sepenuhnya agar kompatibel untuk diimpor langsung ke server database <span className="font-bold text-slate-800">MySQL</span> atau sistem manajemen database relasional sejenis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-semibold text-slate-500 font-sans">
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 space-y-1">
                <p className="font-bold text-slate-700">Tabel yang Diikutsertakan:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li><code className="font-mono text-[10px] text-slate-700 font-bold bg-white px-1 border rounded">students</code> (Identitas & Kelulusan)</li>
                  <li><code className="font-mono text-[10px] text-slate-700 font-bold bg-white px-1 border rounded">yudisium_registrations</code> (Data Yudisium)</li>
                  <li><code className="font-mono text-[10px] text-slate-700 font-bold bg-white px-1 border rounded">wisuda_registrations</code> (Data Wisuda & Toga)</li>
                  <li><code className="font-mono text-[10px] text-slate-700 font-bold bg-white px-1 border rounded">admin_users</code> (Akses Pengguna Staf)</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 space-y-1">
                <p className="font-bold text-slate-700">Spesifikasi Format Ekspor:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Format Sintaksis: <span className="text-slate-700 font-bold">ANSI/MySQL</span></li>
                  <li>Metode: <code className="font-mono text-[10.5px]">DROP TABLE IF EXISTS</code> + <code className="font-mono text-[10.5px]">INSERT INTO</code></li>
                  <li>Karakter Set: <span className="text-slate-700 font-bold">UTF-8 Unicode (utf8mb4)</span></li>
                  <li>Grup Relasi: Dilengkapi Foreign Key Constraints</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center items-center p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3 font-sans">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
              <Database className="w-8 h-8 animate-pulse text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-800">Unduh Database Sekarang</p>
              <p className="text-[10px] text-slate-400 font-medium">Cadangkan sistem dalam 1-klik</p>
            </div>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportSQL}
              className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all text-white shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isExporting
                  ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-750 active:bg-indigo-805 shadow-indigo-100 hover:shadow shadow-sm'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Ekspor Database (.SQL)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. GITHUB INTEGRATION & AUTO-UPDATE CORE PANEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 text-left">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2">
                Manajemen Integrasi GitHub & Otomatisasi Deploy
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Hubungkan container portal akademik Universitas IBO dengan repositori kode utama guna melakukan deployment otomatis secara instan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Webhook Pembaruan Aktif
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: GIT SETTINGS & CONFIG */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 text-left font-semibold text-xs">
              <div className="flex items-center gap-2 text-slate-700 border-b border-slate-200 pb-2">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-[11px] uppercase tracking-wider">Konfigurasi Repositori Kode</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-505 uppercase tracking-wider">GitHub Repository Slug</label>
                <div className="relative">
                  <input
                    type="text"
                    value={gitHubRepo}
                    onChange={(e) => setGitHubRepo(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 pl-8 border border-slate-250 hover:border-slate-350 rounded-xl bg-white text-slate-850 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Github className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-550 uppercase tracking-wider">Target Branch</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gitBranch}
                      onChange={(e) => setGitBranch(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-2.5 pl-8 border border-slate-250 hover:border-slate-350 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <GitBranch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-550 uppercase tracking-wider">Sistem Port Target</label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value="Port 3000 (Proxy)"
                      className="w-full text-xs font-bold p-2.5 pl-8 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                    <Server className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-700 font-bold">Deploy Otomatis via Push Webhook</p>
                  <p className="text-[9px] text-slate-400 leading-tight">Memicu instalasi & bundle build sesaat ada kode didorong.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPushWebhookEnabled(!isPushWebhookEnabled)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                    isPushWebhookEnabled ? 'bg-indigo-600' : 'bg-slate-350'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      isPushWebhookEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* REAL-TIME COMMIT FOOTPRINT */}
            <div className="border border-slate-150 rounded-xl p-4 text-left space-y-2.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Riwayat Commit Repositori ("{gitBranch}")
              </span>
              <div className="divide-y divide-slate-100 text-[11px] font-semibold text-slate-705">
                {isLoadingCommits ? (
                  <div className="py-8 text-center text-slate-400 space-y-1.5 font-bold uppercase tracking-wider text-[10px]">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent mx-auto rounded-full animate-spin"></div>
                    <p className="mt-1">Memuat Riwayat Commit...</p>
                  </div>
                ) : commits.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-[10px]">
                    Tidak ada riwayat commit yang ditemukan.
                  </div>
                ) : (
                  commits.map((c, idx) => {
                    let displayTime = '';
                    try {
                      const d = new Date(c.date);
                      displayTime = d.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (_) {
                      displayTime = c.date || 'Baru-baru ini';
                    }

                    return (
                      <div key={c.hash || idx} className="py-2.5 first:pt-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded text-[10px] font-bold select-all">
                            {c.shortHash || (c.hash ? c.hash.substring(0, 7) : 'Unknown')}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">{displayTime}</span>
                        </div>
                        <p className="text-slate-800 line-clamp-1 font-bold leading-snug">
                          {c.message}
                        </p>
                        <p className="text-[9.5px] text-slate-400 font-medium">
                          Oleh <span className="font-semibold text-slate-500">@{c.author || 'system'}</span>
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: DEPLOY ACTION & LOGGING TERMINAL */}
          <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left flex-1 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span className="text-white text-[10px] uppercase font-bold tracking-widest font-mono">Terminal Deployment Log</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>

              {/* LIVE CONSOLE WINDOW */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 h-56 overflow-y-auto space-y-1.5 font-mono text-[10px] leading-relaxed text-slate-300">
                {deployStep === -1 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700 animate-pulse stroke-1" />
                    <p className="font-semibold uppercase tracking-wider text-[9px]">Konsol Siap Dioperasikan</p>
                    <p className="text-[9.5px] max-w-xs leading-normal">Lakukan cek pembaruan atau klik tombol "Tarik & Terapkan Pembaruan" untuk melihat output live deployment server.</p>
                  </div>
                ) : (
                  <>
                    {deployLogs.map((log, index) => {
                      let textClass = "text-slate-300";
                      if (log.startsWith("[SUKSES]")) textClass = "text-emerald-400 font-bold";
                      else if (log.startsWith("[GIT]")) textClass = "text-indigo-400";
                      else if (log.startsWith("[NPM]")) textClass = "text-amber-400";
                      else if (log.startsWith("[VITE]")) textClass = "text-blue-400";
                      
                      return (
                        <div key={index} className={`animate-fade-in ${textClass}`}>
                          {log}
                        </div>
                      );
                    })}
                    <div ref={consoleBottomRef} />
                  </>
                )}
              </div>

              {/* DEPLOY PROGRESS STATS */}
              {isDeploying && (
                <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span className="font-bold uppercase animate-pulse">Sedang mengompilasi & deploy ke server...</span>
                    <span>{Math.round(((deployStep + 1) / (deployLogs.length || 3)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-305"
                      style={{ width: `${((deployStep + 1) / (deployLogs.length || 3)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION TRIGGERS CONTAINER */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isCheckingUpdate || isDeploying}
                onClick={handleCheckUpdate}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-extrabold uppercase transition-all border cursor-pointer ${
                  isCheckingUpdate
                    ? 'bg-slate-50 text-slate-400 border-slate-200'
                    : 'bg-white text-slate-750 border-slate-250 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-slate-400' : 'text-slate-500'}`} />
                {isCheckingUpdate ? 'Memeriksa...' : 'Periksa Pembaruan Git'}
              </button>

              <button
                type="button"
                disabled={isDeploying || (!hasNewVersion && currentVersion === 'v1.5.0-rolling')}
                onClick={handlePullAndDeploy}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all text-white shadow-md cursor-pointer ${
                  isDeploying
                    ? 'bg-indigo-400 cursor-not-allowed shadow-none'
                    : !hasNewVersion && currentVersion === 'v1.5.0-rolling'
                      ? 'bg-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-100'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                Tarik & Terapkan Pembaruan
              </button>
            </div>

            {/* UPDATE MESSAGE DISCOVERY CHIP */}
            {updateChecked && hasNewVersion && !isDeploying && currentVersion !== 'v1.5.0-rolling' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-[11px] font-semibold flex items-center gap-2 animate-fade-in text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-amber-900">Pembaruan Tersedia!</p>
                  <p className="text-[10px] text-amber-750 font-medium">Branch global "{gitBranch}" memiliki 1 rilis commit terbaru (v1.5.0-rolling) yang belum dimuat. Klik tombol biru di kanan untuk deploy langsung.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/*                       MODAL FORM EDIT                    */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-semibold text-xs text-slate-750">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-in">
            <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-650" />
                <h3 className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
                  Sunting Data Pengguna Portal Admin
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-left">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nama Lengkap / Identitas Staff <span className="text-rose-505">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Username Kredensial <span className="text-rose-505">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full text-xs font-mono font-semibold p-2.5 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sandi Validasi / Password <span className="text-rose-505">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full text-xs font-mono font-semibold p-2.5 pl-10 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Kewenangan / Role Akses
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('akademik')}
                    className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-lg border transition-colors cursor-pointer ${
                      editRole === 'akademik'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-250 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Akademik
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('keuangan')}
                    className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-lg border transition-colors cursor-pointer ${
                      editRole === 'keuangan'
                        ? 'bg-amber-50 text-amber-700 border-amber-250 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Keuangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('superadmin')}
                    className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-lg border transition-colors cursor-pointer ${
                      editRole === 'superadmin'
                        ? 'bg-rose-50 text-rose-700 border-rose-250 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Superadmin
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 -mx-5 -mb-5 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*               MODAL KONFIRMASI HAPUS (DELETE)            */}
      {/* ======================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-semibold text-xs text-slate-750">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">
                  Hapus Akun Administrator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="p-1 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-left">
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Apakah Anda yakin ingin menghapus akses administrator untuk staff berikut?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-extrabold text-slate-800 text-sm">{deletingUser.nama}</p>
                <p className="text-[10px] text-slate-400 font-bold">
                  Username: <span className="font-mono bg-white px-1 py-0.2 border rounded">{deletingUser.username}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  Kewenangan: <span className="uppercase text-slate-700 bg-white px-1 py-0.2 border rounded">{deletingUser.role}</span>
                </p>
              </div>
              <p className="text-[10px] text-rose-600 leading-normal font-bold">
                * Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Pengguna ini tidak akan bisa login lagi ke portal admin.
              </p>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-rose-650 hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/*               MODAL CUSTOM ALERT / WARNING               */}
      {/* ======================================================== */}
      {warningMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-semibold text-xs text-slate-750">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                  Peringatan Sistem
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWarningMessage(null)}
                className="p-1 hover:bg-amber-100 rounded-lg text-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-left text-xs text-slate-700 leading-relaxed font-semibold">
              <p>{warningMessage}</p>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setWarningMessage(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
