import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Check, AlertCircle, RefreshCw, Table, HelpCircle, Download, School } from 'lucide-react';
import { StudentAcademic } from '../types';

export const ALLOWED_PROGRAM_STUDI = [
  'Pendidikan Matematika',
  'Pendidikan Ekonomi',
  'Magister Pendidikan Olahraga',
  'Pendidikan Jasmani Kesehatan dan Rekreasi',
  'Pendidikan Biologi',
  'Pendidikan Bahasa Inggris',
  'Pendidikan Bahasa dan Sastra Indonesia',
  'Pendidikan Sejarah dan Sosiologi',
  'Pendidikan Profesi Guru',
  'Teknik Kimia',
  'Teknik Mesin',
  'Teknik Elektro'
];

interface ExcelImporterProps {
  onImport: (newStudents: StudentAcademic[]) => void;
  existingStudentsCount: number;
}

export default function ExcelImporter({ onImport, existingStudentsCount }: ExcelImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  
  // Column mapping state
  const [mappings, setMappings] = useState<Record<string, string>>({
    nim: '',
    nik: '',
    nama: '',
    tempatLahir: '',
    tanggalLahir: '',
    programStudi: '',
    statusKelulusan: '',
    keterangan: '',
    email: '',
    noHp: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredFields = [
    { key: 'nim', label: 'NIM (Nomor Induk Mahasiswa)' },
    { key: 'nik', label: 'NIK (Nomor Induk Kependudukan)' },
    { key: 'nama', label: 'Nama Lengkap' },
    { key: 'tempatLahir', label: 'Tempat Lahir' },
    { key: 'tanggalLahir', label: 'Tanggal Lahir (YYYY-MM-DD)' },
    { key: 'programStudi', label: 'Program Studi / Jurusan' },
    { key: 'statusKelulusan', label: 'Status Kelulusan (Lulus / Belum Lulus)' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const isExcel = selectedFile.name.endsWith('.xlsx') || 
                    selectedFile.name.endsWith('.xls') || 
                    selectedFile.name.endsWith('.csv');
                    
    if (!isExcel) {
      setError('Format file tidak didukung. Silakan unggah file .xlsx, .xls, atau .csv');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook;
        
        if (selectedFile.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'binary', codepage: 65001 });
        } else {
          workbook = XLSX.read(data, { type: 'binary' });
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse raw rows as arrays of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (rawJson.length === 0) {
          setError('File kosong atau tidak dapat diuraikan.');
          return;
        }

        // Extract potential headers from the first row keys
        const fileHeaders = Object.keys(rawJson[0]);
        setHeaders(fileHeaders);
        setParsedRows(rawJson);

        // Attempt smart automatic mapping based on keyword similarities
        const autoMappings: Record<string, string> = {};
        
        requiredFields.forEach((field) => {
          const match = fileHeaders.find(h => {
            const hLower = h.toLowerCase().replace(/[\s_\-.]/g, '');
            const keyLower = field.key.toLowerCase();
            return hLower.includes(keyLower) || 
                   (field.key === 'nim' && (hLower === 'nim' || hLower.includes('induk'))) ||
                   (field.key === 'nik' && (hLower === 'nik' || hLower.includes('kependudukan') || hLower.includes('identitas'))) ||
                   (field.key === 'nama' && (hLower === 'nama' || hLower.includes('name'))) ||
                   (field.key === 'tempatLahir' && (hLower.includes('tempat') || hLower.includes('tmplahir') || hLower.includes('lahir'))) ||
                   (field.key === 'tanggalLahir' && (hLower.includes('tanggal') || hLower.includes('tgl') || hLower.includes('tgllahir') || hLower.includes('tgl_lah'))) ||
                   (field.key === 'statusKelulusan' && (hLower.includes('lulus') || hLower.includes('status')));
          });
          autoMappings[field.key] = match || '';
        });

        // Set optional mappings
        const optEmail = fileHeaders.find(h => h.toLowerCase().includes('email') || h.toLowerCase().includes('mail'));
        const optHp = fileHeaders.find(h => h.toLowerCase().includes('hp') || h.toLowerCase().includes('telepon') || h.toLowerCase().includes('phone'));
        autoMappings['keterangan'] = fileHeaders.find(h => h.toLowerCase().includes('keterangan') || h.toLowerCase().includes('notes')) || '';
        autoMappings['email'] = optEmail || '';
        autoMappings['noHp'] = optHp || '';

        setMappings(autoMappings);
      } catch (err: any) {
        setError('Gagal membaca file: ' + err.message);
      }
    };

    reader.onerror = () => {
      setError('Kesalahan saat membaca file.');
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleMapChange = (key: string, value: string) => {
    setMappings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExecuteImport = () => {
    // Validate mapping completeness
    const missingFields = requiredFields.filter(f => !mappings[f.key]);
    if (missingFields.length > 0) {
      setError(`Harap tentukan kolom Excel untuk kolom wajib berikut: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      const processedStudents: StudentAcademic[] = parsedRows.map((row, index) => {
        const rawNim = String(row[mappings.nim] || '').trim();
        const rawNik = String(row[mappings.nik] || '').trim();
        const rawNama = String(row[mappings.nama] || '').trim();
        const rawTempatLahir = String(row[mappings.tempatLahir] || '').trim();
        const rawTanggalLahir = String(row[mappings.tanggalLahir] || '').trim();
        const rawProdi = String(row[mappings.programStudi] || '').trim();

        let rawStatusText = String(row[mappings.statusKelulusan] || '').toLowerCase().trim();
        let statusKelulusan: 'Lulus' | 'Belum Lulus' = 'Belum Lulus';
        if (rawStatusText.includes('lulus') && !rawStatusText.includes('belum')) {
          statusKelulusan = 'Lulus';
        }

        const keterangan = mappings.keterangan ? String(row[mappings.keterangan] || '').trim() : undefined;
        const email = mappings.email ? String(row[mappings.email] || '').trim() : undefined;
        const noHp = mappings.noHp ? String(row[mappings.noHp] || '').trim() : undefined;

        if (!rawNim || !rawNik || !rawNama || !rawTempatLahir || !rawTanggalLahir) {
          throw new Error(`Baris ke-${index + 1} tidak memiliki NIM, NIK, Nama Lengkap, Tempat Lahir, atau Tanggal Lahir.`);
        }

        const isTeknik = rawProdi.startsWith('Teknik');
        const isMagister = rawProdi.startsWith('Magister');
        let computedFakultas = 'Fakultas Keguruan dan Ilmu Pendidikan';
        if (isTeknik) computedFakultas = 'Fakultas Teknik';
        else if (isMagister) computedFakultas = 'Pascasarjana';

        return {
          nim: rawNim,
          nik: rawNik,
          nama: rawNama,
          tempatLahir: rawTempatLahir || 'Malang',
          tanggalLahir: rawTanggalLahir || '2004-01-01',
          fakultas: computedFakultas,
          programStudi: rawProdi || 'Pendidikan Matematika',
          statusKelulusan,
          keterangan: keterangan || (statusKelulusan === 'Lulus' ? 'Memenuhi syarat kelulusan' : 'Belum memenuhi syarat SKS'),
          email,
          noHp,
          password: 'kebudiutamaan'
        };
      });

      onImport(processedStudents);
      setSuccessCount(processedStudents.length);
      resetImporterState();
    } catch (err: any) {
      setError(`Kesalahan selama konversi data: ${err.message}`);
    }
  };

  const resetImporterState = () => {
    setFile(null);
    setParsedRows([]);
    setHeaders([]);
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      ['NIM', 'NIK', 'NAMA LENGKAP', 'TEMPAT LAHIR', 'TANGGAL LAHIR', 'PROGRAM STUDI', 'STATUS KELULUSAN', 'KETERANGAN', 'EMAIL', 'NO HANDPHONE'],
      ['120140999', '3573011212990001', 'Rian Hidayat', 'Malang', '2004-05-12', 'Pendidikan Matematika', 'Lulus', 'Memenuhi syarat kelulusan akademik', 'rian.hidayat@univ.ac.id', '085277884422'],
      ['120140888', '3573011212990002', 'Suryani Atika', 'Surabaya', '2004-08-22', 'Teknik Mesin', 'Belum Lulus', 'Kurang mata kuliah pilihan', 'suryani@univ.ac.id', '089912345678'],
      ['120140777', '3573011212990003', 'Farhan Mahendra', 'Blitar', '2003-11-04', 'Pendidikan Bahasa Inggris', 'Lulus', 'Memenuhi syarat kelulusan akademik', 'farhan.m@univ.ac.id', '081242421212']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Akademik');
    
    // Generate .csv format for universally safe downloading without complex file outputs
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_academic_yudisium.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateMockSample = () => {
    const mockData: StudentAcademic[] = [
      {
        nim: '120140999',
        nik: '3573011212990001',
        nama: 'Rian Hidayat',
        tempatLahir: 'Malang',
        tanggalLahir: '2004-05-12',
        fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan',
        programStudi: 'Pendidikan Matematika',
        statusKelulusan: 'Lulus',
        keterangan: 'Memenuhi syarat kelulusan akademik secara penuh',
        email: 'rian.hidayat@univ.ac.id',
        noHp: '085277884422',
        password: 'kebudiutamaan'
      },
      {
        nim: '120140888',
        nik: '3573011212990002',
        nama: 'Suryani Atika',
        tempatLahir: 'Surabaya',
        tanggalLahir: '2004-08-22',
        fakultas: 'Fakultas Teknik',
        programStudi: 'Teknik Mesin',
        statusKelulusan: 'Belum Lulus',
        keterangan: 'Skripsi belum selesai diunggah.',
        email: 'suryani@univ.ac.id',
        noHp: '089912345678',
        password: 'kebudiutamaan'
      },
      {
        nim: '120140777',
        nik: '3573011212990003',
        nama: 'Farhan Mahendra',
        tempatLahir: 'Blitar',
        tanggalLahir: '2003-11-04',
        fakultas: 'Fakultas Keguruan dan Ilmu Pendidikan',
        programStudi: 'Pendidikan Bahasa Inggris',
        statusKelulusan: 'Lulus',
        keterangan: 'Memenuhi syarat kelulusan akademik',
        email: 'farhan.m@univ.ac.id',
        noHp: '081242421212',
        password: 'kebudiutamaan'
      }
    ];
    onImport(mockData);
    setSuccessCount(mockData.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="importer-title" className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Unggah Basis Data Akademik
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Impor data mahasiswa langsung dari file Excel atau CSV secara digital.
          </p>
          <div className="mt-2.5 p-3 bg-slate-50 border border-slate-205 rounded-xl space-y-1.5 max-h-40 overflow-y-auto">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-indigo-600" /> Program Studi Universitas IBU (12 Pilihan):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[10px] text-slate-650">
              {ALLOWED_PROGRAM_STUDI.map((prodi, idx) => (
                <div key={idx} className="flex items-center gap-1 font-medium truncate">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                  {prodi}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            id="download-template-btn"
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-755 bg-gray-50 hover:bg-gray-100 border border-gray-250 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Template CSV
          </button>
          <button
            id="inject-mock-btn"
            onClick={handleCreateMockSample}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Gunakan Sampel Cepat
          </button>
        </div>
      </div>

      {successCount !== null && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-emerald-900">Uraian Impor Berhasil!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Sebanyak {successCount} data mahasiswa akademik berhasil dipetakan dan diintegrasikan ke basis data kelulusan wisuda.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-rose-900">Validasi Impor Gagal</h4>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!file ? (
        <div
          id="dropzone-area"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
              : 'border-gray-250 hover:border-indigo-400 hover:bg-gray-50/50'
          }`}
        >
          <input
            id="academic-file-input"
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="font-semibold text-slate-700 text-sm">Tarik & lepas file Anda di sini, atau cari file</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Mendukung format Microsoft Excel (.xlsx, .xls) atau CSV (.csv)</p>
          <div className="px-3 py-1.5 bg-slate-100 rounded text-slate-600 border border-slate-200 font-mono text-[11px]">
            Format data: NIM, Nama, IPK, SKS, Status Kelulusan, dll.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 truncate max-w-sm md:max-w-md">{file.name}</p>
                <p className="text-xs text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB — {parsedRows.length} baris diuraikan</p>
              </div>
            </div>
            <button
              id="re-upload-btn"
              onClick={resetImporterState}
              className="p-1 px-2.5 inline-flex items-center gap-1 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Ganti file
            </button>
          </div>

          {/* Mapping settings */}
          <div className="bg-slate-50/40 rounded-xl border border-slate-200/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Table className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-700">Petakan Kolom Excel / CSV</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Sesuaikan kolom dari file Excel Anda dengan field yang dibutuhkan oleh sistem untuk validasi kelulusan & akun login mahasiswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requiredFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    {field.label} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id={`map-select-${field.key}`}
                    value={mappings[field.key]}
                    onChange={(e) => handleMapChange(field.key, e.target.value)}
                    className="p-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Hubungkan Kolom --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  Email Mahasiswa (Opsional)
                </label>
                <select
                  id="map-select-email"
                  value={mappings.email}
                  onChange={(e) => handleMapChange('email', e.target.value)}
                  className="p-2 border border-slate-200 bg-white rounded-lg text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Hubungkan Kolom (Opsional) --</option>
                  {headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  Nomor HP (Opsional)
                </label>
                <select
                  id="map-select-noHp"
                  value={mappings.noHp}
                  onChange={(e) => handleMapChange('noHp', e.target.value)}
                  className="p-2 border border-slate-200 bg-white rounded-lg text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Hubungkan Kolom (Opsional) --</option>
                  {headers.map((h, i) => (
                    <option key={i} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-4">
            <button
              id="cancel-import-btn"
              onClick={resetImporterState}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="execute-import-btn"
              onClick={handleExecuteImport}
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-705 active:bg-indigo-805 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Proses & Ambil Data ({parsedRows.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
