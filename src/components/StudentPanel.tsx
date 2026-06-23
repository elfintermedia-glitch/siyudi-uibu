import React, { useState, useEffect } from 'react';
import { 
  User, GraduationCap, CheckCircle2, CheckCircle, AlertTriangle, FileText, Upload, 
  Trash2, Send, HelpCircle, Check, MapPin, Sparkles, BookOpen, Clock, FileWarning, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
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
  
  // Tab states for verification steps
  const [activeStepTab, setActiveStepTab] = useState<number>(() => {
    if (!student.academicApproved) return 1;
    if (yudisium?.status !== 'disetujui') return 2;
    return 3;
  });

  const [showCelebrationPopup, setShowCelebrationPopup] = useState(() => {
    return localStorage.getItem(`saw_congrats_${student.nim}`) !== 'true' && student.statusKelulusan === 'Lulus';
  });

  const handleCloseCelebration = () => {
    localStorage.setItem(`saw_congrats_${student.nim}`, 'true');
    setShowCelebrationPopup(false);
  };

  useEffect(() => {
    if (student.academicApproved) {
      if (yudisium?.status !== 'disetujui') {
        setActiveStepTab(2);
      } else {
        setActiveStepTab(3);
      }
    } else {
      setActiveStepTab(1);
    }
  }, [student.academicApproved, yudisium?.status]);

  const getQRCodeBase64 = async (nim: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      };
      img.onerror = () => {
        resolve('');
      };
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(nim)}`;
    });
  };

  const getLogoBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 300, 300);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve('');
        }
      };
      img.onerror = () => {
        resolve('');
      };
      img.src = '/favicon.svg';
    });
  };

  const drawHeaderKOP = (doc: any, logoBase64: string, primaryColor: number[]) => {
    // Left Logo
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'PNG', 15, 12, 25, 25);
      } catch (e) {
        console.error('Error adding logo to PDF:', e);
      }
    } else {
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, 12, 25, 25);
    }

    // Center text - Serif (times) style like the logo
    doc.setTextColor(30, 41, 59);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text('Universitas Insan', 43, 17);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(23);
    doc.text('Budi Utomo', 43, 25);
    
    doc.setFont('times', 'bold');
    doc.setFontSize(8.5);
    doc.text('dh. IKIP Budi Utomo dan STTI Turen', 43, 29.5);
    
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    doc.text('Where Minds & Hearts Find Harmony', 43, 33.5);

    // Right Column - Akkreditasi box & details
    doc.setFillColor(0, 0, 0); // Solid black for badge background
    doc.rect(148, 12.5, 47, 4.5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.text('T E R A K R E D I T A S I', 171.5, 16, { align: 'center' });

    doc.setTextColor(51, 65, 85);
    doc.setFont('times', 'normal');
    doc.setFontSize(7.5);
    doc.text('Jl. Simpang Arjuno 14 B Malang', 171.5, 21, { align: 'center' });
    doc.text('Jl. Citandui 46 Malang', 171.5, 24, { align: 'center' });
    doc.text('(0341) 323214 - 326019, Fax. 335070', 171.5, 27, { align: 'center' });
    doc.text('uibu.ac.id', 171.5, 30, { align: 'center' });
    doc.text('info@budiutomomalang.ac.id', 171.5, 33, { align: 'center' });

    // Separator double line
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(1);
    doc.line(15, 38, 210 - 15, 38);
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 39.5, 210 - 15, 39.5);
  };

  const previewStep1PDF = async () => {
    try {
      const logoBase64 = await getLogoBase64();
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [5, 150, 105]; // Emerald #059669
      const darkColor = [30, 41, 59]; // Slate 800
      const greyColor = [100, 116, 139]; // Slate 500

      // Margins & Dimensions
      const width = 210;
      const height = 297;

      // Draw elegant emerald border
      doc.setDrawColor(209, 250, 229); // Emerald 100
      doc.setLineWidth(1);
      doc.rect(10, 10, width - 20, height - 20);

      // Inner double border
      doc.setDrawColor(5, 150, 105); // Emerald
      doc.setLineWidth(0.3);
      doc.rect(12, 12, width - 24, height - 24);

      // Kop Surat (Header)
      drawHeaderKOP(doc, logoBase64, primaryColor);

      // Document Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(5, 150, 105);
      doc.text('SURAT KETERANGAN VERIFIKASI DATA ALUMNI & CETAK IJAZAH', width / 2, 50, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nomor Dokumen: BAAK/IBU-VAL1/${student.nim}/${new Date().getFullYear()}`, width / 2, 55, { align: 'center' });

      // Statement
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Biro Administrasi Akademik (BAAK) Universitas Insan Budi Utomo Malang, menerangkan bahwa:', 20, 68);

      // Student Metadata Table
      const metadataStartY = 75;
      const rowHeight = 7;
      
      const details = [
        ['Nama Lengkap', `: ${student.nama}`],
        ['NIM', `: ${student.nim}`],
        ['NIK', `: ${student.nik || '- (Belum Diisi)'}`],
        ['Tempat, Tanggal Lahir', `: ${student.tempatLahir && student.tanggalLahir ? `${student.tempatLahir}, ${student.tanggalLahir}` : '- (Belum Diisi)'}`],
        ['Fakultas', `: ${student.fakultas}`],
        ['Program Studi', `: ${student.programStudi}`],
        ['Email Resmi', `: ${student.email || '-'}`],
      ];

      doc.setFont('helvetica', 'normal');
      details.forEach((item, index) => {
        const y = metadataStartY + (index * rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(item[0], 25, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(item[1], 75, y);
      });

      // Verification status details
      const statusStartY = 135;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('STATUS VERIFIKASI KELAYAKAN DATA', 20, statusStartY);

      // Render status box
      const statusText = !student.dataVerified 
        ? 'DRAFT BELUM DIKUNCI' 
        : !student.academicApproved 
          ? 'TERKUNCI & ANTRIAN VERIFIKASI' 
          : 'SAH & DISETUJUI BAAK (ACC)';
          
      const statusDesc = !student.dataVerified
        ? 'Mahasiswa belum menyelesaikan peninjauan berkas. Data di atas masih dapat berubah.'
        : !student.academicApproved
          ? 'Mahasiswa telah mengunci data. Berkas dalam antrean peninjauan oleh verifikator BAAK.'
          : 'Data kelayakan pencetakan ijazah dinyatakan SAH, VALID, dan SIAP UNTUK DICETAK.';

      const boxColor = !student.dataVerified 
        ? [251, 191, 36] // Amber
        : !student.academicApproved 
          ? [99, 102, 241] // Indigo
          : [16, 185, 129]; // Emerald

      doc.setFillColor(248, 250, 252); // Off white
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, statusStartY + 4, width - 40, 25, 'F');
      doc.rect(20, statusStartY + 4, width - 40, 25);

      // Left indicator bar
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.rect(20, statusStartY + 4, 3, 25, 'F');

      // Status Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.text(statusText, 27, statusStartY + 12);

      // Status Desc
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(statusDesc, 27, statusStartY + 19);

      // Statement of valid documents
      const docsStartY = 172;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('KELENGKAPAN DOKUMEN PENDUKUNG:', 20, docsStartY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const ktpStatus = student.ktpDoc ? (student.ktpDoc.status === 'disetujui' ? 'Ready & ACC' : 'Terunggah (Pending)') : 'Belum Diunggah';
      const ijazahStatus = student.ijazahSmaDoc ? (student.ijazahSmaDoc.status === 'disetujui' ? 'Ready & ACC' : 'Terunggah (Pending)') : 'Belum Diunggah';
      doc.text(`1. Kartu Tanda Penduduk (KTP) : [ ${ktpStatus} ]`, 25, docsStartY + 7);
      doc.text(`2. Ijazah SMA / Sederajat            : [ ${ijazahStatus} ]`, 25, docsStartY + 13);

      // Footer disclaimer text
      const disclaimerY = 195;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const disclaimerText = 'Lembar ini diterbitkan secara otomatis oleh sistem SiHeppiee Universitas Insan Budi Utomo Malang sebagai bukti verifikasi kelayakan pencetakan ijazah mahasiswa.';
      const splitText = doc.splitTextToSize(disclaimerText, width - 40);
      doc.text(splitText, 20, disclaimerY);

      // Signatures
      const sigY = 215;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Malang, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 130, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Kepala BAAK Universitas,', 130, sigY + 5);

      // Mock Stamp Box
      if (student.academicApproved) {
        doc.setDrawColor(16, 185, 129); // Emerald
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(16, 185, 129);
        doc.rect(130, sigY + 9, 45, 12);
        doc.text('[ TERVERIFIKASI SISTEM ]', 133, sigY + 14);
        doc.text('BAAK Universitas IBU', 136, sigY + 18);
      } else {
        doc.setDrawColor(99, 102, 241); // Indigo
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(99, 102, 241);
        doc.rect(130, sigY + 9, 45, 12);
        doc.text('[ KUNCI DATA MANDIRI ]', 134, sigY + 14);
        doc.text('Verifikasi Antrean BAAK', 134, sigY + 18);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Dr. Nopem Kusumaningtyas, M.Pd', 130, sigY + 30);

      // QR Code underneath signatures / at bottom left
      const qrY = sigY;
      const qrX = 25;
      
      // Load QR Code onto document as image
      const qrBase64 = await getQRCodeBase64(student.nim);
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', qrX, qrY + 2, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`NIM: ${student.nim}`, qrX, qrY + 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('QR Code Otentikasi NIM', qrX, qrY + 37);
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.rect(qrX, qrY + 2, 28, 28);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text('[QR CODE ERROR]', qrX + 4, qrY + 15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`NIM: ${student.nim}`, qrX, qrY + 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('Otentikasi NIM Berkas', qrX, qrY + 37);
      }

      // Preview PDF in new tab
      const pdfBlob = doc.output('blob');
      const blobURL = URL.createObjectURL(pdfBlob);
      window.open(blobURL, '_blank');
    } catch (error) {
      console.error('Gagal membuat PDF Langkah 1:', error);
      alert('Terjadi kesalahan saat memproses file PDF bukti verifikasi.');
    }
  };

  const previewStep2PDF = async () => {
    try {
      const logoBase64 = await getLogoBase64();
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [79, 70, 229]; // Indigo
      const darkColor = [30, 41, 59];
      const greyColor = [100, 116, 139];

      const width = 210;
      const height = 297;

      // Draw border
      doc.setDrawColor(224, 231, 255); // Indigo 100
      doc.setLineWidth(1);
      doc.rect(10, 10, width - 20, height - 20);

      // Inner border
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.3);
      doc.rect(12, 12, width - 24, height - 24);

      // Kop Surat
      drawHeaderKOP(doc, logoBase64, primaryColor);

      // Document Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text('SURAT KETERANGAN BEBAS ADMINISTRASI KEUANGAN & KELAYAKAN YUDISIUM', width / 2, 50, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nomor Dokumen: BAUK/IBU-VAL2/${student.nim}/${new Date().getFullYear()}`, width / 2, 55, { align: 'center' });

      // Statement
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Biro Administrasi Umum dan Keuangan (BAUK) Universitas Insan Budi Utomo Malang, menerangkan:', 20, 68);

      // Student Metadata Table
      const metadataStartY = 75;
      const rowHeight = 7;
      
      const details = [
        ['Nama Lengkap', `: ${student.nama}`],
        ['NIM', `: ${student.nim}`],
        ['NIK', `: ${student.nik || '- (Belum Diisi)'}`],
        ['Tempat, Tanggal Lahir', `: ${student.tempatLahir && student.tanggalLahir ? `${student.tempatLahir}, ${student.tanggalLahir}` : '- (Belum Diisi)'}`],
        ['Fakultas', `: ${student.fakultas}`],
        ['Program Studi', `: ${student.programStudi}`],
        ['Email Resmi', `: ${student.email || '-'}`],
      ];

      doc.setFont('helvetica', 'normal');
      details.forEach((item, index) => {
        const y = metadataStartY + (index * rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(item[0], 25, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(item[1], 75, y);
      });

      // Verification status details
      const statusStartY = 135;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('STATUS VERIFIKASI KEUANGAN YUDISIUM', 20, statusStartY);

      // Render status box
      const isApproved = yudisium?.status === 'disetujui';
      const isRejected = yudisium?.status === 'ditolak';

      const statusText = !student.academicApproved
        ? 'PROSES TERKUNCI (LANGKAH 1 BELUM SELESAI)'
        : isApproved
          ? 'SAH & KEUANGAN SETUJU (ACC YUDISIUM)'
          : isRejected
            ? 'TOLAK / TANGGUH VERIFIKASI'
            : 'ANTREAN VERIFIKASI BAUK KEUANGAN';

      const statusDesc = !student.academicApproved
        ? 'Langkah 1 (Akademik) belum disetujui. Verifikasi administrasi keuangan belum dibuka.'
        : isApproved
          ? 'Kebenaran administrasi keuangan lunas & BEBAS ADMINISTRASI KEUANGAN Yudisium.'
          : isRejected
            ? `Persetujuan ditangguhkan. Alasan: ${yudisium?.rejectionReason || 'Ada berkas yang perlu dikonfirmasi.'}`
            : 'Mahasiswa berada dalam antrean peninjauan log tagihan keuangan oleh bagian BAUK.';

      const boxColor = !student.academicApproved
        ? [148, 163, 184] // Slate
        : isApproved
          ? [16, 185, 129] // Emerald
          : isRejected
            ? [239, 68, 68] // Rose
            : [245, 158, 11]; // Amber

      doc.setFillColor(248, 250, 252); // Off white
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, statusStartY + 4, width - 40, 25, 'F');
      doc.rect(20, statusStartY + 4, width - 40, 25);

      // Left indicator bar
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.rect(20, statusStartY + 4, 3, 25, 'F');

      // Status Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.text(statusText, 27, statusStartY + 12);

      // Status Desc
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(statusDesc, 27, statusStartY + 19);

      // Supporting checks
      const docsStartY = 172;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('REKONSILIASI PENUNJANG ADMINISTRASI:', 20, docsStartY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const SPPStatus = isApproved ? 'Lunas / ACC' : isRejected ? 'Ada Tunggakan / Revisi' : 'Menunggu Verifikasi';
      doc.text(`1. Biaya Perkuliahan & SPP       : [ ${SPPStatus} ]`, 25, docsStartY + 7);
      doc.text(`2. Biaya Administrasi Yudisium : [ ${isApproved ? 'Lunas / ACC' : 'Menunggu Verifikasi'} ]`, 25, docsStartY + 13);

      const disclaimerY = 195;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const disclaimerText = 'Lembar ini diterbitkan secara otomatis oleh sistem SiHeppiee Universitas Insan Budi Utomo Malang sebagai bukti kelayakan bebas tunjangan keuangan bagi mahasiswa.';
      const splitText = doc.splitTextToSize(disclaimerText, width - 40);
      doc.text(splitText, 20, disclaimerY);

      // Signatures
      const sigY = 215;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Malang, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 130, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Kepala BAUK Universitas,', 130, sigY + 5);

      // Stamp Box
      if (isApproved) {
        doc.setDrawColor(16, 185, 129); // Emerald
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(16, 185, 129);
        doc.rect(130, sigY + 9, 45, 12);
        doc.text('[ TERVERIFIKASI SISTEM ]', 133, sigY + 14);
        doc.text('BAUK Universitas IBU', 136, sigY + 18);
      } else {
        doc.setDrawColor(79, 70, 229); // Indigo
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(79, 70, 229);
        doc.rect(130, sigY + 9, 45, 12);
        doc.text('[ VERIFIKASI ANTREAN ]', 134, sigY + 14);
        doc.text('Biro Keuangan IBU', 136, sigY + 18);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Adi, S.Pd., M.Pd.', 130, sigY + 30);

      // QR Code bottom left
      const qrY = sigY;
      const qrX = 25;
      
      const qrBase64 = await getQRCodeBase64(student.nim);
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', qrX, qrY + 2, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`NIM: ${student.nim}`, qrX, qrY + 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('QR Code Otentikasi NIM', qrX, qrY + 37);
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.rect(qrX, qrY + 2, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`NIM: ${student.nim}`, qrX, qrY + 34);
      }

      const pdfBlob = doc.output('blob');
      const blobURL = URL.createObjectURL(pdfBlob);
      window.open(blobURL, '_blank');
    } catch (error) {
      console.error('Gagal membuat PDF Langkah 2:', error);
      alert('Terjadi kesalahan saat memproses file PDF bukti verifikasi.');
    }
  };

  const previewStep3PDF = async () => {
    try {
      const logoBase64 = await getLogoBase64();
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [13, 148, 136]; // Teal
      const darkColor = [30, 41, 59];
      const greyColor = [100, 116, 139];

      const width = 210;
      const height = 297;

      // Draw border
      doc.setDrawColor(204, 251, 241); // Teal 100
      doc.setLineWidth(1);
      doc.rect(10, 10, width - 20, height - 20);

      // Inner border
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.3);
      doc.rect(12, 12, width - 24, height - 24);

      // Kop Surat
      drawHeaderKOP(doc, logoBase64, primaryColor);

      // Document Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text('SURAT KETERANGAN KELAYAKAN LOGISTIK & PENDAFTARAN WISUDA', width / 2, 50, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nomor Dokumen: BAUK/IBU-VAL3/${student.nim}/${new Date().getFullYear()}`, width / 2, 55, { align: 'center' });

      // Statement
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Biro Administrasi Umum dan Keuangan (BAUK) Universitas Insan Budi Utomo Malang, menerangkan:', 20, 68);

      // Student Metadata Table
      const metadataStartY = 75;
      const rowHeight = 7;
      
      const details = [
        ['Nama Lengkap', `: ${student.nama}`],
        ['NIM', `: ${student.nim}`],
        ['NIK', `: ${student.nik || '- (Belum Diisi)'}`],
        ['Tempat, Tanggal Lahir', `: ${student.tempatLahir && student.tanggalLahir ? `${student.tempatLahir}, ${student.tanggalLahir}` : '- (Belum Diisi)'}`],
        ['Fakultas', `: ${student.fakultas}`],
        ['Program Studi', `: ${student.programStudi}`],
        ['Email Resmi', `: ${student.email || '-'}`],
      ];

      doc.setFont('helvetica', 'normal');
      details.forEach((item, index) => {
        const y = metadataStartY + (index * rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(item[0], 25, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(item[1], 75, y);
      });

      // Verification status details
      const statusStartY = 135;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('STATUS VERIFIKASI LOGISTIK WISUDA', 20, statusStartY);

      // Render status box
      const isApproved = wisuda?.status === 'disetujui';
      const isRejected = wisuda?.status === 'ditolak';

      const statusText = yudisium?.status !== 'disetujui'
        ? 'PROSES TERKUNCI (LANGKAH 2 BELUM ACC)'
        : isApproved
          ? 'SAH & KELAYAKAN WISUDA OK (ACC PANITIA)'
          : isRejected
            ? 'LOGISTIK TANGGUH / REVISI'
            : 'ANTREAN VERIFIKASI KEANGGOTAAN WISUDA';

      const statusDesc = yudisium?.status !== 'disetujui'
        ? 'Langkah 2 (Yudisium) belum disetujui. Verifikasi pendaftaran wisuda belum dibuka.'
        : isApproved
          ? 'Registrasi wisuda dinyatakan SAH, LUNAS, dan siap untuk distribusi atribut wisuda.'
          : isRejected
            ? `Persetujuan ditangguhkan. Alasan: ${wisuda?.rejectionReason || 'Ada berkas yang perlu dikonfirmasi.'}`
            : 'Mahasiswa berada dalam antrean peninjauan kelayakan wisuda.';

      const boxColor = yudisium?.status !== 'disetujui'
        ? [148, 163, 184] // Slate
        : isApproved
          ? [16, 185, 129] // Emerald
          : isRejected
            ? [239, 68, 68] // Rose
            : [245, 158, 11]; // Amber

      doc.setFillColor(248, 250, 252); // Off white
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, statusStartY + 4, width - 40, 25, 'F');
      doc.rect(20, statusStartY + 4, width - 40, 25);

      // Left indicator bar
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.rect(20, statusStartY + 4, 3, 25, 'F');

      // Status Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.text(statusText, 27, statusStartY + 12);

      // Status Desc
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(statusDesc, 27, statusStartY + 19);

      // Supporting checks
      const docsStartY = 172;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('REKONSILIASI PENUNJANG ADMINISTRASI WISUDA:', 20, docsStartY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`1. Atribut & Kelengkapan Logistik : [ Terdata ]`, 25, docsStartY + 7);
      doc.text(`2. Bebas Tunggakan Wisuda     : [ ${isApproved ? 'Ready & ACC' : 'Menunggu Verifikasi'} ]`, 25, docsStartY + 13);

      const disclaimerY = 195;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const disclaimerText = 'Lembar ini diterbitkan secara otomatis oleh sistem SiHeppiee Universitas Insan Budi Utomo Malang sebagai bukti pendaftaran & verifikasi kelayakan mengikuti wisuda.';
      const splitText = doc.splitTextToSize(disclaimerText, width - 40);
      doc.text(splitText, 20, disclaimerY);

      // Signatures
      const sigY = 215;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Malang, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 130, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Kepala BAUK Universitas,', 130, sigY + 5);

      // Stamp Box
      if (isApproved) {
        doc.setDrawColor(16, 185, 129); // Emerald
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(16, 185, 129);
        doc.rect(130, sigY + 9, 45, 12);
        doc.text('[ TERVERIFIKASI SISTEM ]', 133, sigY + 14);
        doc.text('BAUK Universitas IBU', 136, sigY + 18);
      } else {
        doc.setDrawColor(13, 148, 136); // Teal
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(13, 148, 136);
        doc.rect(130, sigY + 9, 45, 12);
        doc.text('[ VERIFIKASI ANTREAN ]', 134, sigY + 14);
        doc.text('Panitia Wisuda IBU', 136, sigY + 18);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Adi, S.Pd., M.Pd.', 130, sigY + 30);

      // QR Code bottom left
      const qrY = sigY;
      const qrX = 25;
      
      const qrBase64 = await getQRCodeBase64(student.nim);
      if (qrBase64) {
        doc.addImage(qrBase64, 'PNG', qrX, qrY + 2, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`NIM: ${student.nim}`, qrX, qrY + 34);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('QR Code Otentikasi NIM', qrX, qrY + 37);
      } else {
        doc.setDrawColor(200, 200, 200);
        doc.rect(qrX, qrY + 2, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`NIM: ${student.nim}`, qrX, qrY + 34);
      }

      const pdfBlob = doc.output('blob');
      const blobURL = URL.createObjectURL(pdfBlob);
      window.open(blobURL, '_blank');
    } catch (error) {
      console.error('Gagal membuat PDF Langkah 3:', error);
      alert('Terjadi kesalahan saat memproses file PDF bukti verifikasi.');
    }
  };

  const downloadVerificationPDF = async () => {
    try {
      const logoBase64 = await getLogoBase64();
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [13, 148, 136]; // Teal #0d9488
      const darkColor = [30, 41, 59]; // Slate 800
      const greyColor = [100, 116, 139]; // Slate 500

      // Margins & Dimensions
      const margin = 20;
      const width = 210;
      const height = 297;

      // Draw elegant border
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(1);
      doc.rect(10, 10, width - 20, height - 20);

      // Inner double border
      doc.setDrawColor(13, 148, 136); // Teal
      doc.setLineWidth(0.3);
      doc.rect(12, 12, width - 24, height - 24);

      // Kop Surat (Header)
      drawHeaderKOP(doc, logoBase64, primaryColor);

      // Document Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(13, 148, 136);
      doc.text('SURAT KETERANGAN BEBAS ADMINISTRASI YUDISIUM & WISUDA', width / 2, 50, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const uuid = 'IBU-' + student.nim + '-' + Math.floor(1000 + Math.random() * 9000);
      doc.text(`Nomor Dokumen: ${uuid}/BAAK/IBU/VI/2026`, width / 2, 55, { align: 'center' });

      // Statement
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('Rektor Universitas Insan Budi Utomo Malang, menerangkan bahwa mahasiswa di bawah ini:', 20, 68);

      // Student Metadata Table
      const metadataStartY = 75;
      const rowHeight = 7;
      
      const details = [
        ['Nama Lengkap', `: ${student.nama}`],
        ['NIM', `: ${student.nim}`],
        ['NIK', `: ${student.nik || '-'}`],
        ['Tempat, Tanggal Lahir', `: ${student.tempatLahir}, ${student.tanggalLahir}`],
        ['Fakultas', `: ${student.fakultas}`],
        ['Program Studi', `: ${student.programStudi}`],
        ['Status Kelulusan', ': MEMENUHI SYARAT / LULUS']
      ];

      doc.setFont('helvetica', 'normal');
      details.forEach((item, index) => {
        const y = metadataStartY + (index * rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(item[0], 25, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        if (item[0] === 'Status Kelulusan') {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(13, 148, 136);
        }
        doc.text(item[1], 75, y);
      });

      // Verification flow section
      const flowStartY = 130;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('STATUS REKONSILIASI ALUR VERIFIKASI KELULUSAN', 20, flowStartY);

      // Draw a table for active steps verification
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(20, flowStartY + 4, width - 40, 42, 'F');
      
      // Header row
      doc.setDrawColor(203, 213, 225);
      doc.line(20, flowStartY + 4, width - 20, flowStartY + 4);
      doc.line(20, flowStartY + 12, width - 20, flowStartY + 12);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Langkah Alur Verifikasi', 24, flowStartY + 9);
      doc.text('Instansi Penanggung Jawab', 90, flowStartY + 9);
      doc.text('Status Verifikasi', 150, flowStartY + 9);

      // Rows
      const rows = [
        ['1. Kelulusan Akademik', 'Biro Administrasi Akademik (BAAK)', 'DISETUJUI / LUNAS DATA'],
        ['2. Kelayakan Yudisium', 'Biro Administrasi Keuangan (BAK)', 'DISETUJUI / BEBAS SPP'],
        ['3. Pendaftaran Wisuda', 'Panitia Registrasi & Logistik Wisuda', 'DISETUJUI & TERDATA']
      ];

      rows.forEach((row, idx) => {
        const y = flowStartY + 18 + (idx * 9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(row[0], 24, y);
        doc.text(row[1], 90, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(13, 148, 136); // Emerald text for approved
        doc.text(row[2], 150, y);
      });

      // Footer border for the table
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.rect(20, flowStartY + 4, width - 40, 42);

      // Statement of complete
      const stmtY = 184;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      
      const stmtText = 'Berdasarkan data audit log sistem informasi evaluasi pendidikan SiHeppiee, mahasiswa tersebut di atas dinyatakan BEBAS DARI SEGALA TANGGUNGAN ADMINISTRASI AKADEMIK DAN KEUANGAN. Dokumen ini sah dan diterbitkan secara digital oleh Universitas Insan Budi Utomo Malang.';
      const splitText = doc.splitTextToSize(stmtText, width - 40);
      doc.text(splitText, 20, stmtY);

      // Signatures
      const sigY = 215;
      
      // Left sign: Biro Keuangan
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Malang, ' + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 25, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Biro Administrasi Keuangan,', 25, sigY + 5);
      
      // Mock Digital Stamp
      doc.setDrawColor(13, 148, 136);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(13, 148, 136);
      doc.rect(25, sigY + 9, 45, 12);
      doc.text('[ VERIFIKASI DIGITAL ACC ]', 29, sigY + 14);
      doc.text('Biro Keuangan IBU', 32, sigY + 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Adi, S.Pd., M.Pd.', 25, sigY + 30);

      // Right sign: Kepala BAAK
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Disahkan Oleh,', 130, sigY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Kepala BAAK Universitas,', 130, sigY + 5);

      // Mock Digital Stamp
      doc.setDrawColor(79, 70, 229); // Indigo
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(79, 70, 229);
      doc.rect(130, sigY + 9, 45, 12);
      doc.text('[ BERKAS RESMI DI_LOCK ]', 133, sigY + 14);
      doc.text('BAAK Universitas IBU', 136, sigY + 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text('Dr. Nopem Kusumaningtyas, M.Pd', 130, sigY + 30);

      // Bottom Note / Barcode representation
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 275, width - 15, 275);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Keamanan Dokumen: Lembar ini diterbitkan secara otomatis dan terotentikasi digital nomor seri ${uuid}.`, width / 2, 281, { align: 'center' });
      doc.text('Dokumen ini tidak memerlukan tanda tangan basah dan sah secara yuridis.', width / 2, 284, { align: 'center' });

      // Open PDF in a new tab instead of downloading
      const pdfBlob = doc.output('blob');
      const blobURL = URL.createObjectURL(pdfBlob);
      window.open(blobURL, '_blank');
    } catch (error) {
      console.error('Gagal membuat PDF:', error);
      alert('Terjadi kesalahan saat membuat file PDF bukti verifikasi.');
    }
  };

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


  const [showProofModal, setShowProofModal] = useState(false);
  const [showProofModal2, setShowProofModal2] = useState(false);
  const [showProofModal3, setShowProofModal3] = useState(false);

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
      if (typeof yudisium.documents === 'string') {
        try {
          const parsed = JSON.parse(yudisium.documents);
          if (Array.isArray(parsed)) return [...parsed];
        } catch (_) {}
      } else if (Array.isArray(yudisium.documents)) {
        return [...yudisium.documents];
      }
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
      {showCelebrationPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden">
          {/* Balloons */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="balloon text-6xl" style={{ left: '5%', animationDelay: '0s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '15%', animationDelay: '2.5s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '25%', animationDelay: '1.2s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '35%', animationDelay: '3s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '45%', animationDelay: '0.8s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '55%', animationDelay: '4s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '65%', animationDelay: '1.5s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '75%', animationDelay: '3.2s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '85%', animationDelay: '0.5s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '95%', animationDelay: '2.8s' }}>🎈</div>
            <div className="balloon text-5xl" style={{ left: '20%', animationDelay: '4.5s' }}>✨</div>
            <div className="balloon text-5xl" style={{ left: '40%', animationDelay: '1s' }}>🎊</div>
            <div className="balloon text-5xl" style={{ left: '60%', animationDelay: '3.5s' }}>✨</div>
            <div className="balloon text-5xl" style={{ left: '80%', animationDelay: '2.1s' }}>🎊</div>
            <div className="balloon text-6xl" style={{ left: '10%', animationDelay: '1.8s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '50%', animationDelay: '2.1s' }}>🎈</div>
            <div className="balloon text-6xl" style={{ left: '90%', animationDelay: '4.2s' }}>🎈</div>
          </div>

          {/* Fireworks */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="firework w-32 h-32 absolute top-[20%] left-[10%]"></div>
            <div className="firework w-40 h-40 absolute top-[15%] right-[20%]" style={{ animationDelay: '1.2s' }}></div>
            <div className="firework w-24 h-24 absolute top-[40%] left-[30%]" style={{ animationDelay: '0.6s' }}></div>
            <div className="firework w-32 h-32 absolute bottom-[20%] left-[25%]" style={{ animationDelay: '1.8s' }}></div>
            <div className="firework w-36 h-36 absolute bottom-[30%] right-[15%]" style={{ animationDelay: '0.4s' }}></div>
            <div className="firework w-28 h-28 absolute top-[10%] left-[40%]" style={{ animationDelay: '2s' }}></div>
            <div className="firework w-44 h-44 absolute top-[50%] right-[30%]" style={{ animationDelay: '1s' }}></div>
            <div className="firework w-20 h-20 absolute bottom-[10%] right-[40%]" style={{ animationDelay: '2.5s' }}></div>
            <div className="firework w-36 h-36 absolute top-[60%] left-[15%]" style={{ animationDelay: '0.8s' }}></div>
            <div className="firework w-48 h-48 absolute top-[25%] left-[60%]" style={{ animationDelay: '1.5s' }}></div>
            <div className="firework w-24 h-24 absolute bottom-[40%] right-[10%]" style={{ animationDelay: '0.2s' }}></div>
          </div>

          <div
            className="relative rounded-3xl p-8 max-w-2xl w-full mx-4 text-center shadow-[0_0_50px_rgba(250,204,21,0.4)] border-4 transform flex flex-col items-center z-10 bg-yellow-400"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #FCD34D 0%, #EAB308 30%, #CA8A04 70%, #A16207 100%)',
              borderColor: '#FEF08A'
            }}
          >
            {/* Logo placeholder */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-xl w-[280px] md:w-[320px] flex items-center justify-center">
              <img 
                src="/logo-ubu.png" 
                alt="Logo Universitas Insan Budi Utomo" 
                className="w-full h-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-sm text-slate-500 font-medium">Unggah logo-ubu.png ke folder public</span>';
                }}
              />
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              CONGRATULATIONS
            </h2>
            <h3 className="text-2xl md:text-3xl font-extra-bold text-slate-900 mb-6 uppercase">
              {student.nama}
            </h3>

            <div className="bg-white/30 rounded-2xl p-6 mb-8 w-full backdrop-blur-md border border-white/50 shadow-inner">
              <p className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                Dinyatakan
              </p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 drop-shadow-sm mt-3 uppercase tracking-tight">
                LULUS TANPA UJIAN AKHIR
              </p>
            </div>

            <button
              onClick={handleCloseCelebration}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg md:text-xl py-4 px-8 rounded-full shadow-[0_10px_20px_rgba(5,150,105,0.4)] transform transition hover:scale-105 flex items-center justify-center gap-3 w-full md:w-auto border-2 border-emerald-300"
            >
              Klik disini Selanjutnya untuk Verifikasi Data
              <CheckCircle2 className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

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



      {/* Festive Graduation Celebration Card displayed at the top if student is graduated, regardless of step 1 status */}
      {student.statusKelulusan === 'Lulus' && (
        <div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 shadow-xl border-2 border-amber-300 p-6 sm:p-8 text-white"
          style={{ backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #7e22ce 100%)' }}
        >
          {/* Ambient decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
          
          {/* Sparkles & Confetti Visual Accents */}
          <div className="absolute top-4 left-6 text-amber-300 animate-pulse pointer-events-none">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute bottom-4 right-6 text-amber-300 animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute top-1/2 right-12 text-white/20 pointer-events-none">
            <GraduationCap className="w-16 h-16 rotate-12" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-slate-900 text-3xl font-bold font-sans shadow-lg animate-bounce shrink-0">
              🎓
            </div>
            
            <div className="text-center md:text-left space-y-2 flex-grow">
              <span className="inline-block px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-100 text-[10px] uppercase font-bold tracking-widest rounded-full animate-pulse">
                ✨ KABAR KELULUSAN RESMI ✨
              </span>
              <h2 
                className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] text-amber-300 bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100"
                style={{
                  backgroundImage: 'linear-gradient(to right, #fde68a, #facc15, #fde68a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: '#facc15' // Fallback color
                }}
              >
                Selamat Untuk <span className="underline decoration-amber-400/50 decoration-wavy underline-offset-4">{student.nama}</span> Telah dinyatakan LULUS
              </h2>
              <p className="text-xs text-indigo-100 font-medium max-w-xl leading-relaxed">
                Selamat atas pencapaian luar biasa ini! Kerja keras, ketangguhan, dan dedikasi Anda di Universitas Insan Budi Utomo Malang telah membuahkan hasil terbaik. Silakan lanjutkan verifikasi kelayakan akademik, keuangan yudisium, dan pendaftaran wisuda Anda di bawah ini.
              </p>
            </div>

            {/* Minor celebratory stats badge */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3 text-center shrink-0 min-w-[120px]">
              <p className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">NIM Mahasiswa</p>
              <p className="text-sm font-mono font-bold text-amber-300 mt-0.5">{student.nim}</p>
            </div>
          </div>

          {/* Simulated mini visual confetti dots */}
          <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping pointer-events-none" />
          <div className="absolute bottom-6 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute top-8 right-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-4 left-10 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse pointer-events-none" />
        </div>
      )}

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
                Langkah 1: Verifikasi Biodata Mahasiswa
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
                <label className="text-[11px] font-bold text-slate-500">Program Studi / Jurusan <span className="text-rose-500">*</span> <span className="text-slate-400 text-[10px] font-normal">(Tidak Dapat Diubah)</span></label>
                <select
                  value={editProdi}
                  onChange={(e) => handleProdiChange(e.target.value)}
                  className="p-2.5 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-500 rounded-lg focus:outline-none cursor-not-allowed"
                  disabled
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
        <div className="space-y-6">
          
          {/* Success Banner when all steps are approved */}
          {student.academicApproved && yudisium?.status === 'disetujui' && wisuda?.status === 'disetujui' && (
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-md p-6 text-white animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4"
              style={{ backgroundImage: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-2xl shrink-0 shadow-inner">
                  🎉
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Selamat! Semua Langkah Verifikasi Selesai</h3>
                  <p className="text-xs text-white/90 leading-relaxed mt-1 max-w-xl">
                    Anda telah menyelesaikan seluruh rangkaian verifikasi (Data Akademik, Keuangan Yudisium, dan Registrasi Wisuda). Silakan lihat surat bukti bebas administrasi resmi di sebelah kanan.
                  </p>
                </div>
              </div>
              <button
                id="download-bukti-pdf-btn"
                onClick={downloadVerificationPDF}
                className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer shrink-0 uppercase tracking-widest leading-none border border-transparent hover:scale-[1.02]"
              >
                👁️ Lihat Bukti Verifikasi (PDF)
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* STEP TRACKER - Left column */}
            <div className="space-y-4 lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Alur Verifikasi Anda</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">(Silakan Klik tiap Langkah)</span>
                </div>
                
                <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-150">
                  {/* Step 1 */}
                  <div 
                    id="tab-step-1"
                    onClick={() => setActiveStepTab(1)}
                    className={`relative p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                      activeStepTab === 1
                        ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/15 shadow-sm'
                        : 'border-transparent hover:bg-slate-50/70'
                    }`}
                  >
                    <span className={`absolute -left-5 top-3.5 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
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
                  <div 
                    id="tab-step-2"
                    onClick={() => setActiveStepTab(2)}
                    className={`relative p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                      activeStepTab === 2
                        ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/15 shadow-sm'
                        : 'border-transparent hover:bg-slate-50/70'
                    }`}
                  >
                    <span className={`absolute -left-5 top-3.5 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
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
                      {student.academicApproved && yudisium?.status === 'disetujui' ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : yudisium?.status === 'ditolak' ? (
                        <X className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Clock className="w-2.5 h-2.5 text-white" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">2. Pendaftaran Yudisium</h4>
                      <p className="text-[10px] text-gray-550 leading-normal font-semibold">
                        {!student.academicApproved 
                          ? 'Terkunci (Selesaikan Langkah 1)' 
                          : !yudisium 
                            ? 'Unggah berkas persyaratan.' 
                            : yudisium.status === 'disetujui'
                              ? 'Disetujui Keuangan'
                              : yudisium.status === 'ditolak'
                                ? '✗ Ditangguhkan Keuangan'
                                : '⏳ Antrean Keuangan'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div 
                    id="tab-step-3"
                    onClick={() => setActiveStepTab(3)}
                    className={`relative p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                      activeStepTab === 3
                        ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/15 shadow-sm'
                        : 'border-transparent hover:bg-slate-50/70'
                    }`}
                  >
                    <span className={`absolute -left-5 top-3.5 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
                      yudisium?.status !== 'disetujui'
                        ? 'bg-gray-200 grayscale text-gray-400'
                        : wisuda?.status === 'disetujui' 
                          ? 'bg-emerald-500'
                          : wisuda?.status === 'diajukan' || wisuda?.status === 'diproses' || !wisuda
                            ? 'bg-purple-500 animate-pulse'
                            : wisuda?.status === 'ditolak'
                              ? 'bg-rose-500'
                              : 'bg-gray-200'
                    }`}>
                      {wisuda?.status === 'disetujui' ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : wisuda?.status === 'ditolak' ? (
                        <X className="w-2.5 h-2.5 text-white" />
                      ) : (
                        <Clock className="w-2.5 h-2.5 text-white" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">3. Pendaftaran Wisuda</h4>
                      <p className="text-[10px] text-gray-400 leading-normal font-semibold">
                        {yudisium?.status !== 'disetujui' 
                          ? 'Terkunci. Yudisium belum disetujui.' 
                          : !wisuda || wisuda.status === 'belum_daftar'
                            ? 'Silakan isi formulir wisuda.'
                            : wisuda.status === 'disetujui'
                              ? 'Wisuda Disetujui (Lolos)'
                              : wisuda.status === 'ditolak'
                                ? '✗ Ditangguhkan Keuangan'
                                : '⏳ Antrean Wisuda'}
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
            <div className="space-y-6 lg:col-span-2 animate-fade-in animate-duration-300">
              
              {activeStepTab === 1 && (
                <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-5 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-505 bg-indigo-500" />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                        Langkah 1: Verifikasi Biodata Mahasiswa
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Data akademik Anda telah divalidasi dan dikunci secara resmi untuk mencatatkan kelayakan wisuda.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1 shrink-0">
                      ✓ TERVERIFIKASI
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">📋 Profil Akademik Terdaftar</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">Nama Lengkap</span>
                        <span className="font-semibold text-slate-800">{student.nama}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">NIM</span>
                        <span className="font-mono font-semibold text-slate-800">{student.nim}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">Nomor Induk Kependudukan (NIK)</span>
                        <span className="font-mono font-semibold text-slate-800">{student.nik || '-'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">Tempat, Tanggal Lahir</span>
                        <span className="font-semibold text-slate-800">{student.tempatLahir}, {student.tanggalLahir}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">Program Studi</span>
                        <span className="font-semibold text-slate-800">{student.programStudi}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">Fakultas</span>
                        <span className="font-semibold text-slate-800">{student.fakultas}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">Email</span>
                        <span className="font-semibold text-slate-800">{student.email || '-'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block uppercase text-[10px]">No. Telepon / WhatsApp</span>
                        <span className="font-semibold text-slate-800">{student.noHp || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.ktpDoc && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">Kartu Tanda Penduduk (KTP)</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.ktpDoc.fileName}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openFilePreview(student.ktpDoc!.fileData!, student.ktpDoc!.fileName || 'KTP.pdf')}
                          className="px-2.5 py-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold rounded border border-indigo-150 shrink-0 cursor-pointer"
                        >
                          Preview
                        </button>
                      </div>
                    )}

                    {student.ijazahSmaDoc && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">Ijazah SMA / Sederajat</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.ijazahSmaDoc.fileName}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openFilePreview(student.ijazahSmaDoc!.fileData!, student.ijazahSmaDoc!.fileName || 'Ijazah_SMA.pdf')}
                          className="px-2.5 py-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold rounded border border-indigo-150 shrink-0 cursor-pointer"
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Green proof button row inside Langkah 1 card */}
                  <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Bukti Kelayakan Akademik</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Lembar bukti keterangan data yang sah untuk pencetakan ijazah & transkrip nilai.</p>
                    </div>
                    <button
                      id="view-ije-proof-btn"
                      onClick={() => setShowProofModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border border-emerald-500/20 whitespace-nowrap"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-100" />
                      Bukti Verifikasi Langkah 1 (Cetak Ijazah)
                    </button>
                  </div>
                </div>
              )}

              {activeStepTab === 2 && (
                <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-5 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
                  
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

                  {/* Green proof button row inside Langkah 2 card */}
                  <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Bukti Verifikasi Yudisium</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Lembar bukti kelayakan pendaftaran Yudisium & bebas tunggakan administrasi keuangan.</p>
                    </div>
                    <button
                      id="view-yudisium-proof-btn"
                      onClick={() => setShowProofModal2(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border border-emerald-500/20 whitespace-nowrap"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-100" />
                      Bukti Verifikasi Langkah 2 (Yudisium)
                    </button>
                  </div>
                </div>
              )}

              {activeStepTab === 3 && (
                yudisium?.status !== 'disetujui' ? (
                  <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-6 text-center space-y-4 animate-fade-in">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                      🔒
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Langkah 3: Pendaftaran Wisuda (Terkunci)</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Formulir pendaftaran wisuda Anda masih terkunci secara otomatis. Selesaikan Langkah 2 (Pendaftaran Yudisium divalidasi dan disetujui oleh keuangan) terlebih dahulu sebelum dapat diverifikasi untuk logistik wisuda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-250 shadow-sm p-5 space-y-4 relative overflow-hidden animate-fade-in">
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
                      <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1 shrink-0">
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
                          Segala pengisian data pendukung seperti data wisudawan, orang tua, dan alamat pengiriman ijazah/undangan kini dikelola dan diverifikasi langsung secara administratif untuk mempermudah pendaftaran wisuda Anda. Anda tidak perlu mengirim/mengisi formulir manual apa pun.
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

                    {/* Green proof button row inside Langkah 3 card */}
                    <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Bukti Verifikasi Wisuda</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Lembar bukti keterangan kelayakan registrasi wisuda & kelengkapan atribut logistik.</p>
                      </div>
                      <button
                        id="view-wisuda-proof-btn"
                        onClick={() => setShowProofModal3(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border border-emerald-500/20 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-100" />
                        Bukti Verifikasi Langkah 3 (Wisuda)
                      </button>
                    </div>
                  </div>
                )
              )}

            </div>

          </div>

        </div>
      )}
        </>
      )}



      {/* BUKTI VERIFIKASI LANGKAH 1 MODAL */}
      {showProofModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-start justify-center z-50 p-4 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-150 max-w-2xl w-full my-auto sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50 rounded-t-2xl">
              <div className="flex items-center gap-2 text-emerald-950">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900 leading-none">Bukti Verifikasi Langkah 1</h3>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Penulisan Data Kelayakan Pencetakan Ijazah</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProofModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Document Header (Kop Surat) */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎓</span>
                  <h4 className="font-black text-sm tracking-tight text-slate-900 uppercase">Universitas Insan Budi Utomo Malang</h4>
                </div>
                <p className="text-[9px] text-slate-500 font-medium">
                  Jl. Simpang Arjuno No.17-B, Kauman, Kec. Klojen, Kota Malang, Jawa Timur 65119
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Telp: (0341) 323214 | Email: baak@budiutomomalang.ac.id
                </p>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1">
                <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                  SURAT KETERANGAN VERIFIKASI DATA ALUMNI & CETAK IJAZAH
                </h5>
                <p className="text-[10px] text-slate-500 font-mono">
                  Nomor: BAAK/IBU-VAL1/{student.nim}/{new Date().getFullYear()}
                </p>
              </div>

              {/* Status Header Block */}
              {!student.dataVerified ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-center">
                  <div className="text-amber-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> STATUS DATA: DRAFT BELUM DIKUNCI
                  </div>
                  <p className="text-[10.5px] text-amber-700 leading-relaxed font-semibold">
                    Anda belum menyelesaikan Langkah 1 (Tinjau Berkas Data Akademik). Formulir di bawah belum dikunci dan disetujui. Dokumen ini hanya bersifat pratinjau (draft) sementara.
                  </p>
                </div>
              ) : !student.academicApproved ? (
                <div className="p-4 bg-indigo-50 border border-indigo-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-indigo-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                    <Clock className="w-4 h-4 text-indigo-500" /> STATUS DATA: TERKUNCI & ANTRIAN VERIFIKASI BAAK
                  </div>
                  <p className="text-[10.5px] text-indigo-700 leading-relaxed font-semibold">
                    Anda telah menyetujui & mengunci data ijazah. Berkas Anda saat ini berada dalam antrean peninjauan oleh bagian BAAK Universitas untuk mendapatkan persetujuan akhir (ACC).
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-emerald-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> STATUS DATA: SAH & DISETUJUI BAAK (ACC)
                  </div>
                  <p className="text-[10.5px] text-emerald-700 leading-relaxed font-semibold">
                    Kebenaran data akademik Anda telah divalidasi dan disahkan secara resmi oleh Biro Administrasi Akademik (BAAK) untuk keperluan pencetakan Ijazah dan Transkrip Nilai Fisik.
                  </p>
                </div>
              )}

              {/* Student Details Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h6 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-3 block">Detail Data Pencetakan Ijazah:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Lengkap (Sesuai Ijazah)</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{student.nama}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Induk Mahasiswa (NIM)</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{student.nim}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Induk Kependudukan (NIK)</span>
                    <span className="font-mono font-medium text-slate-800 block mt-0.5">{student.nik || '- (Belum Diisi)'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Tempat, Tanggal Lahir</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {student.tempatLahir && student.tanggalLahir 
                        ? `${student.tempatLahir}, ${student.tanggalLahir}` 
                        : '- (Belum Diisi)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Program Studi (Jenjang S1)</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{student.programStudi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fakultas Terdaftar</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{student.fakultas}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Email Resmi</span>
                    <span className="font-mono text-slate-700 block mt-0.5">{student.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">No. Telepon / WhatsApp</span>
                    <span className="font-mono text-slate-700 block mt-0.5">{student.noHp || '-'}</span>
                  </div>
                </div>

                {/* Sub-block Document checks */}
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">📄</span>
                    <div className="text-[10.5px]">
                      <span className="text-slate-500 font-bold block">Dokumen KTP:</span>
                      <span className={`font-bold uppercase ${student.ktpDoc ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {student.ktpDoc ? `Terunggah (${student.ktpDoc.status === 'disetujui' ? 'Ready & Acc' : 'Pending'})` : 'Belum Diunggah'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">📄</span>
                    <div className="text-[10.5px]">
                      <span className="text-slate-500 font-bold block">Ijazah SMA / Sederajat:</span>
                      <span className={`font-bold uppercase ${student.ijazahSmaDoc ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {student.ijazahSmaDoc ? `Terunggah (${student.ijazahSmaDoc.status === 'disetujui' ? 'Ready & Acc' : 'Pending'})` : 'Belum Diunggah'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Certification details */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium text-center sm:text-left space-y-1">
                  <p>Dicetak secara digital oleh:</p>
                  <strong className="text-slate-800 font-bold block">Sistem SiHeppiee BAAK</strong>
                  <p className="font-mono text-[9px] text-slate-400">Waktu: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                {/* NIM QR Code Centerpiece */}
                <div className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(student.nim)}`} 
                    alt={`QR Code NIM ${student.nim}`} 
                    className="w-20 h-20 bg-white p-1 border border-slate-100 rounded-lg shadow-sm" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-mono font-bold text-slate-850 text-[10px] mt-1.5 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">NIM: {student.nim}</span>
                  <span className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Otentikasi Berkas</span>
                </div>

                {/* Simulated Stamp / Seal based on status */}
                <div className="relative shrink-0">
                  {!student.dataVerified ? (
                    <div className="border-2 border-dashed border-amber-400 text-amber-500 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center">
                      [ DRAFT TEMPORER ]<br />
                      <span className="text-[7px]">belum dikunci mhs</span>
                    </div>
                  ) : !student.academicApproved ? (
                    <div className="border-2 border-dashed border-indigo-405 text-indigo-500 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center">
                      [ MENUNGGU ACC BAAK ]<br />
                      <span className="text-[7px]">sudah dikunci mhs</span>
                    </div>
                  ) : (
                    <div className="border-2 border-double border-emerald-500 bg-emerald-50/50 text-emerald-600 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center shadow-sm">
                      [ TEROTENTIKASI BAAK ]<br />
                      <span className="text-[7px] font-mono tracking-wider font-extrabold">OK UNTUK IJAZAH</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informational Warning */}
              <p className="text-[9.5px] italic text-slate-400 leading-normal text-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                Gunakan lembar bukti kelayakan ijazah ini sebagai referensi pemeriksaan data akhir Anda. Apabila terdapat ketidaksesuaian penulisan nama atau NIK, segera ajukan pembatalan kunci data dan perbaiki sebelum wisuda dilaksanakan.
              </p>

            </div>

            {/* Footer with actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={previewStep1PDF}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-500/20"
                >
                  <span>👁️</span> Download PDF
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUKTI VERIFIKASI LANGKAH 2 MODAL (Yudisium) */}
      {showProofModal2 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-start justify-center z-50 p-4 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-150 max-w-2xl w-full my-auto sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50 rounded-t-2xl">
              <div className="flex items-center gap-2 text-indigo-950">
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-indigo-900 leading-none">Bukti Verifikasi Langkah 2</h3>
                  <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">Kelayakan Keuangan & Pendaftaran Yudisium</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProofModal2(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Document Header (Kop Surat) */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎓</span>
                  <h4 className="font-black text-sm tracking-tight text-slate-900 uppercase">Universitas Insan Budi Utomo Malang</h4>
                </div>
                <p className="text-[9px] text-slate-500 font-medium">
                  Jl. Simpang Arjuno No.17-B, Kauman, Kec. Klojen, Kota Malang, Jawa Timur 65119
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Telp: (0341) 323214 | Email: bauk@budiutomomalang.ac.id
                </p>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1">
                <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                  SURAT KETERANGAN BEBAS ADMINISTRASI KEUANGAN & KELAYAKAN YUDISIUM
                </h5>
                <p className="text-[10px] text-slate-500 font-mono">
                  Nomor: BAUK/IBU-VAL2/{student.nim}/{new Date().getFullYear()}
                </p>
              </div>

              {/* Status Header Block */}
              {!student.academicApproved ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-center">
                  <div className="text-amber-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> STATUS DATA: PROSES TERKUNCI
                  </div>
                  <p className="text-[10.5px] text-amber-700 leading-relaxed font-semibold">
                    Langkah 1 (Akademik) belum disetujui. Verifikasi administrasi keuangan belum dibuka.
                  </p>
                </div>
              ) : yudisium?.status === 'disetujui' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-emerald-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> STATUS DATA: ACC BEBAS ADMINISTRASI KEUANGAN
                  </div>
                  <p className="text-[10.5px] text-emerald-700 leading-relaxed font-semibold">
                    Kebenaran administrasi keuangan lunas & BEBAS ADMINISTRASI KEUANGAN Yudisium serta dinyatakan layak mengikuti Yudisium.
                  </p>
                </div>
              ) : yudisium?.status === 'ditolak' ? (
                <div className="p-4 bg-rose-50 border border-rose-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-rose-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                    <X className="w-4 h-4 text-rose-500" /> STATUS DATA: PENANGGUHAN VERIFIKASI KEUANGAN
                  </div>
                  <p className="text-[10.5px] text-rose-700 leading-relaxed font-semibold">
                    Persetujuan yudisium ditangguhkan. Alasan: {yudisium?.rejectionReason || 'Ada berkas yang perlu dikonfirmasi.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-amber-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> STATUS DATA: ANTREAN VERIFIKASI KEUANGAN
                  </div>
                  <p className="text-[10.5px] text-amber-700 leading-relaxed font-semibold">
                    Mahasiswa berada dalam antrean peninjauan log tagihan keuangan oleh bagian BAUK Universitas.
                  </p>
                </div>
              )}

              {/* Student Details Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h6 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-3 block">Detail Data Mahasiswa:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Lengkap</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{student.nama}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Induk Mahasiswa (NIM)</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{student.nim}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fakultas Terdaftar</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{student.fakultas}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Program Studi (Jenjang S1)</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{student.programStudi}</span>
                  </div>
                </div>

                {/* Sub-block Document checks */}
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">💰</span>
                    <div className="text-[10.5px]">
                      <span className="text-slate-500 font-bold block">Biaya Perkuliahan & SPP:</span>
                      <span className={`font-bold uppercase ${yudisium?.status === 'disetujui' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {yudisium?.status === 'disetujui' ? 'Lunas / ACC' : 'Menunggu Verifikasi'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">💰</span>
                    <div className="text-[10.5px]">
                      <span className="text-slate-500 font-bold block">Biaya Administrasi Yudisium:</span>
                      <span className={`font-bold uppercase ${yudisium?.status === 'disetujui' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {yudisium?.status === 'disetujui' ? 'Lunas / ACC' : 'Menunggu Verifikasi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Certification details */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium text-center sm:text-left space-y-1">
                  <p>Dicetak secara digital oleh:</p>
                  <strong className="text-slate-800 font-bold block">Sistem SiHeppiee BAUK</strong>
                  <p className="font-mono text-[9px] text-slate-400">Waktu: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                {/* NIM QR Code Centerpiece */}
                <div className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(student.nim)}`} 
                    alt={`QR Code NIM ${student.nim}`} 
                    className="w-20 h-20 bg-white p-1 border border-slate-100 rounded-lg shadow-sm" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-mono font-bold text-slate-850 text-[10px] mt-1.5 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">NIM: {student.nim}</span>
                </div>

                {/* Simulated Stamp / Seal based on status */}
                <div className="relative shrink-0">
                  {yudisium?.status === 'disetujui' ? (
                    <div className="border-2 border-double border-emerald-500 bg-emerald-50/50 text-emerald-600 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center shadow-sm">
                      [ BEBAS KEUANGAN BAUK ]<br />
                      <span className="text-[7px] font-mono tracking-wider font-extrabold">ACC YUDISIUM OK</span>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-indigo-405 text-indigo-500 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center">
                      [ MENUNGGU ACC BAUK ]<br />
                      <span className="text-[7px]">proses verifikasi</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informational Warning */}
              <p className="text-[9.5px] italic text-slate-400 leading-normal text-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                Data verifikasi keuangan ini diterbitkan oleh BAUK Universitas Insan Budi Utomo Malang sebagai lembar bebas tunggakan resmi guna pendaftaran yudisium.
              </p>

            </div>

            {/* Footer with actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={previewStep2PDF}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-500/20"
                >
                  <span>👁️</span> Download PDF
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowProofModal2(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUKTI VERIFIKASI LANGKAH 3 MODAL (Wisuda) */}
      {showProofModal3 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-start justify-center z-50 p-4 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-150 max-w-2xl w-full my-auto sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-teal-50 rounded-t-2xl">
              <div className="flex items-center gap-2 text-teal-950">
                <span className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-teal-900 leading-none">Bukti Verifikasi Langkah 3</h3>
                  <p className="text-[10px] text-teal-700 font-semibold mt-0.5">Kelayakan Registrasi & Logistik Wisuda</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProofModal3(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Document Header (Kop Surat) */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🎓</span>
                  <h4 className="font-black text-sm tracking-tight text-slate-900 uppercase">Universitas Insan Budi Utomo Malang</h4>
                </div>
                <p className="text-[9px] text-slate-500 font-medium">
                  Jl. Simpang Arjuno No.17-B, Kauman, Kec. Klojen, Kota Malang, Jawa Timur 65119
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Telp: (0341) 323214 | Email: bauk@budiutomomalang.ac.id
                </p>
              </div>

              {/* Document Title */}
              <div className="text-center space-y-1">
                <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                  SURAT KETERANGAN KELAYAKAN LOGISTIK & PENDAFTARAN WISUDA
                </h5>
                <p className="text-[10px] text-slate-500 font-mono">
                  Nomor: BAUK/IBU-VAL3/{student.nim}/{new Date().getFullYear()}
                </p>
              </div>

              {/* Status Header Block */}
              {yudisium?.status !== 'disetujui' ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-center">
                  <div className="text-amber-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" /> STATUS DATA: PROSES TERKUNCI
                  </div>
                  <p className="text-[10.5px] text-amber-700 leading-relaxed font-semibold">
                    Langkah 2 (Yudisium) belum disetujui. Verifikasi pendaftaran wisuda belum dibuka.
                  </p>
                </div>
              ) : wisuda?.status === 'disetujui' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-emerald-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> STATUS DATA: ACC PANITIA & KELAYAKAN WISUDA OK
                  </div>
                  <p className="text-[10.5px] text-emerald-700 leading-relaxed font-semibold">
                    Registrasi wisuda dinyatakan SAH, LUNAS, dan siap untuk distribusi atribut wisuda (Undangan, Jas Almamater).
                  </p>
                </div>
              ) : wisuda?.status === 'ditolak' ? (
                <div className="p-4 bg-rose-50 border border-rose-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-rose-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                    <X className="w-4 h-4 text-rose-500" /> STATUS DATA: LOGISTIK TANGGUH / REVISI
                  </div>
                  <p className="text-[10.5px] text-rose-700 leading-relaxed font-semibold">
                    Persetujuan registrasi wisuda ditangguhkan. Alasan: {wisuda?.rejectionReason || 'Hubungi panitia wisuda.'}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-250 rounded-xl space-y-1.5 text-center">
                  <div className="text-amber-850 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> STATUS DATA: ANTREAN VERIFIKASI WISUDA
                  </div>
                  <p className="text-[10.5px] text-amber-700 leading-relaxed font-semibold">
                    Mahasiswa berada dalam antrean peninjauan kelayakan wisuda dan bebas biaya wisuda oleh panitia BAUK.
                  </p>
                </div>
              )}

              {/* Student Details Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h6 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 mb-3 block">Detail Data Mahasiswa:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nama Lengkap</span>
                    <span className="font-extrabold text-slate-900 block mt-0.5">{student.nama}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Induk Mahasiswa (NIM)</span>
                    <span className="font-mono font-bold text-slate-900 block mt-0.5">{student.nim}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fakultas Terdaftar</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{student.fakultas}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Program Studi (Jenjang S1)</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{student.programStudi}</span>
                  </div>
                </div>

                {/* Sub-block Document checks */}
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">🎓</span>
                    <div className="text-[10.5px]">
                      <span className="text-slate-500 font-bold block">Atribut & Logistik Wisuda:</span>
                      <span className="font-bold uppercase text-emerald-600">
                        Terdata
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">💰</span>
                    <div className="text-[10.5px]">
                      <span className="text-slate-500 font-bold block">Registrasi Biaya Wisuda:</span>
                      <span className={`font-bold uppercase ${wisuda?.status === 'disetujui' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {wisuda?.status === 'disetujui' ? 'Ready & ACC' : 'Menunggu Verifikasi'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures & Certification details */}
              <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium text-center sm:text-left space-y-1">
                  <p>Dicetak secara digital oleh:</p>
                  <strong className="text-slate-800 font-bold block">Sistem SiHeppiee BAUK</strong>
                  <p className="font-mono text-[9px] text-slate-400">Waktu: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                {/* NIM QR Code Centerpiece */}
                <div className="flex flex-col items-center p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(student.nim)}`} 
                    alt={`QR Code NIM ${student.nim}`} 
                    className="w-20 h-20 bg-white p-1 border border-slate-100 rounded-lg shadow-sm" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-mono font-bold text-slate-850 text-[10px] mt-1.5 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">NIM: {student.nim}</span>
                </div>

                {/* Simulated Stamp / Seal based on status */}
                <div className="relative shrink-0">
                  {wisuda?.status === 'disetujui' ? (
                    <div className="border-2 border-double border-emerald-500 bg-emerald-50/50 text-emerald-600 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center shadow-sm">
                      [ TERVERIFIKASI BAUK ]<br />
                      <span className="text-[7px] font-mono tracking-wider font-extrabold">ACC WISUDA OK</span>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-indigo-405 text-indigo-500 rotate-[-8deg] uppercase font-bold text-[9px] px-3 py-1.5 rounded text-center">
                      [ MENUNGGU ACC BAUK ]<br />
                      <span className="text-[7px]">antrean logistik</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informational Warning */}
              <p className="text-[9.5px] italic text-slate-400 leading-normal text-center bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                Pendaftaran & kelayakan atribut wisuda ini diotentikasi secara digital oleh sistem SiHeppiee BAUK Universitas Insan Budi Utomo Malang.
              </p>

            </div>

            {/* Footer with actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={previewStep3PDF}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer border border-emerald-500/20"
                >
                  <span>👁️</span> Download PDF
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowProofModal3(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
