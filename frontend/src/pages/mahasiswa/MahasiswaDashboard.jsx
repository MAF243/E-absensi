import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, LogOut, User, CalendarDays, QrCode } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import useAuthStore from '../../store/useAuthStore';
import useUiStore from '../../store/useUiStore';
import JadwalMahasiswaCard from '../../components/mahasiswa/JadwalMahasiswaCard';
import QrScannerModal from '../../components/mahasiswa/QrScannerModal';

const MahasiswaDashboard = () => {
  const navigate = useNavigate();
  
  // STATE USER DARI ZUSTAND
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { showConfirm, showToast } = useUiStore();
  
  // STATE JADWAL & ABSENSI
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE UI & SCANNER
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  
  // HELPER FUNGSI WAKTU
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const now = new Date();
  const todayName = days[now.getDay()];
  const todayDateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // INIT: CEK LOGIN
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // FETCH DATA MENGGUNAKAN API BARU
  useEffect(() => {
    if (currentUser) {
      fetchJadwalMahasiswa();
      const interval = setInterval(fetchJadwalMahasiswa, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  async function fetchJadwalMahasiswa() {
    try {
      // Menggunakan Endpoint Spesifik Mahasiswa
      const res = await axiosClient.get(`/jadwal/mahasiswa/${currentUser.id}`).then(r => r.data);
      
      if (res.success && res.data) {
        // Filter: Hanya tampilkan jadwal HARI INI
        let jadwalToday = res.data.filter(j => j.hari && j.hari.toLowerCase() === todayName.toLowerCase());

        jadwalToday = jadwalToday.map(j => ({
           ...j,
           status_absen: 'belum' // Default belum (akan diubah otomatis jika backend dicek nanti)
        }));

        setJadwalHariIni(jadwalToday);
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  // LOGIKA SCAN OFFLINE
  const handleBukaScanner = () => {
    setIsLoadingGPS(true);
    if (!navigator.geolocation) {
      setIsLoadingGPS(false);
      return showToast("Browser/HP Anda tidak mendukung fitur GPS Lokasi.", "error");
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLoadingGPS(false);
        setIsScanning(true); 
      },
      () => {
        setIsLoadingGPS(false);
        showToast("Gagal mendapatkan lokasi. Pastikan GPS menyala!", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleScanResult = async (text) => {
    if (text) {
      setIsScanning(false); 
      try {
        const resData = await axiosClient.post('/absensi/scan', {
          qr_code: text, 
          latitude: gpsLocation.lat, 
          longitude: gpsLocation.lng, 
          mahasiswa_id: currentUser.id 
        }).then(r => r.data);
        
        if (resData.success) {
          showToast(resData.message, "success");
          setJadwalHariIni(prev => prev.map(j => {
             const qrMkId = text.split('-')[1];
             if (String(j.id) === String(qrMkId)) {
                return { ...j, status_absen: 'hadir' };
             }
             return j;
          }));
        } else {
          showToast(resData.message, "error");
        }
      } catch {
        showToast("Gagal terhubung ke server Absensi.", "error");
      }
    }
  };

  // LOGIKA KELAS ONLINE
  const handleAbsenOnline = async (mk_id, link_meet) => {
    showToast("Mencatat kehadiran... Mengarahkan ke ruang kelas.", "success");
    setJadwalHariIni(prev => prev.map(j => j.id === mk_id ? { ...j, status_absen: 'hadir' } : j));
    setTimeout(() => {
      if(link_meet) window.open(link_meet, "_blank");
    }, 1500);
  };

  const handleLogout = async () => {
    const isConfirmed = await showConfirm({
      title: 'Keluar dari Sistem',
      message: 'Apakah Anda yakin ingin keluar? Sesi Anda akan berakhir.',
      type: 'danger',
      confirmText: 'Ya, Keluar'
    });

    if (isConfirmed) {
      logout();
      navigate('/');
    }
  };

  if (!currentUser) return <div className="flex h-screen items-center justify-center text-slate-400 text-sm font-black uppercase tracking-widest animate-pulse">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 overflow-x-hidden">
      
      {/* HEADER PROFIL NATIVE-LIKE */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white pt-12 pb-24 px-6 md:px-10 rounded-b-[48px] shadow-2xl shadow-blue-900/20 relative overflow-hidden animate-in slide-in-from-top-full duration-700 ease-out">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/30 rounded-full blur-[60px] translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-[40px] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-10 relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
               <QrCode size={24} strokeWidth={2.5} className="text-white"/>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">E-Absensi</h1>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mt-0.5">Portal Mahasiswa</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3.5 bg-white/10 hover:bg-rose-500 rounded-2xl transition-all active:scale-95 backdrop-blur-md border border-white/20 shadow-sm shadow-black/10 group">
            <LogOut size={20} strokeWidth={2.5} className="text-white group-hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-5 md:gap-6 relative z-10 max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            <User size={36} className="text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
          </div>
          <div className="flex-1 pt-1">
            <h2 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-md tracking-tight mb-2 line-clamp-1">{currentUser.nama_lengkap}</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-black/20 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-[12px] backdrop-blur-md border border-white/10 shadow-sm">
                {currentUser.nomor_induk}
              </span>
              <span className="bg-blue-500/30 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-[12px] backdrop-blur-md border border-blue-400/30 shadow-sm">
                {currentUser.jurusan || 'MHS'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA - JADWAL HARI INI */}
      <div className="px-5 md:px-10 -mt-12 relative z-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="bg-white rounded-[40px] p-6 md:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-[20px] shadow-sm border border-blue-100">
                <CalendarDays size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Jadwal Hari Ini</h3>
                <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">{todayDateStr}</p>
              </div>
            </div>
            <div className="bg-slate-50 px-4 py-2.5 rounded-[16px] border border-slate-200/60 hidden sm:block">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{jadwalHariIni.length} Kelas Tersedia</p>
            </div>
          </div>

          <div className="space-y-5">
            {isLoading ? (
               <div className="text-center py-16 text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse bg-slate-50 rounded-[32px] border border-slate-100">Memuat jadwal kelas...</div>
            ) : jadwalHariIni.length === 0 ? (
               <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 transition-all hover:bg-slate-100/50 group">
                 <div className="w-24 h-24 bg-white rounded-[24px] shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-1 transition-transform">
                   <CalendarDays size={40} className="text-slate-300" strokeWidth={2} />
                 </div>
                 <p className="text-xl font-black text-slate-800 tracking-tight">Tidak Ada Kelas Hari Ini</p>
                 <p className="text-sm font-bold text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">Gunakan waktu luang ini untuk beristirahat, mengerjakan tugas kelompok, atau belajar mandiri.</p>
               </div>
            ) : (
               jadwalHariIni.map((jadwal) => (
                 <JadwalMahasiswaCard
                   key={jadwal.id}
                   jadwal={jadwal}
                   isLoadingGPS={isLoadingGPS}
                   onOpenScanner={handleBukaScanner}
                   onJoinOnline={handleAbsenOnline}
                 />
               ))
            )}
          </div>

        </div>
      </div>

      <QrScannerModal
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScan={(text) => handleScanResult(text)}
      />

    </div>
  );
};

// Keyframes Kustom untuk Scanner Line
const style = document.createElement('style');
style.textContent = `
  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
`;
document.head.appendChild(style);

export default MahasiswaDashboard;
