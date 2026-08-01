import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, LogOut, User, CalendarDays, QrCode } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { clearSession, getCurrentUser } from '../../utils/session';
import JadwalMahasiswaCard from '../../components/mahasiswa/JadwalMahasiswaCard';
import QrScannerModal from '../../components/mahasiswa/QrScannerModal';

const MahasiswaDashboard = () => {
  const navigate = useNavigate();
  
  // STATE USER DINAMIS DARI LOGIN
  const [currentUser, setCurrentUser] = useState(null);
  
  // STATE JADWAL & ABSENSI
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE UI & SCANNER
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  
  // HELPER FUNGSI WAKTU
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const now = new Date();
  const todayName = days[now.getDay()];
  const todayDateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // INIT: CEK LOGIN
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

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
      const res = await fetch(apiUrl(`/api/jadwal/mahasiswa/${currentUser.id}`)).then(r => r.json());
      
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
        const response = await fetch(apiUrl('/api/absensi/scan'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            qr_code: text, 
            latitude: gpsLocation.lat, 
            longitude: gpsLocation.lng, 
            mahasiswa_id: currentUser.id 
          })
        });
        
        const resData = await response.json();
        
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

  const handleLogout = () => {
    if (window.confirm("Yakin ingin keluar?")) {
      clearSession();
      navigate('/');
    }
  };

  if (!currentUser) return <div className="flex h-screen items-center justify-center text-slate-500 font-bold">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Notifikasi Toast */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[9999] animate-in slide-in-from-top-6 duration-300">
          <div className={`flex items-start gap-3 px-4 py-4 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight">{toast.type === 'success' ? 'Berhasil' : 'Gagal / Peringatan'}</span>
              <span className="text-[11px] font-medium text-slate-500 leading-relaxed mt-0.5">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PROFIL NATIVE-LIKE */}
      <div className="bg-blue-600 text-white pt-10 pb-16 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-800/30 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5"><QrCode size={20}/> E-Absensi</h1>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">Portal Mahasiswa</p>
          </div>
          <button onClick={handleLogout} className="p-2 bg-blue-700/50 hover:bg-rose-500 rounded-full transition-colors backdrop-blur-sm border border-white/10 shadow-sm">
            <LogOut size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
            <User size={26} className="text-white drop-shadow-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight shadow-sm">{currentUser.nama_lengkap}</h2>
            <p className="text-blue-100 text-xs font-semibold mt-1 bg-black/10 px-2 py-0.5 rounded w-fit">{currentUser.nomor_induk} • {currentUser.jurusan || 'MHS'}</p>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA - JADWAL HARI INI */}
      <div className="px-5 -mt-8 relative z-20 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          
          <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" /> Jadwal Hari Ini
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{todayDateStr}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-indigo-600">{jadwalHariIni.length} Kelas</p>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
               <div className="text-center py-10 text-slate-400 text-sm font-semibold animate-pulse">Memuat jadwal...</div>
            ) : jadwalHariIni.length === 0 ? (
               <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                 <CalendarDays size={40} className="mx-auto text-slate-300 mb-3"/>
                 <p className="text-sm font-bold text-slate-600">Belum ada matakuliah hari ini.</p>
                 <p className="text-[11px] text-slate-400 mt-1">Gunakan waktu ini untuk istirahat atau belajar mandiri.</p>
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
