import { StudentAcademic, YudisiumRegistration, WisudaRegistration, DocumentUpload, AdminUser } from '../types';

export const INITIAL_STUDENTS: StudentAcademic[] = [
  {
    nim: '120140023',
    nik: '3573012345670001',
    nama: 'Budi Santoso',
    tempatLahir: 'Malang',
    tanggalLahir: '2004-05-12',
    fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan',
    programStudi: 'Pendidikan Bahasa Inggris',
    statusKelulusan: 'Belum Lulus',
    keterangan: 'Belum memenuhi syarat kelulusan. Belum sidang ujian skripsi.',
    email: 'budi.santoso@univ.ac.id',
    noHp: '081234567801',
    dataVerified: true,
    academicApproved: false,
    password: 'kebudiutamaan',
    ktpDoc: { id: 'ktp', name: 'Kartu Tanda Penduduk', fileName: 'ktp_budi.pdf', fileSize: '145 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'pending' },
    ijazahSmaDoc: { id: 'ijazah', name: 'Ijazah SMA / Sederajat', fileName: 'ijazah_sma_budi.pdf', fileSize: '390 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'pending' }
  },
  {
    nim: '120140085',
    nik: '3573012345670002',
    nama: 'Siti Rahmawati',
    tempatLahir: 'Blitar',
    tanggalLahir: '2004-08-22',
    fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan',
    programStudi: 'Pendidikan Matematika',
    statusKelulusan: 'Belum Lulus',
    keterangan: 'Belum menyelesaikan revisi skripsi bab 4 & 5.',
    email: 'siti.rahma@univ.ac.id',
    noHp: '081234567802',
    dataVerified: true,
    academicApproved: true,
    password: 'kebudiutamaan',
    ktpDoc: { id: 'ktp', name: 'Kartu Tanda Penduduk', fileName: 'ktp_siti_rahma.pdf', fileSize: '180 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'disetujui' },
    ijazahSmaDoc: { id: 'ijazah', name: 'Ijazah SMA / Sederajat', fileName: 'ijazah_sma_siti.pdf', fileSize: '450 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'disetujui' }
  },
  {
    nim: '120140112',
    nik: '3573012345670003',
    nama: 'Michael Wijaya',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2003-11-04',
    fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan',
    programStudi: 'Pendidikan Ekonomi',
    statusKelulusan: 'Belum Lulus',
    keterangan: 'Belum menyerahkan bebas pustaka perpustakaan.',
    email: 'michael.w@univ.ac.id',
    noHp: '081234567803',
    dataVerified: true,
    academicApproved: true,
    password: 'kebudiutamaan',
    ktpDoc: { id: 'ktp', name: 'Kartu Tanda Penduduk', fileName: 'ktp_michael.pdf', fileSize: '192 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'disetujui' },
    ijazahSmaDoc: { id: 'ijazah', name: 'Ijazah SMA / Sederajat', fileName: 'ijazah_sma_michael.pdf', fileSize: '410 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'disetujui' }
  },
  {
    nim: '120140224',
    nik: '3573012345670004',
    nama: 'Ahmad Fauzi',
    tempatLahir: 'Malang',
    tanggalLahir: '2004-01-31',
    fakultas: 'Fakultas Teknik',
    programStudi: 'Teknik Elektro',
    statusKelulusan: 'Belum Lulus',
    keterangan: 'Belum mencukupi batas minimum 144 SKS (Kurang 12 SKS). Tugas Akhir sedang berjalan.',
    email: 'ahmad.fauzi@univ.ac.id',
    noHp: '0812345567804',
    dataVerified: false,
    academicApproved: false,
    password: 'kebudiutamaan'
  },
  {
    nim: '120140301',
    nik: '3573012345670005',
    nama: 'Diana Putri',
    tempatLahir: 'Pasuruan',
    tanggalLahir: '2004-10-15',
    fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan',
    programStudi: 'Pendidikan Sejarah dan Sosiologi',
    statusKelulusan: 'Belum Lulus',
    keterangan: 'Belum mendaftar yudisium.',
    email: 'diana.putri@univ.ac.id',
    noHp: '081234567805',
    dataVerified: true,
    academicApproved: true,
    password: 'kebudiutamaan',
    ktpDoc: { id: 'ktp', name: 'Kartu Tanda Penduduk', fileName: 'ktp_diana.pdf', fileSize: '175 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'disetujui' },
    ijazahSmaDoc: { id: 'ijazah', name: 'Ijazah SMA / Sederajat', fileName: 'ijazah_sma_diana.pdf', fileSize: '430 KB', fileData: 'data:application/pdf;base64,JVBERi0xLjUKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqMiAwIG9iajw8L1R5cGUvUGFnZXMvS2lkc1szIDAgUl0vQ291bnQgMT4+ZW5kb2JqMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+ZW5kb2JqeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE5IDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDEyMiAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+JXN0YXJ0eHJlZgoxNzMKJSVFT0Y=', status: 'disetujui' }
  }
];

export const REQUIRED_DOC_TEMPLATES = [
  { id: 'transkrip', name: 'Transkrip Nilai Terakhir (TTD Dekan/Kaprodi)' },
  { id: 'toefl', name: 'Sertifikat Kemampuan Bahasa Inggris / TOEFL (Min. 450)' },
  { id: 'bebas_pustaka', name: 'Surat Keterangan Bebas Pinjam Perpustakaan' },
  { id: 'skripsi', name: 'Lembar Pengesahan Skripsi / Tugas Akhir' },
  { id: 'bebas_spp', name: 'Surat Bebas Tunggakan Keuangan (SPP)' },
];

export const INITIAL_YUDISIUMS: Record<string, YudisiumRegistration> = {
  // Siti Rahmawati: Yudisium registered, awaiting document checks (Diproses)
  '120140085': {
    nim: '120140085',
    judulSkripsi: 'Analisis Keamanan Jaringan IoT Menggunakan Enkripsi Ringan Pada Smart Home',
    pembimbing1: 'Prof. Dr. Ir. Suprapto, M.T.',
    pembimbing2: 'Mega Herawati, S.Kom., M.T.',
    tanggalLulus: '2026-05-15',
    registeredAt: '2026-06-01',
    status: 'diproses',
    documents: [
      { id: 'transkrip', name: 'Transkrip Nilai Terakhir (TTD Dekan/Kaprodi)', fileName: 'transkrip_siti_120140085.pdf', fileSize: '482 KB', status: 'disetujui', notes: 'Sesuai dengan transkrip akademik pusat.' },
      { id: 'toefl', name: 'Sertifikat Kemampuan Bahasa Inggris / TOEFL (Min. 450)', fileName: 'toefl_siti_score_490.pdf', fileSize: '210 KB', status: 'pending' },
      { id: 'bebas_pustaka', name: 'Surat Keterangan Bebas Pinjam Perpustakaan', fileName: 'surat_bebas_perpustakaan_siti.pdf', fileSize: '185 KB', status: 'pending' },
      { id: 'skripsi', name: 'Lembar Pengesahan Skripsi / Tugas Akhir', fileName: 'pengesahan_skripsi_siti.pdf', fileSize: '520 KB', status: 'disetujui' },
      { id: 'bebas_spp', name: 'Surat Bebas Tunggakan Keuangan (SPP)', fileName: 'bebas_keuangan_siti.pdf', fileSize: '150 KB', status: 'pending' },
    ]
  },
  // Michael Wijaya: Yudisium approved, is ready for Wisuda
  '120140112': {
    nim: '120140112',
    judulSkripsi: 'Strategi Pemasaran Digital Menggunakan Content Optimization Terhadap Brand Awareness UMKM',
    pembimbing1: 'Drs. Hidayat Noor, M.B.A.',
    pembimbing2: 'Lina Marlina, S.E., M.Si.',
    tanggalLulus: '2026-05-10',
    registeredAt: '2026-05-20',
    status: 'disetujui',
    documents: [
      { id: 'transkrip', name: 'Transkrip Nilai Terakhir (TTD Dekan/Kaprodi)', fileName: 'transkrip_michael_ttd.pdf', fileSize: '450 KB', status: 'disetujui' },
      { id: 'toefl', name: 'Sertifikat Kemampuan Bahasa Inggris / TOEFL (Min. 450)', fileName: 'toefl_score_510.pdf', fileSize: '180 KB', status: 'disetujui' },
      { id: 'bebas_pustaka', name: 'Surat Keterangan Bebas Pinjam Perpustakaan', fileName: 'bebas_pustaka_perpus_michael.pdf', fileSize: '160 KB', status: 'disetujui' },
      { id: 'skripsi', name: 'Lembar Pengesahan Skripsi / Tugas Akhir', fileName: 'pengesahan_skripsi_michael.pdf', fileSize: '580 KB', status: 'disetujui' },
      { id: 'bebas_spp', name: 'Surat Bebas Tunggakan Keuangan (SPP)', fileName: 'surat_bebas_spp_michael.pdf', fileSize: '144 KB', status: 'disetujui' },
    ]
  },
  // Diana Putri: Registrations is rejected due to invalid TOEFL certificate
  '120140301': {
    nim: '120140301',
    judulSkripsi: 'Representasi Gender dalam Iklan Televisi Produk Kebersihan Domestik',
    pembimbing1: 'Dr. Sarah Amalia, M.Si.',
    pembimbing2: 'Eko Prasetyo, S.I.Kom., M.A.',
    tanggalLulus: '2026-05-22',
    registeredAt: '2026-05-29',
    status: 'ditolak',
    rejectionReason: 'Dokumen TOEFL yang diunggah sudah kedaluwarsa (lebih dari 2 tahun). Silakan unggah sertifikat TOEFL yang baru.',
    documents: [
      { id: 'transkrip', name: 'Transkrip Nilai Terakhir (TTD Dekan/Kaprodi)', fileName: 'transkrip_diana_signed.pdf', fileSize: '512 KB', status: 'disetujui' },
      { id: 'toefl', name: 'Sertifikat Kemampuan Bahasa Inggris / TOEFL (Min. 450)', fileName: 'toefl_diana_2023.pdf', fileSize: '320 KB', status: 'ditolak', notes: 'Sertifikat dikeluarkan tahun 2023 (sudah melewati tenggat berlaku 2 tahun). Silakan ganti.' },
      { id: 'bebas_pustaka', name: 'Surat Keterangan Bebas Pinjam Perpustakaan', fileName: 'lib_clear_diana.pdf', fileSize: '112 KB', status: 'disetujui' },
      { id: 'skripsi', name: 'Lembar Pengesahan Skripsi / Tugas Akhir', fileName: 'pengesahan_skripsi_diana.pdf', fileSize: '620 KB', status: 'disetujui' },
      { id: 'bebas_spp', name: 'Surat Bebas Tunggakan Keuangan (SPP)', fileName: 'keuangan_diana.pdf', fileSize: '135 KB', status: 'disetujui' },
    ]
  }
};

export const INITIAL_WISUDAS: Record<string, WisudaRegistration> = {
  // Michael Wijaya: Yudisium approved, registered for Wisuda, currently in process
  '120140112': {
    nim: '120140112',
    ukuranToga: 'XL',
    namaAyah: 'Hendra Wijaya',
    namaIbu: 'Yenny Hartati',
    noHpOrtu: '081398765432',
    alamatPengiriman: 'Jl. Merdeka No. 45, Kecamatan Gambir, Kota Jakarta Pusat',
    registeredAt: '2026-05-25',
    status: 'diajukan'
  }
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'admin_1',
    nama: 'Farhan Maulana (Super Admin)',
    username: 'superadmin',
    password: 'superadmin',
    role: 'superadmin'
  },
  {
    id: 'admin_2',
    nama: 'Budi Santoso (Admin Akademik)',
    username: 'admin',
    password: 'admin',
    role: 'akademik'
  },
  {
    id: 'admin_3',
    nama: 'Slamet Hartono (Admin Keuangan)',
    username: 'keuangan',
    password: 'keuangan',
    role: 'keuangan'
  },
  {
    id: 'admin_4',
    nama: 'Prof. Dr. Sri Wahyuni (Kaprodi)',
    username: 'prodi',
    password: 'prodi',
    role: 'prodi'
  }
];
