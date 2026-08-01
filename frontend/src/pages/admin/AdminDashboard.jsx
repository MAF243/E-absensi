import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import NavbarAdmin from '../../components/admin/NavbarAdmin';
import StatCard from '../../components/admin/StatCard';

// === IMPORT KOMPONEN HALAMAN DATA ===
import DataMahasiswa from './DataMahasiswa';
import DataDosen from './DataDosen';
import DataMatkul from './DataMatkul';
import JadwalSesi from './JadwalSesi'; 
import RekapAbsensi from './RekapAbsensi'; // <-- SUDAH DITAMBAHKAN IMPORTNYA

// MENGIMPOR ICON PREMIUM TAMBAHAN DARI LUCIDE REACT
import { GraduationCap, Users, BookOpen, CheckCircle, Trophy, AlertTriangle, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState(localStorage.getItem('lastMenu') || 'statistik');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [stats, setStats] = useState({ 
    total_mahasiswa: 0, mhs_aktif: 0, mhs_cuti: 0, mhs_tidak_aktif: 0, 
    total_dosen: 0, total_matkul: 0, rata_kehadiran: 0 
  });
  const [ranking, setRanking] = useState({ rajin: [], kurangRajin: [] });
  const [liveLogs, setLiveLogs] = useState([]);

  const changeMenu = (menuName) => {
    setActiveMenu(menuName);
    localStorage.setItem('lastMenu', menuName);
    setSidebarOpen(false);
  };

  const fetchDashboardData = async () => {
    try {
      if (activeMenu === 'statistik') {
        const baseUrl = 'http://localhost:5000'; 
        
        const [resStats, resRank, resLogs] = await Promise.all([
          fetch(`${baseUrl}/api/dashboard/stats`).then(r => r.json()).catch(() => ({ success: false })),
          fetch(`${baseUrl}/api/dashboard/ranking`).then(r => r.json()).catch(() => ({ success: false })),
          fetch(`${baseUrl}/api/dashboard/logs`).then(r => r.json()).catch(() => ({ success: false }))
        ]);

        if (resStats.success) setStats(resStats.data);
        if (resRank.success) setRanking(resRank.data);
        if (resLogs.success) setLiveLogs(resLogs.data);
      }
    } catch (error) {
      console.error("Gagal menarik data dashboard secara real-time", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // AUTO-REFRESH 5 DETIK SUDAH DINYALAKAN KEMBALI
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [activeMenu]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 transition-transform duration-300 md:relative ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <SidebarAdmin activeMenu={activeMenu} setMenu={changeMenu} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        <NavbarAdmin onToggleMenu={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 scroll-smooth">
          
          {activeMenu === 'statistik' && (
             <div className="animate-in fade-in duration-300">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">📊 Dasbor Administrator</h2>
                  <p className="text-slate-500 font-medium mt-1">Ringkasan sistem dan aktivitas real-time.</p>
                </div>

                <div 
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }} 
                  className="mb-8"
                >
                  <StatCard 
                    title="Total Mahasiswa" 
                    value={stats.total_mahasiswa || 0} 
                    icon={<GraduationCap size={26} strokeWidth={2.5} />} 
                    color="bg-blue-50 text-blue-600 border border-blue-100" 
                    aktif={stats.mhs_aktif || 0}
                    cuti={stats.mhs_cuti || 0}
                  />
                  <StatCard 
                    title="Total Dosen" 
                    value={stats.total_dosen || 0} 
                    icon={<Users size={26} strokeWidth={2.5} />} 
                    color="bg-indigo-50 text-indigo-600 border border-indigo-100" 
                  />
                  <StatCard 
                    title="Total Matkul" 
                    value={stats.total_matkul || 0} 
                    icon={<BookOpen size={26} strokeWidth={2.5} />} 
                    color="bg-amber-50 text-amber-600 border border-amber-100" 
                  />
                  <StatCard 
                    title="Kehadiran Harian" 
                    value={`${stats.rata_kehadiran || 0}%`} 
                    icon={<CheckCircle size={26} strokeWidth={2.5} />} 
                    color="bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* KARTU MAHASISWA RAJIN */}
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Trophy className="text-amber-500" size={22} strokeWidth={2.5} />
                      Mahasiswa Paling Rajin
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {ranking.rajin && ranking.rajin.length > 0 ? ranking.rajin.map((mhs, idx) => (
                        <div key={idx} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-2">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{mhs.nama_lengkap}</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{mhs.jurusan} - {mhs.angkatan}</p>
                          </div>
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm w-fit">
                            {mhs.persentase}% Kehadiran
                          </span>
                        </div>
                      )) : (
                        <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl h-full flex items-center justify-center">
                          <p className="text-slate-500 font-medium italic text-xs">Belum ada data absensi.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KARTU PERLU PERHATIAN */}
                  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-rose-500" size={22} strokeWidth={2.5} />
                      Perlu Perhatian
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {ranking.kurangRajin && ranking.kurangRajin.length > 0 ? ranking.kurangRajin.map((mhs, idx) => (
                        <div key={idx} className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-2">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{mhs.nama_lengkap}</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-0.5">{mhs.jurusan} - {mhs.angkatan}</p>
                          </div>
                          <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm w-fit">
                            {mhs.persentase}% Kehadiran
                          </span>
                        </div>
                      )) : (
                        <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl h-full flex items-center justify-center">
                          <p className="text-slate-500 font-medium italic text-xs">Belum ada data absensi.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KARTU LIVE LOGS */}
                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 flex flex-col md:col-span-2 lg:col-span-1 min-h-[380px] hover:shadow-md transition-shadow">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-emerald-500" size={22} strokeWidth={2.5} />
                        Live Logs Login
                      </h3>
                    </div>
                    
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                      {liveLogs && liveLogs.length > 0 ? liveLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 items-start border-l-2 border-slate-100 hover:border-blue-500 pl-3 py-1 transition-all">
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-800 leading-normal">{log.pesan}</p>
                            <div className="flex items-center justify-between mt-1 gap-2">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                log.jenis === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                log.jenis === 'dosen' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                                'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}>
                                {log.jenis === 'admin' ? 'Admin' : log.jenis === 'dosen' ? 'Dosen' : 'Mhs'}
                              </span>
                              
                              <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{log.waktu} WIB</span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="h-full flex items-center justify-center py-10">
                          <p className="text-xs font-medium text-slate-400 italic text-center">
                            Belum ada aktivitas login hari ini.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
             </div>
          )}

          {/* ==========================================
              SISTEM RENDER MENU (DIPERBARUI)
          ========================================== */}
          {activeMenu === 'mahasiswa' && <DataMahasiswa />}
          {(activeMenu === 'dosen' || activeMenu === 'data-dosen') && <DataDosen />}
          {(activeMenu === 'matkul' || activeMenu === 'mata-kuliah') && <DataMatkul />}
          
          {/* MENU JADWAL, SESI DAN REKAP */}
          {activeMenu === 'jadwal' && <JadwalSesi />}
          {(activeMenu === 'rekap' || activeMenu === 'rekap-absensi') && <RekapAbsensi />}
          
          {/* TAMPILAN FALLBACK UNTUK MENU YANG BELUM DIBUAT */}
          {!['statistik', 'mahasiswa', 'dosen', 'data-dosen', 'matkul', 'mata-kuliah', 'jadwal', 'rekap', 'rekap-absensi'].includes(activeMenu) && (
            <div className="p-10 md:p-20 text-center border-2 border-dashed border-slate-300 rounded-[32px] text-slate-500 font-bold bg-white/50 mt-8 animate-in fade-in zoom-in-95">
              <span className="text-4xl mb-4 block">🚧</span>
              Halaman untuk modul <span className="text-blue-600 uppercase">{activeMenu}</span> sedang dalam tahap pengembangan.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;