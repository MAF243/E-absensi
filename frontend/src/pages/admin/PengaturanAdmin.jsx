import { useEffect, useState } from 'react';
import { KeyRound, Save, Settings, UserRound } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import useAuthStore from '../../store/useAuthStore';
import useUiStore from '../../store/useUiStore';

const PengaturanAdmin = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { showToast } = useUiStore();
  const [formData, setFormData] = useState({ nama_lengkap: '', nomor_induk: '', password: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      nama_lengkap: user?.nama || user?.nama_lengkap || '',
      nomor_induk: user?.nomor_induk || '',
      password: ''
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nama_lengkap.trim() || !formData.nomor_induk.trim()) {
      showToast('Nama dan identitas wajib diisi.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await axiosClient.put('/auth/profile', formData);
      if (!data.success) throw new Error(data.message);
      setUser({ ...user, nama: formData.nama_lengkap, nomor_induk: formData.nomor_induk });
      setFormData((current) => ({ ...current, password: '' }));
      showToast('Pengaturan akun berhasil disimpan.', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Gagal menyimpan pengaturan akun.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-slate-50/80 font-sans animate-in fade-in duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm"><Settings size={28} strokeWidth={2.5} /></div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h2>
          <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Kelola identitas administrator dan keamanan akun</p>
        </div>
      </div>

      <div className="max-w-3xl bg-white rounded-[32px] border border-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] p-5 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><UserRound size={22} /></div>
            <div><h3 className="font-bold text-slate-800">Profil Administrator</h3><p className="text-xs text-slate-500 mt-1">Perubahan akan langsung digunakan pada sesi berikutnya.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap
              <input required value={formData.nama_lengkap} onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white" />
            </label>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identitas Login
              <input required value={formData.nomor_induk} onChange={(e) => setFormData({ ...formData, nomor_induk: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white" />
            </label>
          </div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider"><span className="flex items-center gap-2"><KeyRound size={15} /> Password Baru</span>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Kosongkan jika tidak ingin mengubah password" className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white" />
          </label>
          <div className="flex justify-end pt-3 border-t border-slate-100"><button disabled={isSaving} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60"><Save size={17} /> {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</button></div>
        </form>
      </div>
    </div>
  );
};

export default PengaturanAdmin;
