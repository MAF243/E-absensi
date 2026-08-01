import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, X, CheckCircle2, LogOut, LayoutDashboard, FileText, Menu, Settings } from 'lucide-react';
import RiwayatMengajar from './RiwayatMengajar';
import { apiUrl } from '../../config/api';
import { clearSession, getCurrentUser, saveCurrentUser } from '../../utils/session';
import DosenClassCard from '../../components/dosen/DosenClassCard';
import OpenSessionModal from '../../components/dosen/OpenSessionModal';

const DosenDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setProfileForm({
        nama_lengkap: user.nama_lengkap || user.nama || '',
        nomor_induk: user.nomor_induk || '',
        password: ''
      });
    } else navigate('/'); 

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [navigate]);

  const fetchJadwalDosen = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(apiUrl('/api/jadwal')).then(r => r.json());
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
      const res = await fetch(apiUrl('/api/jadwal/buka-sesi'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mk_id: selectedClass.id, dosen_id: currentUser.id, tipe: tipeSesi, link_meet: linkPertemuan, agenda, jenis_sesi: jenisSesi, bobot: bobotSesi })
      }).then(r => r.json());
      if (res.success) { setModalOpen(false); showToast("Sesi perkuliahan dibuka!", "success"); fetchJadwalDosen(); } else showToast(res.message, "error");
    } catch (err) { showToast("Terjadi kesalahan jaringan.", "error"); }
  };

  const handleAkhiriKelas = async (sesi_id, nama_mk) => {
    if (!window.confirm(`Akhiri sesi untuk ${nama_mk} sekarang?`)) return;
    try {
      const res = await fetch(apiUrl(`/api/jadwal/tutup-sesi/${sesi_id}`), { method: 'PUT' }).then(r => r.json());
      if (res.success) { showToast("Sesi ditutup.", "success"); fetchJadwalDosen(); }
    } catch (err) { showToast("Gagal menutup sesi.", "error"); }
  };

  const handleSimpanProfil = async (e) => { 
    e.preventDefault(); 
    if(!profileForm.nama_lengkap || !profileForm.nomor_induk) return showToast("Form tidak boleh kosong!", "error");
    try {
      const res = await fetch(apiUrl(`/api/dosen/${currentUser.id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileForm)
      }).then(r => r.json());
      if (res.success) {
        showToast("Profil diperbarui!", "success");
        const updatedUser = { ...currentUser, nama_lengkap: profileForm.nama_lengkap, nomor_induk: profileForm.nomor_induk };
        saveCurrentUser(updatedUser);
        setCurrentUser(updatedUser); setProfileForm(prev => ({...prev, password: ''})); 
      } else showToast(res.message, "error");
    } catch (err) {}
  };

  const handleLogout = () => { 
    if(window.confirm("Yakin ingin keluar dari sistem?")) { clearSession(); navigate('/'); }
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
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white flex flex-col shadow-xl z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-indigo-800/50 flex justify-between items-center">
          <div><h1 className="text-xl font-bold text-white">E-Absensi</h1><p className="text-indigo-200 text-xs font-medium mt-1">Portal Dosen STIKOM</p></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-indigo-200"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
          <button onClick={() => { setActiveMenu('dashboard'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${activeMenu === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => { setActiveMenu('riwayat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${activeMenu === 'riwayat' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}><FileText size={18} /> Rekap Absensi</button>
          <div className="my-2 border-t border-indigo-800/50"></div>
          <button onClick={() => { setActiveMenu('pengaturan'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm ${activeMenu === 'pengaturan' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}><Settings size={18} /> Pengaturan Akun</button>
        </div>
        <div className="p-4 border-t border-indigo-800/50"><button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold bg-rose-600 text-white hover:bg-rose-700 text-sm"><LogOut size={18} /> Keluar</button></div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <div className="md:hidden flex items-center justify-between bg-white px-6 py-4 border-b border-slate-200 z-30 shadow-sm">
          <div className="font-bold text-slate-800 flex items-center gap-2"><LayoutDashboard size={18} className="text-indigo-600"/> {activeMenu === 'dashboard' ? 'Dashboard' : activeMenu === 'riwayat' ? 'Riwayat' : 'Pengaturan'}</div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600"><Menu size={20} /></button>
        </div>

        {toast.show && (
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[9999] animate-in fade-in slide-in-from-top-8 duration-300">
            <div className={`flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
              <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><CheckCircle2 size={20} /></div>
              <div className="flex flex-col pr-2 md:pr-4"><span className="text-sm font-bold text-slate-800">{toast.message}</span></div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full pb-20">
          
          {activeMenu === 'dashboard' && (
            <div className="animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">Selamat datang,</h2>
                  <h3 className="text-lg md:text-xl font-bold text-indigo-600 mt-1">{currentUser.nama_lengkap || currentUser.nama || currentUser.nomor_induk}</h3>
                  <p className="text-slate-500 font-medium text-xs md:text-sm mt-2">NIDN/Inisial: <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{currentUser.nomor_induk}</span></p>
                </div>
                <div className="bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100 hidden sm:block">
                  <p className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Waktu Server</p>
                  <p className="text-lg font-black text-indigo-700 flex items-center gap-2"><Clock size={18}/> {currentHourMin} WIB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white p-5 md:p-6 rounded-3xl border shadow-sm flex items-center gap-4 w-full">
                  <div className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><BookOpen size={24} /></div>
                  <div><p className="text-xs font-semibold text-slate-500">Total Kelas</p><h4 className="text-xl font-bold text-slate-800">{totalKelas} Kelas</h4></div>
                </div>
                <div className="bg-white p-5 md:p-6 rounded-3xl border shadow-sm flex items-center gap-4 w-full">
                  <div className="p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-xl shrink-0"><Clock size={24} /></div>
                  <div><p className="text-xs font-semibold text-slate-500">Sesi Berjalan</p><h4 className="text-xl font-bold text-slate-800">{sesiAktif} Aktif</h4></div>
                </div>
              </div>

              <div className="mb-4 md:mb-6"><h3 className="text-lg font-bold text-slate-800">Daftar Jadwal Kelas Anda</h3></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
             <div className="animate-in fade-in max-w-3xl mx-auto w-full">
               <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                 <h3 className="text-xl font-bold mb-6 border-b pb-4">Pengaturan Akun</h3>
                 <form onSubmit={handleSimpanProfil} className="space-y-6">
                    <div><label className="text-sm font-bold block mb-2">Nama Lengkap & Gelar</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-semibold" value={profileForm.nama_lengkap} onChange={e => setProfileForm({...profileForm, nama_lengkap: e.target.value})} /></div>
                    <div><label className="text-sm font-bold block mb-2">Username Login (NIDN/Inisial)</label><input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-semibold uppercase" value={profileForm.nomor_induk} onChange={e => setProfileForm({...profileForm, nomor_induk: e.target.value.toUpperCase()})} /></div>
                    <div><label className="text-sm font-bold block mb-2">Kata Sandi Baru</label><input type="text" placeholder="Kosongkan jika tidak diubah" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} /></div>
                    <button type="submit" className="w-full px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors">Simpan Perubahan</button>
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
