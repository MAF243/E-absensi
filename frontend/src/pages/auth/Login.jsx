import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, QrCode } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import useAuthStore from '../../store/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  
  const [identitas, setIdentitas] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetNIM, setResetNIM] = useState('');
  
  const [notif, setNotif] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotif({ show: false, message: '', type: '' });
    setIsLoading(true);
    
    try {
      const response = await axiosClient.post('/auth/login', {
        identitas,
        password
      });

      if (response.data.success) {
        login(response.data.data, response.data.token);

        setNotif({ 
          show: true, 
          message: `Berhasil! Selamat datang, ${response.data.data.nama}`, 
          type: 'success' 
        });

        // NAVIGASI DINAMIS BERDASARKAN ROLE
        setTimeout(() => {
          const role = response.data.data.role;
          if (role === 'admin') navigate('/dashboard-admin', { replace: true });
          else if (role === 'dosen') navigate('/dashboard-dosen', { replace: true });
          else navigate('/dashboard-mahasiswa', { replace: true });
        }, 1500);
      }
    } catch (error) {
      setNotif({ 
        show: true, 
        message: error.response?.data?.message || "Gagal terhubung ke server", 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setNotif({ show: true, message: `Permintaan reset untuk NIM: ${resetNIM} dikirim.`, type: 'success' });
    setTimeout(() => { setIsForgotPassword(false); setNotif({ show: false, message: '', type: '' }); setResetNIM(''); }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>

      <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 w-full max-w-md border border-white relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-600/30 rotate-3 transition-transform hover:rotate-6">
            <QrCode className="text-white" size={40} strokeWidth={2.5}/>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">E-Absensi</h1>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">STIKOM Elrahma Bogor</p>
        </div>

        {/* Notifikasi */}
        {notif.show && (
          <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            notif.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm shadow-emerald-100/50' : 'bg-rose-50 text-rose-700 border border-rose-100 shadow-sm shadow-rose-100/50'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {notif.type === 'success' ? <CheckCircle2 size={18} strokeWidth={2.5}/> : <AlertCircle size={18} strokeWidth={2.5}/>}
            </div>
            <p className="leading-tight">{notif.message}</p>
          </div>
        )}

        {!isForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Identitas (NIM / NIDN)</label>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <User className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} strokeWidth={2.5} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200/60 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white text-sm font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
                  placeholder="Masukkan NIM atau NIDN"
                  value={identitas}
                  onChange={(e) => setIdentitas(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors">Lupa?</button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} strokeWidth={2.5} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-200/60 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white text-sm font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-800/20 active:scale-95 hover:bg-slate-900 transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                  Otentikasi...
                </span>
              ) : 'Masuk Sistem'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <button type="button" onClick={() => setIsForgotPassword(false)} className="flex items-center text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6 hover:text-blue-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-blue-50">
              <ArrowLeft size={16} strokeWidth={2.5} className="mr-2"/> Kembali ke Login
            </button>
            
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kirim Link Reset</label>
              <div className="relative group">
                <div className="absolute left-4 top-0 bottom-0 flex items-center pointer-events-none">
                  <User className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} strokeWidth={2.5} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200/60 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50/50 focus:bg-white text-sm font-bold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
                  placeholder="Masukkan NIM / NIDN Anda"
                  value={resetNIM}
                  onChange={(e) => setResetNIM(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              Kirim Permintaan
            </button>
          </form>
        )}
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 w-full text-center z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 STIKOM Elrahma Bogor • E-Absensi</p>
      </div>
    </div>
  );
};

export default Login;
