import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { notInArray, eq } from 'drizzle-orm';
import { db, pool } from './src/db/index.ts';
import { students, yudisiumRegistrations, wisudaRegistrations, adminUsers } from './src/db/schema.ts';
import { INITIAL_STUDENTS, INITIAL_YUDISIUMS, INITIAL_WISUDAS, INITIAL_ADMIN_USERS } from './src/utils/dummyData.ts';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// In-Memory Database Fallback Configuration
let isDatabaseAvailable = false;

const memoryStore = {
  students: [] as any[],
  yudisiumRegistrations: [] as any[],
  wisudaRegistrations: [] as any[],
  adminUsers: [] as any[],
};

function initializeMemoryStore() {
  memoryStore.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
  memoryStore.adminUsers = JSON.parse(JSON.stringify(INITIAL_ADMIN_USERS));
  
  memoryStore.yudisiumRegistrations = Object.values(INITIAL_YUDISIUMS).map(y => JSON.parse(JSON.stringify(y)));
  memoryStore.wisudaRegistrations = Object.values(INITIAL_WISUDAS).map(w => JSON.parse(JSON.stringify(w)));
}
initializeMemoryStore();

const memoryDb = {
  getStudents: () => memoryStore.students,
  getYudisiums: () => memoryStore.yudisiumRegistrations,
  getWisudas: () => memoryStore.wisudaRegistrations,
  getAdmins: () => memoryStore.adminUsers,

  reset: () => {
    initializeMemoryStore();
  },

  syncStudents: (incoming: any[]) => {
    const incomingNims = incoming.map(s => s.nim);
    if (incomingNims.length > 0) {
      memoryStore.students = memoryStore.students.filter(s => incomingNims.includes(s.nim));
    } else {
      memoryStore.students = [];
    }

    for (const s of incoming) {
      const idx = memoryStore.students.findIndex(x => x.nim === s.nim);
      const cleanStudent = {
        nim: s.nim,
        nik: s.nik,
        nama: s.nama,
        tempatLahir: s.tempatLahir,
        tanggalLahir: s.tanggalLahir,
        fakultas: s.fakultas,
        programStudi: s.programStudi,
        statusKelulusan: s.statusKelulusan,
        keterangan: s.keterangan || null,
        email: s.email || null,
        noHp: s.noHp || null,
        password: s.password || 'kebudiutamaan',
        dataVerified: s.dataVerified || false,
        academicApproved: s.academicApproved || false,
        academicRejected: s.academicRejected || false,
        academicRejectionReason: s.academicRejectionReason || null,
        ktpDoc: s.ktpDoc || null,
        ijazahSmaDoc: s.ijazahSmaDoc || null,
      };
      if (idx !== -1) {
        memoryStore.students[idx] = cleanStudent;
      } else {
        memoryStore.students.push(cleanStudent);
      }

      if (s.academicApproved) {
        const yIdx = memoryStore.yudisiumRegistrations.findIndex(x => x.nim === s.nim);
        if (yIdx === -1) {
          memoryStore.yudisiumRegistrations.push({
            nim: s.nim,
            judulSkripsi: '-',
            pembimbing1: '-',
            pembimbing2: '-',
            tanggalLulus: '-',
            registeredAt: new Date().toISOString().split('T')[0],
            status: 'diajukan',
            rejectionReason: null,
            documents: []
          });
        }
      }
    }
  },

  upsertYudisium: (y: any) => {
    const idx = memoryStore.yudisiumRegistrations.findIndex(x => x.nim === y.nim);
    const cleanYudisium = {
      nim: y.nim,
      judulSkripsi: y.judulSkripsi,
      pembimbing1: y.pembimbing1,
      pembimbing2: y.pembimbing2,
      tanggalLulus: y.tanggalLulus,
      registeredAt: y.registeredAt,
      status: y.status,
      rejectionReason: y.rejectionReason || null,
      documents: y.documents || null,
    };
    if (idx !== -1) {
      memoryStore.yudisiumRegistrations[idx] = cleanYudisium;
    } else {
      memoryStore.yudisiumRegistrations.push(cleanYudisium);
    }

    if (y.status === 'disetujui') {
      const wIdx = memoryStore.wisudaRegistrations.findIndex(x => x.nim === y.nim);
      if (wIdx === -1) {
        memoryStore.wisudaRegistrations.push({
          nim: y.nim,
          ukuranToga: 'L',
          namaAyah: '-',
          namaIbu: '-',
          noHpOrtu: '-',
          alamatPengiriman: '-',
          registeredAt: new Date().toISOString().split('T')[0],
          status: 'diajukan',
          rejectionReason: null
        });
      }
    }
  },

  upsertWisuda: (w: any) => {
    const idx = memoryStore.wisudaRegistrations.findIndex(x => x.nim === w.nim);
    const cleanWisuda = {
      nim: w.nim,
      ukuranToga: w.ukuranToga,
      namaAyah: w.namaAyah,
      namaIbu: w.namaIbu,
      noHpOrtu: w.noHpOrtu,
      alamatPengiriman: w.alamatPengiriman,
      registeredAt: w.registeredAt,
      status: w.status,
      rejectionReason: w.rejectionReason || null,
    };
    if (idx !== -1) {
      memoryStore.wisudaRegistrations[idx] = cleanWisuda;
    } else {
      memoryStore.wisudaRegistrations.push(cleanWisuda);
    }
  },

  upsertStudentProfile: (std: any) => {
    const idx = memoryStore.students.findIndex(x => x.nim === std.nim);
    const cleanStudent = {
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
      password: std.password || 'kebudiutamaan',
      dataVerified: std.dataVerified || false,
      academicApproved: std.academicApproved || false,
      academicRejected: std.academicRejected || false,
      academicRejectionReason: std.academicRejectionReason || null,
      ktpDoc: std.ktpDoc || null,
      ijazahSmaDoc: std.ijazahSmaDoc || null,
    };
    if (idx !== -1) {
      memoryStore.students[idx] = cleanStudent;
    } else {
      memoryStore.students.push(cleanStudent);
    }
  },

  upsertAdminUser: (adm: any) => {
    const idx = memoryStore.adminUsers.findIndex(x => x.username === adm.username);
    const cleanAdmin = {
      id: adm.id,
      nama: adm.nama,
      username: adm.username,
      password: adm.password,
      role: adm.role,
    };
    if (idx !== -1) {
      memoryStore.adminUsers[idx] = cleanAdmin;
    } else {
      memoryStore.adminUsers.push(cleanAdmin);
    }
  },
};

async function initializeTables() {
  try {
    console.log('Verifying or creating MySQL database tables...');
    // 1. students Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`students\` (
        \`nim\` VARCHAR(50) NOT NULL,
        \`nik\` VARCHAR(50) NOT NULL,
        \`nama\` VARCHAR(255) NOT NULL,
        \`tempat_lahir\` VARCHAR(255) NOT NULL,
        \`tanggal_lahir\` VARCHAR(50) NOT NULL,
        \`fakultas\` VARCHAR(255) NOT NULL,
        \`program_studi\` VARCHAR(255) NOT NULL,
        \`status_kelulusan\` VARCHAR(55) NOT NULL,
        \`keterangan\` TEXT NULL,
        \`email\` VARCHAR(255) NULL,
        \`no_hp\` VARCHAR(50) NULL,
        \`password\` VARCHAR(255) NOT NULL DEFAULT 'kebudiutamaan',
        \`data_verified\` BOOLEAN DEFAULT FALSE,
        \`academic_approved\` BOOLEAN DEFAULT FALSE,
        \`academic_rejected\` BOOLEAN DEFAULT FALSE,
        \`academic_rejection_reason\` TEXT NULL,
        \`ktp_doc\` JSON NULL,
        \`ijazah_sma_doc\` JSON NULL,
        PRIMARY KEY (\`nim\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Migrate existing table to add password if not present
    try {
      await pool.query(`ALTER TABLE \`students\` ADD COLUMN \`password\` VARCHAR(255) NOT NULL DEFAULT 'kebudiutamaan'`);
      console.log('Successfully added password column to existing "students" table!');
    } catch (e: any) {
      // Column probably already exists, which is expected on subsequent runs
    }

    // 2. admin_users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`admin_users\` (
        \`id\` VARCHAR(255) NOT NULL,
        \`nama\` VARCHAR(255) NOT NULL,
        \`username\` VARCHAR(255) NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`admin_users_username_unique\` (\`username\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. yudisium_registrations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`yudisium_registrations\` (
        \`nim\` VARCHAR(50) NOT NULL,
        \`judul_skripsi\` TEXT NOT NULL,
        \`pembimbing1\` VARCHAR(255) NOT NULL,
        \`pembimbing2\` VARCHAR(255) NOT NULL,
        \`tanggal_lulus\` VARCHAR(50) NOT NULL,
        \`registered_at\` VARCHAR(100) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL,
        \`rejection_reason\` TEXT NULL,
        \`documents\` JSON NULL,
        PRIMARY KEY (\`nim\`),
        CONSTRAINT \`fk_yudisium_student\` FOREIGN KEY (\`nim\`) REFERENCES \`students\` (\`nim\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. wisuda_registrations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`wisuda_registrations\` (
        \`nim\` VARCHAR(50) NOT NULL,
        \`ukuran_toga\` VARCHAR(10) NOT NULL,
        \`nama_ayah\` VARCHAR(255) NOT NULL,
        \`nama_ibu\` VARCHAR(255) NOT NULL,
        \`no_hp_ortu\` VARCHAR(50) NOT NULL,
        \`alamat_pengiriman\` TEXT NOT NULL,
        \`registered_at\` VARCHAR(100) NOT NULL,
        \`status\` VARCHAR(50) NOT NULL,
        \`rejection_reason\` TEXT NULL,
        PRIMARY KEY (\`nim\`),
        CONSTRAINT \`fk_wisuda_student\` FOREIGN KEY (\`nim\`) REFERENCES \`students\` (\`nim\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Database tables verified/created successfully!');
  } catch (err: any) {
    console.error('Failed to initialize database tables:', err.message);
    throw err;
  }
}

async function seedDatabaseIfEmpty() {
  try {
    await initializeTables();
    
    // Check connection with active query
    await pool.query('SELECT 1');
    isDatabaseAvailable = true;
    console.log('--- DATABASE CONNECTION SUCCESSFUL! Running with true MySQL backend. ---');

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
          password: std.password || 'kebudiutamaan',
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
  } catch (err: any) {
    isDatabaseAvailable = false;
    console.warn('--- DATABASE CONNECTION TO REAL MYSQL FAILED ---');
    console.warn('Reason:', err.message);
    console.warn('>>> Falling back to high-fidelity In-Memory Database for preview sandbox. <<<');
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
      let allStudents, allYudisiums, allWisudas, allAdmins;
      if (isDatabaseAvailable) {
        allStudents = await db.select().from(students);
        allYudisiums = await db.select().from(yudisiumRegistrations);
        allWisudas = await db.select().from(wisudaRegistrations);
        allAdmins = await db.select().from(adminUsers);
      } else {
        allStudents = memoryDb.getStudents();
        allYudisiums = memoryDb.getYudisiums();
        allWisudas = memoryDb.getWisudas();
        allAdmins = memoryDb.getAdmins();
      }

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
      sql += `  \`password\` VARCHAR(255) NOT NULL DEFAULT 'kebudiutamaan',\n`;
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
          const psw = escapeString(std.password || 'kebudiutamaan');
          const dVer = std.dataVerified ? 'TRUE' : 'FALSE';
          const aApp = std.academicApproved ? 'TRUE' : 'FALSE';
          const aRej = std.academicRejected ? 'TRUE' : 'FALSE';
          const aRejReason = escapeString(std.academicRejectionReason);
          const ktp = escapeJson(std.ktpDoc);
          const ijazah = escapeJson(std.ijazahSmaDoc);

          sql += `INSERT INTO \`students\` (\`nim\`, \`nik\`, \`nama\`, \`tempat_lahir\`, \`tanggal_lahir\`, \`fakultas\`, \`program_studi\`, \`status_kelulusan\`, \`keterangan\`, \`email\`, \`no_hp\`, \`password\`, \`data_verified\`, \`academic_approved\`, \`academic_rejected\`, \`academic_rejection_reason\`, \`ktp_doc\`, \`ijazah_sma_doc\`) VALUES (${nim}, ${nik}, ${nama}, ${tmpt}, ${tgl}, ${fak}, ${prodi}, ${lulus}, ${ket}, ${email}, ${hp}, ${psw}, ${dVer}, ${aApp}, ${aRej}, ${aRejReason}, ${ktp}, ${ijazah});\n`;
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
      if (isDatabaseAvailable) {
        // Delete child records first to honor constraints
        await db.delete(wisudaRegistrations);
        await db.delete(yudisiumRegistrations);
        await db.delete(students);
        await db.delete(adminUsers);

        // Trigger seed logic
        await seedDatabaseIfEmpty();
      } else {
        memoryDb.reset();
      }
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

  function safeParseJSON(val: any) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        console.error('Failed to parse JSON string:', val, e);
        return [];
      }
    }
    return val;
  }

  // Get full state of system
  app.get('/api/state', async (req, res) => {
    try {
      let allStudents, allYudisiums, allWisudas, allAdmins;
      if (isDatabaseAvailable) {
        allStudents = await db.select().from(students);
        allYudisiums = await db.select().from(yudisiumRegistrations);
        allWisudas = await db.select().from(wisudaRegistrations);
        allAdmins = await db.select().from(adminUsers);
      } else {
        allStudents = memoryDb.getStudents();
        allYudisiums = memoryDb.getYudisiums();
        allWisudas = memoryDb.getWisudas();
        allAdmins = memoryDb.getAdmins();
      }

      // Safe parse JSON fields from database
      const parsedStudents = allStudents.map((s: any) => ({
        ...s,
        ktpDoc: safeParseJSON(s.ktpDoc),
        ijazahSmaDoc: safeParseJSON(s.ijazahSmaDoc)
      }));

      const parsedYudisiums = allYudisiums.map((y: any) => ({
        ...y,
        documents: safeParseJSON(y.documents) || []
      }));

      const yudisiumApps: Record<string, any> = {};
      parsedYudisiums.forEach((y) => {
        yudisiumApps[y.nim] = y;
      });

      const wisudaApps: Record<string, any> = {};
      allWisudas.forEach((w) => {
        wisudaApps[w.nim] = w;
      });

      res.json({
        students: parsedStudents,
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

      if (isDatabaseAvailable) {
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
              password: std.password || 'kebudiutamaan',
              dataVerified: std.dataVerified || false,
              academicApproved: std.academicApproved || false,
              academicRejected: std.academicRejected || false,
              academicRejectionReason: std.academicRejectionReason || null,
              ktpDoc: std.ktpDoc || null,
              ijazahSmaDoc: std.ijazahSmaDoc || null,
            })
            .onDuplicateKeyUpdate({
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
                password: std.password || 'kebudiutamaan',
                dataVerified: std.dataVerified || false,
                academicApproved: std.academicApproved || false,
                academicRejected: std.academicRejected || false,
                academicRejectionReason: std.academicRejectionReason || null,
                ktpDoc: std.ktpDoc || null,
                ijazahSmaDoc: std.ijazahSmaDoc || null,
              },
            });
        }

        // Ensure any student with academicApproved has a yudisium entry in Cloud SQL
        for (const std of incomingStudents) {
          if (std.academicApproved) {
            const existing = await db
              .select()
              .from(yudisiumRegistrations)
              .where(eq(yudisiumRegistrations.nim, std.nim));
            if (existing.length === 0) {
              await db.insert(yudisiumRegistrations).values({
                nim: std.nim,
                judulSkripsi: '-',
                pembimbing1: '-',
                pembimbing2: '-',
                tanggalLulus: '-',
                registeredAt: new Date().toISOString().split('T')[0],
                status: 'diajukan',
                documents: []
              });
            }
          }
        }

        // Delete students and cascade associations for any student not included in the payload
        const incomingNims = incomingStudents.map((s: any) => s.nim);
        if (incomingNims.length > 0) {
          await db.delete(students).where(notInArray(students.nim, incomingNims));
        } else {
          await db.delete(students);
        }
      } else {
        memoryDb.syncStudents(incomingStudents);
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

      if (isDatabaseAvailable) {
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
          .onDuplicateKeyUpdate({
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

        if (y.status === 'disetujui') {
          const existing = await db
            .select()
            .from(wisudaRegistrations)
            .where(eq(wisudaRegistrations.nim, y.nim));
          if (existing.length === 0) {
            await db.insert(wisudaRegistrations).values({
              nim: y.nim,
              ukuranToga: 'L',
              namaAyah: '-',
              namaIbu: '-',
              noHpOrtu: '-',
              alamatPengiriman: '-',
              registeredAt: new Date().toISOString().split('T')[0],
              status: 'diajukan',
            });
          }
        }
      } else {
        memoryDb.upsertYudisium(y);
      }

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

      if (isDatabaseAvailable) {
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
          .onDuplicateKeyUpdate({
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
      } else {
        memoryDb.upsertWisuda(w);
      }

      res.json({ message: 'Wisuda registration saved successfully' });
    } catch (err: any) {
      console.error('Error storing wisuda registration:', err);
      res.status(500).json({ error: 'Failed to save wisuda registration', details: err.message });
    }
  });

  // Student login verification against database (MySQL / memoryDb)
  app.post('/api/student/login', async (req, res) => {
    try {
      const { nim, password } = req.body;
      if (!nim) {
        return res.status(400).json({ error: 'NIM wajib diisi!' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Password wajib diisi!' });
      }

      let studentRecord;
      if (isDatabaseAvailable) {
        // Query directly from MySQL table
        const results = await db.select().from(students).where(eq(students.nim, nim.trim()));
        studentRecord = results[0];
      } else {
        // Find in memoryDb
        studentRecord = memoryDb.getStudents().find(s => s.nim === nim.trim());
      }

      if (!studentRecord) {
        return res.status(404).json({ error: `NIM "${nim}" tidak terdaftar di database akademik! Hubungi Program Studi/Fakultas anda.` });
      }

      // Default password fallback: 'kebudiutamaan'
      const expectedPassword = studentRecord.password || 'kebudiutamaan';
      if (password.trim() !== expectedPassword.trim()) {
        return res.status(401).json({ error: 'Password mahasiswa salah!' });
      }

      const parsedStudent = {
        ...studentRecord,
        ktpDoc: safeParseJSON(studentRecord.ktpDoc),
        ijazahSmaDoc: safeParseJSON(studentRecord.ijazahSmaDoc)
      };

      res.json({ success: true, student: parsedStudent });
    } catch (err: any) {
      console.error('Error student login:', err);
      res.status(500).json({ error: 'Terjadi kegagalan sistem saat memverifikasi login.', details: err.message });
    }
  });

  // Update a single student profile
  app.post('/api/students/profile', async (req, res) => {
    try {
      const std = req.body;
      if (!std.nim) {
        return res.status(455).json({ error: 'Student NIM is required.' });
      }

      if (isDatabaseAvailable) {
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
            password: std.password || 'kebudiutamaan',
            dataVerified: std.dataVerified || false,
            academicApproved: std.academicApproved || false,
            academicRejected: std.academicRejected || false,
            academicRejectionReason: std.academicRejectionReason || null,
            ktpDoc: std.ktpDoc || null,
            ijazahSmaDoc: std.ijazahSmaDoc || null,
          })
          .onDuplicateKeyUpdate({
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
              password: std.password || 'kebudiutamaan',
              dataVerified: std.dataVerified || false,
              academicApproved: std.academicApproved || false,
              academicRejected: std.academicRejected || false,
              academicRejectionReason: std.academicRejectionReason || null,
              ktpDoc: std.ktpDoc || null,
              ijazahSmaDoc: std.ijazahSmaDoc || null,
            },
          });
      } else {
        memoryDb.upsertStudentProfile(std);
      }

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

      if (isDatabaseAvailable) {
        await db
          .insert(adminUsers)
          .values({
            id: adm.id,
            nama: adm.nama,
            username: adm.username,
            password: adm.password,
            role: adm.role,
          })
          .onDuplicateKeyUpdate({
            set: {
              nama: adm.nama,
              password: adm.password,
              role: adm.role,
            },
           });
      } else {
        memoryDb.upsertAdminUser(adm);
      }

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
