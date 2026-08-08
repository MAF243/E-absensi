import React, { useState, useEffect } from 'react';
import { FileText, Edit, X, CheckCircle2, AlertCircle, CalendarDays, Users, Save, FileClock } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import useUiStore from '../../store/useUiStore';

const RiwayatMengajar = ({ currentUser }) => {
  const [riwayatList, setRiwayatList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Rekap Modal
  const [modalRekap, setModalRekap] = useState({ isOpen: false, sesi: null, mkId: null });
  const [rekapData, setRekapData] = useState([]);
  const [isLoadingRekap, setIsLoadingRekap] = useState(false);

  const { showToast, showConfirm } = useUiStore();

  const fetchRiwayat = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get(`/absensi/riwayat-dosen/${currentUser.id}`).then(r => r.data);
      if (res.success) setRiwayatList(res.data);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { fetchRiwayat(); }, [currentUser]);

  const openRekapSesi = async (sesi) => {
    setIsLoadingRekap(true);
    setModalRekap({ isOpen: true, sesi, mkId: null });
    try {
      const res = await axiosClient.get(`/absensi/sesi/${sesi.sesi_id}`).then(r => r.data);
      if (res.success) {
        // Transform data API menjadi state yang mudah di-handle form
        const dataForm = res.data.map(m => ({ user_id: m.id, nama: m.nama_lengkap, nim: m.nomor_induk, status: m.status_absen }));
        setRekapData(dataForm);
        setModalRekap(prev => ({ ...prev, mkId: res.mk_id }));
      }
      setIsLoadingRekap(false);
    } catch (err) { setIsLoadingRekap(false); showToast("Gagal memuat rekap", "error"); }
  };

  const handleStatusChange = async (mhsId, statusBaru) => {
    try {
      const payload = {
        sesi_id: modalRekap.sesi.sesi_id,
        mahasiswa_id: mhsId,
        dosen_id: currentUser.id,
        status: statusBaru
      };

      const res = await axiosClient.post('/absensi/rekap-manual', payload).then(r => r.data);
      if (res.success) {
        setRekapData(prev => prev.map(mhs => mhs.user_id === mhsId ? { ...mhs, status: statusBaru } : mhs));
      } else {
        showToast(res.message, "error");
      }
    } catch (err) {
      showToast("Gagal mengubah status", "error");
    }
  };

  const ringkasanRekap = rekapData.reduce((summary, mahasiswa) => {
    summary.total += 1;
    summary[mahasiswa.status] += 1;
    return summary;
  }, { total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 });

  const simpanRekap = async () => {
    const isConfirmed = await showConfirm({
      title: 'Simpan Rekap',
      message: 'Apakah Anda yakin ingin menyimpan perubahan rekap absensi ini?',
      type: 'warning',
      confirmText: 'Ya, Simpan'
    });

    if (isConfirmed) {
      showToast("Rekap selesai disimpan", "success");
      setModalRekap({ isOpen: false, sesi: null, mkId: null });
      fetchRiwayat(); // Refresh data riwayat
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full pb-10">

      <div className="mb-8 flex items-center gap-4">
        <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] shadow-sm shrink-0">
          <FileClock size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Rekap & Riwayat Mengajar</h2>
          <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Lakukan rekap manual kehadiran & pantau sesi.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-l-[20px]">Info Sesi & Agenda</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Mata Kuliah</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Kehadiran</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center rounded-r-[20px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-16 text-slate-400 font-bold tracking-widest uppercase text-xs">Memuat riwayat...</td></tr>
              ) : riwayatList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-20 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-4">
                      <FileText size={40} strokeWidth={1.5} className="text-slate-300"/>
                    </div>
                    <p className="font-black text-slate-800 text-xl tracking-tight mb-2">Riwayat Mengajar Kosong</p>
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Anda belum memiliki riwayat sesi mengajar yang tercatat di sistem.</p>
                  </td>
                </tr>
              ) : riwayatList.map(item => {
                const dateObj = new Date(item.waktu_mulai);
                const tgl = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <tr key={item.sesi_id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm mb-1.5 line-clamp-1">{item.agenda || '-'}</div>
                      <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <CalendarDays size={14} strokeWidth={2.5}/> {tgl} <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-[9px] text-slate-500">{item.jenis_sesi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black tracking-widest text-blue-700 text-[11px] uppercase">{item.kode_mk}</div>
                      <div className="text-sm font-bold text-slate-600 mt-1">{item.nama_mk}</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest px-4 py-2 rounded-xl text-[10px] border border-emerald-100 shadow-sm shadow-emerald-500/10">
                         {item.total_hadir} / {item.total_peserta} Hadir
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button onClick={() => openRekapSesi(item)} className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white flex items-center justify-center gap-2 mx-auto transition-all active:scale-95 shadow-sm group-hover:shadow-blue-500/20">
                        <Edit size={14} strokeWidth={2.5}/> Rekap Manual
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={() => setModalRekap({ isOpen: false, sesi: null })}>
          <div className="bg-white w-full max-w-5xl rounded-[40px] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 h-[90vh] flex flex-col border border-white" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-5 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-[16px]"><Users size={28} strokeWidth={2.5}/></div>
                <div>
                   <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-1">Form Rekap Absensi</h3>
                   <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                     <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">{modalRekap.sesi.kode_mk} - {modalRekap.sesi.nama_mk}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sesi: {new Date(modalRekap.sesi.waktu_mulai).toLocaleDateString('id-ID')} ({modalRekap.sesi.jenis_sesi})</p>
                   </div>
                </div>
              </div>
              <button onClick={() => setModalRekap({ isOpen: false, sesi: null })} className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-[14px] transition-colors active:scale-95"><X size={20} strokeWidth={2.5}/></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6 shrink-0">
              <div className="col-span-2 sm:col-span-1 rounded-[24px] bg-emerald-50 border border-emerald-100 px-5 py-4 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/20 rounded-full blur-[20px] pointer-events-none"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 relative z-10">Hadir</p>
                <p className="text-2xl font-black text-emerald-700 tracking-tight relative z-10">{ringkasanRekap.hadir} <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">/ {ringkasanRekap.total}</span></p>
              </div>
              <div className="rounded-[24px] bg-blue-50 border border-blue-100 px-5 py-4 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Izin</p>
                <p className="text-2xl font-black text-blue-700 tracking-tight">{ringkasanRekap.izin}</p>
              </div>
              <div className="rounded-[24px] bg-amber-50 border border-amber-100 px-5 py-4 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Sakit</p>
                <p className="text-2xl font-black text-amber-700 tracking-tight">{ringkasanRekap.sakit}</p>
              </div>
              <div className="rounded-[24px] bg-rose-50 border border-rose-100 px-5 py-4 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">Alpa</p>
                <p className="text-2xl font-black text-rose-700 tracking-tight">{ringkasanRekap.alpa}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
              {isLoadingRekap ? (
                <div className="flex h-full items-center justify-center text-slate-400 font-black uppercase tracking-widest text-xs">Memuat data mahasiswa...</div>
              ) : (
                <table className="w-full text-left table-auto">
                  <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-tl-[32px]">Mahasiswa</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center rounded-tr-[32px]">Kehadiran (H / I / S / A)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {rekapData.map(mhs => (
                      <tr key={mhs.user_id} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm text-slate-800">{mhs.nama}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{mhs.nim}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex justify-center gap-3">
                             {/* HADIR */}
                             <label className={`cursor-pointer w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm active:scale-90 ${mhs.status === 'hadir' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="hadir" checked={mhs.status === 'hadir'} onChange={() => handleStatusChange(mhs.user_id, 'hadir')} /> H
                             </label>
                             {/* IZIN */}
                             <label className={`cursor-pointer w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm active:scale-90 ${mhs.status === 'izin' ? 'bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="izin" checked={mhs.status === 'izin'} onChange={() => handleStatusChange(mhs.user_id, 'izin')} /> I
                             </label>
                             {/* SAKIT */}
                             <label className={`cursor-pointer w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm active:scale-90 ${mhs.status === 'sakit' ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name={`status-${mhs.user_id}`} value="sakit" checked={mhs.status === 'sakit'} onChange={() => handleStatusChange(mhs.user_id, 'sakit')} /> S
                             </label>
                             {/* ALPA */}
                             <label className={`cursor-pointer w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm active:scale-90 ${mhs.status === 'alpa' ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/30' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}`}>
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

            <div className="mt-8 flex justify-end gap-3 shrink-0 pt-6 border-t border-slate-100">
               <button onClick={() => setModalRekap({ isOpen: false, sesi: null })} className="px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95">Batal & Tutup</button>
               <button onClick={simpanRekap} className="px-8 py-4 rounded-2xl font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"><Save size={18} strokeWidth={2.5}/> Simpan Rekap Absensi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RiwayatMengajar;
