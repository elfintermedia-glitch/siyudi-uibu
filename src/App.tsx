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
import ProdiPanel from './components/ProdiPanel';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  }
};

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
          
          // Hydrate and update student record with the latest state from backend/DB if active
          const cachedStudent = safeLocalStorage.getItem('siyudi_current_student');
          if (cachedStudent) {
            try {
              const parsed = JSON.parse(cachedStudent);
              const refreshed = data.students.find((s: any) => s.nim === parsed.nim);
              if (refreshed) {
                setCurrentStudent(refreshed);
              }
            } catch (_) {}
          }

          // Hydrate and update admin record with the latest state from backend/DB if active
          const cachedAdmin = safeLocalStorage.getItem('siyudi_current_admin');
          if (cachedAdmin) {
            try {
              const parsed = JSON.parse(cachedAdmin);
              const refreshed = data.adminUsers?.find((a: any) => a.username.toLowerCase() === parsed.username.toLowerCase());
              if (refreshed) {
                setCurrentAdmin(refreshed);
              }
            } catch (_) {}
          }
        }
      })
      .catch(e => {
        console.error('Failed to load DB state, using static offline fallbacks:', e);
      });
  }, []);

  // Auth States with Local Cache Initializers
  const [activeRole, setActiveRole] = useState<'guest' | 'student' | 'admin'>(() => {
    return (safeLocalStorage.getItem('siyudi_active_role') as 'guest' | 'student' | 'admin') || 'guest';
  });
  const [loginUsername, setLoginUsername] = useState(() => safeLocalStorage.getItem('siheppiee_login_username') || '');
  const [loginPassword, setLoginPassword] = useState(() => safeLocalStorage.getItem('siheppiee_login_password') || '');
  
  const [currentStudent, setCurrentStudent] = useState<StudentAcademic | null>(() => {
    const cached = safeLocalStorage.getItem('siyudi_current_student');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
    return null;
  });
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    const cached = safeLocalStorage.getItem('siyudi_current_admin');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
    return null;
  });
  const [loginError, setLoginError] = useState<string | null>(() => {
    try {
      const reason = sessionStorage.getItem('siyudi_logout_reason');
      if (reason) {
        sessionStorage.removeItem('siyudi_logout_reason');
        return reason;
      }
    } catch (_) {}
    return null;
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    safeLocalStorage.setItem('siyudi_active_role', activeRole);
    safeLocalStorage.setItem('siheppiee_login_username', loginUsername);
    safeLocalStorage.setItem('siheppiee_login_password', loginPassword);
    
    if (currentStudent) {
      safeLocalStorage.setItem('siyudi_current_student', JSON.stringify(currentStudent));
    } else {
      safeLocalStorage.removeItem('siyudi_current_student');
    }
    
    if (currentAdmin) {
      safeLocalStorage.setItem('siyudi_current_admin', JSON.stringify(currentAdmin));
    } else {
      safeLocalStorage.removeItem('siyudi_current_admin');
    }
  }, [activeRole, loginUsername, loginPassword, currentStudent, currentAdmin]);
  
  // User password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Helper quick diagnostic presets log in
  const handleQuickLogin = (nim: string) => {
    const found = state.students.find(s => s.nim === nim);
    if (found) {
      if (found.statusKelulusan === 'Belum Lulus') {
        setLoginError('Maaf, Anda belum bisa login karena status Anda masih "Belum Lulus" di basis data akademik. Silakan hubungi prodi untuk menyelesaikan seminar hasil');
        return;
      }
      setCurrentStudent(found);
      setActiveRole('student');
      setLoginUsername(found.nim);
      setLoginPassword(found.password || 'kebudiutamaan');
      setLoginError(null);
    }
  };

  const handleUnifiedLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      setLoginError('Username wajib diisi untuk masuk!');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Password wajib diisi!');
      return;
    }

    const usernameInput = loginUsername.trim();
    const passwordInput = loginPassword.trim();
    
    const admins = state.adminUsers || INITIAL_ADMIN_USERS;
    const adminFound = admins.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);

    if (adminFound) {
      setActiveRole('admin');
      setCurrentAdmin(adminFound);
      setLoginError(null);
      return;
    }

    fetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nim: usernameInput,
        password: passwordInput
      })
    })
      .then(async res => {
        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
           data = await res.json();
        } else {
           const text = await res.text();
           throw new Error(res.ok ? 'Format respons tidak valid.' : 'Server sedang sibuk, silakan coba beberapa saat lagi.');
        }
        
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
        setLoginError(err.message || 'Username atau password salah.');
      });
  };

  const handleLogout = (reason?: any) => {
    const finalReason = typeof reason === 'string' ? reason : null;
    setActiveRole('guest');
    setCurrentStudent(null);
    setCurrentAdmin(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError(finalReason);
    
    safeLocalStorage.removeItem('siyudi_active_role');
    safeLocalStorage.removeItem('siheppiee_login_username');
    safeLocalStorage.removeItem('siheppiee_login_password');
    safeLocalStorage.removeItem('siyudi_current_student');
    safeLocalStorage.removeItem('siyudi_current_admin');

    if (finalReason) {
      try {
        sessionStorage.setItem('siyudi_logout_reason', finalReason);
      } catch (_) {}
    }

    // Hard redirect to clear out any React state/memory caches and ensure a perfect login screen presentation
    setTimeout(() => {
      window.location.href = '/';
    }, 50);
  };

  // Auto Logout after 5 minutes (300 seconds) of inactivity
  useEffect(() => {
    if (activeRole === 'guest') return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout('Sesi Anda telah berakhir karena tidak ada aktivitas selama 5 menit.');
      }, 300000);
    };

    // Initialize timer
    resetTimer();

    // Listen for common user interaction events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [activeRole]);

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
                  SiHeppiee <span className="text-gray-400 font-normal">| UNIVERSITAS INSAN BUDI UTOMO MALANG</span>
                </h1>
              </div>
            </div>

            {/* Quick switcher during testing environment */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {activeRole !== 'guest' ? (
                <div className="flex items-center gap-2.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-indigo-700">
                    Sistem Akses: {activeRole === 'admin' ? (currentAdmin?.role === 'superadmin' ? 'Super Admin' : currentAdmin?.role === 'keuangan' ? 'Admin Keuangan' : currentAdmin?.role === 'prodi' ? 'Program Studi' : 'Admin Akademik') : 'Mahasiswa'}
                  </span>
                  
                  <div className="w-px h-3 bg-indigo-200" />
                  
                  <button
                    onClick={() => {
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError(null);
                      setShowNewPassword(false);
                      setIsChangingPassword(true);
                    }}
                    className="text-amber-600 hover:text-amber-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    🔒 Ubah Password
                  </button>
                  
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
                SIHEPPIEE
              </h2>
              <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Sistem Informasi Hasil Evaluasi Penyelesaian Pendidikan
              </p>
            </motion.div>
 
            {/* UNIFIED LOGIN FORM */}
            <div className="max-w-md mx-auto w-full mt-4">
              
              {/* Form Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-6 text-indigo-700 justify-center pb-2 border-b border-gray-100">
                    <UserCheck2 className="w-5 h-5 flex-shrink-0" />
                    <h3 className="text-[13px] font-bold uppercase tracking-wider">LOGIN</h3>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-lg flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0 animate-pulse" />
                      <p>{loginError}</p>
                    </div>
                  )}

                  <form onSubmit={handleUnifiedLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Username atau NIM <span className="text-rose-500">*</span></label>
                      <input
                        id="input-unified-login-username"
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Contoh: 120140085 atau admin"
                        className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-gray-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">Password <span className="text-rose-500">*</span></label>
                      <input
                        id="input-unified-login-password"
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white text-gray-900"
                      />
                      <div className="flex items-center gap-1.5 mt-2 px-0.5">
                        <input
                          id="toggle-unified-pass"
                          type="checkbox"
                          checked={showLoginPassword}
                          onChange={() => setShowLoginPassword(!showLoginPassword)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="toggle-unified-pass" className="text-[11px] text-gray-500 font-medium select-none cursor-pointer">
                          Tampilkan Password
                        </label>
                      </div>
                    </div>

                    <button
                      id="submit-unified-login"
                      type="submit"
                      className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-805 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Masuk Ke Sistem
                    </button>
                  </form>
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
                  ) : currentAdmin.role === 'prodi' ? (
                    <span>Dashboard Penilaian Kelayakan & Status Kelulusan Kaprodi</span>
                  ) : (
                    <span>Dashboard Kemahasiswaan & Administrasi Wisuda</span>
                  )}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {currentAdmin.role === 'superadmin' ? (
                    <span>Gunakan panel ini untuk memantau, menambah, mendelegasikan, atau menghapus kredensial gerbang masuk staff administrasi kampus.</span>
                  ) : currentAdmin.role === 'keuangan' ? (
                    <span>Gunakan panel ini untuk memantau bukti lunas SPP, memeriksa berkas BebasSPP mahasiswa, mendelegasikan catatan perbaikan, atau menyetujui kriteria keuangan.</span>
                  ) : currentAdmin.role === 'prodi' ? (
                    <span>Gunakan panel ini untuk memantau kelayakan akademik, memeriksa persyaratan kelulusan SKS, serta menyetujui atau menangguhkan kelulusan mahasiswa prodi secara mandiri.</span>
                  ) : (
                    <span>Gunakan panel ini untuk mengelola list mahasiswa akademik, memvalidasi berkas Yudisium masuk, dan melacak logistik ukuran Toga Wisuda.</span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                <button
                  id="admin-change-password-btn"
                  onClick={() => {
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    setShowNewPassword(false);
                    setIsChangingPassword(true);
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
                  Keluar Panel {currentAdmin.role === 'superadmin' ? 'Superadmin' : currentAdmin.role === 'keuangan' ? 'Keuangan' : currentAdmin.role === 'prodi' ? 'Prodi' : 'Akademik'}
                </button>
              </div>
            </div>

            {currentAdmin.role === 'superadmin' && (
              <SuperAdminPanel 
                adminUsers={state.adminUsers || INITIAL_ADMIN_USERS}
                students={state.students}
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
                onUpdateAdminUsers={handleUpdateAdminUsers}
                currentAdminUsername={currentAdmin.username}
              />
            )}

            {currentAdmin.role === 'akademik' && (
              <AdminPanel 
                state={state}
                onUpdateStudents={handleUpdateStudentsList}
                onUpdateYudisium={handleUpdateYudisiumApp}
                onUpdateWisuda={handleUpdateWisudaApp}
                onUpdateAdminUsers={handleUpdateAdminUsers}
                currentAdminUsername={currentAdmin.username}
              />
            )}

            {currentAdmin.role === 'prodi' && (
              <ProdiPanel 
                state={state}
                onUpdateStudents={handleUpdateStudentsList}
                currentAdminUsername={currentAdmin.username}
                currentAdminProdi={currentAdmin.prodi || state.adminUsers?.find(u => u.username.toLowerCase() === currentAdmin.username.toLowerCase())?.prodi}
              />
            )}

            {/* PASSWORD CHANGE MODAL */}
            {isChangingPassword && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
                    <div className="flex items-center gap-2 text-indigo-950">
                      <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                        <span className="text-sm font-bold">🔑</span>
                      </span>
                      <h3 className="font-bold text-sm uppercase tracking-wider">Ubah Password {activeRole === 'student' ? 'Mahasiswa' : 'Staff'}</h3>
                    </div>
                    <button 
                      onClick={() => setIsChangingPassword(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newPassword) {
                      setPasswordError("Password baru wajib diisi!");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      setPasswordError("Konfirmasi password tidak cocok!");
                      return;
                    }
                    setPasswordError(null);
                    
                    if (activeRole === 'student' && currentStudent) {
                      const updatedStudent = { ...currentStudent, password: newPassword };
                      handleUpdateStudentProfile(updatedStudent);
                      setCurrentStudent(updatedStudent);
                    } else if (activeRole === 'admin' && currentAdmin) {
                      const updatedAdmin = { ...currentAdmin, password: newPassword };
                      const updatedUsersList = (state.adminUsers || []).map(u => u.username === currentAdmin.username ? updatedAdmin : u);
                      handleUpdateAdminUsers(updatedUsersList);
                      setCurrentAdmin(updatedAdmin);
                    }
                    
                    setPasswordSuccess("Password sukses diubah!");
                    setTimeout(() => {
                      setIsChangingPassword(false);
                      setPasswordSuccess(null);
                    }, 1500);
                  }} className="p-5 space-y-4">
                    
                    {passwordSuccess ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold rounded-xl text-center space-y-2 py-8">
                        <div className="text-2xl">✓</div>
                        <p>{passwordSuccess}</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Username / NIM</label>
                          <input 
                            type="text"
                            disabled
                            value={(activeRole === 'student' && currentStudent) ? currentStudent.nim : ((activeRole === 'admin' && currentAdmin) ? currentAdmin.username : '')}
                            className="w-full p-2.5 text-xs font-bold border border-slate-200 bg-slate-100 text-slate-500 rounded-lg focus:outline-none cursor-not-allowed font-mono"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password Baru <span className="text-rose-500">*</span></label>
                          <input 
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Masukkan password baru"
                            className="w-full px-3 p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Konfirmasi Password Baru <span className="text-rose-500">*</span></label>
                          <input 
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            className="w-full px-3 p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                          />
                          <div className="flex items-center gap-1.5 mt-1 px-0.5">
                            <input
                              id="toggle-new-admin-pass"
                              type="checkbox"
                              checked={showNewPassword}
                              onChange={() => setShowNewPassword(!showNewPassword)}
                              className="h-3.5 w-3.5 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="toggle-new-admin-pass" className="text-[11px] text-slate-500 font-medium select-none cursor-pointer">
                              Tampilkan Password
                            </label>
                          </div>
                        </div>

                        {passwordError && (
                          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-semibold rounded-lg text-left">
                            ⚠️ {passwordError}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
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
