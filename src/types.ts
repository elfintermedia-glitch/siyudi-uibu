export interface StudentAcademic {
  nim: string;
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  fakultas: string;
  programStudi: string;
  statusKelulusan: 'Lulus' | 'Belum Lulus';
  keterangan?: string;
  email?: string;
  noHp?: string;
  dataVerified?: boolean;
  academicApproved?: boolean;
  academicRejected?: boolean;
  academicRejectionReason?: string;
  ktpDoc?: DocumentUpload;
  ijazahSmaDoc?: DocumentUpload;
}

export type RegistrationStatus = 'belum_daftar' | 'diajukan' | 'diproses' | 'disetujui' | 'ditolak';

export interface DocumentUpload {
  id: string; // 'transkrip' | 'toefl' | 'bebas_pustaka' | 'skripsi' | 'bebas_spp'
  name: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string; // base64 or placeholder
  status: 'pending' | 'disetujui' | 'ditolak';
  notes?: string;
}

export interface YudisiumRegistration {
  nim: string;
  judulSkripsi: string;
  pembimbing1: string;
  pembimbing2: string;
  tanggalLulus: string;
  registeredAt: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  documents: DocumentUpload[];
}

export interface WisudaRegistration {
  nim: string;
  ukuranToga: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  namaAyah: string;
  namaIbu: string;
  noHpOrtu: string;
  alamatPengiriman: string;
  registeredAt: string;
  status: RegistrationStatus;
  rejectionReason?: string;
}

export interface AdminUser {
  id: string;
  nama: string;
  username: string;
  password?: string;
  role: 'superadmin' | 'akademik' | 'keuangan';
}

export interface SystemState {
  students: StudentAcademic[];
  yudisiumApps: Record<string, YudisiumRegistration>; // key is NIM
  wisudaApps: Record<string, WisudaRegistration>; // key is NIM
  adminUsers?: AdminUser[];
}
