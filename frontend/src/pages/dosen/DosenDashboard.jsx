import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, X, CheckCircle2, LogOut, LayoutDashboard, FileText, Menu, Settings } from 'lucide-react';
import RiwayatMengajar from './RiwayatMengajar';
import axiosClient from '../../utils/axiosClient';
import useAuthStore from '../../store/useAuthStore';
import useUiStore from '../../store/useUiStore';
import DosenClassCard from '../../components/dosen/DosenClassCard';
import OpenSessionModal from '../../components/dosen/OpenSessionModal';

const DosenDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  const showConfirm = useUiStore((state) => state.showConfirm);
  const [profileForm, setProfileForm] = useState({ nama_lengkap: '', nomor_induk: '', password: '' });
  const [jadwalList, setJadwalList] = useState([]);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [agenda, setAgenda] = useState('');
  const [tipeSesi, setTipeSesi] = useState('offline'); 
  const [linkPertemuan, setLinkPertemuan] = useState('');
  const [jenisSesi, setJenisSesi] = useState('Reguler');
  const [bobotSesi, setBobotSesi] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        nama_lengkap: currentUser.nama_lengkap || currentUser.nama || '',
        nomor_induk: currentUser.nomor_induk || '',
        password: ''
      });
    } else {
      navigate('/'); 
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [navigate]);

  const fetchJadwalDosen = async () => {
    if (!currentUser) return;
    try {
      const res = await axiosClient.get('/jadwal').then(r => r.data);
      if (res.success) setJadwalList(res.data.filter(item => String(item.dosen_id) === String(currentUser.id)));
    } catch (err) {}
  };

  useEffect(() => { 
    if (currentUser) {
      fetchJadwalDosen(); 
      const interval = setInterval(fetchJadwalDosen, 10000);
      return () => clearInterval(interval); 
    }
  }, [currentUser]);

  const handleBukaSesiClick = (kelas) => {
    setSelectedClass(kelas);
    setAgenda(''); setTipeSesi('offline'); setLinkPertemuan(''); setJenisSesi('Reguler'); setBobotSesi(1);
    setModalOpen(true);
  };

  const handleMulaiKelas = async (e) => {
    e.preventDefault();
    if (!agenda.trim()) return showToast("Agenda materi wajib diisi!", "error");
    try {
      const res = await axiosClient.post('/jadwal/buka-sesi', {
        mk_id: selectedClass.id, dosen_id: currentUser.id, tipe: tipeSesi, link_meet: linkPertemuan, agenda, jenis_sesi: jenisSesi, bobot: bobotSesi
      }).then(r => r.data);
      if (res.success) { setModalOpen(false); showToast("Sesi perkuliahan dibuka!", "success"); fetchJadwalDosen(); } else showToast(res.message, "error");
    } catch (err) { showToast("Terjadi kesalahan jaringan.", "error"); }
  };

  const handleAkhiriKelas = async (sesi_id, nama_mk) => {
    const isConfirmed = await showConfirm({ title: 'Tutup Sesi Kelas', message: `Apakah Anda yakin ingin mengakhiri sesi untuk ${nama_mk} sekarang? Mahasiswa tidak akan bisa absen lagi setelah sesi ditutup.`, type: 'danger', confirmText: 'Ya, Tutup Sesi' });
    
    if (!isConfirmed) return;
    
    try {
      const res = await axiosClient.put(`/jadwal/tutup-sesi/${sesi_id}`).then(r => r.data);
      if (res.success) { showToast("Sesi ditutup.", "success"); fetchJadwalDosen(); }
    } catch (err) { showToast("Gagal menutup sesi.", "error"); }
  };

  const handleSimpanProfil = async (e) => { 
    e.preventDefault(); 
    if(!profileForm.nama_lengkap || !profileForm.nomor_induk) return showToast("Form tidak boleh kosong!", "error");
    try {
      const res = await axiosClient.put(`/dosen/${currentUser.id}`, profileForm).then(r => r.data);
      if (res.success) {
        showToast("Profil diperbarui!", "success");
        const updatedUser = { ...currentUser, nama_lengkap: profileForm.nama_lengkap, nomor_induk: profileForm.nomor_induk };
        login(updatedUser, token);
        setProfileForm(prev => ({...prev, password: ''})); 
      } else showToast(res.message, "error");
    } catch (err) {}
  };

  const handleLogout = async () => { 
    const isConfirmed = await showConfirm({ title: 'Keluar dari Sistem', message: 'Yakin ingin keluar dari sistem portal Dosen?', type: 'danger', confirmText: 'Ya, Keluar' });
    
    if (isConfirmed) {
      logout();
      navigate('/');
    }
  };

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = days[currentTime.getDay()];
  const currentHourMin = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
  
  // ========================================================
  // SMART SORTING: Memprioritaskan Jadwal Hari Ini
  // ========================================================
  const sortedJadwalList = [...jadwalList].sort((a, b) => {
    const isTodayA = a.hari?.toLowerCase() === todayName.toLowerCase();
    const isTodayB = b.hari?.toLowerCase() === todayName.toLowerCase();

    // Jika A hari ini dan B bukan, A naik ke atas
    if (isTodayA && !isTodayB) return -1;
    // Jika B hari ini dan A bukan, B naik ke atas
    if (!isTodayA && isTodayB) return 1;

    // Jika keduanya sama (hari ini atau bukan hari ini), urutkan berdasarkan jam mulai
    if (a.jam_mulai && b.jam_mulai) {
      if (a.jam_mulai < b.jam_mulai) return -1;
      if (a.jam_mulai > b.jam_mulai) return 1;
    }
    return 0;
  });

  const totalKelas = jadwalList.length;
  const sesiAktif = jadwalList.filter(k => k.sesi_aktif_id).length;

  if (!currentUser) return <div className="flex h-screen items-center justify-center font-bold text-slate-400">Memuat data dosen...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 w-72 bg-blue-900 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-500 ease-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">E-Absensi</h1>
            <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-1">Portal Dosen STIKOM</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"><X size={20} strokeWidth={2.5}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-3 px-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 ml-2 mb-2">Menu Utama</p>
          <button onClick={() => { setActiveMenu('dashboard'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3.5 px-5 py-3.5 rounded-[20px] font-bold text-sm transition-all active:scale-95 ${activeMenu === 'dashboard' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={20} strokeWidth={2.5}/> Dashboard
          </button>
          <button onClick={() => { setActiveMenu('riwayat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3.5 px-5 py-3.5 rounded-[20px] font-bold text-sm transition-all active:scale-95 ${activeMenu === 'riwayat' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}>
            <FileText size={20} strokeWidth={2.5}/> Rekap Absensi
          </button>
          
          <div className="my-4 border-t border-white/5"></div>
          
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 ml-2 mb-2">Preferensi</p>
          <button onClick={() => { setActiveMenu('pengaturan'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3.5 px-5 py-3.5 rounded-[20px] font-bold text-sm transition-all active:scale-95 ${activeMenu === 'pengaturan' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-blue-200 hover:bg-white/5 hover:text-white'}`}>
            <Settings size={20} strokeWidth={2.5}/> Pengaturan Akun
          </button>
        </div>
        
        <div className="p-6 border-t border-white/5 bg-white/5">
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-4 w-full rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 text-white text-sm transition-all active:scale-95">
            <LogOut size={18} strokeWidth={2.5}/> Keluar Aplikasi
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-slate-50/50">
        <div className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 z-30 shadow-sm sticky top-0">
          <div className="font-black text-slate-800 flex items-center gap-2.5 tracking-tight">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><LayoutDashboard size={18} strokeWidth={2.5}/></div> 
            {activeMenu === 'dashboard' ? 'Dashboard' : activeMenu === 'riwayat' ? 'Riwayat' : 'Pengaturan'}
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"><Menu size={20} strokeWidth={2.5}/></button>
        </div>

        {toast.show && (
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-[9999] animate-in fade-in slide-in-from-top-8 duration-300">
            <div className={`flex items-center gap-3 px-5 py-4 rounded-[24px] shadow-2xl border bg-white/90 backdrop-blur-sm ${toast.type === 'success' ? 'border-emerald-100 shadow-emerald-500/10' : 'border-rose-100 shadow-rose-500/10'}`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                <CheckCircle2 size={20} strokeWidth={2.5}/>
              </div>
              <div className="flex flex-col pr-4"><span className="text-sm font-bold text-slate-800">{toast.message}</span></div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full pb-20">
          
          {activeMenu === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">
              
              {/* Header Card */}
              <div className="mb-8 bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex justify-between items-start sm:items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Selamat datang,</h2>
                  <h3 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight mt-1">{currentUser.nama_lengkap || currentUser.nama || currentUser.nomor_induk}</h3>
                  <p className="text-slate-500 font-bold text-[11px] md:text-xs uppercase tracking-widest mt-3 flex items-center gap-2">
                    NIDN/Inisial: <span className="font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">{currentUser.nomor_induk}</span>
                  </p>
                </div>
                <div className="bg-blue-50/80 px-5 py-4 rounded-[24px] border border-blue-100/60 hidden sm:block shadow-inner relative z-10">
                  <p className="text-[10px] md:text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1 text-center">Waktu Server</p>
                  <p className="text-2xl font-black text-blue-800 flex items-center gap-2 tracking-tight"><Clock size={20} strokeWidth={2.5} className="text-blue-500"/> {currentHourMin} WIB</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 w-full">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-[20px] shrink-0 border border-blue-100"><BookOpen size={28} strokeWidth={2.5}/></div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Kelas Anda</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{totalKelas} <span className="text-lg text-slate-400 font-bold">Kelas</span></h4>
                  </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-5 w-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px] pointer-events-none"></div>
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[20px] shrink-0 border border-emerald-100 relative z-10"><Clock size={28} strokeWidth={2.5}/></div>
                  <div className="relative z-10">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Sesi Berjalan</p>
                    <h4 className="text-2xl font-black text-emerald-600 tracking-tight">{sesiAktif} <span className="text-lg text-emerald-400 font-bold">Aktif</span></h4>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Daftar Jadwal Kelas</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                {/* Looping menggunakan state yang sudah diurutkan (sortedJadwalList) */}
                {sortedJadwalList.map((kelas) => (
                  <DosenClassCard
                    key={kelas.id}
                    kelas={kelas}
                    todayName={todayName}
                    currentHourMin={currentHourMin}
                    onOpenSession={handleBukaSesiClick}
                    onEndSession={handleAkhiriKelas}
                  />
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'riwayat' && <RiwayatMengajar currentUser={currentUser} />}

          {activeMenu === 'pengaturan' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
               <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-10">
                 <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                    <div className="p-3.5 bg-blue-50 text-blue-600 rounded-[20px]"><Settings size={28} strokeWidth={2.5}/></div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h3>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">Perbarui profil atau password Anda</p>
                    </div>
                 </div>
                 <form onSubmit={handleSimpanProfil} className="space-y-6">
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nama Lengkap & Gelar</label>
                      <input required type="text" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all" value={profileForm.nama_lengkap} onChange={e => setProfileForm({...profileForm, nama_lengkap: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Username Login (NIDN/Inisial)</label>
                      <input required type="text" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-black tracking-widest text-slate-700 uppercase transition-all" value={profileForm.nomor_induk} onChange={e => setProfileForm({...profileForm, nomor_induk: e.target.value.toUpperCase()})} />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Kata Sandi Baru</label>
                      <input type="text" placeholder="Kosongkan jika tidak ingin mengubah password" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-sm font-bold text-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full mt-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={20} strokeWidth={2.5}/> Simpan Perubahan
                    </button>
                 </form>
               </div>
             </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <OpenSessionModal
          selectedClass={selectedClass}
          agenda={agenda}
          setAgenda={setAgenda}
          jenisSesi={jenisSesi}
          bobotSesi={bobotSesi}
          setJenisSesi={setJenisSesi}
          setBobotSesi={setBobotSesi}
          onClose={() => setModalOpen(false)}
          onSubmit={handleMulaiKelas}
        />
      )}
    </div>
  );
};

export default DosenDashboard;
