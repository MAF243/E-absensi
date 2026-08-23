import React, { useState, useEffect } from 'react';
import { X, BookOpen, CalendarDays, ChevronDown, ChevronUp, CheckSquare, Trash2, AlertTriangle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const ModalProfilDosen = ({ isOpen, onClose, dosenData }) => {
  const [activeTab, setActiveTab] = useState('matkul');
  const [expandedMkId, setExpandedMkId] = useState(null); 
  
  const [assignedMatkul, setAssignedMatkul] = useState([]); 
  const [riwayatAgenda, setRiwayatAgenda] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);

  // Ambil Data Profil
  const fetchProfilDetail = () => {
    if (dosenData) {
      setIsLoading(true);
      axiosClient.get(`/dosen/${dosenData.id}/detail`)
        .then(res => res.data)
        .then(data => {
            if(data.success) {
                setAssignedMatkul(data.data.mata_kuliah || []);
                setRiwayatAgenda(data.data.riwayat_mengajar || []);
            }
        })
        .catch(err => console.error("Gagal load profil dosen", err))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfilDetail();
    } else {
      setAssignedMatkul([]);
      setRiwayatAgenda([]);
      setExpandedMkId(null);
      setActiveTab('matkul');
    }
  }, [isOpen, dosenData]);

  if (!isOpen || !dosenData) return null;

  const toggleAgenda = (mkId) => setExpandedMkId(prev => prev === mkId ? null : mkId);

  // ========================================================
  // PERBAIKAN LOGIKA: "TOTAL HADIR DOSEN"
  // Dosen dianggap Hadir jika dia membuka sesi (memiliki riwayat agenda)
  // Jadi Total Hadirnya adalah jumlah riwayat sesinya!
  // ========================================================
  const totalHadirGlobal = riwayatAgenda.length; 

  // ========================================================
  // FITUR BARU: RESET RIWAYAT SESI (Sesuai ide Anda)
  // ========================================================
  const handleResetRiwayat = async () => {
    if (window.confirm(`PERINGATAN!\n\nAnda yakin ingin menghapus SELURUH RIWAYAT SESI & AGENDA milik dosen ${dosenData.nama_lengkap}?\n\n(Data absensi mahasiswa di sesi tersebut juga akan hangus).`)) {
      try {
        const res = await axiosClient.delete(`/dosen/${dosenData.id}/reset-sesi`).then(r => r.data);
        if (res.success) {
          alert(res.message);
          fetchProfilDetail(); // Refresh data otomatis setelah dihapus
        } else {
          alert("Gagal mereset data: " + res.message);
        }
      } catch (e) {
        alert("Terjadi kesalahan koneksi server.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl relative flex flex-col md:flex-row overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* BAGIAN KIRI: PROFIL DOSEN */}
        <div className="w-full md:w-1/3 bg-blue-600 p-8 text-white flex flex-col items-center justify-center shrink-0">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 border-2 border-white/30">
            <span className="text-3xl font-black">{dosenData.inisial || dosenData.nama_lengkap.charAt(0)}</span>
          </div>
          <h3 className="text-xl font-bold text-center leading-tight mb-2">{dosenData.nama_lengkap}</h3>
          
          <div className="bg-white/10 px-4 py-3 rounded-xl mt-4 border border-white/20 text-center w-full">
            <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">NIDN / Username</p>
            <p className="text-base font-bold">{dosenData.nomor_induk}</p>
          </div>

          <div className="flex w-full gap-3 mt-4">
              <div className="bg-white/10 flex-1 py-3 rounded-xl border border-white/20 text-center">
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Total Matkul</p>
                  <p className="text-lg font-bold">{assignedMatkul.length}</p>
              </div>
              <div className="bg-white/10 flex-1 py-3 rounded-xl border border-white/20 text-center">
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Total Hadir</p>
                  <p className="text-lg font-bold">{totalHadirGlobal}</p>
              </div>
          </div>
        </div>

        {/* BAGIAN KANAN: TAB KONTEN */}
        <div className="flex-1 flex flex-col bg-slate-50 min-h-[400px]">
          <button onClick={onClose} className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"><X size={20}/></button>

          {/* Navigasi Tab */}
          <div className="flex border-b border-slate-200 px-6 pt-6">
            <button onClick={() => setActiveTab('matkul')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'matkul' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <BookOpen size={18}/> Mata Kuliah Diampu
            </button>
            <button onClick={() => setActiveTab('agenda')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'agenda' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <CalendarDays size={18}/> Riwayat & Agenda
            </button>
          </div>

          {/* Area Konten */}
          <div className="p-6 overflow-y-auto flex-1 bg-white relative">
            {isLoading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">Memuat data...</div>
            ) : (
                <>
                    {/* TAB 1: MATA KULIAH */}
                    {activeTab === 'matkul' && (
                    <div className="animate-in fade-in">
                        {assignedMatkul.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {assignedMatkul.map(mk => (
                            <div key={mk.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{mk.kode_mk} • SMT {mk.semester}</p>
                                <p className="font-bold text-slate-800 leading-tight">{mk.nama_mk}</p>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <BookOpen size={48} className="mb-4 opacity-50" />
                            <p className="font-medium text-sm">Belum ada mata kuliah yang ditugaskan kepada dosen ini.</p>
                        </div>
                        )}
                    </div>
                    )}

                    {/* TAB 2: RIWAYAT & AGENDA */}
                    {activeTab === 'agenda' && (
                    <div className="animate-in fade-in space-y-4 pb-16">
                        {assignedMatkul.length > 0 ? assignedMatkul.map(mk => (
                        <div key={mk.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button onClick={() => toggleAgenda(mk.id)} className="w-full bg-slate-50 p-4 flex justify-between items-center hover:bg-slate-100 transition-colors">
                            <div className="text-left">
                                <p className="font-bold text-slate-800">{mk.nama_mk}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5">{mk.kode_mk}</p>
                            </div>
                            {expandedMkId === mk.id ? <ChevronUp size={20} className="text-slate-500"/> : <ChevronDown size={20} className="text-slate-500"/>}
                            </button>

                            {/* Dropdown Konten Agenda dengan scroll internal */}
                            {expandedMkId === mk.id && (
                            <div className="bg-white border-t border-slate-100 p-4 max-h-60 overflow-y-auto">
                                {riwayatAgenda.filter(agenda => agenda.mk_id === mk.id).length > 0 ? (
                                <div className="space-y-3">
                                    {riwayatAgenda.filter(agenda => agenda.mk_id === mk.id).map((sesi, idx) => (
                                    <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col gap-2">
                                        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><CalendarDays size={14}/> {new Date(sesi.waktu_mulai).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        {/* PERJELAS TEKS "Hadir: X Mhs" MENJADI "Kehadiran Mahasiswa" */}
                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1"><CheckSquare size={12}/> {sesi.jumlah_hadir} Mahasiswa Hadir</span>
                                        </div>
                                        <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Topik / Agenda</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{sesi.agenda || "Tidak ada catatan agenda."}</p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                                ) : (
                                <p className="text-center text-xs font-medium text-slate-400 py-4">Belum ada riwayat sesi untuk kelas ini.</p>
                                )}
                            </div>
                            )}
                        </div>
                        )) : (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <CalendarDays size={48} className="mb-4 opacity-50" />
                            <p className="font-medium text-sm">Tidak ada riwayat kelas.</p>
                        </div>
                        )}

                        {/* TOMBOL RESET RIWAYAT MUNCUL JIKA ADA AGENDA */}
                        {riwayatAgenda.length > 0 && (
                          <div className="absolute bottom-6 right-6">
                            <button onClick={handleResetRiwayat} className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 active:scale-[0.98] transition-all shadow-sm">
                              <Trash2 size={16} /> Bersihkan Semua Riwayat
                            </button>
                          </div>
                        )}
                    </div>
                    )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProfilDosen;