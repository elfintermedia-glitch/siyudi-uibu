import { mysqlTable, text, boolean, json, varchar } from 'drizzle-orm/mysql-core';

export const students = mysqlTable('students', {
  nim: varchar('nim', { length: 50 }).primaryKey(),
  nik: varchar('nik', { length: 50 }).notNull(),
  nama: varchar('nama', { length: 255 }).notNull(),
  tempatLahir: varchar('tempat_lahir', { length: 255 }).notNull(),
  tanggalLahir: varchar('tanggal_lahir', { length: 50 }).notNull(),
  fakultas: varchar('fakultas', { length: 255 }).notNull(),
  programStudi: varchar('program_studi', { length: 255 }).notNull(),
  statusKelulusan: varchar('status_kelulusan', { length: 55 }).$type<'Lulus' | 'Belum Lulus'>().notNull(),
  keterangan: text('keterangan'),
  email: varchar('email', { length: 255 }),
  noHp: varchar('no_hp', { length: 50 }),
  password: varchar('password', { length: 255 }).default('kebudiutamaan'),
  dataVerified: boolean('data_verified').default(false),
  academicApproved: boolean('academic_approved').default(false),
  academicRejected: boolean('academic_rejected').default(false),
  academicRejectionReason: text('academic_rejection_reason'),
  ktpDoc: json('ktp_doc'), // Holds DocumentUpload object
  ijazahSmaDoc: json('ijazah_sma_doc'), // Holds DocumentUpload object
});

export const yudisiumRegistrations = mysqlTable('yudisium_registrations', {
  nim: varchar('nim', { length: 50 }).primaryKey().references(() => students.nim, { onDelete: 'cascade' }),
  judulSkripsi: text('judul_skripsi').notNull(),
  pembimbing1: varchar('pembimbing1', { length: 255 }).notNull(),
  pembimbing2: varchar('pembimbing2', { length: 255 }).notNull(),
  tanggalLulus: varchar('tanggal_lulus', { length: 50 }).notNull(),
  registeredAt: varchar('registered_at', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).$type<'belum_daftar' | 'diajukan' | 'diproses' | 'disetujui' | 'ditolak'>().notNull(),
  rejectionReason: text('rejection_reason'),
  documents: json('documents'), // Holds DocumentUpload[]
});

export const wisudaRegistrations = mysqlTable('wisuda_registrations', {
  nim: varchar('nim', { length: 50 }).primaryKey().references(() => students.nim, { onDelete: 'cascade' }),
  ukuranToga: varchar('ukuran_toga', { length: 10 }).$type<'S' | 'M' | 'L' | 'XL' | 'XXL'>().notNull(),
  namaAyah: varchar('nama_ayah', { length: 255 }).notNull(),
  namaIbu: varchar('nama_ibu', { length: 255 }).notNull(),
  noHpOrtu: varchar('no_hp_ortu', { length: 50 }).notNull(),
  alamatPengiriman: text('alamat_pengiriman').notNull(),
  registeredAt: varchar('registered_at', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).$type<'belum_daftar' | 'diajukan' | 'diproses' | 'disetujui' | 'ditolak'>().notNull(),
  rejectionReason: text('rejection_reason'),
});

export const adminUsers = mysqlTable('admin_users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nama: varchar('nama', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).$type<'superadmin' | 'akademik' | 'keuangan' | 'prodi'>().notNull(),
  prodi: varchar('prodi', { length: 255 }),
});
