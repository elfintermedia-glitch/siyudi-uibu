import React, { useState } from 'react';
import { 
  Search, Filter, GraduationCap, CheckCircle, XCircle, 
  Clock, AlertCircle, FileText, User, Mail, Phone, BookOpen, 
  MapPin, Calendar, Award
} from 'lucide-react';
import { StudentAcademic, SystemState } from '../types';

interface ProdiPanelProps {
  state: SystemState;
  onUpdateStudents: (updatedStudents: StudentAcademic[]) => void;
  currentAdminUsername: string;
  currentAdminProdi?: string;
  logActivity?: (activity: string) => void;
}

export default function ProdiPanel({ state, onUpdateStudents, currentAdminUsername, currentAdminProdi, logActivity }: ProdiPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProdi, setSelectedProdi] = useState(currentAdminProdi || 'Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  
  React.useEffect(() => {
    if (currentAdminProdi) {
      setSelectedProdi(currentAdminProdi);
    }
  }, [currentAdminProdi]);
  
  // Detail Student View Modal
  const [viewingStudent, setViewingStudent] = useState<StudentAcademic | null>(null);

  // Filter students
  const visibleStudents = currentAdminProdi ? state.students.filter(s => s.programStudi === currentAdminProdi) : state.students;

  const availableProdiList = Array.from(new Set(visibleStudents.map(s => s.programStudi).filter(Boolean)));

  const filteredStudents = visibleStudents.filter(s => {
    const matchesSearch = 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.nim.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProdi = selectedProdi === 'Semua' || s.programStudi === selectedProdi;
    const matchesStatus = selectedStatus === 'Semua' || s.statusKelulusan === selectedStatus;
    
    return matchesSearch && matchesProdi && matchesStatus;
  });

  // Calculate statistics
  const totalStudents = visibleStudents.length;
  const graduatedCount = visibleStudents.filter(s => s.statusKelulusan === 'Lulus').length;
  const pendingGradCount = totalStudents - graduatedCount;
  const graduationRate = totalStudents > 0 ? Math.round((graduatedCount / totalStudents) * 100) : 0;



  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* 1. Header Banner & Info */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-850 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-indigo-650 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-bold tracking-wider uppercase">
            🎓 Hak Akses Portal Program Studi
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight leading-none">
            Audit Kelayakan & Kelulusan Mahasiswa
          </h2>
          <p className="text-xs md:text-sm text-indigo-150 leading-relaxed">
            Selamat datang, <strong className="text-white">{currentAdminUsername}</strong>. Anda berwenang merumuskan status kelayakan SKS, memeriksa progres skripsi, dan menetapkan status kelulusan akademik mahasiswa.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 self-stretch md:self-auto flex md:flex-col justify-around gap-4 text-center min-w-[200px]">
          <div>
            <span className="block text-2xl font-black text-indigo-300 tracking-tight leading-none">
              {graduationRate}%
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-100">
              Rasio Kelulusan
            </span>
          </div>
          <div className="h-px bg-white/10 hidden md:block" />
          <div>
            <span className="block text-lg font-bold text-white tracking-tight leading-none">
              {graduatedCount} / {totalStudents}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-100">
              Mahasiswa Lulus
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Mahasiswa</span>
            <span className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
              <User className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totalStudents}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Siswa terdaftar di basis data</p>
          </div>
        </div>

        {/* Graduated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Lulus</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{graduatedCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Bisa masuk & registrasi Yudisium</p>
          </div>
        </div>

        {/* Belum Lulus */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Belum Lulus</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-amber-600 tracking-tight">{pendingGradCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Gerbang login ditangguhkan</p>
          </div>
        </div>

        {/* Active Prodi Counts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Program Studi</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-indigo-600 tracking-tight">{availableProdiList.length}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Penjurusan aktif terdaftar</p>
          </div>
        </div>

      </div>

      {/* 3. Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          Filter & Pencarian Instan
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari NIM atau Nama Mahasiswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all font-sans placeholder-slate-400"
            />
          </div>

          {/* Program Studi filter */}
          <div>
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              disabled={!!currentAdminProdi}
              className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all ${currentAdminProdi ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {!currentAdminProdi && <option value="Semua">Semua Program Studi</option>}
              {currentAdminProdi && !availableProdiList.includes(currentAdminProdi) && (
                <option value={currentAdminProdi}>{currentAdminProdi}</option>
              )}
              {availableProdiList.map(prodi => (
                <option key={prodi} value={prodi}>{prodi}</option>
              ))}
            </select>
          </div>

          {/* Graduation status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
            >
              <option value="Semua">Semua Status Kelulusan</option>
              <option value="Lulus">Lulus</option>
              <option value="Belum Lulus">Belum Lulus</option>
            </select>
          </div>

        </div>
      </div>

      {/* 4. Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Daftar Mahasiswa & Kelayakan Studi</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Menampilkan {filteredStudents.length} dari {totalStudents} total data</p>
          </div>
          {searchTerm || selectedProdi !== 'Semua' || selectedStatus !== 'Semua' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProdi('Semua');
                setSelectedStatus('Semua');
              }}
              className="text-xs text-indigo-650 hover:text-indigo-850 font-bold"
            >
              🔄 Bersihkan Filter
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto overflow-y-auto relative" style={{ maxHeight: '480px' }}>
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm">
              <tr className="text-slate-500 text-[11px] font-bold uppercase border-b border-slate-150">
                <th className="py-4 px-6">Identitas Mahasiswa</th>
                <th className="py-4 px-4">Program Studi / Fakultas</th>
                <th className="py-4 px-4 text-center">Status Kelulusan</th>
                <th className="py-4 px-6 text-right">Opsi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-6 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-10 h-10 text-slate-350" />
                      <p className="text-sm font-bold text-slate-500">Tidak ada data mahasiswa ditemukan</p>
                      <p className="text-xs">Coba sesuaikan pencarian atau filter yang Anda gunakan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isGrad = student.statusKelulusan === 'Lulus';
                  return (
                    <tr key={student.nim} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & NIM */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold font-mono text-xs shadow-inner">
                            {student.nama.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800 leading-tight">{student.nama}</span>
                            <span className="text-xs font-mono text-slate-500 leading-tight">NIM: {student.nim}</span>
                          </div>
                        </div>
                      </td>

                      {/* Course / Faculty */}
                      <td className="py-4 px-4">
                        <span className="block font-medium text-slate-700 leading-tight">{student.programStudi}</span>
                        <span className="text-[11px] text-slate-400 leading-tight">{student.fakultas}</span>
                      </td>

                      {/* Graduation Status Pill */}
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold leading-none ${
                          isGrad 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isGrad ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {student.statusKelulusan}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="px-2.5 py-1.5 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg transition-all"
                          title="Lihat Detail Profil Lengkap"
                        >
                          👁️ Detail
                        </button>
                        <button
                          onClick={() => {
                            const newStatus: 'Lulus' | 'Belum Lulus' = student.statusKelulusan === 'Belum Lulus' ? 'Lulus' : 'Belum Lulus';
                            const updated = state.students.map(s => {
                              if (s.nim === student.nim) {
                                return { ...s, statusKelulusan: newStatus };
                              }
                              return s;
                            });
                            onUpdateStudents(updated);
                            logActivity?.(`${newStatus === 'Lulus' ? 'Mengesahkan kelulusan' : 'Membatalkan kelulusan'} mahasiswa: ${student.nim}`);
                          }}
                          className={`px-3 py-1.5 font-bold text-xs rounded-lg border transition-all cursor-pointer ${
                            student.statusKelulusan === 'Lulus'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-100'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'
                          }`}
                        >
                          {student.statusKelulusan === 'Lulus' ? '❌ Batal Kelulusan' : '✅ Set Kelulusan'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* 6. MODAL: DETAILED PROFILE VIEW */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-150 max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-tight">Detail Lengkap Mahasiswa</h3>
                  <p className="text-xs text-slate-400">Arsip data pribadi & riwayat administrasi yudisium</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingStudent(null)}
                className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Header profile */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                <div className="w-14 h-14 rounded-2xl bg-indigo-750 text-white text-lg font-black flex items-center justify-center">
                  {viewingStudent.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg leading-tight">{viewingStudent.nama}</h4>
                  <p className="text-xs font-mono text-indigo-600 block leading-tight">NIM: {viewingStudent.nim}</p>
                  <p className="text-[11px] text-slate-400 block mt-0.5 leading-tight">{viewingStudent.programStudi} • {viewingStudent.fakultas}</p>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Informasi Personal Mahasiswa</h5>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* NIK */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-medium">Nomor Induk Kependudukan (NIK)</span>
                    <span className="block font-semibold text-slate-700 text-xs font-mono">{viewingStudent.nik || '-'}</span>
                  </div>

                  {/* TTL */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-medium">Tempat, Tanggal Lahir</span>
                    <span className="block font-semibold text-slate-700 text-xs">
                      {viewingStudent.tempatLahir ? `${viewingStudent.tempatLahir}, ` : ''} 
                      {viewingStudent.tanggalLahir || '-'}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" /> Email Akademik
                    </span>
                    <span className="block font-semibold text-slate-700 text-xs select-text">{viewingStudent.email || '-'}</span>
                  </div>

                  {/* Phone */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" /> Telepon / WA
                    </span>
                    <span className="block font-semibold text-slate-700 text-xs font-mono select-text">{viewingStudent.noHp || '-'}</span>
                  </div>

                </div>
              </div>

              {/* Status and Notes */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status & Penilaian Program Studi</h5>
                <div className="p-4 rounded-xl border space-y-3 bg-slate-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Status Kelulusan</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      viewingStudent.statusKelulusan === 'Lulus' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {viewingStudent.statusKelulusan === 'Lulus' ? 'Lulus' : 'Belum Lulus'}
                    </span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div>
                    <span className="block text-[10px] text-slate-400 mb-1 font-medium">Catatan Kelulusan Akademik:</span>
                    <p className="text-xs text-slate-700 italic select-text">
                      {viewingStudent.keterangan || '"Belum ada catatan kelulusan tersemat."'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl transition-all"
              >
                Tutup Detail
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
