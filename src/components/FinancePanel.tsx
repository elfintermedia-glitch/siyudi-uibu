import React, { useState } from 'react';
import { 
  Landmark, Check, X, Search, FileText, Filter, Calendar, ClipboardCheck, 
  DollarSign, RefreshCw, AlertCircle, Eye, CheckCircle2, ChevronDown, ChevronUp, 
  GraduationCap, FileCheck, Info, Users, Plus, Edit3, Trash2
} from 'lucide-react';
import { SystemState, StudentAcademic, YudisiumRegistration, DocumentUpload, WisudaRegistration, AdminUser } from '../types';
import { openFilePreview } from '../utils/filePreview';
import StatsOverview from './StatsOverview';

interface FinancePanelProps {
  state: SystemState;
  onUpdateYudisium: (nim: string, updatedRecord: YudisiumRegistration) => void;
  onUpdateStudents?: (updatedList: StudentAcademic[]) => void;
  onUpdateWisuda: (nim: string, updatedRecord: WisudaRegistration) => void;
  onUpdateAdminUsers?: (adminUsers: AdminUser[]) => void;
  currentAdminUsername?: string;
}

type ActiveTab = 'stats' | 'submissions' | 'wisuda_submissions' | 'admin_users';

export default function FinancePanel({ 
  state, 
  onUpdateYudisium, 
  onUpdateStudents,
  onUpdateWisuda,
  onUpdateAdminUsers,
  currentAdminUsername
}: FinancePanelProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stats');

  // States for financial admin user management inside Finance Admin
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminUsername, setEditAdminUsername] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [deletingAdminUser, setDeletingAdminUser] = useState<AdminUser | null>(null);
  
  // States for 'submissions' (Verifikasi Yudisium) sub-tab
  const [yudisiumSearch, setYudisiumSearch] = useState('');
  const [yudisiumFilter, setYudisiumFilter] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('semua');
  
  // States for 'wisuda_submissions' (Verifikasi Wisuda) sub-tab
  const [wisudaSearch, setWisudaSearch] = useState('');
  const [wisudaFilter, setWisudaFilter] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('semua');

  // Expandable row states for submissions
  const [expandedYudisium, setExpandedYudisium] = useState<Record<string, boolean>>({});
  const [expandedWisuda, setExpandedWisuda] = useState<Record<string, boolean>>({});

  // Individual doc audit note states
  const [docNotes, setDocNotes] = useState<Record<string, string>>({}); // keyed by nim_docId
  const [globalRejectionReason, setGlobalRejectionReason] = useState<Record<string, string>>({}); // keyed by nim

  const getSafeDocs = (app: any): any[] => {
    if (!app || !app.documents) return [];
    if (typeof app.documents === 'string') {
      try {
        const parsed = JSON.parse(app.documents);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_) {
        return [];
      }
    }
    return Array.isArray(app.documents) ? app.documents : [];
  };

  // 1. Audit individual document in Yudisium
  const handleAuditDocument = (nim: string, docId: string, status: 'disetujui' | 'ditolak') => {
    const app = state.yudisiumApps[nim];
    if (!app) return;

    const noteKey = `${nim}_${docId}`;
    const note = docNotes[noteKey] || '';

    const updatedDocs = getSafeDocs(app).map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status,
          notes: note.trim() ? note : (status === 'disetujui' ? undefined : 'Berkas tidak sesuai kriteria.')
        };
      }
      return doc;
    });

    onUpdateYudisium(nim, {
      ...app,
      documents: updatedDocs
    });

    // Notify user
    const studentName = state.students.find(s => s.nim === nim)?.nama || '';
    const statusText = status === 'disetujui' ? 'DISETUJUI / ACC' : 'DITOLAK / REVISI';
    alert(`Berkas ${docId === 'bebas_spp' ? 'Bebas SPP' : docId} untuk ${studentName} (${nim}) berhasil diset berstatus ${statusText}!`);
  };

  // 2. Final approval or rejection of Yudisium
  const handleFinalYudisiumDecision = (nim: string, decision: 'disetujui' | 'ditolak') => {
    const app = state.yudisiumApps[nim];
    if (!app) return;

    const reason = globalRejectionReason[nim] || '';

    onUpdateYudisium(nim, {
      ...app,
      status: decision,
      rejectionReason: decision === 'ditolak' ? (reason.trim() ? reason : 'Beberapa berkas dokumen persyaratan Anda ditolak. Harap periksa catatan di setiap dokumen.') : undefined
    });

    const studentInfo = state.students.find(s => s.nim === nim);
    if (decision === 'disetujui') {
      alert(`Mahasiswa atas nama "${studentInfo?.nama || nim}" (${nim}) telah berhasil disetujui yudisiumnya.`);
    } else {
      alert(`Tindakan Penolakan Yudisium untuk "${studentInfo?.nama || nim}" sudah disimpan.`);
    }
  };

  // 3. Final approval or rejection of Wisuda
  const handleFinalWisudaDecision = (nim: string, decision: 'disetujui' | 'ditolak') => {
    const app = state.wisudaApps[nim];
    if (!app) return;

    const reason = globalRejectionReason[nim] || '';

    onUpdateWisuda(nim, {
      ...app,
      status: decision,
      rejectionReason: decision === 'ditolak' ? (reason || 'Berkas wisuda ditolak panitia.') : undefined
    });

    const studentInfo = state.students.find(s => s.nim === nim);
    if (decision === 'disetujui') {
      alert(`Mahasiswa atas nama "${studentInfo?.nama || nim}" (${nim}) telah berhasil disetujui pendaftaran wisuda & distribusi logistiknya.`);
    } else {
      alert(`Tindakan Penolakan Wisuda untuk "${studentInfo?.nama || nim}" sudah disimpan.`);
    }
  };

  // Action Handlers for Finance Admin Users Management (Restricted to 'keuangan' only)
  const handleAddAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    const name = newAdminName.trim();
    const username = newAdminUsername.trim().toLowerCase();
    const password = newAdminPassword.trim();

    if (!name || !username || !password) {
      setAdminError('Semua kolom wajib diisi!');
      return;
    }

    const adminsList = state.adminUsers || [];
    if (adminsList.some(u => u.username === username)) {
      setAdminError(`Username "${username}" sudah terdaftar sebagai staff admin!`);
      return;
    }

    const newUser: AdminUser = {
      id: 'admin_' + Date.now(),
      nama: name,
      username,
      password,
      role: 'keuangan' // Crucial rule constraint: only 'keuangan'
    };

    if (onUpdateAdminUsers) {
      onUpdateAdminUsers([...adminsList, newUser]);
      setAdminSuccess(`Berhasil menambahkan akun staf keuangan baru: "${name}".`);
      setNewAdminName('');
      setNewAdminUsername('');
      setNewAdminPassword('');
    } else {
      setAdminError('Fitur sinkronisasi admin tidak siap.');
    }
  };

  const handleOpenEditAdmin = (user: AdminUser) => {
    setEditingAdminUser(user);
    setEditAdminName(user.nama);
    setEditAdminUsername(user.username);
    setEditAdminPassword(user.password || '');
    setAdminError(null);
    setAdminSuccess(null);
  };

  const handleSaveEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    const name = editAdminName.trim();
    const username = editAdminUsername.trim().toLowerCase();
    const password = editAdminPassword.trim();

    if (!name || !username || !password) {
      setAdminError('Semua kolom wajib diisi pada formulir edit!');
      return;
    }

    const adminsList = state.adminUsers || [];
    if (adminsList.some(u => u.username === username && u.id !== editingAdminUser?.id)) {
      setAdminError(`Username "${username}" sudah digunakan oleh staff admin lain.`);
      return;
    }

    const updated = adminsList.map(u => {
      if (u.id === editingAdminUser?.id) {
        return {
          ...u,
          nama: name,
          username,
          password,
          role: 'keuangan' as const // Enforce keuangan only rule
        };
      }
      return u;
    });

    if (onUpdateAdminUsers) {
      onUpdateAdminUsers(updated);
      setAdminSuccess(`Data staf "${username}" berhasil diperbarui.`);
      setEditingAdminUser(null);
    } else {
      setAdminError('Sinkronisasi admin error.');
    }
  };

  const handleDeleteAdminRequest = (user: AdminUser) => {
    if (user.username === currentAdminUsername) {
      setAdminError('Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.');
      return;
    }
    setDeletingAdminUser(user);
    setAdminError(null);
    setAdminSuccess(null);
  };

  const handleConfirmDeleteAdmin = () => {
    if (!deletingAdminUser) return;

    const adminsList = state.adminUsers || [];
    const updated = adminsList.filter(u => u.id !== deletingAdminUser.id);

    if (onUpdateAdminUsers) {
      onUpdateAdminUsers(updated);
      setAdminSuccess(`Akun staf "${deletingAdminUser.username}" berhasil dihapus.`);
    }
    setDeletingAdminUser(null);
  };

  // Shared statistics calculations
  const pendingYudisiums = Object.values(state.yudisiumApps).filter(y => y.status === 'diajukan' || y.status === 'diproses' || y.status === 'ditolak');
  const pendingWisudas = Object.values(state.wisudaApps).filter(w => w.status === 'diajukan');

  return (
    <div className="space-y-5">
      
      {/* Tab Navigation with Academic Menu Styles, excluding Langkah 1 and Student Database */}
      <div className="flex border-b border-gray-250 bg-white p-1 rounded-lg shadow-sm">
        <button
          id="tab-finance-stats"
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md cursor-pointer ${
            activeTab === 'stats' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Statistik Keuangan & Akademis
        </button>
        <button
          id="tab-finance-submissions"
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md relative cursor-pointer ml-1 ${
            activeTab === 'submissions' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Verifikasi Yudisium
          {pendingYudisiums.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-white" />
          )}
        </button>
        <button
          id="tab-finance-wisuda-submissions"
          onClick={() => setActiveTab('wisuda_submissions')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md relative cursor-pointer ml-1 ${
            activeTab === 'wisuda_submissions' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Verifikasi Wisuda
          {pendingWisudas.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-pulse border border-white" />
          )}
        </button>
        <button
          id="tab-finance-admin-users"
          onClick={() => setActiveTab('admin_users')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md cursor-pointer ml-1 flex items-center gap-1.5 ${
            activeTab === 'admin_users' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 animate-pulse" /> Kelola Akun Keuangan
        </button>
      </div>

      {/* TAB 1: QUICK STATISTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-5">
          <StatsOverview 
            students={state.students} 
            yudisiums={state.yudisiumApps} 
            wisudas={state.wisudaApps} 
          />
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-start gap-3 shadow-sm">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Sambutan & Panduan Biro Keuangan</h4>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                Selamat bekerja kembali! Sebagai Admin Biro Keuangan, Anda bertanggung jawab memantau ketaatan finansial mahasiswa terkait siklus yudisium serta wisuda. Gunakan menu <strong>Verifikasi Yudisium</strong> untuk mengaudit berkas tunggakan Bebas SPP (mahasiswa harus berstatus Acc agar dapat lolos kelulusan), serta menu <strong>Verifikasi Wisuda</strong> untuk memeriksa logistik wisuda dan keaslian status pembayaran registrasi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BILIK VERIFIKASI YUDISIUM */}
      {activeTab === 'submissions' && (() => {
        const registeredYudisiums = Object.values(state.yudisiumApps).filter(y => y.status !== 'belum_daftar');
        const filteredYudisiums = registeredYudisiums.filter(y => {
          const studentInfo = state.students.find(s => s.nim === y.nim);
          const studentName = studentInfo?.nama || '';
          const studentProdi = studentInfo?.programStudi || '';
          const studentNik = studentInfo?.nik || '';
          
          const matchesSearch = 
            studentName.toLowerCase().includes(yudisiumSearch.toLowerCase()) ||
            y.nim.toLowerCase().includes(yudisiumSearch.toLowerCase()) ||
            studentProdi.toLowerCase().includes(yudisiumSearch.toLowerCase()) ||
            studentNik.toLowerCase().includes(yudisiumSearch.toLowerCase());
            
          if (yudisiumFilter === 'pending') {
            return matchesSearch && (y.status === 'diajukan' || y.status === 'diproses');
          }
          if (yudisiumFilter === 'disetujui') {
            return matchesSearch && y.status === 'disetujui';
          }
          if (yudisiumFilter === 'ditolak') {
            return matchesSearch && y.status === 'ditolak';
          }
          return matchesSearch;
        });

        return (
          <div className="space-y-5 text-slate-755 font-semibold text-xs">
            <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-4 space-y-4 animate-fade-in">
              <div className="border-b border-gray-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    Unit Audit Finansial & Yudisium
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Memantau kelayakan berkas keuangan Bebas SPP mahasiswa serta menyetujui kelolosan Yudisium berdasar pelunasan cicilan kuliah.
                  </p>
                </div>
              </div>

              {/* Live stats inside tab */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Yudisium Masuk</p>
                  <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                    {registeredYudisiums.length}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/75 border border-amber-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Menunggu Verifikasi</p>
                  <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                    {registeredYudisiums.filter(y => y.status === 'diajukan' || y.status === 'diproses').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Yudisium Disetujui</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {registeredYudisiums.filter(y => y.status === 'disetujui').length}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Yudisium Ditolak</p>
                  <p className="text-lg font-extrabold text-rose-700 mt-0.5">
                    {registeredYudisiums.filter(y => y.status === 'ditolak').length}
                  </p>
                </div>
              </div>

              {/* Searching and filtering controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan Nama, NIM, NIK, atau Program Studi..."
                    value={yudisiumSearch}
                    onChange={(e) => setYudisiumSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold placeholder-slate-400 border border-slate-250 hover:border-slate-350 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-slate-705 shadow-sm"
                  />
                  {yudisiumSearch && (
                    <button
                      onClick={() => setYudisiumSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 w-full sm:w-auto shrink-0 justify-start sm:justify-end overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setYudisiumFilter('semua')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      yudisiumFilter === 'semua'
                        ? 'bg-slate-800 text-white border-slate-850 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({registeredYudisiums.length})
                  </button>
                  <button
                    onClick={() => setYudisiumFilter('pending')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      yudisiumFilter === 'pending'
                        ? 'bg-amber-650 text-white border-amber-650 shadow-sm'
                        : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Butuh Acc ({registeredYudisiums.filter(y => y.status === 'diajukan' || y.status === 'diproses').length})
                  </button>
                  <button
                    onClick={() => setYudisiumFilter('disetujui')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      yudisiumFilter === 'disetujui'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-amber-50'
                    }`}
                  >
                    Lolos ({registeredYudisiums.filter(y => y.status === 'disetujui').length})
                  </button>
                  <button
                    onClick={() => setYudisiumFilter('ditolak')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      yudisiumFilter === 'ditolak'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm font-bold'
                        : 'bg-white text-rose-705 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Ditolak ({registeredYudisiums.filter(y => y.status === 'ditolak').length})
                  </button>
                </div>
              </div>

              {/* Data Grid Table */}
              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="p-3 w-10"></th>
                      <th className="p-3">Mahasiswa</th>
                      <th className="p-3">Program Studi</th>
                      <th className="p-3 text-center">Bebas SPP Status</th>
                      <th className="p-3 text-center">Status Berkas</th>
                      <th className="p-3 text-center">Keputusan Yudisium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs">
                    {filteredYudisiums.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <FileText className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                          <p className="text-xs font-bold mt-2.5 uppercase tracking-wide">Data Tidak Ditemukan</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada mahasiswa yang cocok dengan kriteria filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredYudisiums.map((app) => {
                        const studentInfo = state.students.find(s => s.nim === app.nim);
                        const isExpanded = !!expandedYudisium[app.nim];
                        const docsList = getSafeDocs(app);
                        const totalDocs = docsList.length;
                        const uploadedDocsCount = docsList.filter(d => d.fileName).length;
                        const approvedDocsCount = docsList.filter(d => d.status === 'disetujui').length;
                        const rejectedDocsCount = docsList.filter(d => d.status === 'ditolak').length;
                        const allDocsApproved = approvedDocsCount === totalDocs;

                        const sppDoc = docsList.find(d => d.id === 'bebas_spp');
                        const sppStatus = sppDoc ? sppDoc.status : 'belum_unggah';

                        let docSummaryStatus = 'Pending';
                        if (app.status === 'disetujui') docSummaryStatus = 'Keuangan Sudah Lengkap';
                        else if (totalDocs === 0) docSummaryStatus = 'Antrean Keuangan';
                        else if (approvedDocsCount === totalDocs) docSummaryStatus = 'Semua Acc';
                        else if (rejectedDocsCount > 0) docSummaryStatus = `${rejectedDocsCount} Ditolak`;
                        else if (uploadedDocsCount < totalDocs) docSummaryStatus = `${totalDocs - uploadedDocsCount} Belum Unggah`;

                        return (
                          <React.Fragment key={app.nim}>
                            <tr className={`hover:bg-slate-50/50 transition-colors ${
                              app.status === 'disetujui' 
                                ? 'bg-emerald-50/5' 
                                : app.status === 'ditolak' 
                                  ? 'bg-rose-50/5' 
                                  : ''
                            }`}>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedYudisium(prev => ({ ...prev, [app.nim]: !prev[app.nim] }))}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  title="Expand berkas yudisium"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                              <td className="p-3">
                                <div>
                                  <p 
                                    className="font-bold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer text-xs"
                                    onClick={() => setExpandedYudisium(prev => ({ ...prev, [app.nim]: !prev[app.nim] }))}
                                  >
                                    {studentInfo?.nama || 'Nama Tidak Ditemukan'}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                    <span className="font-bold text-slate-600">NIM {app.nim}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-slate-650">
                                <div>
                                  <p className="font-semibold text-xs">{studentInfo?.programStudi || 'N/A'}</p>
                                  <p className="text-[10px] text-slate-400">{studentInfo?.fakultas || 'N/A'}</p>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {sppStatus === 'disetujui' ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-100 text-emerald-800 border border-emerald-250">
                                    ✓ LUNAS (Acc)
                                  </span>
                                ) : sppStatus === 'ditolak' ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold rounded bg-rose-100 text-rose-800 border border-rose-250 animate-pulse">
                                    ✗ REVISI (Tolak)
                                  </span>
                                ) : sppStatus === 'pending' ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold rounded bg-amber-100 text-amber-850 border border-amber-250 animate-pulse">
                                    ⏳ BUTUH ACC
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-extrabold rounded bg-slate-100 text-slate-500 border border-slate-200">
                                    BLM UNGGAH
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {docSummaryStatus === 'Keuangan Sudah Lengkap' ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Keuangan Sudah Lengkap
                                  </span>
                                ) : docSummaryStatus === 'Semua Acc' ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    ✓ Semua Acc
                                  </span>
                                ) : docSummaryStatus.includes('Ditolak') ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200">
                                    ✗ {docSummaryStatus}
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-850 border border-amber-200">
                                    ⏳ {docSummaryStatus}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {app.status === 'disetujui' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-850 text-[10px] font-bold rounded-full border border-emerald-250">
                                    <Check className="w-3" /> Lolos Yudisium
                                  </span>
                                ) : app.status === 'ditolak' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-rose-100 text-rose-850 text-[10px] font-bold rounded-full border border-rose-250">
                                    <X className="w-3" /> Ditolak / Revisi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-blue-100 text-blue-850 text-[10px] font-bold rounded-full border border-blue-250 animate-pulse">
                                    <AlertCircle className="w-3.5 h-3.5" /> Diajukan
                                  </span>
                                )}
                              </td>
                            </tr>

                            {/* Expandable Review Section */}
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={6} className="p-4 border-b border-slate-200">
                                  <div className="space-y-6 max-w-4xl mx-auto pl-8">
                                    <div className="bg-white p-4 rounded-xl border border-slate-150">
                                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5 leading-normal mb-4">
                                        <Info className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-extrabold">Verifikasi Berkas Keuangan (Siklus Yudisium):</span>
                                          <p className="mt-0.5">Fokus utama Unit Keuangan Keuangan adalah memverifikasi Berkas <strong>Surat Bebas Keuangan (SPP)</strong>. Serta berpartisipasi mengawasi dokumen lain demi keutuhan data.</p>
                                        </div>
                                      </div>

                                      {/* Documents check blocks */}
                                      <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Pemeriksaan Dokumen Persyaratan ({getSafeDocs(app).length})</h4>
                                        
                                        {getSafeDocs(app).length === 0 ? (
                                          <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                                            <p className="text-xs font-bold text-slate-600">Pendaftaran Yudisium Tanpa Berkas Digital Mandiri</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Persyaratan dokumen berkas digital dinonaktifkan. Silakan langsung validasi kelayakan pembayaran / yudisium di bawah ini.</p>
                                          </div>
                                        ) : (
                                          <div className="space-y-2.5">
                                            {getSafeDocs(app).map((doc) => {
                                              const noteKey = `${app.nim}_${doc.id}`;
                                              const isBebasSpp = doc.id === 'bebas_spp';
                                              return (
                                                <div key={doc.id} className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                                  isBebasSpp ? 'bg-amber-50/20 border-amber-250/70 shadow-sm' : 'bg-white border-slate-200/80'
                                                }`}>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                      <p className="text-xs font-bold text-slate-700">{doc.name} {isBebasSpp && <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1 rounded">Berkas Utama Keuangan</span>}</p>
                                                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                                                        doc.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : doc.status === 'ditolak' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-150'
                                                      }`}>
                                                        {doc.status === 'disetujui' ? 'DISETUJUI' : doc.status === 'ditolak' ? 'DITOLAK' : 'BELUM DIPERIKSA'}
                                                      </span>
                                                    </div>
                                                    
                                                    {doc.fileName ? (
                                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            if (doc.fileData) {
                                                              openFilePreview(doc.fileData, doc.fileName);
                                                            }
                                                          }}
                                                          className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 hover:text-indigo-900 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-indigo-200/60 shadow-sm"
                                                        >
                                                          👁️ Preview / 📥 Unduh File
                                                        </button>
                                                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                                                          Nama file: <span className="font-mono text-slate-600 font-semibold">{doc.fileName}</span> <span className="text-slate-400 font-mono">({doc.fileSize})</span>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <p className="text-[10px] text-rose-600 font-semibold italic mt-1">Penting: Mahasiswa belum mengunggah file!</p>
                                                    )}

                                                    {doc.notes && (
                                                      <p className="text-[10px] text-rose-700 bg-rose-50/50 p-1.5 rounded mt-1.5 max-w-md"><strong>Catatan Koreksi:</strong> {doc.notes}</p>
                                                    )}
                                                  </div>

                                                  {/* Evaluation forms */}
                                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <input
                                                      id={`doc-audit-note-finance-${app.nim}-${doc.id}`}
                                                      type="text"
                                                      placeholder="Catatan koreksi (jika ditolak)..."
                                                      value={docNotes[noteKey] || ''}
                                                      onChange={(e) => setDocNotes(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                                      className="p-1 px-2 text-[11px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded bg-slate-50 w-full sm:w-48 font-medium"
                                                    />
                                                    <div className="flex gap-1 shrink-0">
                                                      <button
                                                        onClick={() => handleAuditDocument(app.nim, doc.id, 'disetujui')}
                                                        className="p-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
                                                        title="Setujui dokumen ini"
                                                      >
                                                        <Check className="w-3.5 h-3.5" /> Setuju
                                                      </button>
                                                      <button
                                                        onClick={() => handleAuditDocument(app.nim, doc.id, 'ditolak')}
                                                        className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold border border-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
                                                        title="Tolak dokumen ini"
                                                      >
                                                        <X className="w-3.5 h-3.5" /> Tolak
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>

                                      {/* Final Decisions block */}
                                      <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                                        <label className="text-xs font-bold text-slate-700">Form Evaluasi Yudisium Akhir (Dari Keuangan)</label>
                                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                                          <div className="flex-1 w-full">
                                            <textarea
                                              placeholder="Catatan penolakan yudisium secara keseluruhan atau rincian perbaikan apa yang harus dilengkapi..."
                                              rows={1}
                                              value={globalRejectionReason[app.nim] || ''}
                                              onChange={(e) => setGlobalRejectionReason(prev => ({ ...prev, [app.nim]: e.target.value }))}
                                              className="p-2 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none bg-white w-full resize-y"
                                            />
                                          </div>
                                          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                            <button
                                              onClick={() => handleFinalYudisiumDecision(app.nim, 'ditolak')}
                                              className="flex-1 sm:flex-none p-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                            >
                                              <X className="w-3.5 h-3.5" /> Tolak Yudisium
                                            </button>
                                            <button
                                              disabled={!allDocsApproved}
                                              onClick={() => handleFinalYudisiumDecision(app.nim, 'disetujui')}
                                              className={`flex-1 sm:flex-none p-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                                allDocsApproved
                                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm'
                                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                              }`}
                                              title={allDocsApproved ? 'Setujui Yudisium' : 'Harap setujui semua berkas dokumen persyaratan terlebih dahulu'}
                                            >
                                              <Check className="w-3.5 h-3.5" /> Setujui Yudisium
                                            </button>
                                          </div>
                                        </div>
                                        {!allDocsApproved && (
                                          <p className="text-[10px] text-rose-600 font-bold mt-2 flex items-center gap-1 justify-end animate-pulse">
                                            ⚠️ Pengesahan Yudisium dikunci: Harap setujui (Acc) semua berkas dokumen persyaratan di atas terlebih dahulu, terutama SPP.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 3: BILIK VERIFIKASI WISUDA */}
      {activeTab === 'wisuda_submissions' && (() => {
        const registeredWisudas = Object.values(state.wisudaApps).filter(w => w.status !== 'belum_daftar');
        const filteredWisudas = registeredWisudas.filter(w => {
          const studentInfo = state.students.find(s => s.nim === w.nim);
          const studentName = studentInfo?.nama || '';
          const studentProdi = studentInfo?.programStudi || '';
          const studentNik = studentInfo?.nik || '';
          
          const matchesSearch = 
            studentName.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
            w.nim.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
            studentProdi.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
            studentNik.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
            w.namaAyah.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
            w.namaIbu.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
            w.alamatPengiriman.toLowerCase().includes(wisudaSearch.toLowerCase());
            
          if (wisudaFilter === 'pending') {
            return matchesSearch && (w.status === 'diajukan' || w.status === 'diproses');
          }
          if (wisudaFilter === 'disetujui') {
            return matchesSearch && w.status === 'disetujui';
          }
          if (wisudaFilter === 'ditolak') {
            return matchesSearch && w.status === 'ditolak';
          }
          return matchesSearch;
        });

        return (
          <div className="space-y-5 text-slate-755 font-semibold text-xs">
            <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-4 space-y-4 animate-fade-in">
              <div className="border-b border-gray-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    Bilik Verifikasi Administrasi & Registrasi Wisuda
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Melacak status pembayaran registrasi wisuda, kebenaran biodata orang tua wali, serta sinkronisasi alamat pengiriman atribut wisuda.
                  </p>
                </div>
              </div>

              {/* Live stats inside tab */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Wisuda Masuk</p>
                  <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                    {registeredWisudas.length}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/75 border border-amber-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600">Menunggu Verifikasi</p>
                  <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                    {registeredWisudas.filter(w => w.status === 'diajukan' || w.status === 'diproses').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">Wisuda Disetujui</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {registeredWisudas.filter(w => w.status === 'disetujui').length}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600">Wisuda Ditolak</p>
                  <p className="text-lg font-extrabold text-rose-700 mt-0.5">
                    {registeredWisudas.filter(w => w.status === 'ditolak').length}
                  </p>
                </div>
              </div>

              {/* Searching and filtering controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan Nama, NIM, Ukuran Toga, Wali, Kota Pengiriman..."
                    value={wisudaSearch}
                    onChange={(e) => setWisudaSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold placeholder-slate-400 border border-slate-250 hover:border-slate-350 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-slate-705 shadow-sm"
                  />
                  {wisudaSearch && (
                    <button
                      onClick={() => setWisudaSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 w-full sm:w-auto shrink-0 justify-start sm:justify-end overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setWisudaFilter('semua')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'semua'
                        ? 'bg-slate-800 text-white border-slate-850 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({registeredWisudas.length})
                  </button>
                  <button
                    onClick={() => setWisudaFilter('pending')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Butuh Acc ({registeredWisudas.filter(w => w.status === 'diajukan' || w.status === 'diproses').length})
                  </button>
                  <button
                    onClick={() => setWisudaFilter('disetujui')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'disetujui'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-amber-50'
                    }`}
                  >
                    Lolos ({registeredWisudas.filter(w => w.status === 'disetujui').length})
                  </button>
                  <button
                    onClick={() => setWisudaFilter('ditolak')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'ditolak'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-rose-705 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Ditolak ({registeredWisudas.filter(w => w.status === 'ditolak').length})
                  </button>
                </div>
              </div>

              {/* Data Grid Table */}
              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="p-3 w-10"></th>
                      <th className="p-3">Mahasiswa Wisudawan</th>
                      <th className="p-3">Program Studi</th>
                      <th className="p-3 text-center">Yudisium</th>
                      <th className="p-3 text-center">Status Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                    {filteredWisudas.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          <GraduationCap className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                          <p className="text-xs font-bold mt-2.5 uppercase tracking-wide">Data Tidak Ditemukan</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada wisudawan yang cocok dengan kriteria filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredWisudas.map((app) => {
                        const studentInfo = state.students.find(s => s.nim === app.nim);
                        const isExpanded = !!expandedWisuda[app.nim];

                        let statusBadge = (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-200">
                            ⏱️ Diajukan
                          </span>
                        );
                        if (app.status === 'disetujui') {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-250">
                              ✅ Lolos Wisuda
                            </span>
                          );
                        } else if (app.status === 'ditolak') {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-[10px] font-bold border border-rose-200">
                              ❌ Ditolak
                            </span>
                          );
                        }

                        return (
                          <React.Fragment key={app.nim}>
                            <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-indigo-50/15' : ''}`}>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedWisuda(prev => ({ ...prev, [app.nim]: !isExpanded }))}
                                  className="p-1 rounded-lg hover:bg-slate-150 transition-colors cursor-pointer text-slate-500"
                                  title="Tampilkan rincian data wisuda"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-805">{studentInfo?.nama || 'Unregistered'}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIM. {app.nim} • 📞 {studentInfo?.noHp || '-'}</div>
                              </td>
                              <td className="p-3 text-slate-600 font-medium">{studentInfo?.programStudi || '-'}</td>
                              <td className="p-3 text-center">
                                <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-md text-[10px] select-none">
                                  ACC Yudisium
                                </span>
                              </td>
                              <td className="p-3 text-center">{statusBadge}</td>
                            </tr>

                            {/* Expanded sub-section */}
                            {isExpanded && (
                              <tr className="bg-indigo-50/10">
                                <td colSpan={5} className="p-4 border-t border-b border-indigo-100">
                                  <div className="bg-white rounded-xl border border-indigo-100/85 shadow-md p-4 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                                        📋 Rincian Registrasi Kelulusan Wisuda Otomatis
                                      </h4>
                                      <span className="text-[10px] text-slate-400 font-medium">Auto-Registered: <strong className="font-mono">{app.registeredAt}</strong></span>
                                    </div>

                                    {/* Grid data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="p-4 rounded-xl bg-teal-50/20 border border-teal-100/70 space-y-2">
                                        <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider">🎓 Antrean Kelulusan Wisuda</p>
                                        <p className="text-xs text-teal-950 font-medium leading-relaxed">
                                          Mahasiswa ini telah sukses menyelesaikan verifikasi kelayakan akademik & keuangan Yudisium (Langkah 1 & 2). Sistem pendaftaran secara otomatis memasukkan mahasiswa ini ke antrean kelulusan wisuda universitas.
                                        </p>
                                      </div>

                                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-205 space-y-2">
                                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">📞 Informasi Kontak Mahasiswa</p>
                                        <div className="text-xs text-slate-700 leading-relaxed font-semibold space-y-1">
                                          <div><span className="font-bold text-slate-500">Email:</span> {studentInfo?.email || '-'}</div>
                                          <div><span className="font-bold text-slate-500">Nomor Telepon:</span> {studentInfo?.noHp || '-'}</div>
                                          <div><span className="font-bold text-slate-500">NIK:</span> {studentInfo?.nik || '-'}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Box */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 space-y-2">
                                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">🛠️ Rubrik Verifikasi Pembayaran & Pengesahan Pendaftaran Wisuda</p>
                                      <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="flex-1 w-full">
                                          <textarea
                                            placeholder="Catatan penolakan wisuda atau rincian perbaikan apa yang harus dilengkapi..."
                                            rows={1}
                                            value={globalRejectionReason[app.nim] || ''}
                                            onChange={(e) => setGlobalRejectionReason(prev => ({ ...prev, [app.nim]: e.target.value }))}
                                            className="p-2 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none bg-white w-full resize-y"
                                          />
                                        </div>
                                        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                          <button
                                            onClick={() => handleFinalWisudaDecision(app.nim, 'ditolak')}
                                            className="flex-1 sm:flex-none p-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                          >
                                            <X className="w-3.5 h-3.5" /> Tolak Wisuda
                                          </button>
                                          <button
                                            onClick={() => handleFinalWisudaDecision(app.nim, 'disetujui')}
                                            className="flex-1 sm:flex-none p-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                          >
                                            <Check className="w-3.5 h-3.5" /> Setujui Wisuda
                                          </button>
                                        </div>
                                      </div>
                                      {app.rejectionReason && app.status === 'ditolak' && (
                                        <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded border border-rose-200 mt-2">
                                          🚫 <strong>Alasan Penolakan Terakhir:</strong> {app.rejectionReason}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tab: Kelola Akun Staff Keuangan */}
      {activeTab === 'admin_users' && (() => {
        const adminsList = state.adminUsers || [];
        const financeAdmins = adminsList.filter(u => u.role === 'keuangan');

        return (
          <div className="space-y-6 animate-fade-in text-slate-750">
            {/* Header / Banner */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Manajemen Akses Staff Keuangan</h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Menambahkan, memperbarui, dan mengelola akun staf keuangan yang memegang kendali sistem audit Bebas SPP dan biaya registrasi wisuda. Menjaga privasi keuangan mahasiswa secara terstruktur.
                  </p>
                </div>
                <div className="bg-emerald-950/50 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-center self-start md:self-auto min-w-[150px]">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Staff Keuangan</p>
                  <p className="text-2xl font-extrabold text-emerald-300">{financeAdmins.length}</p>
                </div>
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-emerald-50/50 border border-emerald-250 rounded-xl p-4 flex gap-3 text-emerald-900 text-left">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">Kebijakan Hak Akses Staf Keuangan Mandiri</h4>
                <p className="text-[11px] leading-relaxed font-semibold text-emerald-850">
                  Divisi Keuangan hanya diizinkan untuk membuat dan mengelola akun sesama <strong>Admin Keuangan</strong>. Anda tidak diperkenankan membuat akun level Akademik ataupun Super Admin. Hubungi penanggung jawab IT (Superadmin) jika diperlukan repositori akun lintas divisi.
                </p>
              </div>
            </div>

            {/* Status Messages */}
            {adminSuccess && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-850 p-4 rounded-xl flex items-center justify-between shadow-sm text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold">{adminSuccess}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setAdminSuccess(null)}
                  className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {adminError && (
              <div className="bg-rose-50 border border-rose-250 text-rose-850 p-4 rounded-xl flex items-center justify-between shadow-sm text-left">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-xs font-bold">{adminError}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setAdminError(null)}
                  className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 items-start">
              
              {/* Form Column - Left */}
              <div className="md:col-span-5 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm text-left relative h-fit">
                {editingAdminUser && (
                  <div className="absolute top-4 right-4 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Mode Edit Akun
                  </div>
                )}
                
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  {editingAdminUser ? 'Edit Data Staff Keuangan' : 'Formulir Staff Keuangan Baru'}
                </h3>

                <form onSubmit={editingAdminUser ? handleSaveEditAdmin : handleAddAdminUser} className="space-y-4">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                      Nama Lengkap Staf
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAdminUser ? editAdminName : newAdminName}
                      onChange={(e) => editingAdminUser ? setEditAdminName(e.target.value) : setNewAdminName(e.target.value)}
                      placeholder="Contoh: Sri Wahyuni, S.E."
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 font-semibold bg-slate-50/50 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                      Username Login
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAdminUser ? editAdminUsername : newAdminUsername}
                      onChange={(e) => editingAdminUser ? setEditAdminUsername(e.target.value) : setNewAdminUsername(e.target.value)}
                      placeholder="contoh: sri_keuangan"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 font-semibold bg-slate-50/50 text-slate-800"
                    />
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">Username digunakan untuk login dan tidak boleh menggunakan spasi.</p>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                      Password Login
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAdminUser ? editAdminPassword : newAdminPassword}
                      onChange={(e) => editingAdminUser ? setEditAdminPassword(e.target.value) : setNewAdminPassword(e.target.value)}
                      placeholder="Masukkan kata sandi aman"
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 font-semibold bg-slate-50/50 font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
                      Divisi / Tingkat Otoritas
                    </label>
                    <div className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold select-none text-slate-500 flex items-center justify-between">
                      <span>ADMIN KEUANGAN</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold font-mono">TERKUNCI / DIVISI MANDIRI</span>
                    </div>
                    <p className="text-[10px] text-slate-450 mt-1 font-medium italic">Sesuai kebijakan keamanan di atas, divisi terkunci hanya untuk Unit Keuangan saja.</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {editingAdminUser && (
                      <button
                        type="button"
                        onClick={() => setEditingAdminUser(null)}
                        className="w-1/3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`text-xs text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                        editingAdminUser ? 'w-2/3 bg-amber-600 hover:bg-amber-750 shadow-amber-500/10' : 'w-full bg-slate-800 hover:bg-slate-900 shadow-slate-850/10'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-white shrink-0" />
                      {editingAdminUser ? 'Simpan Perubahan' : 'Tambah Staff Baru'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Accounts List Column - Right */}
              <div className="md:col-span-7 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm text-left h-fit">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <span>Daftar Staf Keuangan Aktif ({financeAdmins.length})</span>
                  <span className="text-[10px] text-slate-450 lowercase">divisi keuangan saja</span>
                </h3>

                {financeAdmins.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold">Belum ada staf keuangan tambahan yang terdaftar.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold">
                          <th className="py-2.5 font-bold uppercase tracking-wider text-left pl-2">Nama Lengkap</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-left">Username</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-left">Kata Sandi</th>
                          <th className="py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-center pr-2">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {financeAdmins.map((user) => {
                          const isSelf = user.username === currentAdminUsername;
                          return (
                            <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-emerald-55/30 font-bold text-emerald-950' : ''}`}>
                              <td className="py-3 font-semibold text-slate-800 pl-2">
                                <div className="flex items-center gap-1.5">
                                  <span>{user.nama}</span>
                                  {isSelf && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold uppercase font-mono">Anda</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 font-mono text-slate-600">
                                @{user.username}
                              </td>
                              <td className="py-3 font-mono text-slate-450">
                                {user.password ? '••••••••' : '(tidak diset)'}
                              </td>
                              <td className="py-3 text-center pr-2">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditAdmin(user)}
                                    title="Edit Informasi Akun"
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAdminRequest(user)}
                                    title={isSelf ? 'Anda tidak dapat menghapus diri sendiri' : 'Hapus Akun Staff'}
                                    disabled={isSelf}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isSelf 
                                        ? 'text-slate-200 cursor-not-allowed hidden' 
                                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                    }`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* CUSTOM MODAL CONFIRMATION: DELETE STAFF ADMIN */}
      {deletingAdminUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-750">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">
                  Hapus Akun Staff Keuangan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingAdminUser(null)}
                className="p-1 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-left">
              <p className="text-xs text-slate-550 leading-relaxed font-semibold block">
                Apakah Anda yakin ingin menghapus akun staf keuangan berikut? Pengguna tersebut tidak akan bisa mengakses portal lagi.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-extrabold text-slate-800 text-sm">{deletingAdminUser.nama}</p>
                <p className="text-[10px] text-slate-550 font-bold">
                  Username: <span className="font-mono bg-white px-1 py-0.2 border rounded">@{deletingAdminUser.username}</span>
                </p>
                <p className="text-[10px] text-slate-550 font-bold">
                  Grup Akses: <span className="text-slate-700 bg-white px-1 py-0.2 border rounded">Admin Keuangan</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeletingAdminUser(null)}
                className="px-4 py-2 rounded-xl text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAdmin}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
