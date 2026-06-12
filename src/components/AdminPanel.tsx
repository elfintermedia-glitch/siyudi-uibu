import React, { useState } from 'react';
import { 
  Users, CheckCircle2, AlertCircle, FileText, Search, Filter, Plus, 
  Edit3, Trash2, Check, X, Eye, ChevronDown, ChevronUp, FileCheck, 
  Briefcase, Save, School, GraduationCap, ArrowUpDown, Info
} from 'lucide-react';
import { StudentAcademic, YudisiumRegistration, WisudaRegistration, DocumentUpload, SystemState } from '../types';
import ExcelImporter, { ALLOWED_PROGRAM_STUDI } from './ExcelImporter';
import StatsOverview from './StatsOverview';
import { openFilePreview } from '../utils/filePreview';

export const INDONESIAN_CITIES = Array.from(new Set([
  // Aceh
  'Banda Aceh', 'Langsa', 'Lhokseumawe', 'Sabang', 'Subulussalam', 'Meulaboh', 'Takengon',
  // Sumatera Utara
  'Binjai', 'Gunungsitoli', 'Medan', 'Padangsidimpuan', 'Pematangsiantar', 'Sibolga', 'Tanjungbalai', 'Tebing Tinggi', 'Kabanjahe', 'Lubuk Pakam',
  // Sumatera Barat
  'Bukittinggi', 'Padang', 'Padang Panjang', 'Pariaman', 'Payakumbuh', 'Sawahlunto', 'Solok',
  // Riau & Kepulauan Riau
  'Dumai', 'Pekanbaru', 'Batam', 'Tanjungpinang',
  // Jambi
  'Jambi', 'Sungai Penuh',
  // Bengkulu
  'Bengkulu',
  // Sumatera Selatan
  'Lubuklinggau', 'Pagar Alam', 'Palembang', 'Prabumulih', 'Baturaja',
  // Bangka Belitung
  'Pangkalpinang',
  // Lampung
  'Bandar Lampung', 'Metro',
  // DKI Jakarta
  'Jakarta', 'Jakarta Barat', 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Utara',
  // Banten
  'Cilegon', 'Serang', 'Tangerang', 'Tangerang Selatan',
  // Jawa Barat
  'Bandung', 'Banjar', 'Bekasi', 'Bogor', 'Cimahi', 'Cirebon', 'Depok', 'Sukabumi', 'Tasikmalaya',
  'Cianjur', 'Garut', 'Indramayu', 'Karawang', 'Kuningan', 'Majalengka', 'Purwakarta', 'Subang', 'Sumedang',
  // Jawa Tengah
  'Magelang', 'Pekalongan', 'Salatiga', 'Semarang', 'Surakarta', 'Solo', 'Tegal',
  'Banyumas', 'Batang', 'Blora', 'Boyolali', 'Brebes', 'Cilacap', 'Demak', 'Grobogan', 'Jepara', 'Karanganyar',
  'Kebumen', 'Kendal', 'Klaten', 'Kudus', 'Pati', 'Purbalingga', 'Purworejo', 'Purwokerto', 'Rembang', 'Sragen',
  'Sukoharjo', 'Temanggung', 'Wonogiri', 'Wonosobo',
  // DI Yogyakarta
  'Yogyakarta', 'Sleman', 'Bantul', 'Wonosari', 'Wates',
  // Jawa Timur
  'Batu', 'Blitar', 'Kediri', 'Madiun', 'Malang', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Surabaya',
  'Bangkalan', 'Banyuwangi', 'Bojonegoro', 'Bondowoso', 'Gresik', 'Jember', 'Jombang', 'Lamongan', 'Lumajang',
  'Nganjuk', 'Ngawi', 'Pacitan', 'Pamekasan', 'Ponorogo', 'Sampang', 'Sidoarjo', 'Situbondo', 'Sumenep', 'Trenggalek', 'Tuban', 'Tulungagung',
  // Bali
  'Denpasar', 'Singaraja', 'Gianyar', 'Tabanan',
  // Nusa Tenggara Barat
  'Bima', 'Mataram', 'Sumbawa Besar',
  // Nusa Tenggara Timur
  'Kupang', 'Maumere', 'Ende',
  // Kalimantan Barat
  'Pontianak', 'Singkawang', 'Sintang', 'Sambas',
  // Kalimantan Tengah
  'Palangkaraya', 'Sampit', 'Pangkalan Bun',
  // Kalimantan Selatan
  'Banjarbaru', 'Banjarmasin', 'Martapura',
  // Kalimantan Timur
  'Balikpapan', 'Bontang', 'Samarinda', 'Tenggarong',
  // Kalimantan Utara
  'Tarakan', 'Tanjung Selor',
  // Sulawesi Utara
  'Bitung', 'Kotamobagu', 'Manado', 'Tomohon',
  // Gorontalo
  'Gorontalo',
  // Sulawesi Tengah
  'Palu', 'Luwuk', 'Poso',
  // Sulawesi Barat
  'Mamuju',
  // Sulawesi Selatan
  'Makassar', 'Palopo', 'Parepare', 'Sengkang', 'Rantepao',
  // Sulawesi Tenggara
  'Baubau', 'Kendari', 'Kolaka',
  // Maluku & Maluku Utara
  'Ambon', 'Tual', 'Ternate', 'Tidore Kepulauan',
  // Papua & Papua Barat & Papua Pegunungan & Papua Selatan & Papua Tengah & Papua Barat Daya
  'Jayapura', 'Sorong', 'Manokwari', 'Merauke', 'Mimika', 'Timika', 'Wamena', 'Nabire'
])).sort((a, b) => a.localeCompare(b));

interface AdminPanelProps {
  state: SystemState;
  onUpdateStudents: (students: StudentAcademic[]) => void;
  onUpdateYudisium: (nim: string, registration: YudisiumRegistration) => void;
  onUpdateWisuda: (nim: string, registration: WisudaRegistration) => void;
}

type ActiveTab = 'stats' | 'sahkan_langkah1' | 'submissions' | 'wisuda_submissions' | 'students';

export default function AdminPanel({ 
  state, 
  onUpdateStudents, 
  onUpdateYudisium, 
  onUpdateWisuda 
}: AdminPanelProps) {
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('stats');
  
  // States for 'sahkan_langkah1' sub-tab
  const [langkah1Search, setLangkah1Search] = useState('');
  const [langkah1Filter, setLangkah1Filter] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('semua');
  const [expandedLangkah1, setExpandedLangkah1] = useState<Record<string, boolean>>({});
  const [rejectingNim, setRejectingNim] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  
  // States for 'submissions' (Verifikasi Yudisium) sub-tab
  const [yudisiumSearch, setYudisiumSearch] = useState('');
  const [yudisiumFilter, setYudisiumFilter] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('semua');
  
  // States for 'wisuda_submissions' (Verifikasi Wisuda) sub-tab
  const [wisudaSearch, setWisudaSearch] = useState('');
  const [wisudaFilter, setWisudaFilter] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('semua');
  
  // Database filter/search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Student modal/edit states
  const [editingStudent, setEditingStudent] = useState<StudentAcademic | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  
  // Custom dialog states (replaces iframe-blocked browser confirm)
  const [deletingStudent, setDeletingStudent] = useState<StudentAcademic | null>(null);
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);

  const [studentForm, setStudentForm] = useState<Partial<StudentAcademic>>({
    nim: '', nik: '', nama: '', tempatLahir: '', tanggalLahir: '', fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan', programStudi: 'Pendidikan Matematika',
    statusKelulusan: 'Lulus', keterangan: '', email: '', noHp: ''
  });

  // Expandable row states for submissions
  const [expandedYudisium, setExpandedYudisium] = useState<Record<string, boolean>>({});
  const [expandedWisuda, setExpandedWisuda] = useState<Record<string, boolean>>({});

  // Individual doc audit note states
  const [docNotes, setDocNotes] = useState<Record<string, string>>({}); // keyed by nim_docId
  const [globalRejectionReason, setGlobalRejectionReason] = useState<Record<string, string>>({}); // keyed by nim

  // 1. Excel Importer adapter
  const handleExcelImport = (newStudents: StudentAcademic[]) => {
    // Merge new students, avoiding duplicate NIMs (preferring uploaded files)
    const existingMap = new Map(state.students.map(s => [s.nim, s]));
    newStudents.forEach(stu => {
      existingMap.set(stu.nim, stu);
    });
    onUpdateStudents(Array.from(existingMap.values()));
  };

  // 2. Add / Edit Students
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.nim || !studentForm.nik || !studentForm.nama || !studentForm.tempatLahir || !studentForm.tanggalLahir) {
      alert('NIM, NIK, Nama Lengkap, Tempat Lahir, dan Tanggal Lahir wajib diisi!');
      return;
    }

    if (isAddingStudent) {
      if (state.students.some(s => s.nim === studentForm.nim)) {
        alert('Mahasiswa dengan NIM tersebut sudah terdaftar di sistem!');
        return;
      }
      if (state.students.some(s => s.nik === studentForm.nik)) {
        alert(`Batal menambah: Mahasiswa dengan NIK "${studentForm.nik}" sudah terdaftar di sistem!`);
        return;
      }
      onUpdateStudents([...state.students, studentForm as StudentAcademic]);
      setIsAddingStudent(false);
    } else if (editingStudent) {
      if (state.students.some(s => s.nim !== editingStudent.nim && s.nik === studentForm.nik)) {
        alert(`Batal mengubah: NIK "${studentForm.nik}" sudah terpakai oleh mahasiswa lain!`);
        return;
      }
      const updatedList = state.students.map(s => 
        s.nim === editingStudent.nim ? { ...s, ...studentForm } as StudentAcademic : s
      );
      onUpdateStudents(updatedList);
      setEditingStudent(null);
    }

    setStudentForm({
      nim: '', nik: '', nama: '', tempatLahir: '', tanggalLahir: '', fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan', programStudi: 'Pendidikan Matematika',
      statusKelulusan: 'Lulus', keterangan: '', email: '', noHp: ''
    });
  };

  const handleStartEdit = (stu: StudentAcademic) => {
    setEditingStudent(stu);
    setStudentForm({ ...stu });
    setIsAddingStudent(false);
  };

  const handleDeleteStudent = (nim: string) => {
    const student = state.students.find(s => s.nim === nim);
    if (student) {
      setDeletingStudent(student);
    }
  };

  const handleConfirmDeleteStudent = () => {
    if (deletingStudent) {
      onUpdateStudents(state.students.filter(s => s.nim !== deletingStudent.nim));
      setDeletingStudent(null);
    }
  };

  const handleDeleteAllStudents = () => {
    setIsConfirmingClearAll(true);
  };

  const handleConfirmClearAll = () => {
    onUpdateStudents([]);
    setIsConfirmingClearAll(false);
  };

  const handleApproveStudentAcademic = (nim: string, approved: boolean) => {
    const student = state.students.find(s => s.nim === nim);
    if (approved && student) {
      const isKtpApproved = student.ktpDoc?.status === 'disetujui';
      const isIjazahApproved = student.ijazahSmaDoc?.status === 'disetujui';
      
      if (!isKtpApproved || !isIjazahApproved) {
        alert('Gagal mensahkan: Berkas KTP dan Ijazah SMA harus diverifikasi dan disetujui (Acc) terlebih dahulu!');
        return;
      }
    }

    const updated = state.students.map(s => {
      if (s.nim === nim) {
        return { 
          ...s, 
          academicApproved: approved,
          academicRejected: approved ? false : s.academicRejected,
          academicRejectionReason: approved ? undefined : s.academicRejectionReason
        };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  const handleRejectStudentAcademic = (nim: string) => {
    setRejectingNim(nim);
    setRejectionReasonInput('');
  };

  const submitRejection = () => {
    if (!rejectingNim) return;
    const reason = rejectionReasonInput.trim();
    const finalReason = reason || "Berkas kurang lengkap / tidak sesuai kriteria akademis.";
    
    const updated = state.students.map(s => {
      if (s.nim === rejectingNim) {
        return {
          ...s,
          academicApproved: false,
          academicRejected: true,
          academicRejectionReason: finalReason
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    setRejectingNim(null);
    setRejectionReasonInput('');
  };

  const handleAuditStudentDocument = (nim: string, docType: 'ktp' | 'ijazah', status: 'disetujui' | 'ditolak') => {
    const updated = state.students.map(s => {
      if (s.nim === nim) {
        if (docType === 'ktp' && s.ktpDoc) {
          return {
            ...s,
            ktpDoc: { ...s.ktpDoc, status }
          };
        } else if (docType === 'ijazah' && s.ijazahSmaDoc) {
          return {
            ...s,
            ijazahSmaDoc: { ...s.ijazahSmaDoc, status }
          };
        }
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  // 3. Document auditing inside Yudisium App
  const handleAuditDocument = (nim: string, docId: string, status: 'disetujui' | 'ditolak') => {
    const app = state.yudisiumApps[nim];
    if (!app) return;

    const noteKey = `${nim}_${docId}`;
    const note = docNotes[noteKey] || '';

    const updatedDocs = app.documents.map(doc => {
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
  };

  // 4. Final approval or rejection of Yudisium / Wisuda
  const handleFinalYudisiumDecision = (nim: string, decision: 'disetujui' | 'ditolak') => {
    const app = state.yudisiumApps[nim];
    if (!app) return;

    const reason = globalRejectionReason[nim] || '';

    onUpdateYudisium(nim, {
      ...app,
      status: decision,
      rejectionReason: decision === 'ditolak' ? (reason.trim() ? reason : 'Beberapa berkas dokumen persyaratan Anda ditolak. Harap periksa catatan di setiap dokumen.') : undefined
    });

    if (decision === 'disetujui') {
      const studentInfo = state.students.find(s => s.nim === nim);
      alert(`Mahasiswa atas nama "${studentInfo?.nama || nim}" (${nim}) telah berhasil disetujui yudisiumnya.`);
    }
  };

  const handleFinalWisudaDecision = (nim: string, decision: 'disetujui' | 'ditolak') => {
    const app = state.wisudaApps[nim];
    if (!app) return;

    const reason = globalRejectionReason[nim] || '';

    onUpdateWisuda(nim, {
      ...app,
      status: decision,
      rejectionReason: decision === 'ditolak' ? (reason || 'Berkas wisuda ditolak panitia.') : undefined
    });

    if (decision === 'disetujui') {
      const studentInfo = state.students.find(s => s.nim === nim);
      alert(`Mahasiswa atas nama "${studentInfo?.nama || nim}" (${nim}) telah berhasil disetujui pendaftaran wisuda & distribusi logistiknya.`);
    }
  };

  // Filters calculation
  const filteredStudents = state.students.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nim.includes(searchQuery);
    const matchesProdi = filterProdi ? s.programStudi === filterProdi : true;
    const matchesStatus = filterStatus ? s.statusKelulusan === filterStatus : true;
    return matchesSearch && matchesProdi && matchesStatus;
  });

  const uniqueProdis = Array.from(new Set(state.students.map(s => s.programStudi))).filter(Boolean);

  // Split submissions
  const pendingYudisiums = Object.values(state.yudisiumApps).filter(y => y.status === 'diajukan' || y.status === 'diproses' || y.status === 'ditolak');
  const approvedYudisiums = Object.values(state.yudisiumApps).filter(y => y.status === 'disetujui');
  
  const pendingWisudas = Object.values(state.wisudaApps).filter(w => w.status === 'diajukan');
  const approvedWisudas = Object.values(state.wisudaApps).filter(w => w.status === 'disetujui');

  return (
    <div className="space-y-5">
      
      {/* Navigation Admin Workspace Tabs */}
      <div className="flex border-b border-gray-250 bg-white p-1 rounded-lg shadow-sm">
        <button
          id="tab-stats"
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md cursor-pointer ${
            activeTab === 'stats' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Statistik
        </button>
        <button
          id="tab-sahkan-langkah1"
          onClick={() => setActiveTab('sahkan_langkah1')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md relative cursor-pointer ml-1 ${
            activeTab === 'sahkan_langkah1' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Sahkan Langkah 1
          {state.students.filter(s => s.dataVerified && !s.academicApproved).length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse border border-white" />
          )}
        </button>
        <button
          id="tab-submissions"
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md relative cursor-pointer ml-1 ${
            activeTab === 'submissions' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Verifikasi Yudisium
          {pendingYudisiums.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-white" />
          )}
        </button>
        <button
          id="tab-wisuda-submissions"
          onClick={() => setActiveTab('wisuda_submissions')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md relative cursor-pointer ml-1 ${
            activeTab === 'wisuda_submissions' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Verifikasi Wisuda
          {pendingWisudas.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-pulse border border-white" />
          )}
        </button>
        <button
          id="tab-students"
          onClick={() => setActiveTab('students')}
          className={`px-4 py-1.5 text-xs uppercase tracking-wider font-bold transition-all rounded-md cursor-pointer ml-1 ${
            activeTab === 'students' 
              ? 'bg-indigo-600 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Basis Data Akademik ({state.students.length})
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
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div>
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Ingin menambah mahasiswa baru dalam jumlah banyak?</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Gunakan fitur Impor Excel pada tab "Basis Data Akademik" untuk mengunggah ratusan akun secara digital.</p>
            </div>
            <button
              id="switch-todb-btn"
              onClick={() => setActiveTab('students')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
            >
              Buka Basis Data
            </button>
          </div>
        </div>
      )}

      {/* TAB 1.5: SAHKAN LANGKAH 1 */}
      {activeTab === 'sahkan_langkah1' && (() => {
        const verifiedStudents = state.students.filter(s => s.dataVerified);
        const filteredVerified = verifiedStudents.filter(s => {
          const matchesSearch = 
            s.nama.toLowerCase().includes(langkah1Search.toLowerCase()) ||
            s.nim.toLowerCase().includes(langkah1Search.toLowerCase()) ||
            (s.nik && s.nik.toLowerCase().includes(langkah1Search.toLowerCase())) ||
            s.programStudi.toLowerCase().includes(langkah1Search.toLowerCase());
            
          if (langkah1Filter === 'pending') {
            return matchesSearch && !s.academicApproved && !s.academicRejected;
          }
          if (langkah1Filter === 'disetujui') {
            return matchesSearch && s.academicApproved;
          }
          if (langkah1Filter === 'ditolak') {
            return matchesSearch && s.academicRejected;
          }
          return matchesSearch;
        });

        return (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-4 space-y-4 animate-fade-in">
              <div className="border-b border-gray-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    Basis Data Kelayakan Akademik (Langkah 1)
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Memantau, menyeleksi, menyetujui (Acc), atau menolak kelayakan data & berkas Langkah 1 mahasiswa yang sudah dikunci.
                  </p>
                </div>
              </div>

              {/* Live stats inside tab */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Berkas Masuk</p>
                  <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                    {verifiedStudents.length}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/75 border border-amber-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 font-bold">Menunggu Validasi</p>
                  <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                    {verifiedStudents.filter(s => !s.academicApproved && !s.academicRejected).length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 font-bold">Langkah 1 Disahkan</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {verifiedStudents.filter(s => s.academicApproved).length}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600 font-bold">Langkah 1 Ditolak</p>
                  <p className="text-lg font-extrabold text-rose-700 mt-0.5">
                    {verifiedStudents.filter(s => s.academicRejected).length}
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
                    value={langkah1Search}
                    onChange={(e) => setLangkah1Search(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold placeholder-slate-400 border border-slate-250 hover:border-slate-350 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-slate-700 shadow-sm"
                  />
                  {langkah1Search && (
                    <button
                      onClick={() => setLangkah1Search('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5 w-full sm:w-auto shrink-0 justify-start sm:justify-end overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setLangkah1Filter('semua')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      langkah1Filter === 'semua'
                        ? 'bg-slate-850 text-white border-slate-850 shadow-sm font-bold'
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({verifiedStudents.length})
                  </button>
                  <button
                    onClick={() => setLangkah1Filter('pending')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      langkah1Filter === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                        : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Butuh Acc ({verifiedStudents.filter(s => !s.academicApproved && !s.academicRejected).length})
                  </button>
                  <button
                    onClick={() => setLangkah1Filter('disetujui')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      langkah1Filter === 'disetujui'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Disahkan ({verifiedStudents.filter(s => s.academicApproved).length})
                  </button>
                  <button
                    onClick={() => setLangkah1Filter('ditolak')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      langkah1Filter === 'ditolak'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm font-bold'
                        : 'bg-white text-rose-705 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    Ditolak ({verifiedStudents.filter(s => s.academicRejected).length})
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
                      <th className="p-3 text-center">Status KTP</th>
                      <th className="p-3 text-center">Status Ijazah</th>
                      <th className="p-3 text-center">Status Kelayakan</th>
                      <th className="p-3 text-right">Aksi Kelayakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs">
                    {filteredVerified.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          <FileCheck className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                          <p className="text-xs font-bold mt-2.5 uppercase tracking-wide">Data Tidak Ditemukan</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada mahasiswa yang cocok dengan kriteria filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredVerified.map((stu) => {
                        const isExpanded = !!expandedLangkah1[stu.nim];
                        const isKtpApproved = stu.ktpDoc?.status === 'disetujui';
                        const isIjazahApproved = stu.ijazahSmaDoc?.status === 'disetujui';
                        const canApprove = isKtpApproved && isIjazahApproved;

                        return (
                          <React.Fragment key={stu.nim}>
                            <tr className={`hover:bg-slate-50/50 transition-colors ${
                              stu.academicApproved 
                                ? 'bg-emerald-50/5' 
                                : stu.academicRejected 
                                  ? 'bg-rose-50/5' 
                                  : ''
                            }`}>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setExpandedLangkah1(prev => ({ ...prev, [stu.nim]: !prev[stu.nim] }))}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  title="Expand berkas mahasiswa"
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
                                    onClick={() => setExpandedLangkah1(prev => ({ ...prev, [stu.nim]: !prev[stu.nim] }))}
                                  >
                                    {stu.nama}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                    <span className="font-bold text-slate-600">NIM {stu.nim}</span>
                                    <span>•</span>
                                    <span>NIK {stu.nik || '-'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-slate-650">
                                <div>
                                  <p className="font-semibold text-xs">{stu.programStudi}</p>
                                  <p className="text-[10px] text-slate-400">{stu.fakultas}</p>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                {stu.ktpDoc ? (
                                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded ${
                                    stu.ktpDoc.status === 'disetujui'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : stu.ktpDoc.status === 'ditolak'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  }`}>
                                    {stu.ktpDoc.status === 'disetujui' ? '✓ ACC' : stu.ktpDoc.status === 'ditolak' ? '✗ Ditolak' : '⏳ Pending'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-450 italic">Belum unggah</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {stu.ijazahSmaDoc ? (
                                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded ${
                                    stu.ijazahSmaDoc.status === 'disetujui'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : stu.ijazahSmaDoc.status === 'ditolak'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  }`}>
                                    {stu.ijazahSmaDoc.status === 'disetujui' ? '✓ ACC' : stu.ijazahSmaDoc.status === 'ditolak' ? '✗ Ditolak' : '⏳ Pending'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-450 italic">Belum unggah</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {stu.academicApproved ? (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-850 text-[10px] font-bold rounded-full border border-emerald-250">
                                    <Check className="w-3 h-3 text-emerald-600 font-extrabold" /> Disahkan (Lulus)
                                  </span>
                                ) : stu.academicRejected ? (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-rose-100 text-rose-850 text-[10px] font-bold rounded-full border border-rose-250">
                                    <X className="w-3 h-3 text-rose-600 font-extrabold" /> Ditolak / Revisi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-amber-100 text-amber-850 text-[10px] font-bold rounded-full border border-amber-250 animate-pulse">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Butuh Acc
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {stu.academicApproved ? (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pr-1">
                                      <Check className="w-3.5 h-3.5" /> Selesai ACC
                                    </span>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleRejectStudentAcademic(stu.nim)}
                                        className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer flex items-center gap-1 bg-white ${
                                          stu.academicRejected
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : 'text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300'
                                        }`}
                                        title="Tolak Pengajuan Langkah 1"
                                      >
                                        <X className="w-3 h-3 text-rose-600" /> Tolak
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (!canApprove) {
                                            alert('Gagal mensahkan: Berkas KTP dan Ijazah SMA harus diverifikasi dan disetujui (Acc) terlebih dahulu!');
                                            return;
                                          }
                                          handleApproveStudentAcademic(stu.nim, true);
                                        }}
                                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                                          canApprove 
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md' 
                                            : 'bg-slate-100 text-slate-400 border border-slate-205 cursor-not-allowed'
                                        }`}
                                        disabled={!canApprove}
                                        title={canApprove ? "Sahkan kelayakan akademik" : "Harap setujui/Acc kedua berkas (KTP & Ijazah) terlebih dahulu."}
                                      >
                                        <Check className="w-3 h-3" /> Sahkan
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Expandable Document Audit Desk */}
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={7} className="p-4 border-b border-slate-200">
                                  <div className="space-y-4 max-w-4xl mx-auto pl-8">
                                    
                                    {/* Warnings if files are not approved but client clicks Sahkan */}
                                    {!canApprove && !stu.academicApproved && (
                                      <div className="p-2 px-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-650 shrink-0" />
                                        <span>
                                          <strong>Catatan:</strong> Tombol <strong>Sahkan</strong> dinonaktifkan hingga berkas KTP dan Ijazah SMA disetujui (Acc) di bawah ini.
                                        </span>
                                      </div>
                                    )}

                                    {/* Show explicit rejecting feedback if rejected */}
                                    {stu.academicRejected && stu.academicRejectionReason && (
                                      <div className="p-3 bg-rose-50 border border-rose-150 rounded-lg text-xs flex items-start gap-2.5">
                                        <AlertCircle className="w-4 h-4 text-rose-650 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-bold text-rose-950">Alasan Penolakan Langkah 1:</p>
                                          <p className="text-rose-800 font-semibold mt-0.5">{stu.academicRejectionReason}</p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Document Auditing Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* KTP audit card */}
                                      <div className="p-3 flex flex-col justify-between bg-white rounded-xl border border-slate-200 shadow-sm gap-3">
                                        <div className="flex justify-between items-start gap-2 leading-none">
                                          <div>
                                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                              🪪 Kartu Tanda Penduduk (KTP)
                                            </p>
                                            {stu.ktpDoc?.fileName ? (
                                              <p className="text-[11px] text-indigo-700 font-semibold font-mono mt-1.5 underline truncate max-w-[220px]" title={stu.ktpDoc.fileName}>
                                                {stu.ktpDoc.fileName} ({stu.ktpDoc.fileSize || 'N/A'})
                                              </p>
                                            ) : (
                                              <p className="text-[11px] text-rose-500 font-bold mt-1.5">
                                                ⚠️ Belum diunggah secara sah
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            {stu.ktpDoc?.status === 'disetujui' ? (
                                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                                                ✓ ACC
                                              </span>
                                            ) : stu.ktpDoc?.status === 'ditolak' ? (
                                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded">
                                                ✗ Ditolak
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 bg-amber-50 text-amber-705 border border-amber-200 text-[10px] font-bold rounded animate-pulse">
                                                ⏳ Butuh Acc
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {stu.ktpDoc && (
                                          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                                            {stu.ktpDoc.fileData ? (
                                              <a
                                                href={stu.ktpDoc.fileData}
                                                download={stu.ktpDoc.fileName || `KTP_${stu.nim}.pdf`}
                                                className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-250 hover:border-indigo-250 text-[10px] font-bold text-slate-705 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                                                target="_blank"
                                                onClick={(e) => {
                                                  if (stu.ktpDoc?.fileData) {
                                                    e.preventDefault();
                                                    openFilePreview(stu.ktpDoc.fileData, stu.ktpDoc.fileName || 'KTP.pdf');
                                                  }
                                                }}
                                              >
                                                📥 Download (PDF)
                                              </a>
                                            ) : (
                                              <span className="text-[10px] text-slate-400 font-medium">Bentuk digital instan</span>
                                            )}
                                            <div className="flex gap-1">
                                              <button
                                                type="button"
                                                onClick={() => handleAuditStudentDocument(stu.nim, 'ktp', 'ditolak')}
                                                className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                                                  stu.ktpDoc.status === 'ditolak'
                                                    ? 'bg-rose-100 text-rose-850 border-rose-300'
                                                    : 'bg-white text-rose-600 hover:bg-rose-50 border-rose-150 hover:border-rose-250'
                                                }`}
                                              >
                                                Tolak
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleAuditStudentDocument(stu.nim, 'ktp', 'disetujui')}
                                                className={`px-3 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                                                  stu.ktpDoc.status === 'disetujui'
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-150 hover:border-emerald-250'
                                                }`}
                                              >
                                                Acc / Setuju
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Ijazah SMA audit card */}
                                      <div className="p-3 flex flex-col justify-between bg-white rounded-xl border border-slate-200 shadow-sm gap-3">
                                        <div className="flex justify-between items-start gap-2 leading-none">
                                          <div>
                                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                              📜 Ijazah SMA / Sederajat
                                            </p>
                                            {stu.ijazahSmaDoc?.fileName ? (
                                              <p className="text-[11px] text-teal-800 font-semibold font-mono mt-1.5 underline truncate max-w-[220px]" title={stu.ijazahSmaDoc.fileName}>
                                                {stu.ijazahSmaDoc.fileName} ({stu.ijazahSmaDoc.fileSize || 'N/A'})
                                              </p>
                                            ) : (
                                              <p className="text-[11px] text-rose-500 font-bold mt-1.5">
                                                ⚠️ Belum diunggah secara sah
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            {stu.ijazahSmaDoc?.status === 'disetujui' ? (
                                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                                                ✓ ACC
                                              </span>
                                            ) : stu.ijazahSmaDoc?.status === 'ditolak' ? (
                                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded">
                                                ✗ Ditolak
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 bg-amber-50 text-amber-705 border border-amber-200 text-[10px] font-bold rounded animate-pulse">
                                                ⏳ Butuh Acc
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {stu.ijazahSmaDoc && (
                                          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                                            {stu.ijazahSmaDoc.fileData ? (
                                              <a
                                                href={stu.ijazahSmaDoc.fileData}
                                                download={stu.ijazahSmaDoc.fileName || `Ijazah_SMA_${stu.nim}.pdf`}
                                                className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-250 hover:border-indigo-250 text-[10px] font-bold text-slate-705 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                                                target="_blank"
                                                onClick={(e) => {
                                                  if (stu.ijazahSmaDoc?.fileData) {
                                                    e.preventDefault();
                                                    openFilePreview(stu.ijazahSmaDoc.fileData, stu.ijazahSmaDoc.fileName || 'Ijazah_SMA.pdf');
                                                  }
                                                }}
                                              >
                                                📥 Download (PDF)
                                              </a>
                                            ) : (
                                              <span className="text-[10px] text-slate-400 font-medium">Bentuk digital instan</span>
                                            )}
                                            <div className="flex gap-1">
                                              <button
                                                type="button"
                                                onClick={() => handleAuditStudentDocument(stu.nim, 'ijazah', 'ditolak')}
                                                className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                                                  stu.ijazahSmaDoc.status === 'ditolak'
                                                    ? 'bg-rose-100 text-rose-850 border-rose-300'
                                                    : 'bg-white text-rose-600 hover:bg-rose-50 border-rose-150 hover:border-rose-250'
                                                }`}
                                              >
                                                Tolak
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleAuditStudentDocument(stu.nim, 'ijazah', 'disetujui')}
                                                className={`px-3 py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                                                  stu.ijazahSmaDoc.status === 'disetujui'
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                    : 'bg-white text-emerald-600 hover:bg-emerald-50 border-emerald-150 hover:border-emerald-250'
                                                }`}
                                              >
                                                Acc / Setuju
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Simple info row */}
                                    <div className="text-[11px] text-slate-400 bg-slate-100 p-2 rounded border border-slate-200">
                                      📍 <strong>Catatan Kontak Mahasiswa:</strong> Email: {stu.email || '-'} • Telepon: {stu.noHp || '-'} • Tempat/Tgl Lahir: {stu.tempatLahir || '-'}, {stu.tanggalLahir || '-'}
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
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-4 space-y-4 animate-fade-in">
              <div className="border-b border-gray-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    Basis Data Verifikasi Yudisium
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Memantau, menyeleksi, menyetujui, atau menolak kelayakan berkas persyaratan pendaftaran Yudisium mahasiswa.
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
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 font-bold">Menunggu Verifikasi</p>
                  <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                    {registeredYudisiums.filter(y => y.status === 'diajukan' || y.status === 'diproses').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 font-bold">Yudisium Disetujui</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {registeredYudisiums.filter(y => y.status === 'disetujui').length}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600 font-bold">Yudisium Ditolak</p>
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
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold placeholder-slate-400 border border-slate-250 hover:border-slate-350 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-slate-700 shadow-sm"
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
                        ? 'bg-slate-850 text-white border-slate-850 shadow-sm font-bold'
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({registeredYudisiums.length})
                  </button>
                  <button
                    onClick={() => setYudisiumFilter('pending')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      yudisiumFilter === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
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
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
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
                      <th className="p-3 text-center">Berkas Diunggah</th>
                      <th className="p-3 text-center">Status Berkas</th>
                      <th className="p-3 text-center">Status Yudisium</th>
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
                        const totalDocs = app.documents.length;
                        const uploadedDocsCount = app.documents.filter(d => d.fileName).length;
                        const approvedDocsCount = app.documents.filter(d => d.status === 'disetujui').length;
                        const rejectedDocsCount = app.documents.filter(d => d.status === 'ditolak').length;
                        const allDocsApproved = approvedDocsCount === totalDocs;

                        let docSummaryStatus = 'Pending';
                        if (approvedDocsCount === totalDocs) docSummaryStatus = 'Semua Acc';
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
                              <td className="p-3 text-center font-semibold text-slate-700 font-mono">
                                {uploadedDocsCount} / {totalDocs} Dokumen
                              </td>
                              <td className="p-3 text-center">
                                {docSummaryStatus === 'Semua Acc' ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    ✓ Semua Acc
                                  </span>
                                ) : docSummaryStatus.includes('Ditolak') ? (
                                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
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
                                    <Check className="w-3 h-3 text-emerald-600 font-extrabold" /> Lolos Yudisium
                                  </span>
                                ) : app.status === 'ditolak' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-rose-100 text-rose-850 text-[10px] font-bold rounded-full border border-rose-250">
                                    <X className="w-3 h-3 text-rose-600 font-extrabold" /> Ditolak / Revisi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-blue-100 text-blue-850 text-[10px] font-bold rounded-full border border-blue-250 animate-pulse">
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Diajukan
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
                                      <div className="flex flex-col justify-center">
                                        <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs text-blue-750 flex items-start gap-2.5 leading-normal">
                                          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                          <div>
                                            <span className="font-bold">Informasi Verifikasi:</span>
                                            <p className="mt-0.5">Verifikasi dokumen serta keaslian berkas wajib dicocokkan dan dinilai secara manual oleh admin program studi sebelum menyelesaikan verifikasi Yudisium.</p>
                                            {(studentInfo?.ktpDoc || studentInfo?.ijazahSmaDoc) && (
                                              <div className="mt-2.5 space-y-1.5 pt-2 border-t border-blue-100/50">
                                                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">Berkas Wajib Langkah 1 (Verifikasi Identitas & Asal Sekolah):</p>
                                                <div className="flex flex-wrap gap-2 text-[10px] mt-1">
                                                  {studentInfo?.ktpDoc?.fileData && (
                                                    <a
                                                      href={studentInfo.ktpDoc.fileData}
                                                      download={studentInfo.ktpDoc.fileName || `KTP_${app.nim}.pdf`}
                                                      className="inline-flex items-center gap-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
                                                      target="_blank"
                                                      onClick={(e) => {
                                                        if (studentInfo?.ktpDoc?.fileData) {
                                                          e.preventDefault();
                                                          openFilePreview(studentInfo.ktpDoc.fileData, studentInfo.ktpDoc.fileName || 'KTP.pdf');
                                                        }
                                                      }}
                                                    >
                                                      👁️ Preview / 📥 Unduh KTP
                                                    </a>
                                                  )}
                                                  {studentInfo?.ijazahSmaDoc?.fileData && (
                                                    <a
                                                      href={studentInfo.ijazahSmaDoc.fileData}
                                                      download={studentInfo.ijazahSmaDoc.fileName || `Ijazah_SMA_${app.nim}.pdf`}
                                                      className="inline-flex items-center gap-1 bg-white hover:bg-teal-50 hover:text-teal-700 border border-teal-200 hover:border-teal-300 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
                                                      target="_blank"
                                                      onClick={(e) => {
                                                        if (studentInfo?.ijazahSmaDoc?.fileData) {
                                                          e.preventDefault();
                                                          openFilePreview(studentInfo.ijazahSmaDoc.fileData, studentInfo.ijazahSmaDoc.fileName || 'Ijazah_SMA.pdf');
                                                        }
                                                      }}
                                                    >
                                                      👁️ Preview / 📥 Unduh Ijazah SMA
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Documents check blocks */}
                                    <div className="space-y-3">
                                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pemeriksaan Dokumen Persyaratan ({app.documents.length})</h4>
                                      
                                      <div className="space-y-2.5">
                                        {app.documents.map((doc) => {
                                          const noteKey = `${app.nim}_${doc.id}`;
                                          return (
                                            <div key={doc.id} className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <p className="text-xs font-bold text-slate-700">{doc.name}</p>
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
                                                      id={`view-doc-btn-${app.nim}-${doc.id}`}
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
                                                  id={`doc-audit-note-${app.nim}-${doc.id}`}
                                                  type="text"
                                                  placeholder="Catatan koreksi (jika ditolak)..."
                                                  value={docNotes[noteKey] || ''}
                                                  onChange={(e) => setDocNotes(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                                  className="p-1 px-2 text-[11px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded bg-slate-50 w-full sm:w-48 font-medium"
                                                />
                                                <div className="flex gap-1 shrink-0">
                                                  <button
                                                    id={`approve-doc-btn-${app.nim}-${doc.id}`}
                                                    onClick={() => handleAuditDocument(app.nim, doc.id, 'disetujui')}
                                                    className="p-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold border border-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
                                                    title="Setujui dokumen ini"
                                                  >
                                                    <Check className="w-3.5 h-3.5" /> Setuju
                                                  </button>
                                                  <button
                                                    id={`reject-doc-btn-${app.nim}-${doc.id}`}
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
                                    </div>

                                    {/* Final Decisions block */}
                                    <div className="pt-4 border-t border-slate-200 flex flex-col gap-3">
                                      <label className="text-xs font-bold text-slate-700">Form Evaluasi Yudisium Akhir</label>
                                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                                        <div className="flex-1 w-full">
                                          <textarea
                                            id={`final-eval-textarea-${app.nim}`}
                                            placeholder="Catatan penolakan yudisium secara keseluruhan atau rincian perbaikan apa yang harus dilengkapi..."
                                            rows={1}
                                            value={globalRejectionReason[app.nim] || ''}
                                            onChange={(e) => setGlobalRejectionReason(prev => ({ ...prev, [app.nim]: e.target.value }))}
                                            className="p-2 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none bg-white w-full resize-y"
                                          />
                                        </div>
                                        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                          <button
                                            id={`reject-yudisium-final-btn-${app.nim}`}
                                            onClick={() => handleFinalYudisiumDecision(app.nim, 'ditolak')}
                                            className="flex-1 sm:flex-none p-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-rose-100"
                                          >
                                            <X className="w-3.5 h-3.5" /> Tolak Yudisium
                                          </button>
                                          <button
                                            id={`approve-yudisium-final-btn-${app.nim}`}
                                            disabled={!allDocsApproved}
                                            onClick={() => handleFinalYudisiumDecision(app.nim, 'disetujui')}
                                            className={`flex-1 sm:flex-none p-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                              allDocsApproved
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm shadow-emerald-100'
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
                                          ⚠️ Pengesahan Yudisium dikunci: Harap setujui (Acc) semua berkas dokumen persyaratan di atas terlebih dahulu.
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

      {/* TAB 2.5: BILIK VERIFIKASI WISUDA */}
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
            w.ukuranToga.toLowerCase().includes(wisudaSearch.toLowerCase()) ||
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
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-4 space-y-4 animate-fade-in">
              <div className="border-b border-gray-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-gray-805 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    Basis Data Verifikasi Wisuda & Logistik
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Memantau rincian pendaftaran wisuda, melakukan verifikasi data orang tua, serta memvalidasi kesiapan logistik Toga mahasiswa.
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
                  <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600 font-bold">Menunggu Verifikasi</p>
                  <p className="text-lg font-extrabold text-amber-700 mt-0.5">
                    {registeredWisudas.filter(w => w.status === 'diajukan' || w.status === 'diproses').length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 font-bold">Wisuda Disetujui</p>
                  <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    {registeredWisudas.filter(w => w.status === 'disetujui').length}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600 font-bold">Wisuda Ditolak</p>
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
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold placeholder-slate-400 border border-slate-250 hover:border-slate-350 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-slate-700 shadow-sm"
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
                        ? 'bg-slate-850 text-white border-slate-850 shadow-sm font-bold'
                        : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                    }`}
                  >
                    Semua ({registeredWisudas.length})
                  </button>
                  <button
                    onClick={() => setWisudaFilter('pending')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm font-bold'
                        : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    Butuh Acc ({registeredWisudas.filter(w => w.status === 'diajukan' || w.status === 'diproses').length})
                  </button>
                  <button
                    onClick={() => setWisudaFilter('disetujui')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'disetujui'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    Lolos ({registeredWisudas.filter(w => w.status === 'disetujui').length})
                  </button>
                  <button
                    onClick={() => setWisudaFilter('ditolak')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border shrink-0 cursor-pointer ${
                      wisudaFilter === 'ditolak'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm font-bold'
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
                      <th className="p-3 text-center">Ukuran Toga</th>
                      <th className="p-3">Orang Tua / Wali</th>
                      <th className="p-3 text-center">Status Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs text-slate-700">
                    {filteredWisudas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
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
                                  id={`toggle-wisuda-row-${app.nim}`}
                                  onClick={() => setExpandedWisuda(prev => ({ ...prev, [app.nim]: !isExpanded }))}
                                  className="p-1 rounded-lg hover:bg-slate-150 transition-colors cursor-pointer text-slate-500"
                                  title="Tampilkan rincian data wisuda"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-slate-800">{studentInfo?.nama || 'Unregistered'}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIM. {app.nim}</div>
                              </td>
                              <td className="p-3 text-slate-600 font-medium">{studentInfo?.programStudi || '-'}</td>
                              <td className="p-3 text-center">
                                <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-750 font-extrabold px-3 py-1 rounded text-xs select-none">
                                  {app.ukuranToga}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="text-slate-700 font-semibold text-[11px]">Ayah: {app.namaAyah}</div>
                                <div className="text-slate-700 font-semibold text-[11px]">Ibu: {app.namaIbu}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">📞 {app.noHpOrtu}</div>
                              </td>
                              <td className="p-3 text-center">{statusBadge}</td>
                            </tr>

                            {/* Expanded sub-section */}
                            {isExpanded && (
                              <tr className="bg-indigo-50/10">
                                <td colSpan={6} className="p-4 border-t border-b border-indigo-100">
                                  <div className="bg-white rounded-xl border border-indigo-100/80 shadow-md p-4 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                                        📋 Rincian Pendaftaran Wisuda & Atribut Logistik
                                      </h4>
                                      <span className="text-[10px] text-slate-400 font-medium">Tanggal Pengajuan: <strong className="font-mono">{app.registeredAt}</strong></span>
                                    </div>

                                    {/* Grid data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1.5">
                                        <p className="text-[11px] font-bold text-indigo-850 uppercase tracking-wider mb-2">📦 Informasi Pengiriman & Logistik</p>
                                        <div className="text-[11px] text-slate-600">
                                          <span className="font-bold text-slate-500">Ukuran Toga Wisuda:</span> <span className="font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold text-xs">{app.ukuranToga}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-600">
                                          <span className="font-bold text-slate-500">Alamat Pengiriman Atribut:</span>
                                          <p className="font-medium text-slate-800 bg-white p-2 border border-slate-200 rounded mt-1 shadow-inner leading-relaxed">
                                            {app.alamatPengiriman}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 space-y-1.5">
                                        <p className="text-[11px] font-bold text-indigo-850 uppercase tracking-wider mb-2">👨‍👩‍👦 Kontak & Data Keluarga</p>
                                        <div className="text-[11px] text-slate-600">
                                          <span className="font-bold text-slate-500">Nama Lengkap Ayah:</span> <span className="font-semibold text-slate-800">{app.namaAyah}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-600">
                                          <span className="font-bold text-slate-500">Nama Lengkap Ibu:</span> <span className="font-semibold text-slate-800">{app.namaIbu}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-600">
                                          <span className="font-bold text-slate-500">No. HP Orang Tua:</span> <span className="font-mono text-slate-800 font-bold">{app.noHpOrtu}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-650 pt-1.5 border-t border-slate-200">
                                          📧 <span className="font-semibold">{studentInfo?.email || '-'}</span> • 📞 <span className="font-semibold">{studentInfo?.noHp || '-'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Box */}
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2 space-y-2">
                                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">🛠️ Rubrik Verifikasi & Pengesahan Pendaftaran Wisuda</p>
                                      <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="flex-1 w-full">
                                          <textarea
                                            id={`wisuda-eval-textarea-${app.nim}`}
                                            placeholder="Catatan penolakan wisuda atau rincian perbaikan apa yang harus dilengkapi..."
                                            rows={1}
                                            value={globalRejectionReason[app.nim] || ''}
                                            onChange={(e) => setGlobalRejectionReason(prev => ({ ...prev, [app.nim]: e.target.value }))}
                                            className="p-2 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none bg-white w-full resize-y"
                                          />
                                        </div>
                                        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                          <button
                                            id={`reject-wisuda-final-btn-${app.nim}`}
                                            onClick={() => handleFinalWisudaDecision(app.nim, 'ditolak')}
                                            className="flex-1 sm:flex-none p-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-rose-100"
                                          >
                                            <X className="w-3.5 h-3.5" /> Tolak Wisuda
                                          </button>
                                          <button
                                            id={`approve-wisuda-final-btn-${app.nim}`}
                                            onClick={() => handleFinalWisudaDecision(app.nim, 'disetujui')}
                                            className="flex-1 sm:flex-none p-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm shadow-emerald-100"
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

      {/* TAB 3: MAHASISWA DATABASE LIST & EXCEL UPLOADER */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          
          {/* Excel Uploader integration */}
          <ExcelImporter 
            onImport={handleExcelImport} 
            existingStudentsCount={state.students.length} 
          />

          {/* Student table workspace */}
          <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Database Akademik Mahasiswa</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Edit status studi mahasiswa untuk menguji berbagai respon status kelulusan di panel mahasiswa.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  id="clear-all-students-btn"
                  onClick={handleDeleteAllStudents}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 text-rose-600 hover:text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Hapus dan Kosongkan Seluruh Database Akademik"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Kosongkan database akademik
                </button>

                <button
                  id="add-student-btn"
                  onClick={() => {
                    setIsAddingStudent(true);
                    setEditingStudent(null);
                    setStudentForm({
                      nim: '', nik: '', nama: '', tempatLahir: '', tanggalLahir: '', fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan', programStudi: 'Pendidikan Matematika',
                      ipk: 3.5, sks: 144, statusKelulusan: 'Lulus', keterangan: '', email: '', noHp: ''
                    });
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Mahasiswa Manual
                </button>
              </div>
            </div>

            {/* Manual Form (Insert/Edit Modal Overlay mimicking style to prevent cluttered pages) */}
            {(isAddingStudent || editingStudent) && (
              <div className="p-5 bg-slate-50 border border-slate-205/65 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-sm text-slate-700">
                    {isAddingStudent ? 'Tambah Mahasiswa Baru' : `Perbarui Data Akademik — NIM ${editingStudent?.nim}`}
                  </h4>
                  <button 
                    id="close-modal-btn"
                    onClick={() => {
                      setIsAddingStudent(false);
                      setEditingStudent(null);
                    }} 
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-650">
                  <div className="flex flex-col gap-1">
                    <label>NIM <span className="text-rose-500">*</span></label>
                    <input
                      id="form-nim"
                      type="text"
                      disabled={!!editingStudent}
                      value={studentForm.nim}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, nim: e.target.value }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                      placeholder="Contoh: 120140222"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label>NIK <span className="text-rose-500">*</span></label>
                    <input
                      id="form-nik"
                      type="text"
                      maxLength={16}
                      value={studentForm.nik || ''}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, nik: e.target.value.replace(/[^\d]/g, '') }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="Masukkan 16 digit NIK"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label>Nama Lengkap <span className="text-rose-500">*</span></label>
                    <input
                      id="form-nama"
                      type="text"
                      value={studentForm.nama}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, nama: e.target.value }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label>Tempat Lahir <span className="text-rose-500">*</span></label>
                    <input
                      id="form-tempat-lahir"
                      type="text"
                      list="indonesia-cities"
                      value={studentForm.tempatLahir || ''}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, tempatLahir: e.target.value }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500"
                      placeholder="Contoh: Malang"
                    />
                    <datalist id="indonesia-cities">
                      {INDONESIAN_CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label>Tanggal Lahir <span className="text-rose-550">*</span></label>
                    <input
                      id="form-tanggal-lahir"
                      type="date"
                      value={studentForm.tanggalLahir || ''}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label>Program Studi</label>
                    <select
                      id="form-prodi"
                      value={studentForm.programStudi}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isTeknik = val.startsWith('Teknik');
                        const isMagister = val.startsWith('Magister');
                        let computedFakultas = 'Fakultas Keguruan dan Ilmu Pendidikan';
                        if (isTeknik) computedFakultas = 'Fakultas Teknik';
                        else if (isMagister) computedFakultas = 'Pascasarjana';
                        
                        setStudentForm(prev => ({ 
                          ...prev, 
                          programStudi: val,
                          fakultas: computedFakultas
                        }));
                      }}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-xs text-slate-800"
                    >
                      {ALLOWED_PROGRAM_STUDI.map((prodi, i) => (
                        <option key={i} value={prodi}>{prodi}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 text-slate-650">
                    <label>Status Kelulusan Akademik</label>
                    <select
                      id="form-status"
                      value={studentForm.statusKelulusan}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, statusKelulusan: e.target.value as any }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Lulus">Lulus (Berhak Yudisium)</option>
                      <option value="Belum Lulus">Belum Lulus (Ujian Ditahan)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label>Keterangan Tambahan / Alasan Ditahan</label>
                    <input
                      id="form-keterangan"
                      type="text"
                      value={studentForm.keterangan}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, keterangan: e.target.value }))}
                      className="p-2 border bg-white rounded-lg focus:outline-none focus:border-indigo-500"
                      placeholder="Detail syarat yang belum dilengkapi jika berstatus Belum Lulus"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t">
                    <button
                      id="cancel-modal-form-btn"
                      type="button"
                      onClick={() => {
                        setIsAddingStudent(false);
                        setEditingStudent(null);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      id="submit-modal-form-btn"
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan Data
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Cari NIM atau Nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 pl-8 border border-slate-200 bg-slate-50/50 rounded-xl text-xs w-full focus:outline-none focus:border-indigo-400 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div>
                <select
                  id="filter-prodi-select"
                  value={filterProdi}
                  onChange={(e) => setFilterProdi(e.target.value)}
                  className="p-2 border border-slate-200 bg-slate-50/50 rounded-xl text-xs w-full focus:outline-none text-slate-600 font-medium"
                >
                  <option value="">Semua Program Studi</option>
                  {uniqueProdis.map((p, i) => <option key={i} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <select
                  id="filter-status-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 border border-slate-200 bg-slate-50/50 rounded-xl text-xs w-full focus:outline-none text-slate-600 font-medium"
                >
                  <option value="">Semua Status Kelulusan</option>
                  <option value="Lulus">Memenuhi Syarat (Lulus)</option>
                  <option value="Belum Lulus">Belum Memenuhi Syarat</option>
                </select>
              </div>
            </div>

            {/* Student Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-3">NIM / NIK & Mahasiswa</th>
                    <th className="p-3">Program Studi & Fakultas</th>
                    <th className="p-3">Kelayakan Akademik</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 italic">
                        Tidak ada data mahasiswa ditemukan yang cocok dengan penyaringan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => (
                      <tr key={stu.nim} className="hover:bg-slate-50/30">
                        <td className="p-3">
                          <p className="font-bold text-slate-800">{stu.nama}</p>
                          <p className="text-[10px] text-slate-550 font-mono mt-0.5">NIM {stu.nim} • NIK {stu.nik || '-'}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Lahir: {stu.tempatLahir || '-'}, {stu.tanggalLahir || '-'}</p>
                          {(stu.ktpDoc || stu.ijazahSmaDoc) && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {stu.ktpDoc?.fileData && (
                                <a
                                  href={stu.ktpDoc.fileData}
                                  download={stu.ktpDoc.fileName || `KTP_${stu.nim}.pdf`}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded hover:bg-indigo-100 border border-indigo-155 transition-colors cursor-pointer"
                                  title={`Preview / Unduh KTP: ${stu.ktpDoc.fileName}`}
                                  target="_blank"
                                  onClick={(e) => {
                                    if (stu.ktpDoc?.fileData) {
                                      e.preventDefault();
                                      openFilePreview(stu.ktpDoc.fileData, stu.ktpDoc.fileName || 'KTP.pdf');
                                    }
                                  }}
                                >
                                  👁️ Preview KTP
                                </a>
                              )}
                              {stu.ijazahSmaDoc?.fileData && (
                                <a
                                  href={stu.ijazahSmaDoc.fileData}
                                  download={stu.ijazahSmaDoc.fileName || `Ijazah_SMA_${stu.nim}.pdf`}
                                  className="inline-flex items-center gap-0.5 text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded hover:bg-teal-100 border border-teal-155 transition-colors cursor-pointer"
                                  title={`Preview / Unduh Ijazah SMA: ${stu.ijazahSmaDoc.fileName}`}
                                  target="_blank"
                                  onClick={(e) => {
                                    if (stu.ijazahSmaDoc?.fileData) {
                                      e.preventDefault();
                                      openFilePreview(stu.ijazahSmaDoc.fileData, stu.ijazahSmaDoc.fileName || 'Ijazah_SMA.pdf');
                                    }
                                  }}
                                >
                                  👁️ Preview Ijazah SMA
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-3 leading-relaxed">
                          <p>{stu.programStudi}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{stu.fakultas}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider inline-block ${
                              stu.statusKelulusan === 'Lulus' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {stu.statusKelulusan === 'Lulus' ? 'Lulus' : 'Belum Lulus'}
                            </span>
                            
                            {/* Verification & Academic Approval Status */}
                            {stu.dataVerified ? (
                              <div className="space-y-1">
                                {stu.academicApproved ? (
                                  <span className="px-1.5 py-0.5 text-[9px] text-emerald-750 bg-emerald-50/50 border border-emerald-200 rounded font-extrabold whitespace-nowrap block text-center uppercase tracking-wider">
                                    ✓ Langkah 1 sudah ACC
                                  </span>
                                ) : (
                                  <>
                                    <span className="px-1.5 py-0.5 text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-200 rounded font-semibold whitespace-nowrap block text-center">
                                      ✓ Sudah Submit
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded font-bold whitespace-nowrap block text-center animate-pulse">
                                      ⏳ Butuh Acc Lgkh 1
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] text-slate-400 bg-slate-50 border border-slate-200 rounded font-semibold whitespace-nowrap block text-center">
                                ⏳ Belum Verif (Mhs)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1 whitespace-nowrap">
                          {stu.dataVerified && !stu.academicApproved && (
                            <button
                              onClick={() => handleApproveStudentAcademic(stu.nim, true)}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 hover:shadow text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                              title="Sahkan / Setujui Data & Dokumen Langkah 1"
                            >
                              Sahkan Langkah 1
                            </button>
                          )}
                          <button
                            id={`edit-stu-btn-${stu.nim}`}
                            onClick={() => handleStartEdit(stu)}
                            className="p-1 px-2 hover:bg-indigo-50 hover:text-indigo-700 border border-transparent hover:border-indigo-150 rounded text-[10px] font-bold text-slate-500 transition-all cursor-pointer inline-block"
                            title="Edit data mahasiswa"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-stu-btn-${stu.nim}`}
                            onClick={() => handleDeleteStudent(stu.nim)}
                            className="p-1 px-2 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-150 rounded text-[10px] font-bold text-slate-400 transition-all cursor-pointer inline-block"
                            title="Hapus mahasiswa"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <p>Menampilkan {filteredStudents.length} dari {state.students.length} record</p>
              <p>Basis Data Akademik Terenkripsi Aman</p>
            </div>
          </div>

        </div>
      )}

      {/* REJECTION REASON MODAL OVERLAY */}
      {rejectingNim && (() => {
        const targetStudent = state.students.find(s => s.nim === rejectingNim);
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-750">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-in">
              <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">
                    Tolak Kelayakan Akademik
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectingNim(null)}
                  className="p-1 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 space-y-4 text-left">
                <div>
                  <p className="text-xs text-slate-500 font-semibold leading-normal">
                    Anda menolak kelayakan dokumen/data Langkah 1 untuk mahasiswa:
                  </p>
                  <p className="text-sm font-extrabold text-slate-800 mt-1">
                    {targetStudent?.nama || 'N/A'} <span className="font-mono text-xs font-bold text-slate-500">({targetStudent?.nim})</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {targetStudent?.programStudi} • {targetStudent?.fakultas}
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Alasan Penolakan / Catatan Perbaikan <strong className="text-rose-500">*</strong>
                  </label>
                  <textarea
                    rows={4}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Contoh: Lampiran berkas Ijazah SMA buram atau tidak terbaca. Harap lakukan upload ulang."
                    className="w-full text-xs font-semibold p-3 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 placeholder-slate-400 text-slate-700 bg-white shadow-inner"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 font-medium leading-normal">
                    Alasan ini akan langsung tampil di panel mahasiswa agar mereka dapat segera memperbaiki/mengunggah ulang dokumen yang ditolak.
                  </p>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingNim(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={submitRejection}
                  disabled={!rejectionReasonInput.trim()}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                    rejectionReasonInput.trim()
                      ? 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow hover:scale-[1.01]'
                      : 'bg-slate-200 text-slate-400 border border-slate-250 cursor-not-allowed'
                  }`}
                >
                  <X className="w-3.5 h-3.5 text-white" /> Tolak & Minta Perbaikan
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 1. CUSTOM MODAL CONFIRMATION: DELETE STUDENT */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-750">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />
                <h3 className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">
                  Hapus Data Mahasiswa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="p-1 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-left">
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Apakah Anda yakin ingin menghapus mahasiswa berikut dari database akademik?
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-extrabold text-slate-800 text-sm">{deletingStudent.nama}</p>
                <p className="text-[10px] text-slate-550 font-bold">
                  NIM: <span className="font-mono bg-white px-1 py-0.2 border rounded">{deletingStudent.nim}</span>
                </p>
                <p className="text-[10px] text-slate-550 font-bold">
                  Program Studi: <span className="text-slate-700 bg-white px-1 py-0.2 border rounded">{deletingStudent.programStudi}</span>
                </p>
              </div>
              <p className="text-[10.5px] text-rose-600 leading-normal font-bold">
                * Tindakan ini bersifat permanen dan juga akan menghapus seluruh data pendaftaran yudisium & wisuda yang berkaitan jika ada.
              </p>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOM MODAL CONFIRMATION: KOSONGKAN DATABASE */}
      {isConfirmingClearAll && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-750">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-scale-in">
            <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 animate-bounce" />
                <h3 className="font-extrabold text-xs text-rose-955 uppercase tracking-wider">
                  Kosongkan Seluruh Database
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(false)}
                className="p-1 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-left">
              <p className="text-xs text-rose-950 leading-relaxed font-extrabold bg-rose-50 border border-rose-100 p-3 rounded-lg">
                ⚠️ TINDAKAN SANGAT SENSITIF!
              </p>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Apakah Anda yakin ingin menghapus <strong>seluruh data mahasiswa ({state.students.length} record)</strong> beserta semua riwayat dokumen, yudisium, dan wisuda dari sistem?
              </p>
              <p className="text-[10px] text-rose-600 leading-normal font-bold">
                * Data tidak akan dapat dikembalikan lagi setelah dihapus. Hubungi tim teknis jika ini adalah kesalahan.
              </p>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsConfirmingClearAll(false)}
                className="px-4 py-2 rounded-xl text-slate-650 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-5 py-2 rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm cursor-pointer"
              >
                Ya, Kosongkan Semua
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
