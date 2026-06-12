import { pgTable, text, boolean, jsonb, serial } from 'drizzle-orm/pg-core';

export const students = pgTable('students', {
  nim: text('nim').primaryKey(),
  nik: text('nik').notNull(),
  nama: text('nama').notNull(),
  tempatLahir: text('tempat_lahir').notNull(),
  tanggalLahir: text('tanggal_lahir').notNull(),
  fakultas: text('fakultas').notNull(),
  programStudi: text('program_studi').notNull(),
  statusKelulusan: text('status_kelulusan').$type<'Lulus' | 'Belum Lulus'>().notNull(),
  keterangan: text('keterangan'),
  email: text('email'),
  noHp: text('no_hp'),
  dataVerified: boolean('data_verified').default(false),
  academicApproved: boolean('academic_approved').default(false),
  academicRejected: boolean('academic_rejected').default(false),
  academicRejectionReason: text('academic_rejection_reason'),
  ktpDoc: jsonb('ktp_doc'), // Holds DocumentUpload object
  ijazahSmaDoc: jsonb('ijazah_sma_doc'), // Holds DocumentUpload object
});

export const yudisiumRegistrations = pgTable('yudisium_registrations', {
  nim: text('nim').primaryKey().references(() => students.nim, { onDelete: 'cascade' }),
  judulSkripsi: text('judul_skripsi').notNull(),
  pembimbing1: text('pembimbing1').notNull(),
  pembimbing2: text('pembimbing2').notNull(),
  tanggalLulus: text('tanggal_lulus').notNull(),
  registeredAt: text('registered_at').notNull(),
  status: text('status').$type<'belum_daftar' | 'diajukan' | 'diproses' | 'disetujui' | 'ditolak'>().notNull(),
  rejectionReason: text('rejection_reason'),
  documents: jsonb('documents'), // Holds DocumentUpload[]
});

export const wisudaRegistrations = pgTable('wisuda_registrations', {
  nim: text('nim').primaryKey().references(() => students.nim, { onDelete: 'cascade' }),
  ukuranToga: text('ukuran_toga').$type<'S' | 'M' | 'L' | 'XL' | 'XXL'>().notNull(),
  namaAyah: text('nama_ayah').notNull(),
  namaIbu: text('nama_ibu').notNull(),
  noHpOrtu: text('no_hp_ortu').notNull(),
  alamatPengiriman: text('alamat_pengiriman').notNull(),
  registeredAt: text('registered_at').notNull(),
  status: text('status').$type<'belum_daftar' | 'diajukan' | 'diproses' | 'disetujui' | 'ditolak'>().notNull(),
  rejectionReason: text('rejection_reason'),
});

export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey(),
  nama: text('nama').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').$type<'superadmin' | 'akademik' | 'keuangan'>().notNull(),
});
