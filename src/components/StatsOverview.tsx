import React from 'react';
import { Users, GraduationCap, FileCheck, Landmark, Percent, AlertCircle } from 'lucide-react';
import { StudentAcademic, YudisiumRegistration, WisudaRegistration } from '../types';

interface StatsOverviewProps {
  students: StudentAcademic[];
  yudisiums: Record<string, YudisiumRegistration>;
  wisudas: Record<string, WisudaRegistration>;
}

export default function StatsOverview({ students, yudisiums, wisudas }: StatsOverviewProps) {
  // 1. Calculations
  const totalStudents = students.length;
  const graduatedCount = students.filter(s => s.statusKelulusan === 'Lulus').length;
  const notGraduatedCount = totalStudents - graduatedCount;
  const graduationRate = totalStudents > 0 ? Math.round((graduatedCount / totalStudents) * 100) : 0;
  
  // Yudisium stats
  const yudisiumList = Object.values(yudisiums);
  const totalYudisium = yudisiumList.length;
  const yudisiumPending = yudisiumList.filter(y => y.status === 'diajukan' || y.status === 'diproses').length;
  const yudisiumApproved = yudisiumList.filter(y => y.status === 'disetujui').length;
  const yudisiumRejected = yudisiumList.filter(y => y.status === 'ditolak').length;

  // Wisuda stats
  const wisudaList = Object.values(wisudas);
  const totalWisuda = wisudaList.length;
  const wisudaPending = wisudaList.filter(w => w.status === 'diajukan' || w.status === 'diproses').length;
  const wisudaApproved = wisudaList.filter(w => w.status === 'disetujui').length;

  // Toga distribution
  const togaSizes: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  wisudaList.forEach(w => {
    if (togaSizes[w.ukuranToga] !== undefined) {
      togaSizes[w.ukuranToga]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Mahasiswa Terdaftar</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800">{totalStudents}</h3>
            <p className="text-xs text-slate-500 font-medium">Berdasarkan data akademik Excel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat Kelulusan</p>
            <h3 className="text-2xl font-bold font-sans text-emerald-600">
              {graduatedCount} <span className="text-sm font-medium text-slate-400">/ {totalStudents}</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: `${graduationRate}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-500 font-mono">{graduationRate}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendaftar Yudisium</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800">
              {totalYudisium}{' '}
              {yudisiumPending > 0 && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1.5 animate-pulse">
                  {yudisiumPending} Verifikasi
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{yudisiumApproved} Disetujui • {yudisiumRejected} Ditolak</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendaftar Wisuda</p>
            <h3 className="text-2xl font-bold font-sans text-slate-800">
              {totalWisuda}{' '}
              {wisudaPending > 0 && (
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full ml-1.5">
                  {wisudaPending} Baru
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{wisudaApproved} Disetujui Wisuda</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Statistics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Academic Distribution & GPA */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Distribusi Program Studi Kelulusan</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left box: Majors count */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-500 uppercase">Distribusi Berdasarkan Program Studi</h5>
              <div className="space-y-2">
                {Array.from(new Set(students.map(s => s.programStudi))).slice(0, 4).map((prodi, idx) => {
                  const prodiStudents = students.filter(s => s.programStudi === prodi);
                  const count = prodiStudents.length;
                  const graduated = prodiStudents.filter(s => s.statusKelulusan === 'Lulus').length;
                  const pct = count > 0 ? Math.round((graduated / count) * 100) : 0;
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 truncate max-w-[180px]">{prodi || 'Program Studi Umum'}</span>
                        <span className="text-slate-500">{graduated}/{count} Lulus <span className="text-[10px] text-slate-400 font-mono">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/60">
                        <div 
                          className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Array.from(new Set(students.map(s => s.programStudi))).length === 0 && (
                  <p className="text-xs text-slate-400 italic">Belum ada program studi tercatat.</p>
                )}
              </div>
            </div>

            {/* Right box: Quick Information status */}
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                  Kriteria Yudisium Universitas
                </h5>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>Telah dinyatakan lulus seluruh beban mata kuliah wajib program studi</li>
                  <li>Lulus semua tugas akhir/skripsi dengan lembar pengesahan sah</li>
                  <li>Bebas dari segala tunggakan administratif, perpustakaan, & UKT</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400">
                <span>Diperbarui secara berkala</span>
                <span className="font-mono text-indigo-600">Terintegrasi Excel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Toga Sizes & Logistics */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3.5">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Logistik Wisuda (Ukuran Toga)</h4>
            <p className="text-xs text-slate-400 mt-0.5">Berdasarkan pendaftar wisuda yang diajukan</p>
          </div>

          <div className="space-y-3">
            {Object.entries(togaSizes).map(([size, count]) => {
              const maxCount = Math.max(...Object.values(togaSizes), 1);
              const percentage = Math.round((count / maxCount) * 100);
              return (
                <div key={size} className="flex items-center gap-3">
                  <div className="w-10 font-bold text-xs text-slate-600 font-mono flex items-center justify-center p-1.5 bg-slate-50 border border-slate-200/80 rounded-lg shrink-0">
                    Siz. {size}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-700">{count} Set Pakaian</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalWisuda === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <p className="text-[11px] font-medium leading-normal">
                Belum ada berkas pendaftaran wisuda masuk. Distribusi ukuran baju toga belum tersedia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
