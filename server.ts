import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { notInArray } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import { students, yudisiumRegistrations, wisudaRegistrations, adminUsers } from './src/db/schema.ts';
import { INITIAL_STUDENTS, INITIAL_YUDISIUMS, INITIAL_WISUDAS, INITIAL_ADMIN_USERS } from './src/utils/dummyData.ts';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function seedDatabaseIfEmpty() {
  try {
    const existingAdmins = await db.select().from(adminUsers);
    if (existingAdmins.length === 0) {
      console.log('Database is empty. Seeding initial data...');

      // 1. Seed admin users
      for (const admin of INITIAL_ADMIN_USERS) {
        await db.insert(adminUsers).values({
          id: admin.id,
          nama: admin.nama,
          username: admin.username,
          password: admin.password || 'admin',
          role: admin.role,
        });
      }

      // 2. Seed students
      for (const std of INITIAL_STUDENTS) {
        await db.insert(students).values({
          nim: std.nim,
          nik: std.nik,
          nama: std.nama,
          tempatLahir: std.tempatLahir,
          tanggalLahir: std.tanggalLahir,
          fakultas: std.fakultas,
          programStudi: std.programStudi,
          statusKelulusan: std.statusKelulusan,
          keterangan: std.keterangan || null,
          email: std.email || null,
          noHp: std.noHp || null,
          dataVerified: std.dataVerified || false,
          academicApproved: std.academicApproved || false,
          academicRejected: std.academicRejected || false,
          academicRejectionReason: std.academicRejectionReason || null,
          ktpDoc: std.ktpDoc || null,
          ijazahSmaDoc: std.ijazahSmaDoc || null,
        });
      }

      // 3. Seed yudisium apps
      for (const nim of Object.keys(INITIAL_YUDISIUMS)) {
        const y = INITIAL_YUDISIUMS[nim];
        await db.insert(yudisiumRegistrations).values({
          nim: y.nim,
          judulSkripsi: y.judulSkripsi,
          pembimbing1: y.pembimbing1,
          pembimbing2: y.pembimbing2,
          tanggalLulus: y.tanggalLulus,
          registeredAt: y.registeredAt,
          status: y.status,
          rejectionReason: y.rejectionReason || null,
          documents: y.documents || null,
        });
      }

      // 4. Seed wisuda registrations
      for (const nim of Object.keys(INITIAL_WISUDAS)) {
        const w = INITIAL_WISUDAS[nim];
        await db.insert(wisudaRegistrations).values({
          nim: w.nim,
          ukuranToga: w.ukuranToga,
          namaAyah: w.namaAyah,
          namaIbu: w.namaIbu,
          noHpOrtu: w.noHpOrtu,
          alamatPengiriman: w.alamatPengiriman,
          registeredAt: w.registeredAt,
          status: w.status,
          rejectionReason: w.rejectionReason || null,
        });
      }

      console.log('Database seeded successfully!');
    } else {
      console.log('Database contains existing records. Skipping seed.');
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Run seed
  await seedDatabaseIfEmpty();

  // Middleware
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // API ROUTES
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
  });

  // Check for updates from GitHub
  app.post('/api/git-check', async (req, res) => {
    const { repo, branch } = req.body;
    const targetBranch = branch || 'main';
    const targetRepo = repo || 'elfintermedia-glitch/siyudi-uibu';
    try {
      // Check if git works of if we are inside a repo
      await execPromise('git --version');
      
      try {
        await execPromise(`git remote set-url origin https://github.com/${targetRepo}.git`);
      } catch (_) {
        // If remote doesn't exist, try adding it
        try {
          await execPromise(`git remote add origin https://github.com/${targetRepo}.git`);
        } catch (__) {}
      }

      await execPromise(`git fetch origin ${targetBranch}`);
      
      const localShaRes = await execPromise(`git rev-parse --short HEAD`);
      const remoteShaRes = await execPromise(`git rev-parse --short origin/${targetBranch}`);
      
      const localSha = localShaRes.stdout.trim();
      const remoteSha = remoteShaRes.stdout.trim();
      
      res.json({
        success: true,
        localSha,
        remoteSha,
        hasUpdates: localSha !== remoteSha,
        isGit: true
      });
    } catch (err: any) {
      console.warn('Git check failed or not a git repository yet:', err.message);
      // Fallback response for mock behavior in sandbox, but still reporting info
      res.json({
        success: true,
        localSha: '8fa2c3e',
        remoteSha: '7fc1b52',
        hasUpdates: true,
        isGit: false,
        warning: 'Sandbox / Non-Git Mode: ' + err.message
      });
    }
  });

  // Pull code from GitHub and re-build
  app.post('/api/git-pull', async (req, res) => {
    const { repo, branch } = req.body;
    const targetBranch = branch || 'main';
    const targetRepo = repo || 'elfintermedia-glitch/siyudi-uibu';
    const logs: string[] = [];

    logs.push(`[SISTEM] Memulai proses pembaruan otomatis dari repositori: ${targetRepo} [Branch: ${targetBranch}]`);

    try {
      // 1. Ensure we are in a git tree
      try {
        await execPromise('git rev-parse --is-inside-work-tree');
      } catch (err) {
        logs.push(`[SISTEM] Direktori bukan git repositori. Menginisialisasi git init...`);
        await execPromise('git init');
        await execPromise(`git remote add origin https://github.com/${targetRepo}.git`);
      }

      // 2. Set remote URL to use HTTPS
      try {
        await execPromise(`git remote set-url origin https://github.com/${targetRepo}.git`);
        logs.push(`[SISTEM] Remote origin berhasil diselaraskan ke: github.com/${targetRepo}`);
      } catch (e) {
        try {
          await execPromise(`git remote add origin https://github.com/${targetRepo}.git`);
        } catch (__) {}
      }

      // 3. Git Fetch
      logs.push(`[GIT] Menjalankan: git fetch origin ${targetBranch}...`);
      await execPromise(`git fetch origin ${targetBranch}`);
      
      // 4. Git Pull / Hard Reset (lebih direkomendasikan untuk auto-deploy agar tidak bentrok)
      logs.push(`[GIT] Menjalankan: git reset --hard origin/${targetBranch}...`);
      const resetRes = await execPromise(`git reset --hard origin/${targetBranch}`);
      logs.push(`[GIT] Berhasil menarik kode terbaru.`);
      if (resetRes.stdout) {
        logs.push(`[GIT LOG] ${resetRes.stdout.trim()}`);
      }

      // 5. Build Vite SPA and rebuild server bundle
      logs.push(`[VITE] Menjalankan kompilasi: npm run build...`);
      const buildRes = await execPromise(`npm run build`);
      logs.push(`[VITE] Kompilasi berhasil diselesaikan.`);
      if (buildRes.stdout) {
        const buildLines = buildRes.stdout.split('\n').slice(-5).join('\n');
        logs.push(`[VITE OUT] ...\n${buildLines}`);
      }

      logs.push(`[SUKSES] Seluruh sistem berhasil dimuat ulang ke build terbaru!`);
      logs.push(`[SISTEM] Memulai proses reload/restart layanan secara otomatis...`);

      res.json({ success: true, logs });

      // Trigger automatic restart/hot-reload
      setTimeout(() => {
        console.log('Deploy success. Initiating service restart...');
        
        const isPM2 = typeof process.env.pm_id !== 'undefined';
        
        if (isPM2) {
          console.log(`Aplikasi berjalan di bawah PM2 (ID: ${process.env.pm_id}). Meminta PM2 restart...`);
          // Try executing pm2 restart
          exec(`pm2 restart ${process.env.pm_id}`, (err) => {
            if (err) {
              console.warn('Gagal menjalankan perintah "pm2" langsung. Mencoba "npx pm2"...', err);
              exec(`npx pm2 restart ${process.env.pm_id}`, (npxErr) => {
                if (npxErr) {
                  console.error('Gagal menjalankan npx pm2 restart. Memaksa exit dengan kode 1 agar PM2/Supervisor mendeteksi crash dan memulai ulang...', npxErr);
                  process.exit(1); // Exit with non-zero code to force PM2 to restart as a crash recovery
                }
              });
            }
          });
        } else {
          // Detached spawn fallback: spawn mandiri secara background dan exit
          try {
            const { spawn } = require('child_process');
            console.log('Menyalahgunakan detached spawn untuk memicu reload mandiri...');
            const child = spawn(process.argv[0], process.argv.slice(1), {
              detached: true,
              stdio: 'ignore'
            });
            child.unref();
            process.exit(0);
          } catch (spawnErr) {
            console.error('Gagal melakukan spawn detached, memaksa exit langsung...', spawnErr);
            process.exit(0);
          }
        }
      }, 2000);

    } catch (err: any) {
      console.error('Git integration failed:', err);
      logs.push(`[EROR] Kegagalan fatal saat menarik atau mendominasi pembaruan.`);
      logs.push(`[EROR DETAIL] ${err.message}`);
      if (err.stdout) logs.push(`[STDOUT ERROR] ${err.stdout.trim().slice(0, 300)}`);
      if (err.stderr) logs.push(`[STDERR ERROR] ${err.stderr.trim().slice(0, 300)}`);

      res.status(500).json({ success: false, error: err.message, logs });
    }
  });

  // Export full MySQL-compatible SQL database dump
  app.get('/api/export-sql', async (req, res) => {
    try {
      const allStudents = await db.select().from(students);
      const allYudisiums = await db.select().from(yudisiumRegistrations);
      const allWisudas = await db.select().from(wisudaRegistrations);
      const allAdmins = await db.select().from(adminUsers);

      let sql = `-- ========================================================\n`;
      sql += `-- Yudisium & Wisuda Portal - MySQL Database Dump\n`;
      sql += `-- Generated: ${new Date().toISOString()}\n`;
      sql += `-- ========================================================\n\n`;
      
      sql += `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n`;
      sql += `/*!40101 SET NAMES utf8mb4 */;\n`;
      sql += `/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;\n`;
      sql += `/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;\n\n`;

      // 1. admin_users Table
      sql += `-- --------------------------------------------------------\n`;
      sql += `-- Table structure for table \`admin_users\`\n`;
      sql += `-- --------------------------------------------------------\n`;
      sql += `DROP TABLE IF EXISTS \`admin_users\`;\n`;
      sql += `CREATE TABLE \`admin_users\` (\n`;
      sql += `  \`id\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`nama\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`username\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`password\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`role\` VARCHAR(50) NOT NULL,\n`;
      sql += `  PRIMARY KEY (\`id\`),\n`;
      sql += `  UNIQUE KEY \`admin_users_username_unique\` (\`username\`)\n`;
      sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (allAdmins.length > 0) {
        sql += `-- Dumping data for table \`admin_users\`\n`;
        allAdmins.forEach(adm => {
          const id = escapeString(adm.id);
          const nama = escapeString(adm.nama);
          const username = escapeString(adm.username);
          const password = escapeString(adm.password);
          const role = escapeString(adm.role);
          sql += `INSERT INTO \`admin_users\` (\`id\`, \`nama\`, \`username\`, \`password\`, \`role\`) VALUES (${id}, ${nama}, ${username}, ${password}, ${role});\n`;
        });
        sql += `\n`;
      }

      // 2. students Table
      sql += `-- --------------------------------------------------------\n`;
      sql += `-- Table structure for table \`students\`\n`;
      sql += `-- --------------------------------------------------------\n`;
      sql += `DROP TABLE IF EXISTS \`students\`;\n`;
      sql += `CREATE TABLE \`students\` (\n`;
      sql += `  \`nim\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`nik\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`nama\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`tempat_lahir\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`tanggal_lahir\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`fakultas\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`program_studi\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`status_kelulusan\` VARCHAR(55) NOT NULL,\n`;
      sql += `  \`keterangan\` TEXT NULL,\n`;
      sql += `  \`email\` VARCHAR(255) NULL,\n`;
      sql += `  \`no_hp\` VARCHAR(50) NULL,\n`;
      sql += `  \`data_verified\` BOOLEAN DEFAULT FALSE,\n`;
      sql += `  \`academic_approved\` BOOLEAN DEFAULT FALSE,\n`;
      sql += `  \`academic_rejected\` BOOLEAN DEFAULT FALSE,\n`;
      sql += `  \`academic_rejection_reason\` TEXT NULL,\n`;
      sql += `  \`ktp_doc\` JSON NULL,\n`;
      sql += `  \`ijazah_sma_doc\` JSON NULL,\n`;
      sql += `  PRIMARY KEY (\`nim\`)\n`;
      sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (allStudents.length > 0) {
        sql += `-- Dumping data for table \`students\`\n`;
        allStudents.forEach(std => {
          const nim = escapeString(std.nim);
          const nik = escapeString(std.nik);
          const nama = escapeString(std.nama);
          const tmpt = escapeString(std.tempatLahir);
          const tgl = escapeString(std.tanggalLahir);
          const fak = escapeString(std.fakultas);
          const prodi = escapeString(std.programStudi);
          const lulus = escapeString(std.statusKelulusan);
          const ket = escapeString(std.keterangan);
          const email = escapeString(std.email);
          const hp = escapeString(std.noHp);
          const dVer = std.dataVerified ? 'TRUE' : 'FALSE';
          const aApp = std.academicApproved ? 'TRUE' : 'FALSE';
          const aRej = std.academicRejected ? 'TRUE' : 'FALSE';
          const aRejReason = escapeString(std.academicRejectionReason);
          const ktp = escapeJson(std.ktpDoc);
          const ijazah = escapeJson(std.ijazahSmaDoc);

          sql += `INSERT INTO \`students\` (\`nim\`, \`nik\`, \`nama\`, \`tempat_lahir\`, \`tanggal_lahir\`, \`fakultas\`, \`program_studi\`, \`status_kelulusan\`, \`keterangan\`, \`email\`, \`no_hp\`, \`data_verified\`, \`academic_approved\`, \`academic_rejected\`, \`academic_rejection_reason\`, \`ktp_doc\`, \`ijazah_sma_doc\`) VALUES (${nim}, ${nik}, ${nama}, ${tmpt}, ${tgl}, ${fak}, ${prodi}, ${lulus}, ${ket}, ${email}, ${hp}, ${dVer}, ${aApp}, ${aRej}, ${aRejReason}, ${ktp}, ${ijazah});\n`;
        });
        sql += `\n`;
      }

      // 3. yudisium_registrations Table
      sql += `-- --------------------------------------------------------\n`;
      sql += `-- Table structure for table \`yudisium_registrations\`\n`;
      sql += `-- --------------------------------------------------------\n`;
      sql += `DROP TABLE IF EXISTS \`yudisium_registrations\`;\n`;
      sql += `CREATE TABLE \`yudisium_registrations\` (\n`;
      sql += `  \`nim\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`judul_skripsi\` TEXT NOT NULL,\n`;
      sql += `  \`pembimbing1\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`pembimbing2\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`tanggal_lulus\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`registered_at\` VARCHAR(100) NOT NULL,\n`;
      sql += `  \`status\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`rejection_reason\` TEXT NULL,\n`;
      sql += `  \`documents\` JSON NULL,\n`;
      sql += `  PRIMARY KEY (\`nim\`),\n`;
      sql += `  CONSTRAINT \`fk_yudisium_student\` FOREIGN KEY (\`nim\`) REFERENCES \`students\` (\`nim\`) ON DELETE CASCADE\n`;
      sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (allYudisiums.length > 0) {
        sql += `-- Dumping data for table \`yudisium_registrations\`\n`;
        allYudisiums.forEach(y => {
          const nim = escapeString(y.nim);
          const judul = escapeString(y.judulSkripsi);
          const p1 = escapeString(y.pembimbing1);
          const p2 = escapeString(y.pembimbing2);
          const tgl = escapeString(y.tanggalLulus);
          const reg = escapeString(y.registeredAt);
          const st = escapeString(y.status);
          const rej = escapeString(y.rejectionReason);
          const docs = escapeJson(y.documents);

          sql += `INSERT INTO \`yudisium_registrations\` (\`nim\`, \`judul_skripsi\`, \`pembimbing1\`, \`pembimbing2\`, \`tanggal_lulus\`, \`registered_at\`, \`status\`, \`rejection_reason\`, \`documents\`) VALUES (${nim}, ${judul}, ${p1}, ${p2}, ${tgl}, ${reg}, ${st}, ${rej}, ${docs});\n`;
        });
        sql += `\n`;
      }

      // 4. wisuda_registrations Table
      sql += `-- --------------------------------------------------------\n`;
      sql += `-- Table structure for table \`wisuda_registrations\`\n`;
      sql += `-- --------------------------------------------------------\n`;
      sql += `DROP TABLE IF EXISTS \`wisuda_registrations\`;\n`;
      sql += `CREATE TABLE \`wisuda_registrations\` (\n`;
      sql += `  \`nim\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`ukuran_toga\` VARCHAR(10) NOT NULL,\n`;
      sql += `  \`nama_ayah\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`nama_ibu\` VARCHAR(255) NOT NULL,\n`;
      sql += `  \`no_hp_ortu\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`alamat_pengiriman\` TEXT NOT NULL,\n`;
      sql += `  \`registered_at\` VARCHAR(100) NOT NULL,\n`;
      sql += `  \`status\` VARCHAR(50) NOT NULL,\n`;
      sql += `  \`rejection_reason\` TEXT NULL,\n`;
      sql += `  PRIMARY KEY (\`nim\`),\n`;
      sql += `  CONSTRAINT \`fk_wisuda_student\` FOREIGN KEY (\`nim\`) REFERENCES \`students\` (\`nim\`) ON DELETE CASCADE\n`;
      sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

      if (allWisudas.length > 0) {
        sql += `-- Dumping data for table \`wisuda_registrations\`\n`;
        allWisudas.forEach(w => {
          const nim = escapeString(w.nim);
          const ukuran = escapeString(w.ukuranToga);
          const ayah = escapeString(w.namaAyah);
          const ibu = escapeString(w.namaIbu);
          const hp = escapeString(w.noHpOrtu);
          const alamat = escapeString(w.alamatPengiriman);
          const reg = escapeString(w.registeredAt);
          const st = escapeString(w.status);
          const rej = escapeString(w.rejectionReason);

          sql += `INSERT INTO \`wisuda_registrations\` (\`nim\`, \`ukuran_toga\`, \`nama_ayah\`, \`nama_ibu\`, \`no_hp_ortu\`, \`alamat_pengiriman\`, \`registered_at\`, \`status\`, \`rejection_reason\`) VALUES (${nim}, ${ukuran}, ${ayah}, ${ibu}, ${hp}, ${alamat}, ${reg}, ${st}, ${rej});\n`;
        });
        sql += `\n`;
      }

      sql += `/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;\n`;
      sql += `/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;\n`;
      sql += `/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename=portal_akademik_db_dump.sql');
      res.send(sql);
    } catch (err: any) {
      console.error('Error generating MySQL dump:', err);
      res.status(500).json({ error: 'Failed to generate database SQL export.', details: err.message });
    }
  });

  // Reset database state back to scratch
  app.post('/api/reset', async (req, res) => {
    try {
      // Delete child records first to honor constraints
      await db.delete(wisudaRegistrations);
      await db.delete(yudisiumRegistrations);
      await db.delete(students);
      await db.delete(adminUsers);

      // Trigger seed logic
      await seedDatabaseIfEmpty();
      res.json({ message: 'Database reset and seeded successfully' });
    } catch (err: any) {
      console.error('Error resetting database:', err);
      res.status(500).json({ error: 'Failed to reset database', details: err.message });
    }
  });

  function escapeString(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    const escaped = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  function escapeJson(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    const escaped = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  // Get full state of system
  app.get('/api/state', async (req, res) => {
    try {
      const allStudents = await db.select().from(students);
      const allYudisiums = await db.select().from(yudisiumRegistrations);
      const allWisudas = await db.select().from(wisudaRegistrations);
      const allAdmins = await db.select().from(adminUsers);

      const yudisiumApps: Record<string, typeof yudisiumRegistrations.$inferSelect> = {};
      allYudisiums.forEach((y) => {
        yudisiumApps[y.nim] = y;
      });

      const wisudaApps: Record<string, typeof wisudaRegistrations.$inferSelect> = {};
      allWisudas.forEach((w) => {
        wisudaApps[w.nim] = w;
      });

      res.json({
        students: allStudents,
        yudisiumApps,
        wisudaApps,
        adminUsers: allAdmins,
      });
    } catch (err: any) {
      console.error('Error fetching state:', err);
      res.status(500).json({ error: 'Failed to retrieve academic database state.', details: err.message });
    }
  });

  // Sync entire student list
  app.post('/api/students', async (req, res) => {
    try {
      const incomingStudents = req.body.students || [];

      // Bulk upsert one by one to ensure safety
      for (const std of incomingStudents) {
        await db
          .insert(students)
          .values({
            nim: std.nim,
            nik: std.nik,
            nama: std.nama,
            tempatLahir: std.tempatLahir,
            tanggalLahir: std.tanggalLahir,
            fakultas: std.fakultas,
            programStudi: std.programStudi,
            statusKelulusan: std.statusKelulusan,
            keterangan: std.keterangan || null,
            email: std.email || null,
            noHp: std.noHp || null,
            dataVerified: std.dataVerified || false,
            academicApproved: std.academicApproved || false,
            academicRejected: std.academicRejected || false,
            academicRejectionReason: std.academicRejectionReason || null,
            ktpDoc: std.ktpDoc || null,
            ijazahSmaDoc: std.ijazahSmaDoc || null,
          })
          .onConflictDoUpdate({
            target: students.nim,
            set: {
              nik: std.nik,
              nama: std.nama,
              tempatLahir: std.tempatLahir,
              tanggalLahir: std.tanggalLahir,
              fakultas: std.fakultas,
              programStudi: std.programStudi,
              statusKelulusan: std.statusKelulusan,
              keterangan: std.keterangan || null,
              email: std.email || null,
              noHp: std.noHp || null,
              dataVerified: std.dataVerified || false,
              academicApproved: std.academicApproved || false,
              academicRejected: std.academicRejected || false,
              academicRejectionReason: std.academicRejectionReason || null,
              ktpDoc: std.ktpDoc || null,
              ijazahSmaDoc: std.ijazahSmaDoc || null,
            },
          });
      }

      // Delete students and cascade associations for any student not included in the payload
      const incomingNims = incomingStudents.map((s: any) => s.nim);
      if (incomingNims.length > 0) {
        await db.delete(students).where(notInArray(students.nim, incomingNims));
      } else {
        await db.delete(students);
      }

      res.json({ message: 'Synced student list successfully' });
    } catch (err: any) {
      console.error('Error syncing students:', err);
      res.status(500).json({ error: 'Failed to sync students list', details: err.message });
    }
  });

  // Submit or update a single yudisium app
  app.post('/api/yudisium', async (req, res) => {
    try {
      const y = req.body;
      if (!y.nim) {
        return res.status(400).json({ error: 'Student NIM is required.' });
      }

      await db
        .insert(yudisiumRegistrations)
        .values({
          nim: y.nim,
          judulSkripsi: y.judulSkripsi,
          pembimbing1: y.pembimbing1,
          pembimbing2: y.pembimbing2,
          tanggalLulus: y.tanggalLulus,
          registeredAt: y.registeredAt,
          status: y.status,
          rejectionReason: y.rejectionReason || null,
          documents: y.documents || null,
        })
        .onConflictDoUpdate({
          target: yudisiumRegistrations.nim,
          set: {
            judulSkripsi: y.judulSkripsi,
            pembimbing1: y.pembimbing1,
            pembimbing2: y.pembimbing2,
            tanggalLulus: y.tanggalLulus,
            registeredAt: y.registeredAt,
            status: y.status,
            rejectionReason: y.rejectionReason || null,
            documents: y.documents || null,
          },
        });

      res.json({ message: 'Yudisium registration saved successfully' });
    } catch (err: any) {
      console.error('Error storing yudisium registration:', err);
      res.status(500).json({ error: 'Failed to save yudisium registration', details: err.message });
    }
  });

  // Submit or update a single wisuda registration
  app.post('/api/wisuda', async (req, res) => {
    try {
      const w = req.body;
      if (!w.nim) {
        return res.status(400).json({ error: 'Student NIM is required.' });
      }

      await db
        .insert(wisudaRegistrations)
        .values({
          nim: w.nim,
          ukuranToga: w.ukuranToga,
          namaAyah: w.namaAyah,
          namaIbu: w.namaIbu,
          noHpOrtu: w.noHpOrtu,
          alamatPengiriman: w.alamatPengiriman,
          registeredAt: w.registeredAt,
          status: w.status,
          rejectionReason: w.rejectionReason || null,
        })
        .onConflictDoUpdate({
          target: wisudaRegistrations.nim,
          set: {
            ukuranToga: w.ukuranToga,
            namaAyah: w.namaAyah,
            namaIbu: w.namaIbu,
            noHpOrtu: w.noHpOrtu,
            alamatPengiriman: w.alamatPengiriman,
            registeredAt: w.registeredAt,
            status: w.status,
            rejectionReason: w.rejectionReason || null,
          },
        });

      res.json({ message: 'Wisuda registration saved successfully' });
    } catch (err: any) {
      console.error('Error storing wisuda registration:', err);
      res.status(500).json({ error: 'Failed to save wisuda registration', details: err.message });
    }
  });

  // Update a single student profile
  app.post('/api/students/profile', async (req, res) => {
    try {
      const std = req.body;
      if (!std.nim) {
        return res.status(455).json({ error: 'Student NIM is required.' });
      }

      await db
        .insert(students)
        .values({
          nim: std.nim,
          nik: std.nik,
          nama: std.nama,
          tempatLahir: std.tempatLahir,
          tanggalLahir: std.tanggalLahir,
          fakultas: std.fakultas,
          programStudi: std.programStudi,
          statusKelulusan: std.statusKelulusan,
          keterangan: std.keterangan || null,
          email: std.email || null,
          noHp: std.noHp || null,
          dataVerified: std.dataVerified || false,
          academicApproved: std.academicApproved || false,
          academicRejected: std.academicRejected || false,
          academicRejectionReason: std.academicRejectionReason || null,
          ktpDoc: std.ktpDoc || null,
          ijazahSmaDoc: std.ijazahSmaDoc || null,
        })
        .onConflictDoUpdate({
          target: students.nim,
          set: {
            nik: std.nik,
            nama: std.nama,
            tempatLahir: std.tempatLahir,
            tanggalLahir: std.tanggalLahir,
            fakultas: std.fakultas,
            programStudi: std.programStudi,
            statusKelulusan: std.statusKelulusan,
            keterangan: std.keterangan || null,
            email: std.email || null,
            noHp: std.noHp || null,
            dataVerified: std.dataVerified || false,
            academicApproved: std.academicApproved || false,
            academicRejected: std.academicRejected || false,
            academicRejectionReason: std.academicRejectionReason || null,
            ktpDoc: std.ktpDoc || null,
            ijazahSmaDoc: std.ijazahSmaDoc || null,
          },
        });

      res.json({ message: 'Student profile updated successfully' });
    } catch (err: any) {
      console.error('Error updating student profile:', err);
      res.status(500).json({ error: 'Failed to save student profile', details: err.message });
    }
  });

  // Handle admin configurations
  app.post('/api/admin/users', async (req, res) => {
    try {
      const adm = req.body;
      if (!adm.username) {
        return res.status(400).json({ error: 'Username is required.' });
      }

      await db
        .insert(adminUsers)
        .values({
          id: adm.id,
          nama: adm.nama,
          username: adm.username,
          password: adm.password,
          role: adm.role,
        })
        .onConflictDoUpdate({
          target: adminUsers.username,
          set: {
            nama: adm.nama,
            password: adm.password,
            role: adm.role,
          },
         });

      res.json({ message: 'Admin user saved successfully' });
    } catch (err: any) {
      console.error('Error saving admin user:', err);
      res.status(500).json({ error: 'Failed to save admin user', details: err.message });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
