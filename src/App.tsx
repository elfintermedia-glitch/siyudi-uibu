import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, UserCheck, Shield, HelpCircle, LogOut, CheckCircle, 
  Database, UserCheck2, Landmark, HelpCircle as HelpIcon, ChevronRight
} from 'lucide-react';
import { StudentAcademic, YudisiumRegistration, WisudaRegistration, SystemState, DocumentUpload, AdminUser } from './types';
import { INITIAL_STUDENTS, INITIAL_YUDISIUMS, INITIAL_WISUDAS, INITIAL_ADMIN_USERS } from './utils/dummyData';
import StudentPanel from './components/StudentPanel';
import AdminPanel from './components/AdminPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import FinancePanel from './components/FinancePanel';

export default function App() {
  // 1. Initial State Load from Database with local fallbacks
  const [state, setState] = useState<SystemState>({
    students: INITIAL_STUDENTS,
    yudisiumApps: INITIAL_YUDISIUMS,
    wisudaApps: INITIAL_WISUDAS,
    adminUsers: INITIAL_ADMIN_USERS
  });

  // Load state from Cloud SQL database via backend APIs
  useEffect(() => {
    fetch('/api/state')
      .then(res => {
        if (!res.ok) throw new Error('Error status: ' + res.status);
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data.students)) {
          setState(data);
        }
      })
      .catch(e => {
        console.error('Failed to load DB state, using static offline fallbacks:', e);
      });
  }, []);

  // Auth States
  const [activeRole, setActiveRole] = useState<'guest' | 'student' | 'admin'>('guest');
  const [studentNimInput, setStudentNimInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [currentStudent, setCurrentStudent] = useState<StudentAcademic | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Admin password change states
  const [isChangingAdminPassword, setIsChangingAdminPassword] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [adminPasswordSuccess, setAdminPasswordSuccess] = useState<string | null>(null);
  
  // Tab within the login container
  const [loginTab, setLoginTab] = useState<'student' | 'admin'>('student');

  // Helper quick diagnostic presets log in
  const handleQuickLogin = (nim: string) => {
    const found = state.students.find(s => s.nim === nim);
    if (found) {
      setCurrentStudent(found);
      setActiveRole('student');
      setStudentNimInput(found.nim);
      setStudentPasswordInput(found.password || 'kebudiutamaan');
      setLoginError(null);
    }
  };

  const handleStudentLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNimInput.trim()) {
      setLoginError('NIM wajib diisi untuk masuk!');
      return;
    }
    if (!studentPasswordInput.trim()) {
      setLoginError('Password wajib diisi!');
      return;
    }

    fetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nim: studentNimInput.trim(),
        password: studentPasswordInput.trim()
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Autentikasi gagal.');
        }
        return data;
      })
      .then(data => {
        if (data.success && data.student) {
          setCurrentStudent(data.student);
          setActiveRole('student');
          setLoginError(null);
        }
      })
      .catch(err => {
        setLoginError(err.message || 'Terjadi kesalahan saat masuk.');
      });
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameInput = adminUsername.trim().toLowerCase();
    const passwordInput = adminPassword.trim();
    
    const admins = state.adminUsers || INITIAL_ADMIN_USERS;
    const found = admins.find(u => u.username === usernameInput && u.password === passwordInput);

    if (found) {
      setActiveRole('admin');
      setCurrentAdmin(found);
      setLoginError(null);
    } else {
      setLoginError('Username atau password admin salah!');
    }
  };

  const handleLogout = () => {
    setActiveRole('guest');
    setCurrentStudent(null);
    setCurrentAdmin(null);
    setStudentNimInput('');
    setStudentPasswordInput('');
    setAdminUsername('');
    setAdminPassword('');
    setLoginError(null);
  };

  // State update handlers passed down to Admin or Student panel
  const handleUpdateStudentsList = (updatedStudentsList: StudentAcademic[]) => {
    setState(prev => {
      const remainingNims = new Set(updatedStudentsList.map(s => s.nim));
      
      const cleanedYudisiumApps = { ...prev.yudisiumApps };
      Object.keys(cleanedYudisiumApps).forEach(nim => {
        if (!remainingNims.has(nim)) {
          delete cleanedYudisiumApps[nim];
        }
      });

      const cleanedWisudaApps = { ...prev.wisudaApps };
      Object.keys(cleanedWisudaApps).forEach(nim => {
        if (!remainingNims.has(nim)) {
          delete cleanedWisudaApps[nim];
        }
      });

      // Maintain and auto-populate yudisiumApps for students with academicApproved === true
      updatedStudentsList.forEach(s => {
        if (s.academicApproved) {
          if (!cleanedYudisiumApps[s.nim] || cleanedYudisiumApps[s.nim].status === 'belum_daftar') {
            const autoYudisium: YudisiumRegistration = {
              nim: s.nim,
              judulSkripsi: '-',
              pembimbing1: '-',
              pembimbing2: '-',
              tanggalLulus: '-',
              registeredAt: new Date().toISOString().split('T')[0],
              status: 'diajukan',
              documents: []
            };
            cleanedYudisiumApps[s.nim] = autoYudisium;

            // Sync with backend
            fetch('/api/yudisium', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(autoYudisium)
            }).catch(err => {
              console.error('Auto API sync of yudisium failed:', err);
            });
          }
        }
      });

      const nextState = {
        ...prev,
        students: updatedStudentsList,
        yudisiumApps: cleanedYudisiumApps,
        wisudaApps: cleanedWisudaApps
      };

      // Background sync to Cloud SQL database
      fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedStudentsList })
      }).catch(err => {
        console.error('Database syncing failed:', err);
      });

      return nextState;
    });
    
    // Maintain current logged-in profile if synced
    if (currentStudent) {
      const refreshed = updatedStudentsList.find(s => s.nim === currentStudent.nim);
      if (refreshed) {
        setCurrentStudent(refreshed);
      } else {
        setCurrentStudent(null);
        setActiveRole('guest');
      }
    }
  };

  const handleUpdateStudentProfile = (updatedStudent: StudentAcademic) => {
    const updatedList = state.students.map(s => s.nim === updatedStudent.nim ? updatedStudent : s);
    handleUpdateStudentsList(updatedList);

    // Save individual profile separately for safety
    fetch('/api/students/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedStudent)
    }).catch(err => {
      console.error('Database profiling failed:', err);
    });
  };

  const handleRegisterYudisium = (nim: string, formData: any, docs: DocumentUpload[]) => {
    const formatted: YudisiumRegistration = {
      nim,
      judulSkripsi: formData.judulSkripsi,
      pembimbing1: formData.pembimbing1,
      pembimbing2: formData.pembimbing2,
      tanggalLulus: formData.tanggalLulus,
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'diajukan', // Submitted
      documents: docs
    };

    setState(prev => ({
      ...prev,
      yudisiumApps: {
        ...prev.yudisiumApps,
        [nim]: formatted
      }
    }));

    fetch('/api/yudisium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    }).catch(err => {
      console.error('Database recording yudisium failed:', err);
    });
  };

  const handleRegisterWisuda = (nim: string, formData: any) => {
    const formatted: WisudaRegistration = {
      nim,
      ukuranToga: formData.ukuranToga,
      namaAyah: formData.namaAyah,
      namaIbu: formData.namaIbu,
      noHpOrtu: formData.noHpOrtu,
      alamatPengiriman: formData.alamatPengiriman,
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'diajukan' // Submitted
    };

    setState(prev => ({
      ...prev,
      wisudaApps: {
        ...prev.wisudaApps,
        [nim]: formatted
      }
    }));

    fetch('/api/wisuda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formatted)
    }).catch(err => {
      console.error('Database recording wisuda failed:', err);
    });
  };

  const handleUpdateYudisiumApp = (nim: string, updatedRecord: YudisiumRegistration) => {
    let extraStateUpdate = {};
    if (updatedRecord.status === 'disetujui') {
      const existingWisuda = state.wisudaApps[nim];
      if (!existingWisuda || existingWisuda.status === 'belum_daftar') {
        const autoWisuda: WisudaRegistration = {
          nim,
          ukuranToga: 'L',
          namaAyah: '-',
          namaIbu: '-',
          noHpOrtu: '-',
          alamatPengiriman: '-',
          registeredAt: new Date().toISOString().split('T')[0],
          status: 'diajukan'
        };
        extraStateUpdate = {
          wisudaApps: {
            ...state.wisudaApps,
            [nim]: autoWisuda
          }
        };

        // Sync with backend (the backend will already handle this, but sync client-side state for responsiveness)
        fetch('/api/wisuda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(autoWisuda)
        }).catch(err => {
          console.error('Auto API sync of wisuda failed:', err);
        });
      }
    }

    setState(prev => ({
      ...prev,
      yudisiumApps: {
        ...prev.yudisiumApps,
        [nim]: updatedRecord
      },
      ...extraStateUpdate
    }));

    fetch('/api/yudisium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecord)
    }).catch(err => {
      console.error('Database updating yudisium failed:', err);
    });
  };

  const handleUpdateWisudaApp = (nim: string, updatedRecord: WisudaRegistration) => {
    setState(prev => ({
      ...prev,
      wisudaApps: {
        ...prev.wisudaApps,
        [nim]: updatedRecord
      }
    }));

    fetch('/api/wisuda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecord)
    }).catch(err => {
      console.error('Database updating wisuda failed:', err);
    });
  };

  const handleUpdateAdminUsers = (updatedAdmins: AdminUser[]) => {
    setState(prev => ({
      ...prev,
      adminUsers: updatedAdmins
    }));

    updatedAdmins.forEach(adm => {
      fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adm)
      }).catch(err => {
        console.error('Database admin updating failed:', err);
      });
    });
  };

  // Diagnostic helper to reset database back to scratch in Cloud SQL
  const handleClearDatabase = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang database kembali ke data contoh bawaan? Seluruh perubahan data Excel & berkas akan hilang.')) {
      fetch('/api/reset', {
        method: 'POST'
      })
        .then(res => {
          if (!res.ok) throw new Error('Reset failed');
          return fetch('/api/state').then(r => r.json());
        })
        .then(data => {
          if (data && Array.isArray(data.students)) {
            setState(data);
          }
          handleLogout();
        })
        .catch(err => {
          console.error('Failed to reset state via API:', err);
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-gray-800">
      
      {/* 1. TOP PREMIUM ACADEMIC NAVIGATION BAR */}
      <header className="bg-white border-b border-gray-200 text-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Branding Identity */}
            <div className="flex items-center gap-2.5">
              <img src="/favicon.svg" alt="Universitas Insan Budi Utomo" className="w-8 h-8 object-contain shrink-0" referrerPolicy="no-referrer" />
              <div>
                <h1 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-1.5">
                  SIYUDI <span className="text-gray-400 font-normal">| Portal Yudisium & Wisuda Universitas Insan Budi Utomo Malang</span>
                </h1>
              </div>
            </div>

            {/* Quick switcher during testing environment */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {activeRole !== 'guest' ? (
                <div className="flex items-center gap-2.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-indigo-700">
                    Sistem Akses: {activeRole === 'admin' ? (currentAdmin?.role === 'superadmin' ? 'Super Admin' : currentAdmin?.role === 'keuangan' ? 'Admin Keuangan' : 'Admin Akademik') : 'Mahasiswa'}
                  </span>
                  
                  {activeRole === 'student' && currentStudent && (
                    <span className="text-[11px] font-bold text-indigo-900 font-mono">
                      NIM {currentStudent.nim}
                    </span>
                  )}

                  <div className="w-px h-3 bg-indigo-200" />
                  
                  <button
                    id="role-indicator-logout"
                    onClick={handleLogout}
                    className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" /> Keluar
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sistem Verifikasi Wisudawan Digital</span>
                </div>
              )}
            </div>
          </div>

          </div>
        </div>
      </header>

      {/* 2. MAIN APPLICATION LANDING CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW A: GUEST ENTRY PORTAL (LOGIN PANEL) */}
        {activeRole === 'guest' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center md:py-4 SpaceY1.5 space-y-2"
            >
              <h2 className="text-3xl font-extrabold text-slate-850 tracking-tight font-sans">
                Registrasi Yudisium & Pelulusan Sarjana
              </h2>
              <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                Silakan masuk menggunakan USERNAME untuk melengkapi berkas ijazah atau mendaftar yudisium. Bagian Administrasi silakan pilih Admin.
              </p>
            </motion.div>
 
            {/* DUAL LOGIN FORMS */}
            <div className="max-w-md mx-auto w-full">
              
              {/* Form Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
                <div className="flex bg-gray-50 border-b border-gray-200 p-1">
                  <button
                    id="tab-login-student"
                    onClick={() => { setLoginTab('student'); setLoginError(null); }}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      loginTab === 'student' 
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <UserCheck2 className="w-4 h-4 text-indigo-600" />
                    Mahasiswa
                  </button>
                  <button
                    id="tab-login-admin"
                    onClick={() => { setLoginTab('admin'); setLoginError(null); }}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      loginTab === 'admin' 
                        ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50' 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-gray-500" />
                    Admin
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  {loginError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0 animate-pulse" />
                      <p>{loginError}</p>
                    </div>
                  )}

                  {loginTab === 'student' ? (
                    <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">NIM <span className="text-rose-500">*</span></label>
                        <input
                          id="input-nim-login"
                          type="text"
                          required
                          value={studentNimInput}
                          onChange={(e) => setStudentNimInput(e.target.value)}
                          placeholder="Masukkan NIM (contoh: 120140085)"
                          className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-gray-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">PASSWORD <span className="text-rose-500">*</span></label>
                        <input
                          id="input-password-student"
                          type="password"
                          required
                          value={studentPasswordInput}
                          onChange={(e) => setStudentPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-gray-900"
                        />
                      </div>

                      <button
                        id="submit-student-login"
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-805 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        Masuk Ke Akun Mahasiswa
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5 font-semibold">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Username <span className="text-rose-500">*</span></label>
                        <input
                          id="input-username-admin"
                          type="text"
                          required
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="admin"
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">PASSWORD <span className="text-rose-500">*</span></label>
                        <input
                          id="input-password-admin"
                          type="password"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="admin"
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>

                      <button
                        id="submit-admin-login"
                        type="submit"
                        className="w-full py-2 bg-gray-800 hover:bg-gray-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer"
                      >
                        Masuk Sebagai Staff Biro
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW B: LOGGED-IN MAHASISWA PANEL */}
        {activeRole === 'student' && currentStudent && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <StudentPanel 
              student={currentStudent}
              yudisium={state.yudisiumApps[currentStudent.nim]}
              wisuda={state.wisudaApps[currentStudent.nim]}
              onRegisterYudisium={handleRegisterYudisium}
              onRegisterWisuda={handleRegisterWisuda}
              onLogout={handleLogout}
              onUpdateStudentProfile={handleUpdateStudentProfile}
              allStudents={state.students}
            />
          </motion.div>
        )}

        {/* VIEW C: LOGGED-IN STAFF PANEL */}
        {activeRole === 'admin' && currentAdmin && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-800 font-sans tracking-tight uppercase flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  {currentAdmin.role === 'superadmin' ? (
                    <span>Dashboard Keamanan & Manajemen Pengguna Admin</span>
                  ) : currentAdmin.role === 'keuangan' ? (
                    <span>Dashboard Pembayaran & Validasi Keuangan Mahasiswa</span>
                  ) : (
                    <span>Dashboard Kemahasiswaan & Administrasi Wisuda</span>
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {currentAdmin.role === 'superadmin' ? (
                    <span>Gunakan panel ini untuk memantau, menambah, mendelegasikan, atau menghapus kredensial gerbang masuk staff administrasi kampus.</span>
                  ) : currentAdmin.role === 'keuangan' ? (
                    <span>Gunakan panel ini untuk memantau bukti lunas SPP, memeriksa berkas BebasSPP mahasiswa, mendelegasikan catatan perbaikan, atau menyetujui kriteria keuangan.</span>
                  ) : (
                    <span>Gunakan panel ini untuk mengelola list mahasiswa akademik, memvalidasi berkas Yudisium masuk, dan melacak logistik ukuran Toga Wisuda.</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                <button
                  id="admin-change-password-btn"
                  onClick={() => {
                    setNewAdminPassword('');
                    setConfirmAdminPassword('');
                    setAdminPasswordError(null);
                    setAdminPasswordSuccess(null);
                    setIsChangingAdminPassword(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm border border-indigo-500 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  🔒 Ubah Password Staff
                </button>
                <button
                  id="admin-logout-top"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700/80 cursor-pointer"
                >
                  Keluar Panel {currentAdmin.role === 'superadmin' ? 'Superadmin' : currentAdmin.role === 'keuangan' ? 'Keuangan' : 'Akademik'}
                </button>
              </div>
            </div>

            {currentAdmin.role === 'superadmin' && (
              <SuperAdminPanel 
                adminUsers={state.adminUsers || INITIAL_ADMIN_USERS}
                currentAdminUsername={currentAdmin.username}
                onUpdateAdminUsers={handleUpdateAdminUsers}
              />
            )}

            {currentAdmin.role === 'keuangan' && (
              <FinancePanel 
                state={state}
                onUpdateYudisium={handleUpdateYudisiumApp}
                onUpdateStudents={handleUpdateStudentsList}
                onUpdateWisuda={handleUpdateWisudaApp}
              />
            )}

            {currentAdmin.role === 'akademik' && (
              <AdminPanel 
                state={state}
                onUpdateStudents={handleUpdateStudentsList}
                onUpdateYudisium={handleUpdateYudisiumApp}
                onUpdateWisuda={handleUpdateWisudaApp}
              />
            )}

            {/* ADMIN PASSWORD CHANGE MODAL */}
            {isChangingAdminPassword && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                    <div className="flex items-center gap-2 text-indigo-950">
                      <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <span className="text-sm font-bold">🔑</span>
                      </span>
                      <h3 className="font-bold text-sm uppercase tracking-wider">Ubah Password Staff</h3>
                    </div>
                    <button 
                      onClick={() => setIsChangingAdminPassword(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAdminPassword) {
                      setAdminPasswordError("Password baru wajib diisi!");
                      return;
                    }
                    if (newAdminPassword !== confirmAdminPassword) {
                      setAdminPasswordError("Konfirmasi password tidak cocok!");
                      return;
                    }
                    setAdminPasswordError(null);
                    
                    // Update admin profile logic
                    const updatedAdmin = { ...currentAdmin, password: newAdminPassword };
                    const updatedUsersList = (state.adminUsers || []).map(u => u.username === currentAdmin.username ? updatedAdmin : u);
                    
                    handleUpdateAdminUsers(updatedUsersList);
                    setCurrentAdmin(updatedAdmin);
                    
                    setAdminPasswordSuccess("Password staff sukses diubah!");
                    setTimeout(() => {
                      setIsChangingAdminPassword(false);
                      setAdminPasswordSuccess(null);
                    }, 1500);
                  }} className="p-5 space-y-4">
                    
                    {adminPasswordSuccess ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-xl text-center space-y-2 py-8">
                        <div className="text-2xl">✓</div>
                        <p>{adminPasswordSuccess}</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Username Staff</label>
                          <input 
                            type="text"
                            disabled
                            value={currentAdmin.username}
                            className="w-full p-2.5 text-xs font-bold border border-slate-200 bg-slate-100 text-slate-500 rounded-lg focus:outline-none cursor-not-allowed font-mono"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password Baru <span className="text-rose-500">*</span></label>
                          <input 
                            type="password"
                            required
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                            className="w-full p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Konfirmasi Password Baru <span className="text-rose-500">*</span></label>
                          <input 
                            type="password"
                            required
                            value={confirmAdminPassword}
                            onChange={(e) => setConfirmAdminPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            className="w-full p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                          />
                        </div>

                        {adminPasswordError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-semibold rounded-lg text-left">
                            ⚠️ {adminPasswordError}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsChangingAdminPassword(false)}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                          >
                            Simpan Password
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </main>

      {/* 3. HIGH DENSITY FOOTER BAR */}
      <footer className="mt-8 h-10 bg-gray-100 border-t border-gray-250 px-6 flex items-center justify-between shrink-0 text-gray-500 font-semibold">
        <p className="text-[10px] text-gray-400">Universitas Insan Budi Utomo Malang © 2026 - Divisi Pengembangan Sistem Informasi</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Server Online
          </span>
          <span className="text-[10px] text-gray-300 font-mono">v2.4.1-stable</span>
        </div>
      </footer>

    </div>
  );
}
