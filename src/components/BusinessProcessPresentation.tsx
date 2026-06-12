import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Download, GraduationCap, 
  UserCheck2, Landmark, Award, Terminal, Layers, RefreshCw, FileText, CheckCircle, HelpCircle, X, Maximize2, Minimize2
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: 'Overview' | 'Mahasiswa' | 'Keuangan' | 'Akademik' | 'Wisuda' | 'GitHub Deploy';
  icon: React.ReactNode;
  bgColor: string;
  accentColor: string;
  steps: {
    title: string;
    description: string;
    actor: string;
  }[];
  summary: string;
  keyBenefits: string[];
}

export default function BusinessProcessPresentation({ onClose }: { onClose?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);

  const slides: Slide[] = [
    {
      id: 1,
      category: 'Overview',
      title: 'SIYUDI (Sistem Yudisium & Wisuda Digital)',
      subtitle: 'Arsitektur & Grand Business Process Portal Akademik Universitas IBO',
      icon: <Layers className="w-10 h-10" />,
      bgColor: 'bg-slate-900 text-white',
      accentColor: 'indigo',
      summary: 'SIYUDI menyatukan 4 pilar birokrasi kampus utama (Mahasiswa, Biro Keuangan, Biro Akademik Utama, dan Tim Infrastruktur GitHub DevOps) ke dalam satu wadah sinkronisasi real-time berbasis local state cache & CI-CD.',
      keyBenefits: [
        'Single Source of Truth terintegrasi penuh',
        'Validasi berkas digital bebas tatap muka',
        'Otomatisasi deployment sinkron dari repositori GitHub',
        'Dasbor keuangan lunas SPP terisolasi aman'
      ],
      steps: [
        { title: 'Inisiasi Data Akademik', description: 'Biro akademik mengunggah daftar mahasiswa lulus sidang skripsi via database Excel.', actor: 'Biro Akademik' },
        { title: 'Pengajuan Mandiri', description: 'Mahasiswa melengkapi berkas ijazah, NIK, dan mendaftar yudisium.', actor: 'Mahasiswa' },
        { title: 'Verifikasi Ganda', description: 'Biro Keuangan audit lunas SPP & Biro Akademik melakukan verifikasi yudisium.', actor: 'Layanan Keuangan & Akademik' },
        { title: 'Undangan Wisuda & Toga', description: 'Wisudawan yang disetujui mengisi spesifikasi Toga dan menerima undangan.', actor: 'Sistem & Calon Wisudawan' }
      ]
    },
    {
      id: 2,
      category: 'Mahasiswa',
      title: 'Alur 1: Manajemen Akun & Pengisian Profil Mahasiswa',
      subtitle: 'Gerbang Mandiri Calon Wisudawan',
      icon: <UserCheck2 className="w-10 h-10" />,
      bgColor: 'bg-white text-slate-800 border-slate-200',
      accentColor: 'indigo',
      summary: 'Mahasiswa bertindak sebagai pemula alur registrasi dengan memvalidasi data diri primer, mematuhinya dengan 16 digit NIK legal, serta melengkapi email operasional.',
      keyBenefits: [
        'Filter cerdas pencegah karakter non-digit di kolom NIK',
        'Indikator kelulusan bersyarat real-time',
        'Keamanan berbasis session-cookie virtual'
      ],
      steps: [
        { title: 'Autentikasi NIM', description: 'Mahasiswa login menggunakan NIM yang divalidasi silang terhadap database akademik utama.', actor: 'Mahasiswa' },
        { title: 'Input Data Kependudukan', description: 'Melakukan registrasi NIK 16 digit (telah terpasang pengaman filter keyboard non-digit).', actor: 'Mahasiswa' },
        { title: 'Profil Kontak Aktif', description: 'Memasukkan email terverifikasi dan nomor WhatsApp aktif guna koordinasi logistik wisuda.', actor: 'Mahasiswa' }
      ]
    },
    {
      id: 3,
      category: 'Keuangan',
      title: 'Alur 2: Verifikasi Bebas Masalah SPP & Finansial',
      subtitle: 'Garis Pertahanan Pertama Audit Kelayakan Yudisium',
      icon: <Landmark className="w-10 h-10" />,
      bgColor: 'bg-white text-slate-800 border-slate-200',
      accentColor: 'rose',
      summary: 'Biro Keuangan mengaudit pembayaran SPP wajib dari semester awal hingga akhir. Hanya mahasiswa dengan status "Bebas SPP" yang dapat disahkan langkah yudisiumnya.',
      keyBenefits: [
        'Antarmuka khusus kasir & administrasi keuangan',
        'Pemberian catatan/komentar revisi spesifik jika ada kekurangan bayar',
        'Tombol override instan kelayakan finansial'
      ],
      steps: [
        { title: 'Pemeriksaan Slip Pembayaran', description: 'Petugas kasir meneliti file bukti lunas SPP yang diunggah mahasiswa.', actor: 'Biro Keuangan' },
        { title: 'Status Override Lunas', description: 'Mengubah status di panel keuangan menjadi "Bebas Keuangan" apabila syarat terpenuhi.', actor: 'Biro Keuangan' },
        { title: 'Umpan Balik Instan', description: 'Sistem langsung memperbarui modul pengisian mahasiswa dan membuka kunci langkah Yudisium.', actor: 'Sistem' }
      ]
    },
    {
      id: 4,
      category: 'Akademik',
      title: 'Alur 3: Audit Berkas Yudisium & Penerbitan SK Lulus',
      subtitle: 'Pintu Gerbang Kelulusan Akademik Resmi',
      icon: <Award className="w-10 h-10" />,
      bgColor: 'bg-white text-slate-800 border-slate-200',
      accentColor: 'emerald',
      summary: 'Tim Biro Akademik memvalidasi empat berkas inti: PDF Ijazah Terakhir, Transkrip Akademik Kumulatif, Sertifikat Bebas Perpustakaan, dan Bukti Bebas Tunggakan SPP.',
      keyBenefits: [
        'Verifikasi parsial per dokumen (Setujui / Tolak per item)',
        'Kolom revisi dinamis yang memicu notifikasi di dashboard mahasiswa',
        'Peta ringkasan rasio kelulusan per-prodi'
      ],
      steps: [
        { title: 'Unggah Berkas Persyaratan', description: 'Mahasiswa mengunduh template syarat, melengkapinya, lalu mengunggah file formulir PDF/JPG.', actor: 'Mahasiswa' },
        { title: 'Review Parsial Biro', description: 'Biro akademik meneliti lembar demi lembar berkas. Menandai berkas cacat jika tidak sesuai.', actor: 'Biro Akademik' },
        { title: 'Pemberian Status Yudisium', description: 'Menyetujui pendaftaran keseluruhan, menetapkan predikat kelulusan, dan menerbitkan SK.', actor: 'Biro Akademik' }
      ]
    },
    {
      id: 5,
      category: 'Wisuda',
      title: 'Alur 4: Registrasi Wisuda & Distribusi Paket Toga',
      subtitle: 'Logistik & Seremonial Akhir Perkuliahan',
      icon: <GraduationCap className="w-10 h-10" />,
      bgColor: 'bg-white text-slate-800 border-slate-200',
      accentColor: 'amber',
      summary: 'Setelah disahkan yudisium, wisudawan mengisi detail seremonial seperti ukuran toga, nama orang tua kandung untuk ijazah, dan alamat pengiriman logistik.',
      keyBenefits: [
        'Pilihan ukuran Toga dinamis dengan panduan dimensi tubuh',
        'Pencetakan label alamat pengiriman ijazah & sertifikat otomatis',
        'Logistik tersentralisasi'
      ],
      steps: [
        { title: 'Aktivasi Gerbang Wisuda', description: 'Sistem membuka tombol "Daftar Wisuda" secara otomatis untuk mahasiswa berstatus Yudisium Disetujui.', actor: 'Sistem' },
        { title: 'Pengisian Atribut Wisuda', description: 'Mahasiswa memilih ukuran Toga (S/M/L/XL) dan menulis nama orang tua untuk naskah wisuda.', actor: 'Mahasiswa' },
        { title: 'Rencana Kursi & Toga', description: 'Biro akademik mencatat sebaran Toga dan menentukan plotting kursi kehormatan.', actor: 'Biro Akademik' }
      ]
    },
    {
      id: 6,
      category: 'GitHub Deploy',
      title: 'Integrasi DevOps: Pembaruan Mandiri via Repositori GitHub',
      subtitle: 'Arsitektur Deployment Nir-henti Portal SIYUDI',
      icon: <Terminal className="w-10 h-10" />,
      bgColor: 'bg-slate-950 text-slate-200 border-slate-800',
      accentColor: 'slate',
      summary: 'Khusus Superadmin, portal ini dilengkapi dashboard integrasi GitHub untuk sinkronisasi kode langsung dari repositori elfintermedia-glitch/siyudi-uibu ke Docker Node container.',
      keyBenefits: [
        'Webhooks mendeteksi Push commits dari branch "main"',
        'Proses pulling otomatis, npm install dependencies, dan Vite production SPA build',
        'Terminal log interaktif untuk memantau status kompilasi server'
      ],
      steps: [
        { title: 'Trigger Pembaruan', description: 'Developer melakukan git push kode termutakhir ke repositori GitHub.', actor: 'Developer / Superadmin' },
        { title: 'Koneksi API & Pengecekan', description: 'Superadmin mengeklik "Periksa Pembaruan Git" di dasbor guna mengidentifikasi SHA commit terbaru.', actor: 'Superadmin' },
        { title: 'Eksekusi Pull & Build', description: 'Klik "Tarik & Terapkan Pembaruan" untuk menarik kode, pasang modul, build Vite, rilis reverse-proxy port 3000.', actor: 'Sistem DevOps' }
      ]
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentSlide];

  // Helper to trigger browser print for exporting slide documentation
  const handlePrint = () => {
    window.print();
  };

  // Simulated Presentation Data JSON Download
  const handleDownloadSpecs = () => {
    const textData = slides.map(s => {
      const stepText = s.steps.map((st, i) => `${i+1}. [${st.actor}] ${st.title}: ${st.description}`).join('\n');
      return `=========================================\nSLIDE ${s.id}: ${s.title}\n=========================================\nKategori: ${s.category}\nSub-judul: ${s.subtitle}\nRingkasan Bisnis Proses:\n${s.summary}\n\nLangkah-langkah Alur:\n${stepText}\n\nManfaat Sistem:\n${s.keyBenefits.map(b => `- ${b}`).join('\n')}\n\n`;
    }).join('\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bisnis_proses_siyudi_universitas_ibo.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}>
      
      {/* HEADER BAR */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-black text-white tracking-widest uppercase font-sans">
              Lembar Presentasi Bisnis Proses SIYUDI
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Dokumentasi Lengkap Alur Akademik Yudisium & Wisuda Digital Universitas IBO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Text Spec Button Client Side */}
          <button
            type="button"
            onClick={handleDownloadSpecs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] uppercase tracking-wider font-extrabold rounded-lg border border-slate-700 transition-all cursor-pointer"
            title="Unduh Spesifikasi Teknis Bisnis Proses (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            Buku Panduan (.txt)
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] uppercase tracking-wider font-extrabold rounded-lg border border-slate-700 transition-all cursor-pointer mr-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Cetak PDF
          </button>

          {/* Toggle Fullscreen mode */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-transform hover:scale-105 cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 px-2.5 bg-slate-750 hover:bg-rose-600 hover:text-white rounded-lg text-slate-400 font-bold transition-all cursor-pointer"
            >
              <X className="w-4 h-4 inline-block align-middle" />
            </button>
          )}
        </div>
      </div>

      {/* CAROUSEL PRESENTATION CONTAINER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
        
        {/* SIDE BAR: SELECTOR SLIDES */}
        <div className="bg-slate-950 border-r border-slate-800 p-4 space-y-2 overflow-y-auto hidden lg:block text-left">
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-2 block">Daftar Slide Presentasi</span>
          <div className="space-y-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => { setCurrentSlide(idx); setIsPlaying(false); }}
                className={`w-full p-2.5 rounded-xl text-[11px] font-bold text-left transition-all border block ${
                  currentSlide === idx 
                    ? 'bg-indigo-650 hover:bg-indigo-700 border-indigo-500 text-white' 
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] opacity-70">0{s.id}</span>
                  <p className="truncate font-semibold">{s.category}</p>
                </div>
                <p className={`text-[10px] font-medium leading-tight line-clamp-1 mt-0.5 ${currentSlide === idx ? 'text-indigo-150' : 'text-slate-500'}`}>
                  {s.title}
                </p>
              </button>
            ))}
          </div>
          
          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2 text-[10.5px] font-semibold text-slate-500">
            <span className="text-[9px] uppercase font-bold tracking-widest block text-slate-500">Keterangan Akses Portal</span>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> 1. Mahasiswa (Siswa Mandiri)</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> 2. Biro Keuangan (Audit Kasir)</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> 3. Biro Akademik (Fungsionaris)</p>
              <p className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> 4. Superadmin (GitHub & Akses)</p>
            </div>
          </div>
        </div>

        {/* CENTER ACTIVE DISPLAY SLIDE */}
        <div className={`lg:col-span-3 flex flex-col justify-between p-6 md:p-8 relative transition-colors ${current.bgColor}`}>
          
          {/* WATERMARK BACKGROUND ICON */}
          <div className="absolute right-8 top-8 opacity-5 text-indigo-505 pointer-events-none">
            {current.icon}
          </div>

          {/* SLIDE COVER HEADER CATEGORY */}
          <div className="flex justify-between items-start gap-4 mb-4 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-650 text-white text-[10px] font-black tracking-widest uppercase rounded-full border border-indigo-500">
              SLIDE 0{current.id} : {current.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              Siklus Yudisium &copy; 2026 UNIBU MALANG
            </span>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center text-left max-w-2xl mx-auto w-full">
            <div className="space-y-1.5">
              <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight">
                {current.title}
              </h2>
              <p className="text-xs md:text-sm font-semibold opacity-75 italic font-sans">
                {current.subtitle}
              </p>
            </div>

            {/* TWO COLUMN GRID FOR SLIDE DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* LIST STEPS FLOW */}
              <div className="space-y-3">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest font-mono">
                  Langkah Proses Berantai:
                </p>
                <div className="relative border-l border-slate-500/30 pl-4 ml-2.5 space-y-4">
                  {current.steps.map((st, sidx) => (
                    <div key={sidx} className="relative group text-xs">
                      {/* Bullet Dot */}
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-slate-900 group-hover:scale-125 transition-transform flex items-center justify-center font-mono text-[8px] text-white">
                        {sidx+1}
                      </span>
                      <p className="font-extrabold text-[12px] opacity-95">
                        {st.title} 
                        <span className="ml-1.5 px-1.5 py-0.2 bg-slate-800 text-[9px] text-indigo-300 font-mono rounded font-bold uppercase tracking-wider">{st.actor}</span>
                      </p>
                      <p className="opacity-70 mt-0.5 leading-tight text-[11px] font-medium">{st.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BENEFITS & CONTEXT */}
              <div className="space-y-4 bg-slate-850/40 p-4 rounded-2xl border border-slate-700/30">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Ringkasan Konseptual:</p>
                  <p className="text-[11.5px] leading-relaxed opacity-90 font-medium font-sans">
                    {current.summary}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-700/50">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-mono">Kelebihan & Pengaman Sistem:</p>
                  <ul className="space-y-1 text-[11px] font-semibold opacity-85">
                    {current.keyBenefits.map((b, bidx) => (
                      <li key={bidx} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-indigo-400 mt-0.5 font-bold">✓</span>
                        <p>{b}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* LOWER PRESENTATION PLAYER BUTTONS */}
          <div className="mt-6 border-t border-slate-700/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <p className="text-[11px] font-bold text-slate-400">
              Slide <span className="text-white font-mono">{currentSlide + 1}</span> dari <span className="text-white font-mono">{slides.length}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Slide Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isPlaying ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                title="Autoplay Slide Presentasi"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play (Auto)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Slide Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* SLIDE PROGRESS PIP DOTS */}
            <div className="flex gap-1.5">
              {slides.map((_, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => { setCurrentSlide(pIdx); setIsPlaying(false); }}
                  className={`w-2.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    currentSlide === pIdx ? 'bg-indigo-500 w-5' : 'bg-slate-700'
                  }`}
                  title={`Ke Slide ${pIdx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* DOCK SHOW NOTES ON SCREEN BY DEFAULT */}
      {showNotes && (
        <div className="bg-slate-950 p-4 border-t border-slate-800 text-left text-xs text-slate-400 space-y-1 font-semibold leading-relaxed">
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest font-mono">Slide Presenter Notes (Spesifikasi Teknis Bisnis Proses):</p>
          <p className="text-[11px] font-medium">Presentasi interaktif di atas mendemonstrasikan integrasi multifaset aplikasi SIYUDI. Alur dimulai dari database excel akademik yang diunggah oleh <strong>Staf Akademik</strong>, dilanjutkan pengisian NIK terproteksi secara mandiri oleh <strong>Mahasiswa</strong>, validasi lunas SPP oleh <strong>Biro Keuangan</strong>, audit verifikasi berkas oleh <strong>Akademik</strong>, pendaftaran sebaran baju wisuda logistik Toga, hingga penanganan patch DevOps real-time termutakhir memanfaatkan <strong>Konektor GitHub Autodeploy</strong> untuk penulisan kode modern.</p>
        </div>
      )}

    </div>
  );
}
