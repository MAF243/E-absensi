import React, { useState, useEffect } from 'react';
import { FileText, Edit, X, CheckCircle2, AlertCircle, CalendarDays, Users, Save } from 'lucide-react';

const RiwayatMengajar = ({ currentUser }) => {
  const [riwayatList, setRiwayatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // State Rekap Modal
  const [modalRekap, setModalRekap] = useState({ isOpen: false, sesi: null, mkId: null });
  const [rekapData, setRekapData] = useState([]);
  const [isLoadingRekap, setIsLoadingRekap] = useState(false);

  const BASE_URL = 'http://localhost:5000';

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchRiwayat = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/absensi/riwayat-dosen/${currentUser.id}`).then(r => r.json());
      if (res.success) setRiwayatList(res.data);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { fetchRiwayat(); }, [currentUser]);

  const openRekapSesi = async (sesi) => {
    setIsLoadingRekap(true);
    setModalRekap({ isOpen: true, sesi, mkId: null });
    try {
      const res = await fetch(`${BASE_URL}/api/absensi/sesi/${sesi.sesi_id}`).then(r => r.json());
      if (res.success) {
        // Transform data API menjadi state yang mudah di-handle form
        const dataForm = res.data.map(m => ({ user_id: m.id, nama: m.nama_lengkap, nim: m.nomor_induk, status: m.status_absen }));
        setRekapData(dataForm);
        setModalRekap(prev => ({ ...prev, mkId: res.mk_id }));
      }
      setIsLoadingRekap(false);
    } catch (err) { setIsLoadingRekap(false); showToast("Gagal memuat rekap", "error"); }
  };

  const handleStatusChange = (userId, newStatus) => {
    setRekapData(prev => prev.map(mhs => mhs.user_id === userId ? { ...mhs, status: newStatus } : mhs));
  };

  const ringkasanRekap = rekapData.reduce((summary, mahasiswa) => {
    summary.total += 1;
    summary[mahasiswa.status] += 1;
    return summary;
  }, { total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 });

  const simpanRekap = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/absensi/rekap-manual`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesi_id: modalRekap.sesi.sesi_id, mk_id: modalRekap.mkId, rekap_data: rekapData })
      }).then(r => r.json());

      if (res.success) {
        showToast(res.message, "success");
        setModalRekap({ isOpen: false, sesi: null, mkId: null });
        fetchRiwayat(); // Refresh data riwayat
      } else { showToast(res.message, "error"); }
    } catch (err) { showToast("Gagal menyimpan rekap", "error"); }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      {toast.show && (
        <div className="fixed top-8 right-8 z-[99999] animate-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border bg-white ${toast.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
            <div className={`p-2 rounded-xl shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="flex flex-col pr-4">
              <span className="text-sm font-bold text-slate-800">{toast.type === 'success' ? 'Berhasil!' : 'Peringatan!'}</span>
              <span className="text-xs font-medium text-slate-500">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 border-b border-slate-200 pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800">Rekap Absensi & Riwayat Mengajar</h3>
        <p className="text-sm text-slate-500 mt-1">Lakukan rekap manual kehadiran mahasiswa dan pantau sesi sebelumnya.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Info Sesi & Agenda</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Mata Kuliah</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Kehadiran</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-500">Memuat riwayat...</td></tr>
              ) : riwayatList.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-16 text-slate-500 font-medium"><FileText size={40} className="mx-auto text-slate-300 mb-2"/> Belum ada riwayat mengajar.</td></tr>
              ) : riwayatList.map(item => {
                const dateObj = new Date(item.waktu_mulai);
                const tgl = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <tr key={item.sesi_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{item.agenda || '-'}</div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CalendarDays size={14}/> {tgl} <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-bold uppercase">{item.jenis_sesi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-indigo-700 text-sm">{item.kode_mk}</div>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5">{item.nama_mk}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs border border-emerald-100">
                         {item.total_hadir} / {item.total_peserta} Hadir
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openRekapSesi(item)} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 flex items-center justify-end gap-2 ml-auto transition-colors">
                        <Edit size={14}/> Rekap Manual
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REKAP MANUAL */}
      {modalRekap.isOpen && modalRekap.sesi && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setModalRekap({ isOpen: false, sesi: null })}>
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4 shrink-0">
              <div>
                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users size={24} className="text-indigo-600"/> Form Rekap Absensi</h3>
                 <p className="text-sm font-semibold text-indigo-600 mt-1">{modalRekap.sesi.kode_mk} - {modalRekap.sesi.nama_mk}</p>
                 <p className="text-xs font-medium text-slate-500 mt-1">Sesi: {new Date(modalRekap.sesi.waktu_mulai).toLocaleDateString('id-ID')} ({modalRekap.sesi.jenis_sesi})</p>
              </div>
              <button onClick={() => setModalRekap({ isOpen: false, sesi: null })} className="p-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5 shrink-0">
              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Hadir Hari Ini</p>
                <p className="text-xl font-black text-emerald-700">{ringkasanRekap.hadir} <span className="text-xs font-bold text-emerald-600">/ {ringkasanRekap.total}</span></p>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Izin</p><p className="text-xl font-black text-blue-700">{ringkasanRekap.izin}</p></div>
              <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Sakit</p><p className="text-xl font-black text-amber-700">{ringkasanRekap.sakit}</p></div>
              <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-rose-600">Alpa</p><p className="text-xl font-black text-rose-700">{ringkasanRekap.alpa}</p></div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-slate-50 rounded-2xl border border-slate-200">
              {isLoadingRekap ? (
                <div className="flex h-full items-center justify-center text-slate-400 font-medium">Memuat data mahasiswa...</div>
              ) : (
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="px-4 py-4 text-xs font-bold uppercase text-slate-500">Mahasiswa</th>
                      <th className="px-4 py-4 text-xs font-bold uppercase text-slate-500 text-center">Kehadiran (H / I / S / A)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rekapData.map(mhs => (
                      <tr key={mhs.user_id} className="hover:bg-white transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-sm text-slate-800">{mhs.nama}</p>
                          <p className="text-[10px] font-semibold text-slate-500">{mhs.nim}</p>
                        </td>
                        <td className="px-4 py-3">
                           <div className="flex justify-center gap-2">
                             {/* HADIR */}
                             <label className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-bold text-sm ${mhs.status === 'hadir' ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="hadir" checked={mhs.status === 'hadir'} onChange={() => handleStatusChange(mhs.user_id, 'hadir')} /> H
                             </label>
                             {/* IZIN */}
                             <label className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-bold text-sm ${mhs.status === 'izin' ? 'bg-blue-500 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="izin" checked={mhs.status === 'izin'} onChange={() => handleStatusChange(mhs.user_id, 'izin')} /> I
                             </label>
                             {/* SAKIT */}
                             <label className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-bold text-sm ${mhs.status === 'sakit' ? 'bg-amber-500 border-amber-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="sakit" checked={mhs.status === 'sakit'} onChange={() => handleStatusChange(mhs.user_id, 'sakit')} /> S
                             </label>
                             {/* ALPA */}
                             <label className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all font-bold text-sm ${mhs.status === 'alpa' ? 'bg-rose-500 border-rose-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="alpa" checked={mhs.status === 'alpa'} onChange={() => handleStatusChange(mhs.user_id, 'alpa')} /> A
                             </label>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 shrink-0 pt-4 border-t border-slate-100">
               <button onClick={() => setModalRekap({ isOpen: false, sesi: null })} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Batal</button>
               <button onClick={simpanRekap} className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"><Save size={18}/> Simpan Rekap</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiwayatMengajar;
