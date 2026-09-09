import { useEffect, useState } from 'react';
import { Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const roleLabel = { admin: 'Admin', dosen: 'Dosen', mahasiswa: 'Mahasiswa' };

const AktivitasLog = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 1 });

  const fetchActivities = async () => {
    try {
      const { data } = await axiosClient.get(`/auth/activity?page=${pagination.page}&pageSize=50`);
      if (data.success) {
        setActivities(data.data || []);
        setPagination(data.pagination || pagination);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, [pagination.page]);

  const activityLabel = (action) => {
    const [method, ...pathParts] = String(action || '').split(' ');
    const path = pathParts.join(' ').replace('/api/', '').replaceAll('/', ' / ');
    return `${method} ${path}`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-slate-50/80 font-sans animate-in fade-in duration-500">
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[20px] shadow-sm"><Activity size={28} /></div>
        <div><h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Aktivitas Sistem</h2><p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Riwayat aktivitas seluruh pengguna</p></div>
      </div>

      <div className="bg-white rounded-[32px] border border-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] p-3 md:p-5">
        <div className="flex items-center justify-between px-3 md:px-5 py-4 border-b border-slate-100">
          <div><h3 className="font-bold text-slate-800">Log Terbaru</h3><p className="text-xs text-slate-500 mt-1">Diperbarui otomatis setiap 10 detik</p></div>
          <button onClick={fetchActivities} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl" title="Segarkan log"><RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Waktu</th><th className="px-5 py-4">Pengguna</th><th className="px-5 py-4">Aktivitas</th><th className="px-5 py-4">Hasil</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {activities.length ? activities.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">{new Date(item.created_at).toLocaleString('id-ID')}</td><td className="px-5 py-4"><p className="text-sm font-medium text-slate-800">{item.nama_lengkap}</p><p className="text-[11px] text-slate-400">{roleLabel[item.role] || item.role || 'Sistem'}</p></td><td className="px-5 py-4 text-xs font-medium text-slate-600">{activityLabel(item.action)}</td><td className={`px-5 py-4 text-xs font-medium ${item.outcome === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{item.outcome === 'success' ? 'Berhasil' : 'Gagal'}</td></tr>) : <tr><td colSpan="4" className="px-5 py-16 text-center text-sm text-slate-400">{isLoading ? 'Memuat aktivitas...' : 'Belum ada aktivitas tercatat.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-3 md:px-5 py-4">
          <p className="text-xs text-slate-500">Halaman <span className="font-medium text-slate-700">{pagination.page}</span> dari <span className="font-medium text-slate-700">{pagination.totalPages}</span> ({pagination.total} aktivitas)</p>
          <div className="flex gap-2"><button disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40" title="Halaman sebelumnya"><ChevronLeft size={17} /></button><button disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))} className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40" title="Halaman berikutnya"><ChevronRight size={17} /></button></div>
        </div>
      </div>
    </div>
  );
};

export default AktivitasLog;
