import React, { useState, useEffect } from 'react';
import { 
  User, GraduationCap, CheckCircle2, CheckCircle, AlertTriangle, FileText, Upload, 
  Trash2, Send, HelpCircle, Check, MapPin, Sparkles, BookOpen, Clock, FileWarning, X
} from 'lucide-react';
import { StudentAcademic, YudisiumRegistration, WisudaRegistration, DocumentUpload, RegistrationStatus } from '../types';
import { REQUIRED_DOC_TEMPLATES } from '../utils/dummyData';
import { ALLOWED_PROGRAM_STUDI } from './ExcelImporter';
import { INDONESIAN_CITIES } from './AdminPanel';
import { openFilePreview } from '../utils/filePreview';

interface StudentPanelProps {
  student: StudentAcademic;
  yudisium: YudisiumRegistration | undefined;
  wisuda: WisudaRegistration | undefined;
  onRegisterYudisium: (nim: string, formData: any, docs: DocumentUpload[]) => void;
  onRegisterWisuda: (nim: string, formData: any) => void;
  onLogout: () => void;
  onUpdateStudentProfile: (updatedStudent: StudentAcademic) => void;
  allStudents?: StudentAcademic[];
}

export default function StudentPanel({ 
  student, 
  yudisium, 
  wisuda, 
  onRegisterYudisium, 
  onRegisterWisuda, 
  onLogout,
  onUpdateStudentProfile,
  allStudents = []
}: StudentPanelProps) {
  
  // Student profile edit states
  const [editNik, setEditNik] = useState(student.nik || '');
  const [editNama, setEditNama] = useState(student.nama || '');
  const [editTempatLahir, setEditTempatLahir] = useState(student.tempatLahir || '');
  const [editTanggalLahir, setEditTanggalLahir] = useState(student.tanggalLahir || '');
  const [editFakultas, setEditFakultas] = useState(student.fakultas || 'Fakultas Keguruan dan Ilmu Pendidikan');
  const [editProdi, setEditProdi] = useState(student.programStudi || 'Pendidikan Matematika');
  const [editEmail, setEditEmail] = useState(student.email || '');
  const [editNoHp, setEditNoHp] = useState(student.noHp || '');
  const [ktpDoc, setKtpDoc] = useState<DocumentUpload | undefined>(student.ktpDoc);
  const [ijazahSmaDoc, setIjazahSmaDoc] = useState<DocumentUpload | undefined>(student.ijazahSmaDoc);

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setEditNik(student.nik || '');
    setEditNama(student.nama || '');
    setEditTempatLahir(student.tempatLahir || '');
    setEditTanggalLahir(student.tanggalLahir || '');
    setEditFakultas(student.fakultas || 'Fakultas Keguruan dan Ilmu Pendidikan');
    setEditProdi(student.programStudi || 'Pendidikan Matematika');
    setEditEmail(student.email || '');
    setEditNoHp(student.noHp || '');
    setKtpDoc(student.ktpDoc);
    setIjazahSmaDoc(student.ijazahSmaDoc);
  }, [student]);

  useEffect(() => {
    if (ktpDoc?.fileData && ijazahSmaDoc?.fileData) {
      setAcademicError(null);
    }
  }, [ktpDoc, ijazahSmaDoc]);

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file format: pdf or jpg/jpeg
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'jpg' && fileExt !== 'jpeg') {
      alert('Format file tidak didukung! Hanya file berformat PDF atau JPG/JPEG yang diizinkan.');
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setKtpDoc({
        id: 'ktp',
        name: 'Kartu Tanda Penduduk (KTP)',
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileData: dataUrl,
        status: 'pending'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleIjazahSmaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file format: pdf or jpg/jpeg
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'jpg' && fileExt !== 'jpeg') {
      alert('Format file tidak didukung! Hanya file berformat PDF atau JPG/JPEG yang diizinkan.');
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setIjazahSmaDoc({
        id: 'ijazah_sma',
        name: 'Ijazah SMA / Sederajat',
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileData: dataUrl,
        status: 'pending'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveKtp = () => {
    setKtpDoc(undefined);
  };

  const handleRemoveIjazahSma = () => {
    setIjazahSmaDoc(undefined);
  };

  const handleProdiChange = (val: string) => {
    setEditProdi(val);
    const isTeknik = val.startsWith('Teknik');
    const isMagister = val.startsWith('Magister');
    let computedFakultas = 'Fakultas Keguruan dan Ilmu Pendidikan';
    if (isTeknik) computedFakultas = 'Fakultas Teknik';
    else if (isMagister) computedFakultas = 'Pascasarjana';
    setEditFakultas(computedFakultas);
  };

  const handleApproveAcademicData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNik.trim() || !editNama.trim() || !editTempatLahir.trim() || !editTanggalLahir.trim() || !editEmail.trim() || !editNoHp.trim()) {
      const msg = 'NIK, Nama Lengkap, Tempat Lahir, Tanggal Lahir, Email, dan No HP wajib diisi!';
      setAcademicError(msg);
      alert(msg);
      return;
    }

    const nikClean = editNik.trim();
    if (!/^\d+$/.test(nikClean)) {
      const msg = 'Format NIK tidak valid! NIK harus berupa angka saja (tidak boleh mengandung huruf atau karakter spesial).';
      setAcademicError(msg);
      alert(msg);
      return;
    }

    if (nikClean.length !== 16) {
      const msg = `Format NIK tidak valid! NIK harus terdiri dari tepat 16 digit angka (saat ini Anda memasukkan ${nikClean.length} digit).`;
      setAcademicError(msg);
      alert(msg);
      return;
    }

    // Periksa apakah NIK sudah dipakai oleh mahasiswa lain
    const isNikDuplicate = allStudents.some(s => s.nim !== student.nim && s.nik === editNik.trim());
    if (isNikDuplicate) {
      const msg = `Gagal menyimpan: NIK "${editNik.trim()}" sudah terpakai oleh mahasiswa lain!`;
      setAcademicError(msg);
      alert(msg);
      return;
    }

    if ((!ktpDoc || !ktpDoc.fileData) && (!ijazahSmaDoc || !ijazahSmaDoc.fileData)) {
      const msg = 'Anda belum mengunggah berkas KTP dan Ijazah SMA! Kedua dokumen wajib ini harus diunggah untuk mengunci data akademik.';
      setAcademicError(msg);
      alert(msg);
      return;
    }

    if (!ktpDoc || !ktpDoc.fileData) {
      const msg = 'Anda belum mengunggah berkas KTP! Dokumen ini wajib diunggah untuk mengunci data akademik.';
      setAcademicError(msg);
      alert(msg);
      return;
    }

    if (!ijazahSmaDoc || !ijazahSmaDoc.fileData) {
      const msg = 'Anda belum mengunggah berkas Ijazah SMA! Dokumen ini wajib diunggah untuk mengunci data akademik.';
      setAcademicError(msg);
      alert(msg);
      return;
    }

    setAcademicError(null);
    const updatedStudent: StudentAcademic = {
      ...student,
      nik: editNik,
      nama: editNama,
      tempatLahir: editTempatLahir,
      tanggalLahir: editTanggalLahir,
      fakultas: editFakultas,
      programStudi: editProdi,
      email: editEmail,
      noHp: editNoHp,
      statusKelulusan: student.statusKelulusan || 'Lulus',
      keterangan: student.keterangan || 'Memenuhi syarat kelulusan',
      ktpDoc: ktpDoc ? { ...ktpDoc, status: ktpDoc.status === 'ditolak' ? 'pending' : ktpDoc.status } : undefined,
      ijazahSmaDoc: ijazahSmaDoc ? { ...ijazahSmaDoc, status: ijazahSmaDoc.status === 'ditolak' ? 'pending' : ijazahSmaDoc.status } : undefined,
      dataVerified: true,
      academicRejected: false,
      academicRejectionReason: undefined
    };

    onUpdateStudentProfile(updatedStudent);
    setSuccessMsg("Data akademik Anda berhasil diverifikasi dan disetujui! Alur pendaftaran Yudisium kini terbuka.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Yudisium form fields
  const [judulSkripsi, setJudulSkripsi] = useState(yudisium?.judulSkripsi || '');
  const [pembimbing1, setPembimbing1] = useState(yudisium?.pembimbing1 || '');
  const [pembimbing2, setPembimbing2] = useState(yudisium?.pembimbing2 || '');
  const [tanggalLulus, setTanggalLulus] = useState(yudisium?.tanggalLulus || '');
  
  // Document uploads matching templates
  const [uploadedDocs, setUploadedDocs] = useState<DocumentUpload[]>(() => {
    if (yudisium?.documents) {
      return [...yudisium.documents];
    }
    return REQUIRED_DOC_TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      status: 'pending' as const
    }));
  });

  // Wisuda form fields
  const [ukuranToga, setUkuranToga] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>(wisuda?.ukuranToga || 'L');
  const [namaAyah, setNamaAyah] = useState(wisuda?.namaAyah || '');
  const [namaIbu, setNamaIbu] = useState(wisuda?.namaIbu || '');
  const [noHpOrtu, setNoHpOrtu] = useState(wisuda?.noHpOrtu || '');
  const [alamatPengiriman, setAlamatPengiriman] = useState(wisuda?.alamatPengiriman || '');

  // Local notifications/errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittingYudisium, setSubmittingYudisium] = useState(false);
  const [submittingWisuda, setSubmittingWisuda] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [academicError, setAcademicError] = useState<string | null>(null);

  // File Upload Helper
  const handleFileUpload = (docId: string, file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'pdf' && fileExt !== 'jpg' && fileExt !== 'jpeg') {
      alert('Format file tidak didukung! Hanya file berformat PDF atau JPG/JPEG yang diizinkan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      setUploadedDocs(prev => prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(0)} KB`,
            fileData: dataUrl,
            status: 'pending', // reset to pending on reupload or new upload
            notes: undefined
          };
        }
        return doc;
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedDocs(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          id: doc.id,
          name: doc.name,
          status: 'pending'
        };
      }
      return doc;
    }));
  };

  const validateYudisium = () => {
    return true;
  };

  const handleYudisiumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYudisium()) return;

    setSubmittingYudisium(true);
    setTimeout(() => {
      onRegisterYudisium(student.nim, {
        judulSkripsi: judulSkripsi || '-',
        pembimbing1: pembimbing1 || '-',
        pembimbing2: pembimbing2 || '-',
        tanggalLulus: tanggalLulus || '-',
      }, []);
      setSubmittingYudisium(false);
      setSuccessMsg("Pendaftaran Yudisium Anda berhasil diajukan! Admin akademik akan segera memproses pengajuan Anda.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const validateWisuda = () => {
    const newErrors: Record<string, string> = {};
    if (!namaAyah.trim()) newErrors.namaAyah = 'Nama Ayah wajib diisi';
    if (!namaIbu.trim()) newErrors.namaIbu = 'Nama Ibu wajib diisi';
    if (!noHpOrtu.trim()) newErrors.noHpOrtu = 'Nomor HP Orang Tua wajib diisi';
    if (!alamatPengiriman.trim()) newErrors.alamatPengiriman = 'Alamat pengiriman undangan/ijazah wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWisudaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateWisuda()) return;

    setSubmittingWisuda(true);
    setTimeout(() => {
      onRegisterWisuda(student.nim, {
        ukuranToga,
        namaAyah,
        namaIbu,
        noHpOrtu,
        alamatPengiriman
      });
      setSubmittingWisuda(false);
      setSuccessMsg("Pendaftaran Wisuda Anda berhasil diajukan ke panitia wisuda!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  // Helper status colorizer
  const getStatusBadge = (status: RegistrationStatus | undefined) => {
    if (!status || status === 'belum_daftar') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-150 text-slate-600 border border-slate-200">Belum Daftar</span>;
    }
    if (status === 'diajukan') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">Diajukan</span>;
    }
    if (status === 'diproses') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1">Diproses <Clock className="w-3 h-3 animate-spin" /></span>;
    }
    if (status === 'disetujui') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Disetujui</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-10 border-rose-100"><AlertTriangle className="w-3 h-3" /> Ditolak / Perbaikan</span>;
  };

  return (
    <div className="space-y-6">
      {/* Upper Status Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl relative flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-emerald-950">Aksi Berhasil</h4>
            <p className="text-xs mt-0.5">{successMsg}</p>
          </div>
          <button 
            id="close-success-msg-btn"
            onClick={() => setSuccessMsg(null)} 
            className="absolute top-3 right-3 text-emerald-500 hover:text-emerald-700 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">{student.nama}</h1>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${
                  student.statusKelulusan === 'Lulus' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {student.statusKelulusan === 'Lulus' ? 'Memenuhi Syarat' : 'Belum Memenuhi Syarat'}
                </span>
                {student.dataVerified ? (
                  student.academicRejected ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
                      <X className="w-3 h-3 text-rose-600" /> REVISI LANGKAH 1
                    </span>
                  ) : student.academicApproved ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1 animate-pulse">
                      ⏳ Menunggu Acc
                    </span>
                  )
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
                    Belum Verifikasi Data
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono mt-1 leading-relaxed">
                NIM: {student.nim} • NIK: {student.nik || '-'} <br className="sm:hidden" />
                • TTL: {student.tempatLahir || '-'}, {student.tanggalLahir || '-'} <br className="sm:hidden" />
                • {student.programStudi} ({student.fakultas})
              </p>
              {student.dataVerified && (student.ktpDoc || student.ijazahSmaDoc) && (
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">
                  {student.ktpDoc && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] ${
                      student.ktpDoc.status === 'disetujui'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : student.ktpDoc.status === 'ditolak'
                          ? 'bg-rose-50 text-rose-800 border-rose-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100/75'
                    }`}>
                      <FileText className="w-3 h-3 text-indigo-600" /> KTP {student.ktpDoc.status === 'disetujui' ? '(ACC)' : student.ktpDoc.status === 'ditolak' ? '(DITOLAK)' : '(Terunggah)'}
                    </span>
                  )}
                  {student.ijazahSmaDoc && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] ${
                      student.ijazahSmaDoc.status === 'disetujui'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : student.ijazahSmaDoc.status === 'ditolak'
                          ? 'bg-rose-50 text-rose-800 border-rose-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100/75'
                    }`}>
                      <FileText className="w-3 h-3 text-indigo-600" /> Ijazah {student.ijazahSmaDoc.status === 'disetujui' ? '(ACC)' : student.ijazahSmaDoc.status === 'ditolak' ? '(DITOLAK)' : '(Terunggah)'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {student.dataVerified && !student.academicRejected && (!yudisium || yudisium.status === 'belum_daftar' || yudisium.status === 'ditolak') && (
              <button 
                id="edit-academic-profile-btn"
                onClick={() => {
                  const updatedStudent: StudentAcademic = {
                    ...student,
                    dataVerified: false, // Unlock/allow re-editing
                    academicRejected: false, // Clear rejection status on edit
                    academicRejectionReason: undefined // Clear reason
                  };
                  onUpdateStudentProfile(updatedStudent);
                  setSuccessMsg("Kunci data akademik dibuka. Silakan sesuaikan kembali data akademik Anda di bawah ini.");
                }} 
                className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-150 text-xs font-semibold text-amber-700 rounded-lg border border-amber-250 transition-colors cursor-pointer"
              >
                Ubah Data Akademik
              </button>
            )}
            <button 
              id="change-password-student-btn"
              onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError(null);
                setIsChangingPassword(true);
              }} 
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-150 text-xs font-semibold text-indigo-700 rounded-lg border border-indigo-250 transition-colors cursor-pointer flex items-center gap-1"
            >
              🔒 Ubah Password
            </button>
            <button 
              id="logout-btn"
              onClick={onLogout} 
              className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-150 text-xs font-semibold text-gray-600 hover:text-gray-950 rounded-lg border border-gray-250 transition-colors cursor-pointer"
            >
              Keluar Akun
            </button>
          </div>
        </div>
        
        {/* Core academic metrics */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Yudisium</p>
            <div className="mt-0.5">{getStatusBadge(yudisium?.status)}</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Wisuda</p>
            <div className="mt-0.5">{getStatusBadge(wisuda?.status)}</div>
          </div>
        </div>
      </div>

      {/* STEPS PRE-FLOW: Academic Verification Form */}
      {!student.dataVerified || student.academicRejected ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          {student.academicRejected && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-fade-in mb-2">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">Langkah 1 Ditolak & Memerlukan Perbaikan Berkas</h4>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed font-semibold">
                Berkas kelayakan akademik Langkah 1 Anda ditolak oleh admin dengan alasan perbaikan sebagai berikut:
              </p>
              <div className="bg-white p-3 rounded-lg border border-rose-150 text-xs font-semibold font-mono text-rose-900 leading-relaxed shadow-sm">
                {student.academicRejectionReason || "Berkas kurang lengkap / tidak sesuai kriteria akademis."}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                Silakan lakukan revisi data atau unggah ulang dokumen yang ditolak di bawah ini, lalu klik <strong className="text-indigo-600">"Setujui & Kunci Data Akademik"</strong> untuk diajukan kembali kepada admin akademik.
              </p>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Langkah 1: Tinjau & Verifikasi Data Akademik
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Sebelum Anda mendaftarkan Yudisium, Anda diwajibkan untuk memeriksa, melengkapi, dan menyetujui kebenaran seluruh data akademik Anda di bawah ini. Kesalahan data pada bagian ini akan berakibat pada salah cetak dokumen Ijazah & Transkrip Nilai Anda.
              </p>
            </div>
          </div>

          <form onSubmit={handleApproveAcademicData} className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIM */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Nomor Induk Mahasiswa (NIM) <span className="text-slate-400 text-[10px] font-normal">(Tidak Dapat Diubah)</span></label>
                <input
                  type="text"
                  value={student.nim}
                  className="p-2.5 text-xs font-mono font-bold border border-slate-200 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed focus:outline-none"
                  disabled
                />
              </div>

              {/* NIK */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={editNik}
                  onChange={(e) => setEditNik(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="Masukkan 16 digit NIK sesuai KTP"
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800 font-mono"
                  maxLength={16}
                  required
                />
              </div>

              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Nama Lengkap <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Nama lengkap sesuai ijazah sebelumnya"
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                  required
                />
              </div>

              {/* Tempat Lahir */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Tempat Lahir <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  list="indonesia-cities-student"
                  value={editTempatLahir}
                  onChange={(e) => setEditTempatLahir(e.target.value)}
                  placeholder="Contoh: Malang, Surabaya"
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                  required
                />
                <datalist id="indonesia-cities-student">
                  {INDONESIAN_CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>

              {/* Tanggal Lahir */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Tanggal Lahir <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={editTanggalLahir}
                  onChange={(e) => setEditTanggalLahir(e.target.value)}
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800 font-mono"
                  required
                />
              </div>

              {/* Program Studi */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Program Studi / Jurusan <span className="text-rose-500">*</span></label>
                <select
                  value={editProdi}
                  onChange={(e) => handleProdiChange(e.target.value)}
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800 cursor-pointer"
                  required
                >
                  {ALLOWED_PROGRAM_STUDI.map((prodi) => (
                    <option key={prodi} value={prodi}>
                      {prodi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fakultas */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500">Fakultas <span className="text-slate-400 text-[10px] font-normal">(Ditentukan Otomatis)</span></label>
                <input
                  type="text"
                  value={editFakultas}
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-500 rounded-lg focus:outline-none cursor-not-allowed"
                  disabled
                />
              </div>



              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 font-semibold">Alamat Email Kontak <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                  required
                />
              </div>

              {/* No HP */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 font-semibold">Nomor HP / WhatsApp Aktif <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={editNoHp}
                  onChange={(e) => setEditNoHp(e.target.value)}
                  placeholder="Contoh: 08XXXXXXXXXX"
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Lampiran Wajib (KTP & ijazah SMA) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unggah Berkas Persyaratan Wajib <span className="text-rose-500">*</span></h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Format berkas yang diperbolehkan hanya PDF atau JPG saja.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kartu Tanda Penduduk (KTP) */}
                <div className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                  ktpDoc?.fileData ? 'bg-indigo-50/20 border-indigo-150' : 'bg-slate-50/40 border-slate-200'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 leading-snug">Kartu Tanda Penduduk (KTP)</p>
                      {ktpDoc?.fileName ? (
                        <div className="flex items-center gap-1.5 mt-1 min-w-0 flex-wrap">
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
                            {ktpDoc.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({ktpDoc.fileSize})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-semibold block mt-1">Belum diunggah</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2">
                    {ktpDoc?.fileData ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openFilePreview(ktpDoc.fileData, ktpDoc.fileName || 'KTP.pdf')}
                          className="px-2.5 py-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold rounded border border-indigo-200 flex items-center gap-1 cursor-pointer"
                        >
                          👁️ Lihat / Preview
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveKtp}
                          className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold rounded border border-rose-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus Berkas
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-slate-200 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors">
                          <Upload className="w-3 h-3" /> Unggah KTP (.pdf / .jpg)
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={handleKtpUpload}
                            className="absolute inset-0 w-0 h-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ijazah SMA / Sederajat */}
                <div className={`p-4 rounded-xl border transition-colors flex flex-col justify-between gap-3 ${
                  ijazahSmaDoc?.fileData ? 'bg-indigo-50/20 border-indigo-150' : 'bg-slate-50/40 border-slate-200'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 leading-snug">Ijazah SMA / Sederajat</p>
                      {ijazahSmaDoc?.fileName ? (
                        <div className="flex items-center gap-1.5 mt-1 min-w-0 flex-wrap">
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
                            {ijazahSmaDoc.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({ijazahSmaDoc.fileSize})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-semibold block mt-1">Belum diunggah</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-2">
                    {ijazahSmaDoc?.fileData ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openFilePreview(ijazahSmaDoc.fileData, ijazahSmaDoc.fileName || 'Ijazah_SMA.pdf')}
                          className="px-2.5 py-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold rounded border border-indigo-200 flex items-center gap-1 cursor-pointer"
                        >
                          👁️ Lihat / Preview
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveIjazahSma}
                          className="px-2.5 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[10px] font-bold rounded border border-rose-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus Berkas
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-slate-200 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors">
                          <Upload className="w-3 h-3" /> Unggah Ijazah SMA (.pdf / .jpg)
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg"
                            onChange={handleIjazahSmaUpload}
                            className="absolute inset-0 w-0 h-0 opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2.5 mt-2">
              <input
                type="checkbox"
                id="academic-agreement-checkbox"
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                required
              />
              <label htmlFor="academic-agreement-checkbox" className="text-[11px] text-indigo-950 font-medium leading-relaxed cursor-pointer select-none">
                Saya menyatakan dengan sadar bahwa rincian data akademik di atas benar milik saya dan siap dideklarasikan ke SIAKAD resmi guna kelayakan data Yudisium dan cetakan Ijazah Negara.
              </label>
            </div>

            {academicError && (
              <div className="p-3.5 bg-rose-50 border border-rose-150 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs font-semibold mt-3 animate-fade-in shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <p className="font-bold text-rose-950">Gagal Mengunci Data Akademik</p>
                  <p className="text-[11px] text-rose-800 mt-0.5 font-medium">{academicError}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                Setujui & Kunci Data Akademik
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Eligibility Warning Block */}
          {student.statusKelulusan !== 'Lulus' && (
        <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 flex flex-col md:flex-row gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
            <FileWarning className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-base text-rose-950">Aksi Diblokir: Belum Memenuhi Syarat Kelulusan Yudisium</h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              Status Anda di basis data akademik belum dinyatakan lulus ujian skripsi/komprehensif atau belum memenuhi SKS minimum (144 SKS).
              Harap selesaikan seluruh tanggungan akademik Anda dengan jurusan/prodi sebelum mendaftarkan Yudisium.
            </p>
            {student.keterangan && (
              <div className="bg-white/65 p-3 rounded-xl border border-rose-100/50 text-xs font-mono text-rose-900 mt-2">
                <strong>Catatan Bagian Akademik:</strong> {student.keterangan}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Flow: If student status is graduated */}
      {student.statusKelulusan === 'Lulus' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* STEP TRACKER - Left column */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Alur Verifikasi Anda</h3>
              
              <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150">
                {/* Step 1 */}
                <div className="relative">
                  <span className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
                    student.academicApproved 
                      ? 'bg-emerald-500' 
                      : student.academicRejected
                        ? 'bg-rose-500 shadow-sm animate-pulse'
                        : 'bg-amber-500 animate-pulse'
                  }`}>
                    {student.academicApproved ? (
                      <Check className="w-2.5 h-2.5 text-white" />
                    ) : student.academicRejected ? (
                      <X className="w-2.5 h-2.5 text-white" />
                    ) : (
                      <Clock className="w-2.5 h-2.5 text-white" />
                    )}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">1. Kelulusan Akademik</h4>
                    <p className={`text-[10px] font-semibold ${
                      student.academicApproved 
                        ? 'text-emerald-600' 
                        : student.academicRejected
                          ? 'text-rose-600 font-bold'
                          : 'text-amber-600'
                    }`}>
                      {student.academicApproved 
                        ? 'Disetujui Admin (Lulus)' 
                        : student.academicRejected
                          ? '✗ Tolak / Revisi Berkas'
                          : '⏳ Menunggu Persetujuan Admin'}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
                    !student.academicApproved
                      ? 'bg-gray-200 grayscale text-gray-400'
                      : yudisium?.status === 'disetujui' 
                        ? 'bg-emerald-500' 
                        : yudisium?.status === 'diajukan' || yudisium?.status === 'diproses'
                          ? 'bg-blue-500 animate-pulse'
                          : yudisium?.status === 'ditolak'
                            ? 'bg-rose-500'
                            : 'bg-gray-200'
                  }`}>
                    {student.academicApproved && yudisium?.status === 'disetujui' && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">2. Pendaftaran Yudisium</h4>
                    <p className="text-[10px] text-gray-550 leading-normal font-semibold">
                      {!student.academicApproved 
                        ? 'Terkunci (Selesaikan Langkah 1)' 
                        : !yudisium 
                          ? 'Unggah berkas persyaratan.' 
                          : `Status: ${yudisium.status.toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
                    wisuda?.status === 'disetujui' 
                      ? 'bg-emerald-500'
                      : wisuda?.status === 'diajukan'
                        ? 'bg-purple-500'
                        : 'bg-gray-200'
                  }`}>
                    {wisuda?.status === 'disetujui' && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">3. Pendaftaran Wisuda</h4>
                    <p className="text-[10px] text-gray-400 leading-normal font-semibold">
                      {yudisium?.status !== 'disetujui' 
                        ? 'Terkunci. Yudisium belum disetujui.' 
                        : !wisuda || wisuda.status === 'belum_daftar'
                          ? 'Silakan isi formulir wisuda.'
                          : wisuda.status === 'disetujui'
                            ? 'Status: Disetujui'
                            : wisuda.status === 'diajukan' || wisuda.status === 'diproses'
                              ? 'Status: Diajukan'
                              : 'Status: Ditolak / Perbaikan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-2.5 items-start">
              <HelpCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h5 className="font-bold text-xs text-indigo-950">Alur Penyelesaian Ijazah</h5>
                <p className="text-[10px] text-indigo-850 leading-relaxed font-semibold">
                  Semua berkas kelengkapan akan diverifikasi administrasi oleh Biro Akademik Kemahasiswaan. Pendaftaran wisuda hanya dapat dibuka setelah pendaftaran Yudisium Anda berstatus <strong className="text-indigo-900">"DISETUJUI"</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* DYNAMIC FORMS WORKSPACE - Right column (2 columns) */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* STAGE A: YUDISIUM FORM & ATTACHMENT */}
            {!student.academicApproved ? (
              student.academicRejected ? (
                <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6 text-center space-y-4 animate-fade-in">
                  <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm">
                    <X className="w-6 h-6 text-rose-650" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2.5">
                    <h4 className="font-bold text-rose-950 text-xs uppercase tracking-wider">Langkah 1: Kelayakan Akademik Ditolak / Perlu Revisi</h4>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      Berkas kelayakan akademik Langkah 1 Anda ditolak oleh admin karena belum sesuai dengan kriteria kelayakan.
                    </p>
                    <div className="text-left bg-rose-50/75 border border-rose-150 rounded-lg p-3 space-y-1">
                      <p className="text-[11px] font-bold text-rose-950">Catatan Rejeksi Admin:</p>
                      <p className="text-xs text-rose-900 font-mono font-semibold bg-white p-2.5 rounded border border-rose-100 leading-relaxed">
                        {student.academicRejectionReason || "Tidak ada alasan tertulis."}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Silakan klik tombol <strong className="text-amber-700">"Ubah Data Akademik"</strong> di pojok kanan profil atas untuk mengunggah ulang dokumen revisi Anda.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 animate-pulse shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2.5">
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Langkah 2: Pendaftaran Yudisium (Terkunci)</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Formulir Pendaftaran Yudisium ini masih terkunci karena berkas kelayakan akademik Langkah 1 (KTP & ijazah SMA) yang Anda kumpulkan sedang dalam proses peninjauan dan wajib disetujui secara manual oleh <strong className="text-indigo-600">bagian Admin Akademik</strong> terlebih dahulu.
                    </p>
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-50/75 border border-amber-150 rounded-xl text-[10px] text-amber-850 font-bold font-mono shadow-sm mt-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                      Status: Menunggu Persetujuan Admin Akademik
                    </div>
                  </div>
                </div>
              )
            ) : yudisium?.status !== 'disetujui' && (
              <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-5 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
                
                <div>
                  <h3 id="yudisium-header" className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
                    Langkah 2: Kelayakan Keuangan & Verifikasi Yudisium
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Ajuan kelayakan akademik Langkah 1 Anda telah disahkan. Akun Anda telah terdaftar otomatis dalam antrean verifikasi yudisium untuk disetujui ikut yudisium oleh bagian keuangan.
                  </p>
                </div>

                {/* If rejected, show rejection box closely and beautifully */}
                {yudisium?.status === 'ditolak' && yudisium.rejectionReason && (
                  <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-650 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-rose-950">Alasan Penangguhan / Rejection Keuangan:</h4>
                        <p className="text-xs text-rose-800 font-mono mt-1 leading-normal bg-white/70 p-3 rounded-lg border border-rose-100">
                          {yudisium.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informational block - no documents needed */}
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex gap-3 items-center">
                  <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Informasi Berkas Yudisium</p>
                    <p className="text-[11px] text-indigo-900 font-medium leading-relaxed mt-0.5">
                      Dokumen kelengkapan persyaratan fisik tidak perlu diunggah secara mandiri. Silakan langsung datang ke bagian keuangan untuk mendapatkan persetujuan mengikuti yudisium dengan membawa bukti pembayaran yudisium.
                    </p>
                  </div>
                </div>

                {/* Submission Action (Read-only status info) */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-slate-400 font-sans font-semibold text-[11px]">Tidak perlu melakukan pengiriman formulir.</span>
                  {(yudisium?.status === 'diajukan' || yudisium?.status === 'diproses' || !yudisium) ? (
                    <span className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 font-bold text-[10px] font-mono shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Status: Menunggu Verifikasi Keuangan
                    </span>
                  ) : yudisium?.status === 'ditolak' ? (
                    <span className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 font-bold text-[10px] font-mono shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Status: Ditangguhkan Keuangan
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 font-bold text-[10px] font-mono shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Status: Yudisium Disetujui
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STAGE B: WISUDA STATUS CARD (UNLOCKED IF YUDISIUM APPROVED) */}
            {yudisium?.status === 'disetujui' && (
              <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-indigo-600" />
                
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 id="wisuda-header" className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                       <GraduationCap className="w-5 h-5 text-teal-600" />
                       Langkah 3: Pendaftaran Wisuda (Terdaftar Otomatis)
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Selamat, Yudisium Anda disetujui! Akun Anda telah terdaftar otomatis dalam antrean verifikasi wisuda oleh bagian keuangan.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Yudisium Lulus!
                  </span>
                </div>

                {wisuda?.rejectionReason && (
                  <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-650 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-rose-950">Alasan Penangguhan / Rejection Wisuda:</h4>
                        <p className="text-xs text-rose-800 font-mono mt-1 leading-normal bg-white/70 p-3 rounded-lg border border-rose-100">
                          {wisuda.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-teal-50/30 border border-teal-100 rounded-xl flex gap-3 items-center">
                  <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-teal-950">Informasi Berkas Wisuda</p>
                    <p className="text-[11px] text-teal-900 font-medium leading-relaxed mt-0.5">
                      Segala pengisian data pendukung seperti ukuran baju toga, data wisudawan, orang tua, dan alamat pengiriman ijazah/undangan kini dikelola dan diverifikasi langsung secara administratif untuk mempermudah pendaftaran wisuda Anda. Anda tidak perlu mengirim/mengisi formulir manual apa pun.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-slate-400 font-sans font-semibold text-[11px]">Tidak perlu melakukan pengiriman formulir.</span>
                  {(wisuda?.status === 'diajukan' || wisuda?.status === 'diproses' || !wisuda) ? (
                    <span className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 font-bold text-[10px] font-mono shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Status: Menunggu Verifikasi Wisuda Keuangan
                    </span>
                  ) : wisuda?.status === 'ditolak' ? (
                    <span className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 font-bold text-[10px] font-mono shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Status: Ditangguhkan Keuangan
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 inline-flex items-center gap-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 font-bold text-[10px] font-mono shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Status: Wisuda Disetujui (Lolos)
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      )}
        </>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-2 text-indigo-950">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <span className="text-sm font-bold">🔑</span>
                </span>
                <h3 className="font-bold text-sm uppercase tracking-wider">Ubah Password Akun</h3>
              </div>
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
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
              onUpdateStudentProfile({
                ...student,
                password: newPassword
              });
              setSuccessMsg("Password akun Anda berhasil diubah!");
              setIsChangingPassword(false);
            }} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password Baru <span className="text-rose-500">*</span></label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru Anda"
                  className="w-full p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Konfirmasi Password Baru <span className="text-rose-500">*</span></label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru Anda"
                  className="w-full p-2.5 text-xs font-semibold border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none rounded-lg text-slate-800"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-semibold rounded-lg">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
