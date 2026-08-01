import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiUrl } from '../../config/api';
import { saveSession } from '../../utils/session';

const Login = () => {
  const navigate = useNavigate();
  
  const [identitas, setIdentitas] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetNIM, setResetNIM] = useState('');
  
  const [notif, setNotif] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotif({ show: false, message: '', type: '' });
    setIsLoading(true);
    
    try {
      const response = await axios.post(apiUrl('/api/auth/login'), {
        identitas,
        password
      });

      if (response.data.success) {
        saveSession({ user: response.data.data, token: response.data.token });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">E-Absensi</h1>
          <p className="text-slate-400 font-medium mt-1">STIKOM Elrahma Bogor</p>
        </div>

        {/* Notifikasi */}
        {notif.show && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 ${
            notif.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}>
            {notif.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
            {notif.message}
          </div>
        )}

        {!isForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Identitas</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50"
                  placeholder="NIM / NIDN"
                  value={identitas}
                  onChange={(e) => setIdentitas(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Lupa Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-slate-50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              {isLoading ? 'Memproses...' : 'Masuk Sistem'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <button type="button" onClick={() => setIsForgotPassword(false)} className="flex items-center text-xs font-bold text-slate-500 mb-4 hover:text-blue-600"><ArrowLeft size={16} className="mr-1"/> Kembali</button>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              placeholder="Masukkan NIM / NIDN"
              value={resetNIM}
              onChange={(e) => setResetNIM(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Kirim Permintaan</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
